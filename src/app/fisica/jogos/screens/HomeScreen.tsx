import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const HomeScreenJogos: React.FC = () => {
  const games = [
    {
      id: 'wordSearch',
      title: 'Caça-palavras',
      description: 'Encontre palavras de Física e Astronomia escondidas no grid',
      icon: '🔍',
      gradient: ['#667eea', '#764ba2'],
      shadowColor: '#667eea',
      accent: '#8b5cf6'
    },
    {
      id: 'puzzle',
      title: 'Quebra-cabeça',
      description: 'Monte imagens incríveis do cosmos',
      icon: '🧩',
      gradient: ['#f093fb', '#f5576c'],
      shadowColor: '#f093fb',
      accent: '#ec4899'
    },
    {
      id: 'memory',
      title: 'Jogo da Memória',
      description: 'Encontre os pares de símbolos científicos',
      icon: '🧠',
      gradient: ['#4facfe', '#00f2fe'],
      shadowColor: '#4facfe',
      accent: '#06b6d4'
    }
  ];

  const navigateToGame = (gameId: string) => {
    switch (gameId) {
      case 'wordSearch':
        router.push('/fisica/jogos/games/wordSearch/WordSearchGame' as any);
        break;
      case 'puzzle':
        router.push('/fisica/jogos/games/QuebraCabeca/PuzzleGame' as any);
        break;
      case 'memory':
        router.push('/fisica/jogos/memoryGame/MemoryGameScreen' as any);
        break;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Background com múltiplas camadas */}
      <LinearGradient
        colors={['#0f0c29', '#24243e', '#302b63']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Efeito de estrelas/partículas */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: 2,
              height: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header moderno */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ 
            alignItems: 'center', 
            marginBottom: 16,
            shadowColor: '#fff',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
          }}>
            <Text style={{ 
              fontSize: 48, 
              fontWeight: '800', 
              color: '#ffffff',
              textAlign: 'center',
              letterSpacing: 1.5,
              textShadowColor: 'rgba(139, 92, 246, 0.5)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 20,
            }}>
              🌌 COSMOS
            </Text>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: '300', 
              color: '#a855f7',
              textAlign: 'center',
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}>
              Games
            </Text>
          </View>
          
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 25,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}>
            <Text style={{ 
              fontSize: 16, 
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              fontWeight: '500',
            }}>
              Explore o universo através de jogos educativos
            </Text>
          </View>
        </View>

        {/* Cards dos jogos */}
        <View style={{ gap: 20 }}>
          {games.map((game, index) => (
            <TouchableOpacity
              key={game.id}
              onPress={() => navigateToGame(game.id)}
              activeOpacity={0.9}
              style={{
                shadowColor: game.shadowColor,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={game.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 24,
                  padding: 24,
                  marginBottom: 4,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                {/* Overlay com blur sutil */}
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 24,
                }} />
                
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {/* Ícone com background */}
                  <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}>
                    <Text style={{ fontSize: 28 }}>{game.icon}</Text>
                  </View>
                  
                  {/* Conteúdo */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      fontSize: 22, 
                      fontWeight: '700', 
                      color: '#ffffff',
                      marginBottom: 6,
                      textShadowColor: 'rgba(0, 0, 0, 0.3)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}>
                      {game.title}
                    </Text>
                    <Text style={{ 
                      fontSize: 14, 
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: 20,
                      fontWeight: '400',
                    }}>
                      {game.description}
                    </Text>
                  </View>
                  
                  {/* Seta com animação */}
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}>
                    <Text style={{ 
                      color: '#ffffff', 
                      fontSize: 18,
                      fontWeight: '600',
                    }}>→</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer elegante */}
        <View style={{ 
          marginTop: 40,
          alignItems: 'center',
          paddingTop: 24,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>🚀</Text>
            <Text style={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 14,
              fontWeight: '500',
            }}>
              Aprenda Física e Astronomia de forma divertida!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreenJogos;