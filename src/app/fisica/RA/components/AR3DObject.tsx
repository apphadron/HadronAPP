import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Dimensions, Animated, ActivityIndicator } from 'react-native';
import { ARContent } from '../types';

interface AR3DObjectProps {
  content: ARContent;
  isVisible: boolean;
}

export const AR3DObject: React.FC<AR3DObjectProps> = ({ content, isVisible }) => {
  const { width, height } = Dimensions.get('window');
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      // Simula carregamento do modelo 3D
      setIsLoading(true);
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
        
        // Animação de entrada
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();

        // Rotação contínua para simular objeto 3D
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          })
        ).start();
      }, 2000); // Simula 2 segundos de carregamento

      return () => clearTimeout(loadingTimer);
    } else {
      setIsLoading(true);
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [isVisible]);

  if (!isVisible || content.type !== '3d') {
    return null;
  }

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (isLoading) {
    return (
      <View className="absolute inset-0 justify-center items-center">
        <View className="bg-black bg-opacity-80 rounded-2xl p-8 items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-white text-lg font-bold mt-4">
            Carregando Modelo 3D
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            Preparando experiência AR...
          </Text>
          
          {/* Barra de progresso simulada */}
          <View className="w-48 h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
            <Animated.View 
              className="h-full bg-blue-500 rounded-full"
              style={{
                width: '100%',
                transform: [{ translateX: -192 }],
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="absolute inset-0 justify-center items-center" pointerEvents="none">
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { rotateY: rotate },
          ],
          opacity: opacityAnim,
        }}
      >
        {/* Sombra AR */}
        <View 
          className="absolute inset-0 bg-black rounded-3xl"
          style={{
            transform: [{ translateY: 15 }, { translateX: 8 }],
            opacity: 0.5,
            width: width * 0.7,
            height: height * 0.6,
          }}
        />
        
        {/* Container principal do objeto 3D */}
        <View 
          className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl border-2 border-cyan-400 overflow-hidden"
          style={{
            width: width * 0.7,
            height: height * 0.6,
            shadowColor: '#06B6D4',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 20,
            elevation: 30,
          }}
        >
          {/* Header com informações do modelo */}
          <View className="bg-cyan-600 px-4 py-3 flex-row justify-between items-center">
            <Text className="text-white text-sm font-bold">MODELO 3D</Text>
            <View className="flex-row space-x-1">
              <View className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <View className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <View className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            </View>
          </View>
          
          {/* Área de visualização 3D simulada */}
          <View className="flex-1 justify-center items-center p-6">
            {/* Objeto 3D simulado com múltiplas camadas */}
            <Animated.View
              style={{
                transform: [{ rotateY: rotate }],
              }}
              className="relative"
            >
              {/* Camada base */}
              <View className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl transform rotate-12 shadow-lg" />
              
              {/* Camada intermediária */}
              <View 
                className="absolute top-4 left-4 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl transform -rotate-12 shadow-lg"
                style={{ opacity: 0.8 }}
              />
              
              {/* Camada superior */}
              <View 
                className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-lg transform rotate-45 shadow-lg"
                style={{ opacity: 0.9 }}
              />
              
              {/* Pontos de luz simulando reflexos */}
              <View className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full opacity-80 animate-pulse" />
              <View className="absolute bottom-6 left-6 w-2 h-2 bg-cyan-300 rounded-full opacity-60 animate-pulse" />
            </Animated.View>
            
            {/* Informações do modelo */}
            <View className="mt-6 items-center">
              {content.title && (
                <Text className="text-white text-lg font-bold text-center">
                  {content.title}
                </Text>
              )}
              {content.description && (
                <Text className="text-gray-300 text-sm text-center mt-2">
                  {content.description}
                </Text>
              )}
              
              {/* Informações técnicas simuladas */}
              <View className="mt-4 bg-black bg-opacity-50 rounded-lg px-3 py-2">
                <Text className="text-cyan-400 text-xs text-center">
                  Vértices: 2,847 | Faces: 5,694
                </Text>
                <Text className="text-gray-400 text-xs text-center">
                  Formato: {content.url.split('.').pop()?.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Indicadores de tracking AR nos cantos */}
          <View className="absolute top-20 left-4">
            <View className="w-6 h-6 border-2 border-cyan-400 rounded-full items-center justify-center">
              <View className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            </View>
          </View>
          <View className="absolute top-20 right-4">
            <View className="w-6 h-6 border-2 border-purple-400 rounded-full items-center justify-center">
              <View className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            </View>
          </View>
          <View className="absolute bottom-20 left-4">
            <View className="w-6 h-6 border-2 border-pink-400 rounded-full items-center justify-center">
              <View className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
            </View>
          </View>
          <View className="absolute bottom-20 right-4">
            <View className="w-6 h-6 border-2 border-yellow-400 rounded-full items-center justify-center">
              <View className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            </View>
          </View>
        </View>
        
        {/* Informações flutuantes */}
        <View className="absolute -bottom-24 left-0 right-0">
          <View className="bg-black bg-opacity-90 rounded-xl px-4 py-3 mx-4">
            <Text className="text-white text-sm text-center font-bold">
              🎯 Objeto 3D em Realidade Aumentada
            </Text>
            <Text className="text-gray-400 text-xs text-center mt-1">
              Rotação automática ativa • Tracking estável
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

