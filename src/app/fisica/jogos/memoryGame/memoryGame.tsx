import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  ScrollView, 
  Dimensions, 
  Alert,
  StatusBar,
  SafeAreaView 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withDelay
} from 'react-native-reanimated';
import AnimatedCard from './AnimatedCard';
import * as AllImages from './images/images';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Função para calcular o tamanho ideal das cartas baseado na tela e número de colunas
const calculateCardSize = (cols: number, totalCards: number): number => {
  const padding = 24; // padding lateral reduzido
  const cardMargin = 3; // margem entre cartas reduzida
  const availableWidth = screenWidth - padding;
  const maxCardWidth = (availableWidth - (cardMargin * 2 * cols)) / cols;
  
  // Limites baseados no tamanho da tela - aumentados
  const minCardSize = screenWidth > 400 ? 70 : 60;
  const maxCardSize = screenWidth > 400 ? 120 : 100;
  
  return Math.max(minCardSize, Math.min(maxCardSize, maxCardWidth));
};

type Card = {
  id: number;
  image: any;
  isFlipped: boolean;
  isMatched: boolean;
};

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

const getDifficultyConfig = (level: Difficulty) => {
  const isTablet = screenWidth > 600;
  
  switch (level) {
    case 'easy': 
      return { 
        pairs: 6, 
        cols: isTablet ? 4 : 3, 
        name: 'Fácil', 
        color: '#10b981' 
      };
    case 'medium': 
      return { 
        pairs: 8, 
        cols: 4, 
        name: 'Médio', 
        color: '#f59e0b' 
      };
    case 'hard': 
      return { 
        pairs: 12, 
        cols: isTablet ? 5 : 4, 
        name: 'Difícil', 
        color: '#ef4444' 
      };
    case 'expert': 
      return { 
        pairs: 16, 
        cols: isTablet ? 6 : 4, 
        name: 'Expert', 
        color: '#8b5cf6' 
      };
  }
};

const generateCards = (level: Difficulty): Card[] => {
  const { pairs } = getDifficultyConfig(level);
  const imageList = Object.values(AllImages).slice(0, pairs);
  const duplicated = [...imageList, ...imageList];
  
  return duplicated
    .sort(() => Math.random() - 0.5)
    .map((img, index) => ({
      id: index,
      image: img,
      isFlipped: false,
      isMatched: false,
    }));
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function MemoryGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [cards, setCards] = useState<Card[]>(generateCards(difficulty));
  const [flipped, setFlipped] = useState<Card[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [bestTime, setBestTime] = useState<{ [key: string]: number }>({});
  const [streak, setStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const celebrationScale = useSharedValue(0);
  const celebrationOpacity = useSharedValue(0);

  const { pairs, cols, name, color } = getDifficultyConfig(difficulty);
  const cardSize = calculateCardSize(cols, pairs * 2);

  // Timer effect
  useEffect(() => {
    if (gameStarted && !isCompleted) {
      timerRef.current = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, isCompleted]);

  // Check completion
  useEffect(() => {
    if (matches === pairs && matches > 0) {
      setIsCompleted(true);
      setShowCelebration(true);
      
      if (!bestTime[difficulty] || time < bestTime[difficulty]) {
        setBestTime(prev => ({ ...prev, [difficulty]: time }));
      }
      
      celebrationScale.value = withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
      celebrationOpacity.value = withSequence(
        withSpring(1, { damping: 8 }),
        withDelay(3000, withSpring(0, { damping: 10 }))
      );
      
      setTimeout(() => setShowCelebration(false), 3500);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [matches, pairs, time, bestTime, difficulty]);

  const flipCard = (card: Card) => {
    if (card.isFlipped || card.isMatched || flipped.length === 2 || isCompleted) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    const updatedCards = cards.map(c =>
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);
    setFlipped([...flipped, { ...card, isFlipped: true }]);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = flipped;
      
      if (first.image === second.image) {
        setCards(prev =>
          prev.map(c =>
            c.image === first.image ? { ...c, isMatched: true, isFlipped: true } : c
          )
        );
        setMatches(m => m + 1);
        setStreak(s => s + 1);
        setFlipped([]);
      } else {
        setStreak(0);
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === first.id || c.id === second.id
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlipped([]);
        }, 1200);
      }
    }
  }, [flipped]);

  const resetGame = () => {
    setCards(generateCards(difficulty));
    setFlipped([]);
    setMatches(0);
    setMoves(0);
    setTime(0);
    setIsCompleted(false);
    setGameStarted(false);
    setStreak(0);
    setShowCelebration(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const changeDifficulty = (level: Difficulty) => {
    if (gameStarted && !isCompleted) {
      Alert.alert(
        'Mudar Dificuldade',
        'Isso irá reiniciar o jogo atual. Deseja continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sim',
            onPress: () => performDifficultyChange(level)
          }
        ]
      );
    } else {
      performDifficultyChange(level);
    }
  };

  const performDifficultyChange = (level: Difficulty) => {
    setDifficulty(level);
    setCards(generateCards(level));
    setFlipped([]);
    setMatches(0);
    setMoves(0);
    setTime(0);
    setIsCompleted(false);
    setGameStarted(false);
    setStreak(0);
    setShowCelebration(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const getAccuracy = () => {
    if (moves === 0) return 100;
    return Math.round((matches / moves) * 100);
  };

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    opacity: celebrationOpacity.value,
  }));

  // Responsividade dos textos
  const fontSize = {
    title: screenWidth > 400 ? 32 : 28,
    subtitle: screenWidth > 400 ? 16 : 14,
    stat: screenWidth > 400 ? 18 : 16,
    statLabel: screenWidth > 400 ? 12 : 10,
    button: screenWidth > 400 ? 16 : 14,
    celebration: screenWidth > 400 ? 24 : 20,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1e293b' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingHorizontal: 12, 
          paddingTop: 10,
          paddingBottom: 20 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ 
            fontSize: fontSize.title, 
            fontWeight: 'bold', 
            color: 'white', 
            textAlign: 'center' 
          }}>
            🧠 Jogo da Memória
          </Text>
          <Text style={{ 
            fontSize: fontSize.subtitle, 
            color: '#94a3b8', 
            marginTop: 4,
            textAlign: 'center' 
          }}>
            Teste sua memória e concentração!
          </Text>
        </View>

        {/* Stats Panel */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: 14,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)'
        }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}>
            <View style={{ alignItems: 'center', minWidth: '24%' }}>
              <Text style={{ 
                fontSize: fontSize.statLabel, 
                color: '#60a5fa', 
                marginBottom: 4,
                textAlign: 'center'
              }}>
                ⏱️ Tempo
              </Text>
              <Text style={{ 
                fontSize: fontSize.stat, 
                fontWeight: 'bold', 
                color: 'white' 
              }}>
                {formatTime(time)}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center', minWidth: '24%' }}>
              <Text style={{ 
                fontSize: fontSize.statLabel, 
                color: '#34d399', 
                marginBottom: 4,
                textAlign: 'center'
              }}>
                🎯 Pares
              </Text>
              <Text style={{ 
                fontSize: fontSize.stat, 
                fontWeight: 'bold', 
                color: 'white' 
              }}>
                {matches}/{pairs}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center', minWidth: '24%' }}>
              <Text style={{ 
                fontSize: fontSize.statLabel, 
                color: '#f472b6', 
                marginBottom: 4,
                textAlign: 'center'
              }}>
                ⚡ Jogadas
              </Text>
              <Text style={{ 
                fontSize: fontSize.stat, 
                fontWeight: 'bold', 
                color: 'white' 
              }}>
                {moves}
              </Text>
            </View>
            
            <View style={{ alignItems: 'center', minWidth: '24%' }}>
              <Text style={{ 
                fontSize: fontSize.statLabel, 
                color: '#c084fc', 
                marginBottom: 4,
                textAlign: 'center'
              }}>
                🏆 Precisão
              </Text>
              <Text style={{ 
                fontSize: fontSize.stat, 
                fontWeight: 'bold', 
                color: getAccuracy() >= 80 ? '#10b981' : getAccuracy() >= 60 ? '#f59e0b' : '#ef4444'
              }}>
                {getAccuracy()}%
              </Text>
            </View>
          </View>
          
          {streak > 1 && (
            <View style={{ marginTop: 12, alignItems: 'center' }}>
              <View style={{
                backgroundColor: '#ea580c',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Text style={{ 
                  color: 'white', 
                  fontSize: fontSize.button - 2, 
                  fontWeight: '600' 
                }}>
                  🔥 Sequência: {streak}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Difficulty Selector */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          marginBottom: 14,
          paddingHorizontal: 4
        }}>
          {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map(level => {
            const config = getDifficultyConfig(level);
            const isSelected = difficulty === level;
            return (
              <Pressable
                key={level}
                onPress={() => changeDifficulty(level)}
                style={{
                  backgroundColor: isSelected ? config.color : 'rgba(255,255,255,0.2)',
                  paddingHorizontal: screenWidth > 400 ? 16 : 12,
                  paddingVertical: screenWidth > 400 ? 8 : 6,
                  borderRadius: 20,
                  marginHorizontal: 4,
                  marginVertical: 4,
                  transform: [{ scale: isSelected ? 1.05 : 1 }],
                  minWidth: '20%',
                  alignItems: 'center'
                }}
              >
                <Text style={{ 
                  color: 'white', 
                  fontWeight: '600', 
                  fontSize: fontSize.button - 2,
                  textAlign: 'center'
                }}>
                  {config.name}
                </Text>
                <Text style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: fontSize.button - 4,
                  textAlign: 'center'
                }}>
                  ({config.pairs * 2})
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Game Board */}
        <View style={{ alignItems: 'center', marginBottom: 14, flex: 1 }}>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: 8,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}>
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              width: '100%',
              paddingHorizontal: 4,
            }}>
              {cards.map(card => (
                <AnimatedCard
                  key={card.id}
                  card={card}
                  onPress={() => flipCard(card)}
                  cardSize={cardSize}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Best Time Display */}
        {bestTime[difficulty] && (
          <View style={{ alignItems: 'center', marginBottom: 14 }}>
            <View style={{
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Text style={{ 
                color: '#f59e0b', 
                fontSize: fontSize.button - 2, 
                fontWeight: '600',
                textAlign: 'center'
              }}>
                🏆 Melhor tempo ({name}): {formatTime(bestTime[difficulty])}
              </Text>
            </View>
          </View>
        )}

        {/* Controls */}
        <View style={{ alignItems: 'center', paddingBottom: 16 }}>
          <Pressable
            onPress={resetGame}
            style={{
              backgroundColor: '#4f46e5',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 25,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              minWidth: screenWidth * 0.4,
              justifyContent: 'center'
            }}
          >
            <Text style={{ 
              color: 'white', 
              fontWeight: '600', 
              fontSize: fontSize.button,
              textAlign: 'center'
            }}>
              🔄 Novo Jogo
            </Text>
          </Pressable>
        </View>

        {/* Celebration Overlay */}
        {showCelebration && (
          <Animated.View style={[
            celebrationStyle,
            {
              position: 'absolute',
              top: screenHeight * 0.3,
              left: screenWidth * 0.1,
              right: screenWidth * 0.1,
              backgroundColor: 'rgba(16, 185, 129, 0.95)',
              padding: 24,
              borderRadius: 20,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 16,
            }
          ]}>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>🎉</Text>
            <Text style={{ 
              fontSize: fontSize.celebration, 
              fontWeight: 'bold', 
              color: 'white', 
              marginBottom: 8,
              textAlign: 'center'
            }}>
              Parabéns!
            </Text>
            <Text style={{ 
              fontSize: fontSize.button, 
              color: 'white', 
              textAlign: 'center', 
              marginBottom: 12 
            }}>
              Você completou o jogo!
            </Text>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-around', 
              width: '100%',
              flexWrap: 'wrap'
            }}>
              <View style={{ alignItems: 'center', minWidth: '30%' }}>
                <Text style={{ 
                  fontSize: fontSize.button - 2, 
                  color: 'rgba(255,255,255,0.8)' 
                }}>
                  Tempo
                </Text>
                <Text style={{ 
                  fontSize: fontSize.stat, 
                  fontWeight: 'bold', 
                  color: 'white' 
                }}>
                  {formatTime(time)}
                </Text>
              </View>
              <View style={{ alignItems: 'center', minWidth: '30%' }}>
                <Text style={{ 
                  fontSize: fontSize.button - 2, 
                  color: 'rgba(255,255,255,0.8)' 
                }}>
                  Precisão
                </Text>
                <Text style={{ 
                  fontSize: fontSize.stat, 
                  fontWeight: 'bold', 
                  color: 'white' 
                }}>
                  {getAccuracy()}%
                </Text>
              </View>
            </View>
            {bestTime[difficulty] === time && (
              <Text style={{ 
                fontSize: fontSize.button - 2, 
                color: '#fbbf24', 
                fontWeight: '600', 
                marginTop: 8,
                textAlign: 'center'
              }}>
                🏆 Novo recorde pessoal!
              </Text>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}