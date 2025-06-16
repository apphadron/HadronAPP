import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Modal, 
  ActivityIndicator,
  Animated 
} from 'react-native';
import GEMINI_GAME_CONFIG from '@/utils/configGemini';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  topic: string;
  hash: string;
}

interface GameStats {
  score: number;
  streak: number;
  bestStreak: number;
  totalQuestions: number;
}

const TOPICS = {
  fisica: {
    name: 'Física',
    subtopics: ['Mecânica', 'Termodinâmica', 'Eletromagnetismo', 'Óptica', 'Física Moderna']
  },
  astronomia: {
    name: 'Astronomia', 
    subtopics: ['Sistema Solar', 'Estrelas', 'Galáxias', 'Cosmologia', 'Exploração Espacial']
  },
  astrofisica: {
    name: 'Astrofísica',
    subtopics: ['Buracos Negros', 'Evolução Estelar', 'Relatividade', 'Matéria Escura', 'Exoplanetas']
  }
};

const DIFFICULTIES = ['Fácil', 'Médio', 'Difícil'];

const QuizGame = () => {
  // Estados principais
  const [showConfig, setShowConfig] = useState(true);
  const [config, setConfig] = useState({ topic: '', subtopic: '', difficulty: '' });
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<GameStats>({ score: 0, streak: 0, bestStreak: 0, totalQuestions: 0 });
  const [usedHashes, setUsedHashes] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Animações
  const fadeAnim = new Animated.Value(1);
  const scaleAnim = new Animated.Value(1);

  // Carregar dados salvos
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [savedStats, savedHashes] = await Promise.all([
        AsyncStorage.getItem('quizStats'),
        AsyncStorage.getItem('usedHashes')
      ]);
      
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
      
      if (savedHashes) {
        const hashArray = JSON.parse(savedHashes);
        setUsedHashes(new Set(hashArray.slice(-200))); // Manter apenas os 200 mais recentes
      }
    } catch (error) {
      console.warn('Erro ao carregar dados:', error);
    }
  };

  const saveData = async (newStats: GameStats, newHash?: string) => {
    try {
      await AsyncStorage.setItem('quizStats', JSON.stringify(newStats));
      
      if (newHash) {
        const updatedHashes = new Set(usedHashes);
        updatedHashes.add(newHash);
        const hashArray = Array.from(updatedHashes).slice(-200);
        await AsyncStorage.setItem('usedHashes', JSON.stringify(hashArray));
        setUsedHashes(new Set(hashArray));
      }
    } catch (error) {
      console.warn('Erro ao salvar dados:', error);
    }
  };

  // Gerar hash simples para detecção de duplicatas
  const generateHash = (text: string): string => {
    let hash = 0;
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  };

  // Fazer requisição para API
  const fetchFromGemini = async (prompt: string): Promise<string> => {
    if (!GEMINI_GAME_CONFIG.API_KEY) {
      throw new Error('API key não configurada');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(`${GEMINI_GAME_CONFIG.API_URL}?key=${GEMINI_GAME_CONFIG.API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.8,
            topK: 40,
            topP: 0.9
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Erro da API: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        throw new Error('Timeout: A requisição demorou muito');
      }
      throw error;
    }
  };

  // Processar resposta da API
  const parseGeminiResponse = (response: string): QuizQuestion => {
    try {
      // Extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON não encontrado na resposta');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validar estrutura
      if (!parsed.question || !Array.isArray(parsed.options) || 
          typeof parsed.correctAnswer !== 'number' || !parsed.explanation) {
        throw new Error('Estrutura de resposta inválida');
      }

      if (parsed.options.length !== 4 || parsed.correctAnswer < 0 || parsed.correctAnswer > 3) {
        throw new Error('Opções ou resposta correta inválidas');
      }

      const hash = generateHash(parsed.question + parsed.options.join(''));
      
      return {
        question: parsed.question,
        options: parsed.options,
        correctAnswer: parsed.correctAnswer,
        explanation: parsed.explanation,
        difficulty: parsed.difficulty || config.difficulty,
        topic: parsed.topic || config.subtopic,
        hash
      };
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
      throw new Error('Não foi possível processar a resposta da IA');
    }
  };

  // Gerar nova pergunta
  const generateQuestion = useCallback(async () => {
    if (!config.topic || !config.subtopic || !config.difficulty) {
      setError('Configuração incompleta');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedAnswer(null);
    setShowFeedback(false);

    const maxAttempts = 5;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const timestamp = Date.now();
        const randomSeed = Math.random().toString(36).substring(7);
        
        const prompt = `Gere uma pergunta de quiz ÚNICA sobre ${config.topic} - ${config.subtopic} com dificuldade ${config.difficulty.toLowerCase()}.
        
Timestamp: ${timestamp}
Seed: ${randomSeed}

Retorne APENAS um JSON válido neste formato exato:
{
  "question": "Pergunta clara e específica sobre o tópico",
  "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
  "correctAnswer": 0,
  "explanation": "Explicação detalhada da resposta correta",
  "difficulty": "${config.difficulty.toLowerCase()}",
  "topic": "${config.subtopic}"
}

IMPORTANTE: 
- correctAnswer deve ser um número (0, 1, 2 ou 3)
- A pergunta deve ser original e educativa
- As opções devem ser plausíveis
- Seja criativo para evitar repetições`;

        const response = await fetchFromGemini(prompt);
        const newQuestion = parseGeminiResponse(response);

        // Verificar se já foi usada
        if (usedHashes.has(newQuestion.hash)) {
          console.log(`Pergunta repetida detectada (tentativa ${attempts + 1})`);
          attempts++;
          
          // Pequena pausa entre tentativas
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }

        // Pergunta é nova!
        setQuestion(newQuestion);
        setIsLoading(false);
        
        // Animar entrada da pergunta
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true })
        ]).start();

        return;

      } catch (error: any) {
        console.error(`Tentativa ${attempts + 1} falhou:`, error);
        attempts++;
        
        if (attempts >= maxAttempts) {
          setError(`Erro após ${maxAttempts} tentativas: ${error.message}`);
          setIsLoading(false);
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }, [config, usedHashes, fadeAnim]);

  // Processar resposta do usuário
  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || !question) return;

    setSelectedAnswer(answerIndex);
    
    // Animar seleção
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();

    setTimeout(() => {
      const isCorrect = answerIndex === question.correctAnswer;
      const newStats = {
        ...stats,
        totalQuestions: stats.totalQuestions + 1,
        score: isCorrect ? stats.score + 1 : stats.score,
        streak: isCorrect ? stats.streak + 1 : 0,
        bestStreak: isCorrect ? Math.max(stats.bestStreak, stats.streak + 1) : stats.bestStreak
      };
      
      setStats(newStats);
      setShowFeedback(true);
      saveData(newStats, question.hash);
    }, 500);
  };

  // Próxima pergunta
  const nextQuestion = () => {
    generateQuestion();
  };

  // Resetar quiz
  const resetQuiz = () => {
    setShowConfig(true);
    setQuestion(null);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setError(null);
  };

  // Limpar histórico
  const clearHistory = async () => {
    Alert.alert(
      'Limpar Histórico',
      'Isso irá apagar todas as perguntas já feitas e estatísticas. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: async () => {
          try {
            await AsyncStorage.multiRemove(['usedHashes', 'quizStats']);
            setUsedHashes(new Set());
            setStats({ score: 0, streak: 0, bestStreak: 0, totalQuestions: 0 });
            Alert.alert('Sucesso', 'Histórico limpo!');
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível limpar o histórico');
          }
        }}
      ]
    );
  };

  // Iniciar quiz
  const startQuiz = () => {
    if (!config.topic || !config.subtopic || !config.difficulty) {
      Alert.alert('Erro', 'Selecione todas as opções');
      return;
    }
    setShowConfig(false);
    generateQuestion();
  };

  // Renderizar modal de configuração
  const renderConfigModal = () => (
    <Modal visible={showConfig} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>🎯 Configurar Quiz</Text>
          
          <Text style={styles.sectionTitle}>Tema</Text>
          <View style={styles.optionGrid}>
            {Object.entries(TOPICS).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[styles.optionButton, config.topic === key && styles.selectedOption]}
                onPress={() => setConfig(prev => ({ ...prev, topic: key, subtopic: '' }))}
              >
                <Text style={styles.optionText}>{value.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {config.topic && (
            <>
              <Text style={styles.sectionTitle}>Subtópico</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.subtopicRow}>
                  {TOPICS[config.topic as keyof typeof TOPICS].subtopics.map((subtopic) => (
                    <TouchableOpacity
                      key={subtopic}
                      style={[styles.subtopicButton, config.subtopic === subtopic && styles.selectedSubtopic]}
                      onPress={() => setConfig(prev => ({ ...prev, subtopic }))}
                    >
                      <Text style={styles.subtopicText}>{subtopic}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </>
          )}

          <Text style={styles.sectionTitle}>Dificuldade</Text>
          <View style={styles.optionGrid}>
            {DIFFICULTIES.map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[styles.difficultyButton, config.difficulty === difficulty && styles.selectedDifficulty]}
                onPress={() => setConfig(prev => ({ ...prev, difficulty }))}
              >
                <Text style={styles.difficultyText}>{difficulty}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
              <Text style={styles.startButtonText}>🚀 Iniciar Quiz</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
              <Text style={styles.clearButtonText}>🗑️ Limpar Histórico</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Renderizar pergunta
  const renderQuestion = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Gerando pergunta única...</Text>
          <TouchableOpacity style={styles.cancelButton} onPress={() => {
            setIsLoading(false);
            resetQuiz();
          }}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorActions}>
            <TouchableOpacity style={styles.retryButton} onPress={generateQuestion}>
              <Text style={styles.retryButtonText}>🔄 Tentar Novamente</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.configButton} onPress={resetQuiz}>
              <Text style={styles.configButtonText}>⚙️ Configurações</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (!question) return null;

    return (
      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.topicLabel}>
            {TOPICS[config.topic as keyof typeof TOPICS].name} • {question.topic}
          </Text>
          <Text style={styles.difficultyLabel}>{question.difficulty}</Text>
        </View>

        <Text style={styles.questionText}>{question.question}</Text>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.answerButton,
                selectedAnswer === index && (
                  index === question.correctAnswer ? styles.correctAnswer : styles.wrongAnswer
                ),
                selectedAnswer !== null && index === question.correctAnswer && styles.correctAnswer
              ]}
              onPress={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
            >
              <Text style={styles.answerText}>{String.fromCharCode(65 + index)}. {option}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>
              {selectedAnswer === question.correctAnswer ? '✅ Correto!' : '❌ Incorreto'}
            </Text>
            <Text style={styles.explanationText}>{question.explanation}</Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
                <Text style={styles.nextButtonText}>➡️ Próxima</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.configButton} onPress={resetQuiz}>
                <Text style={styles.configButtonText}>⚙️ Config</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {renderConfigModal()}
      
      <View style={styles.statsBar}>
        <Text style={styles.statText}>📊 {stats.score}/{stats.totalQuestions}</Text>
        <Text style={styles.statText}>🔥 {stats.streak}</Text>
        <Text style={styles.statText}>🏆 {stats.bestStreak}</Text>
      </View>

      <ScrollView style={styles.content}>
        {renderQuestion()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    color: '#555',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#e9ecef',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  subtopicRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  subtopicButton: {
    backgroundColor: '#e9ecef',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
  },
  selectedSubtopic: {
    backgroundColor: '#28a745',
  },
  subtopicText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  difficultyButton: {
    backgroundColor: '#e9ecef',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    flex: 1,
    alignItems: 'center',
  },
  selectedDifficulty: {
    backgroundColor: '#ff6b35',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  modalActions: {
    marginTop: 24,
    gap: 12,
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#dc3545',
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  configButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  configButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  questionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  topicLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  difficultyLabel: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    lineHeight: 26,
    marginBottom: 24,
  },
  answerButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  correctAnswer: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  wrongAnswer: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  answerText: {
    fontSize: 16,
    color: '#333',
  },
  feedbackContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});


export default QuizGame;