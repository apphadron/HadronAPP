import React, { useEffect, useRef } from 'react';
import { View, Image, Text, Dimensions, Animated } from 'react-native';
import { ARContent } from '../types';

interface ARImageProps {
  content: ARContent;
  isVisible: boolean;
}

export const ARImage: React.FC<ARImageProps> = ({ content, isVisible }) => {
  const { width, height } = Dimensions.get('window');
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Animação de entrada com efeito AR
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Rotação sutil para simular tracking 3D
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [isVisible]);

  if (!isVisible || content.type !== 'image') {
    return null;
  }

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-2deg', '2deg'],
  });

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
        {/* Sombra AR para dar profundidade */}
        <View 
          className="absolute inset-0 bg-black rounded-xl"
          style={{
            transform: [{ translateY: 8 }, { translateX: 4 }],
            opacity: 0.3,
            width: width * 0.6,
            height: height * 0.4,
          }}
        />
        
        {/* Container principal da imagem */}
        <View 
          className="bg-white rounded-xl shadow-2xl border-2 border-blue-400"
          style={{
            width: width * 0.6,
            height: height * 0.4,
            shadowColor: '#3B82F6',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 20,
          }}
        >
          <Image
            source={{ uri: content.url }}
            style={{
              width: '100%',
              height: '85%',
              resizeMode: 'cover',
            }}
            className="rounded-t-xl"
          />
          
          {/* Info overlay com efeito holográfico */}
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900 to-transparent rounded-b-xl p-2">
            {content.title && (
              <Text className="text-white text-sm font-bold text-center">
                {content.title}
              </Text>
            )}
          </View>
          
          {/* Indicadores AR */}
          <View className="absolute top-2 left-2">
            <View className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          </View>
          <View className="absolute top-2 right-2">
            <View className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </View>
          <View className="absolute bottom-2 left-2">
            <View className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          </View>
          <View className="absolute bottom-2 right-2">
            <View className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          </View>
        </View>
        
        {/* Texto flutuante com informações */}
        {content.description && (
          <View className="absolute -bottom-16 left-0 right-0">
            <View className="bg-black bg-opacity-80 rounded-lg px-3 py-2 mx-4">
              <Text className="text-white text-xs text-center">
                📱 {content.description}
              </Text>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

