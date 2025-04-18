import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Dimensions, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { niveis } from './imgQuebra';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function JogoQuebraCabeca() {
  const { id } = useLocalSearchParams();
  const nivel = niveis.find((n) => n.id === id) || niveis[0];
  
  const [imagem, setImagem] = useState(nivel.imagens[0]);
  const [completo, setCompleto] = useState(false);
  const [jogando, setJogando] = useState(false);
  const [tempo, setTempo] = useState(0);
  const timerRef = useRef(null);
  
  // Constantes do jogo
  const getGrid = () => {
    switch (nivel.dificuldade) {
      case 'facil': return 3;
      case 'medio': return 4;
      case 'dificil': return 5;
      default: return 3;
    }
  };
  
  const grid = getGrid();
  const tamanhoJogo = SCREEN_WIDTH - 40;
  const tamanhoPeca = tamanhoJogo / grid;
  
  // Estrutura das peças
  const [pecas, setPecas] = useState(() => {
    // Inicialização apenas uma vez
    const initialPecas = [];
    return initialPecas;
  });
  
  // Limpar timer ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Criar nova partida
  const iniciarJogo = () => {
    // Parar timer anterior se existir
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Criar novas peças
    const novasPecas = [];
    for (let row = 0; row < grid; row++) {
      for (let col = 0; col < grid; col++) {
        const id = row * grid + col;
        const targetX = col * tamanhoPeca;
        const targetY = row * tamanhoPeca;
        
        // Posições iniciais aleatórias
        const randomOffsetX = (Math.random() - 0.5) * tamanhoJogo * 0.8;
        const randomOffsetY = (Math.random() - 0.5) * tamanhoJogo * 0.8;
        const startX = targetX + randomOffsetX;
        const startY = targetY + randomOffsetY;
        
        novasPecas.push({
          id,
          targetX,
          targetY,
          x: useSharedValue(startX),
          y: useSharedValue(startY),
          isCorrect: useSharedValue(false),
          zIndex: useSharedValue(1),
        });
      }
    }
    
    // Atualizar estado
    setPecas(novasPecas);
    setCompleto(false);
    setTempo(0);
    setJogando(true);
    
    // Iniciar timer
    timerRef.current = setInterval(() => {
      setTempo(prev => prev + 1);
    }, 1000);
  };
  
  // Verificar se quebra-cabeça está completo
  const verificarCompleto = () => {
    if (!jogando) return;
    
    const allCorrect = pecas.every(peca => peca.isCorrect.value);
    
    if (allCorrect) {
      // Parar timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setCompleto(true);
      setJogando(false);
      
      // Mostrar alerta de vitória
      setTimeout(() => {
        Alert.alert(
          "Parabéns!",
          `Você completou o quebra-cabeça em ${formatarTempo(tempo)}!`,
          [{ text: "OK" }]
        );
      }, 500);
    }
  };
  
  // Formatar tempo
  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };
  
  // Mudar imagem
  const mudarImagem = () => {
    const index = nivel.imagens.findIndex((img) => img.id === imagem.id);
    const proxIndex = (index + 1) % nivel.imagens.length;
    setImagem(nivel.imagens[proxIndex]);
  };
  
  // Renderizar peças
  const renderPecas = () => {
    if (!jogando) return null;
    
    return pecas.map((peca) => {
      // Criar estilo animado para posição
      const animatedStyle = useAnimatedStyle(() => {
        return {
          transform: [
            { translateX: peca.x.value },
            { translateY: peca.y.value },
          ],
          zIndex: peca.zIndex.value,
        };
      });
      
      // Criar gesto para arrastar peça
      const panGesture = Gesture.Pan()
        .onStart(() => {
          peca.zIndex.value = 100;  // Trazer peça para frente
        })
        .onUpdate((event) => {
          peca.x.value += event.translationX - event.translationX / 1.05;
          peca.y.value += event.translationY - event.translationY / 1.05;
        })
        .onEnd(() => {
          // Verificar se está próximo da posição correta
          const distX = Math.abs(peca.x.value - peca.targetX);
          const distY = Math.abs(peca.y.value - peca.targetY);
          
          if (distX < 20 && distY < 20) {
            // Encaixar na posição correta
            peca.x.value = withSpring(peca.targetX);
            peca.y.value = withSpring(peca.targetY);
            peca.isCorrect.value = true;
          } else {
            peca.isCorrect.value = false;
          }
          
          peca.zIndex.value = 1;  // Restaurar z-index normal
          
          // Verificar se jogo está completo
          runOnJS(verificarCompleto)();
        });
      
      // Calcular posição da imagem dentro da peça
      const imagemWidth = tamanhoJogo;
      const imagemHeight = tamanhoJogo;
      const pieceRow = Math.floor(peca.id / grid);
      const pieceCol = peca.id % grid;
      const imageOffsetX = -pieceCol * tamanhoPeca;
      const imageOffsetY = -pieceRow * tamanhoPeca;
      
      return (
        <GestureDetector key={peca.id} gesture={panGesture}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: tamanhoPeca,
                height: tamanhoPeca,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.23,
                shadowRadius: 2.62,
                elevation: 4,
              },
              animatedStyle,
            ]}
          >
            <Image
              source={imagem.source}
              style={{
                width: imagemWidth,
                height: imagemHeight,
                top: imageOffsetY,
                left: imageOffsetX,
              }}
              resizeMode="cover"
            />
          </Animated.View>
        </GestureDetector>
      );
    });
  };
  
  // Desistir do jogo
  const desistir = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setJogando(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#EEF2FF' }}>
        <StatusBar style="dark" />
        
        <View style={{ flex: 1, padding: 20 }}>
          {/* Cabeçalho */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: 16 
          }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 44,
                height: 44,
                backgroundColor: 'white',
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: "#6366F1",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 3,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#4F46E5' }}>←</Text>
            </TouchableOpacity>
            
            <View style={{
              backgroundColor: 'white',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 16,
              shadowColor: "#6366F1",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2,
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4F46E5', textAlign: 'center' }}>
                {nivel.nome}
              </Text>
              <Text style={{ fontSize: 14, color: '#6366F1', textAlign: 'center' }}>
                {nivel.dificuldade.charAt(0).toUpperCase() + nivel.dificuldade.slice(1)} • {grid}x{grid}
              </Text>
            </View>
            
            <View style={{
              backgroundColor: '#4F46E5',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              shadowColor: "#4F46E5",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 3,
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>
                {formatarTempo(tempo)}
              </Text>
            </View>
          </View>
          
          {/* Área de jogo */}
          <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            {!jogando ? (
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={imagem.source}
                  style={{ 
                    width: tamanhoJogo, 
                    height: tamanhoJogo,
                    borderRadius: 16,
                    borderWidth: 4,
                    borderColor: 'white',
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                    elevation: 8,
                  }}
                  resizeMode="cover"
                />
                
                <Text style={{ 
                  color: '#4F46E5', 
                  marginTop: 16, 
                  textAlign: 'center',
                  fontSize: 16,
                  opacity: 0.8
                }}>
                  {completo ? 
                    `Você completou em ${formatarTempo(tempo)}!` : 
                    "Arraste as peças para montar a imagem"
                  }
                </Text>
                
                <View style={{ flexDirection: 'row', marginTop: 24, gap: 16 }}>
                  <TouchableOpacity
                    onPress={mudarImagem}
                    style={{
                      backgroundColor: 'white',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 12,
                      shadowColor: "#6366F1",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    <Text style={{ color: '#4F46E5', fontWeight: '600' }}>Mudar imagem</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={iniciarJogo}
                    style={{
                      backgroundColor: '#4F46E5',
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 12,
                      shadowColor: "#4F46E5",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                      elevation: 3,
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                      {completo ? "Jogar novamente" : "Iniciar jogo"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <View style={{ 
                  width: tamanhoJogo, 
                  height: tamanhoJogo,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  borderWidth: 2,
                  borderColor: 'rgba(255, 255, 255, 0.7)',
                  position: 'relative',
                  marginBottom: 20,
                  shadowColor: "#6366F1",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}>
                  {renderPecas()}
                </View>
                
                <TouchableOpacity
                  onPress={desistir}
                  style={{
                    backgroundColor: '#EF4444',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignSelf: 'center',
                    shadowColor: "#EF4444",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Desistir</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}