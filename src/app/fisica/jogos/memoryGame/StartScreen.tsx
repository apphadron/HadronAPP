import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  Switch,
  Modal,
  Alert
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  withTiming,
  runOnJS,
  interpolateColor
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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

interface StartScreenProps {
  onStartGame: (settings: GameSettings) => void;
  bestTimes?: { [key: string]: number };
}

const getDifficultyConfig = (level: Difficulty) => {
  const isTablet = screenWidth > 600;
  
  switch (level) {
    case 'easy': 
      return { 
        pairs: 6, 
        cols: isTablet ? 4 : 3, 
        name: 'Fácil', 
        color: '#10b981',
        icon: '🌱',
        description: '6 pares - Perfeito para iniciantes'
      };
    case 'medium': 
      return { 
        pairs: 8, 
        cols: 4, 
        name: 'Médio', 
        color: '#f59e0b',
        icon: '🌟',
        description: '8 pares - Desafio equilibrado'
      };
    case 'hard': 
      return { 
        pairs: 12, 
        cols: isTablet ? 5 : 4, 
        name: 'Difícil', 
        color: '#ef4444',
        icon: '🔥',
        description: '12 pares - Para jogadores experientes'
      };
    case 'expert': 
      return { 
        pairs: 16, 
        cols: isTablet ? 6 : 4, 
        name: 'Expert', 
        color: '#8b5cf6',
        icon: '💎',
        description: '16 pares - Desafio supremo'
      };
  }
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const themeConfig = {
  classic: {
    name: 'Clássico',
    colors: ['#1e293b', '#334155'],
    icon: '🎨',
    accent: '#3b82f6'
  },
  neon: {
    name: 'Neon',
    colors: ['#0f0f23', '#1a1a2e'],
    icon: '⚡',
    accent: '#00ff88'
  },
  nature: {
    name: 'Natureza',
    colors: ['#1e3a3a', '#2d5a5a'],
    icon: '🌿',
    accent: '#10b981'
  },
  space: {
    name: 'Espacial',
    colors: ['#0f0f1a', '#1a1a2e'],
    icon: '🚀',
    accent: '#8b5cf6'
  }
};

export default function StartScreen({ onStartGame, bestTimes = {} }: StartScreenProps) {
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: 'easy',
    soundEnabled: true,
    hapticEnabled: true,
    showTimer: true,
    showMoves: true,
    autoFlip: false,
    flipDelay: 1200,
    theme: 'classic'
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Animations
  const titleScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0);
  const cardAnimations = useSharedValue(0);

  useEffect(() => {
    // Entrada animada
    titleScale.value = withSequence(
      withSpring(1.1, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
    titleOpacity.value = withSpring(1, { damping: 10 });
    
    buttonScale.value = withDelay(300, withSpring(1, { damping: 10 }));
    cardAnimations.value = withDelay(600, withSpring(1, { damping: 8 }));
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonScale.value,
  }));
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(cardAnimations.value, [0, 1], [50, 0]) },
      { scale: cardAnimations.value ? cardAnimations.value : 1 }
    ],
    opacity: cardAnimations.value ? cardAnimations.value : 1,
  }));

  const handleStartGame = () => {
    onStartGame(settings);
  };

  const updateSetting = <K extends keyof GameSettings>(
    key: K, 
    value: GameSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const currentTheme = themeConfig[settings.theme];
  const fontSize = {
    title: screenWidth > 400 ? 36 : 32,
    subtitle: screenWidth > 400 ? 18 : 16,
    button: screenWidth > 400 ? 18 : 16,
    card: screenWidth > 400 ? 16 : 14,
    small: screenWidth > 400 ? 14 : 12,
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
            padding: 20,
            justifyContent: 'center'
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[titleAnimatedStyle, { alignItems: 'center', marginBottom: 40 }]}>
            <View style={{ 
              alignItems: 'center',
              marginBottom: 20
            }}>
              <Text style={{
                fontSize: 64,
                marginBottom: 10
              }}>🧠</Text>
              <Text style={{
                fontSize: fontSize.title,
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                textShadowColor: 'rgba(0,0,0,0.5)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4
              }}>
                Jogo da Memória
              </Text>
              <Text style={{
                fontSize: fontSize.subtitle,
                color: 'rgba(255,255,255,0.8)',
                textAlign: 'center',
                marginTop: 8
              }}>
                Desafie sua mente e divirta-se!
              </Text>
            </View>
          </Animated.View>

          {/* Difficulty Selection */}
          <Animated.View style={[cardAnimatedStyle, { marginBottom: 30 }]}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)'
            }}>
              <Text style={{
                fontSize: fontSize.card,
                fontWeight: '600',
                color: 'white',
                marginBottom: 15,
                textAlign: 'center'
              }}>
                🎯 Escolha a Dificuldade
              </Text>
              
              <View style={{ gap: 12 }}>
                {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map(level => {
                  const config = getDifficultyConfig(level);
                  const isSelected = settings.difficulty === level;
                  const bestTime = bestTimes[level];
                  
                  return (
                    <Pressable
                      key={level}
                      onPress={() => updateSetting('difficulty', level)}
                      style={{
                        backgroundColor: isSelected 
                          ? config.color 
                          : 'rgba(255,255,255,0.1)',
                        borderRadius: 15,
                        padding: 16,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected 
                          ? 'rgba(255,255,255,0.3)' 
                          : 'rgba(255,255,255,0.1)',
                        transform: [{ scale: isSelected ? 1.02 : 1 }]
                      }}
                    >
                      <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Text style={{ fontSize: 20, marginRight: 8 }}>
                              {config.icon}
                            </Text>
                            <Text style={{
                              fontSize: fontSize.card,
                              fontWeight: '600',
                              color: 'white'
                            }}>
                              {config.name}
                            </Text>
                          </View>
                          <Text style={{
                            fontSize: fontSize.small,
                            color: 'rgba(255,255,255,0.8)'
                          }}>
                            {config.description}
                          </Text>
                          {bestTime && (
                            <Text style={{
                              fontSize: fontSize.small - 2,
                              color: '#fbbf24',
                              marginTop: 4
                            }}>
                              🏆 Melhor: {formatTime(bestTime)}
                            </Text>
                          )}
                        </View>
                        {isSelected && (
                          <Text style={{ fontSize: 20, color: 'white' }}>✓</Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View style={[buttonAnimatedStyle, { gap: 15 }]}>
            {/* Start Game Button */}
            <Pressable
              onPress={handleStartGame}
              style={{
                backgroundColor: currentTheme.accent,
                borderRadius: 25,
                paddingVertical: 18,
                paddingHorizontal: 32,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{
                fontSize: fontSize.button,
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center'
              }}>
                🚀 Começar Jogo
              </Text>
            </Pressable>

            {/* Secondary Buttons */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              gap: 10
            }}>
              <Pressable
                onPress={() => setShowSettings(true)}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 20,
                  paddingVertical: 14,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)'
                }}
              >
                <Text style={{
                  fontSize: fontSize.button - 2,
                  fontWeight: '600',
                  color: 'white'
                }}>
                  ⚙️ Configurações
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowStats(true)}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 20,
                  paddingVertical: 14,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)'
                }}
              >
                <Text style={{
                  fontSize: fontSize.button - 2,
                  fontWeight: '600',
                  color: 'white'
                }}>
                  📊 Estatísticas
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSettings(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
          }}>
            <View style={{
              backgroundColor: currentTheme.colors[0],
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              maxHeight: '80%'
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20
              }}>
                <Text style={{
                  fontSize: fontSize.card,
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  ⚙️ Configurações
                </Text>
                <Pressable
                  onPress={() => setShowSettings(false)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 15,
                    padding: 8
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 16 }}>✕</Text>
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Theme Selection */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{
                    fontSize: fontSize.small,
                    color: 'white',
                    marginBottom: 10,
                    fontWeight: '600'
                  }}>
                    🎨 Tema Visual
                  </Text>
                  <View style={{ gap: 8 }}>
                    {Object.entries(themeConfig).map(([key, theme]) => (
                      <Pressable
                        key={key}
                        onPress={() => updateSetting('theme', key as GameSettings['theme'])}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: settings.theme === key 
                            ? theme.accent 
                            : 'rgba(255,255,255,0.1)',
                          borderRadius: 12,
                          padding: 12
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 18, marginRight: 10 }}>
                            {theme.icon}
                          </Text>
                          <Text style={{ color: 'white', fontSize: fontSize.small }}>
                            {theme.name}
                          </Text>
                        </View>
                        {settings.theme === key && (
                          <Text style={{ color: 'white', fontSize: 16 }}>✓</Text>
                        )}
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Game Settings */}
                <View style={{ gap: 15 }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: 15
                  }}>
                    <Text style={{ color: 'white', fontSize: fontSize.small }}>
                      🔊 Sons do jogo
                    </Text>
                    <Switch
                      value={settings.soundEnabled}
                      onValueChange={(value) => updateSetting('soundEnabled', value)}
                      trackColor={{ false: '#767577', true: currentTheme.accent }}
                    />
                  </View>

                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: 15
                  }}>
                    <Text style={{ color: 'white', fontSize: fontSize.small }}>
                      📳 Vibração
                    </Text>
                    <Switch
                      value={settings.hapticEnabled}
                      onValueChange={(value) => updateSetting('hapticEnabled', value)}
                      trackColor={{ false: '#767577', true: currentTheme.accent }}
                    />
                  </View>

                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: 15
                  }}>
                    <Text style={{ color: 'white', fontSize: fontSize.small }}>
                      ⏱️ Mostrar cronômetro
                    </Text>
                    <Switch
                      value={settings.showTimer}
                      onValueChange={(value) => updateSetting('showTimer', value)}
                      trackColor={{ false: '#767577', true: currentTheme.accent }}
                    />
                  </View>

                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: 15
                  }}>
                    <Text style={{ color: 'white', fontSize: fontSize.small }}>
                      📊 Mostrar jogadas
                    </Text>
                    <Switch
                      value={settings.showMoves}
                      onValueChange={(value) => updateSetting('showMoves', value)}
                      trackColor={{ false: '#767577', true: currentTheme.accent }}
                    />
                  </View>

                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: 15
                  }}>
                    <Text style={{ color: 'white', fontSize: fontSize.small }}>
                      🔄 Virar cartas automaticamente
                    </Text>
                    <Switch
                      value={settings.autoFlip}
                      onValueChange={(value) => updateSetting('autoFlip', value)}
                      trackColor={{ false: '#767577', true: currentTheme.accent }}
                    />
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Stats Modal */}
        <Modal
          visible={showStats}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowStats(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
          }}>
            <View style={{
              backgroundColor: currentTheme.colors[0],
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              maxHeight: '70%'
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20
              }}>
                <Text style={{
                  fontSize: fontSize.card,
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  📊 Suas Estatísticas
                </Text>
                <Pressable
                  onPress={() => setShowStats(false)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 15,
                    padding: 8
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 16 }}>✕</Text>
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {Object.keys(bestTimes).length === 0 ? (
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    <Text style={{ fontSize: 48, marginBottom: 10 }}>🎯</Text>
                    <Text style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: fontSize.small,
                      textAlign: 'center'
                    }}>
                      Jogue algumas partidas para ver suas estatísticas aqui!
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: 12 }}>
                    <Text style={{
                      color: 'white',
                      fontSize: fontSize.small,
                      fontWeight: '600',
                      marginBottom: 8
                    }}>
                      🏆 Melhores Tempos
                    </Text>
                    {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map(level => {
                      const config = getDifficultyConfig(level);
                      const bestTime = bestTimes[level];
                      
                      if (!bestTime) return null;
                      
                      return (
                        <View
                          key={level}
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderRadius: 12,
                            padding: 15,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 20, marginRight: 10 }}>
                              {config.icon}
                            </Text>
                            <Text style={{ color: 'white', fontSize: fontSize.small }}>
                              {config.name}
                            </Text>
                          </View>
                          <Text style={{
                            color: config.color,
                            fontSize: fontSize.small,
                            fontWeight: '600'
                          }}>
                            {formatTime(bestTime)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}