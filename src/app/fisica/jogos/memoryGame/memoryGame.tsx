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
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedCard from './AnimatedCard';
import * as AllImages from './images/images';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface GameSettings {
  difficulty: Difficulty;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  showTimer: boolean;
  showMoves: boolean;
  autoFlip: boolean;
  flipDelay: number;
  theme: 'classic' | 'neon' | 'nature' | 'space';
}

interface MemoryGameProps {
  settings: GameSettings;
  onBackToStart: () => void;
  onGameComplete: (time: number) => void;
}

// Função para calcular o tamanho ideal das cartas baseado na tela e número de colunas
const calculateCardSize = (cols: number, totalCards: number): number => {
  const padding = 24;
  const cardMargin = 3;
  const availableWidth = screenWidth - padding;
  const maxCardWidth = (availableWidth - (cardMargin * 2 * cols)) / cols;
  
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

const themeConfig = {
  classic: {
    name: 'Clássico',
    colors: ['#1e293b', '#334155'],
    accent: '#3b82f6'
  },
  neon: {
    name: 'Neon',
    colors: ['#0f0f23', '#1a1a2e'],
    accent: '#00ff88'
  },
  nature: {
    name: 'Natureza',
    colors: ['#1e3a3a', '#2d5a5a'],
    accent: '#10b981'
  },
  space: {
    name: 'Espacial',
    colors: ['#0f0f1a', '#1a1a2e'],
    accent: '#8b5cf6'
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

export default function MemoryGame({ settings, onBackToStart, onGameComplete }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>(generateCards(settings.difficulty));
  const [flipped, setFlipped] = useState<Card[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const celebrationScale = useSharedValue(0);
  const celebrationOpacity = useSharedValue(0);

  const { pairs, cols, name, color } = getDifficultyConfig(settings.difficulty);
  const cardSize = calculateCardSize(cols, pairs * 2);
  const currentTheme = themeConfig[settings.theme];

  // Timer effect
  useEffect(() => {
    if (gameStarted && !isCompleted && !isPaused) {
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
  }, [gameStarted, isCompleted, isPaused]);

  // Check completion
  useEffect(() => {
    if (matches === pairs && matches > 0) {
      setIsCompleted(true);
      setShowCelebration(true);
      onGameComplete(time);
      
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
  }, [matches, pairs, time, onGameComplete]);

  const flipCard = (card: Card) => {
    if (card.isFlipped || card.isMatched || flipped.length === 2 || isCompleted || isPaused) return;

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
        const flipDelay = settings.autoFlip ? settings.flipDelay : 1200;
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === first.id || c.id === second.id
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlipped([]);
        }, flipDelay);
      }
    }
  }, [flipped, settings.autoFlip, settings.flipDelay]);

  const resetGame = () => {
    setCards(generateCards(settings.difficulty));
    setFlipped([]);
    setMatches(0);
    setMoves(0);
    setTime(0);
    setIsCompleted(false);
    setGameStarted(false);
    setStreak(0);
    setShowCelebration(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleBackToStart = () => {
    if (gameStarted && !isCompleted) {
      Alert.alert(
        'Voltar ao Início',
        'Isso irá sair do jogo atual. Deseja continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sim',
            onPress: () => {
              if (timerRef.current) {
                clearInterval(timerRef.current);
              }
              onBackToStart();
            }
          }
        ]
      );
    } else {
      onBackToStart();
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
    title: screenWidth > 400 ? 28 : 24,
    subtitle: screenWidth > 400 ? 14 : 12,
    stat: screenWidth > 400 ? 18 : 16,
    statLabel: screenWidth > 400 ? 12 : 10,
    button: screenWidth > 400 ? 16 : 14,
    celebration: screenWidth > 400 ? 24 : 20,
  };

  return (
    <LinearGradient
      colors={currentTheme.colors}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor={currentTheme.colors[0]} />
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
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16 
          }}>
            <Pressable
              onPress={handleBackToStart}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 12,
                padding: 8,
                minWidth: 40,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontSize: 18 }}>←</Text>
            </Pressable>
            
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ 
                fontSize: fontSize.title, 
                fontWeight: 'bold', 
                color: 'white', 
                textAlign: 'center' 
              }}>
                🧠 {name}
              </Text>
              <Text style={{ 
                fontSize: fontSize.subtitle, 
                color: '#94a3b8', 
                marginTop: 2,
                textAlign: 'center' 
              }}>
                {pairs} pares • {currentTheme.name}
              </Text>
            </View>

            <Pressable
              onPress={togglePause}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 12,
                padding: 8,
                minWidth: 40,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', fontSize: 16 }}>
                {isPaused ? '▶️' : '⏸️'}
              </Text>
            </Pressable>
          </View>

          {/* Pause Overlay */}
          {isPaused && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <View style={{
                backgroundColor: currentTheme.colors[0],
                borderRadius: 20,
                padding: 30,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)'
              }}>
                <Text style={{
                  fontSize: 48,
                  marginBottom: 15
                }}>⏸️</Text>
                <Text style={{
                  fontSize: fontSize.title - 4,
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: 20,
                  textAlign: 'center'
                }}>
                  Jogo Pausado
                </Text>
                <Pressable
                  onPress={togglePause}
                  style={{
                    backgroundColor: currentTheme.accent,
                    borderRadius: 15,
                    paddingVertical: 12,
                    paddingHorizontal: 24
                  }}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: fontSize.button,
                    fontWeight: '600'
                  }}>
                    ▶️ Continuar
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Stats Panel */}
          {!isPaused && (
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
                {settings.showTimer && (
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
                )}
                
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
                
                {settings.showMoves && (
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
                )}
                
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
          )}

          {/* Game Board */}
          {!isPaused && (
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
          )}

          {/* Controls */}
          {!isPaused && (
            <View style={{ alignItems: 'center', paddingBottom: 16 }}>
              <Pressable
                onPress={resetGame}
                style={{
                  backgroundColor: currentTheme.accent,
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
          )}

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
                {settings.showTimer && (
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
                )}
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
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}