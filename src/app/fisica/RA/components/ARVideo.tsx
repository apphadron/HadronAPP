import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { ARContent } from '../types';

interface ARVideoProps {
  content: ARContent;
  isVisible: boolean;
}

export const ARVideo: React.FC<ARVideoProps> = ({ content, isVisible }) => {
  const [status, setStatus] = useState<any>({});
  const { width, height } = Dimensions.get('window');
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Animação de entrada
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Animação de flutuação
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      floatAnim.setValue(0);
    }
  }, [isVisible]);

  if (!isVisible || content.type !== 'video') {
    return null;
  }

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View className="absolute inset-0 justify-center items-center" pointerEvents="box-none">
      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { translateY: translateY },
          ],
          opacity: opacityAnim,
        }}
      >
        {/* Sombra AR */}
        <View 
          className="absolute inset-0 bg-black rounded-2xl"
          style={{
            transform: [{ translateY: 12 }, { translateX: 6 }],
            opacity: 0.4,
            width: width * 0.8,
            height: height * 0.5,
          }}
        />
        
        {/* Container principal do vídeo */}
        <View 
          className="bg-gray-900 rounded-2xl border-2 border-purple-500 overflow-hidden"
          style={{
            width: width * 0.8,
            height: height * 0.5,
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 15,
            elevation: 25,
          }}
        >
          {/* Barra superior com indicadores */}
          <View className="bg-purple-600 px-4 py-2 flex-row justify-between items-center">
            <View className="flex-row space-x-2">
              <View className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
              <View className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              <View className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </View>
            <Text className="text-white text-xs font-bold">AR VIDEO</Text>
          </View>
          
          {/* Player de vídeo */}
          <Video
            style={{
              width: '100%',
              height: '80%',
            }}
            source={{ uri: content.url }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay={true}
            onPlaybackStatusUpdate={setStatus}
          />
          
          {/* Controles customizados */}
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                {content.title && (
                  <Text className="text-white text-sm font-bold">
                    {content.title}
                  </Text>
                )}
                {content.description && (
                  <Text className="text-gray-300 text-xs">
                    {content.description}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity
                className="bg-purple-600 rounded-full p-2 ml-3"
                onPress={() => {
                  if (status.isPlaying) {
                    status.pauseAsync?.();
                  } else {
                    status.playAsync?.();
                  }
                }}
              >
                <Text className="text-white text-xs font-bold">
                  {status.isPlaying ? '⏸️' : '▶️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Indicadores de tracking AR */}
          <View className="absolute top-16 left-3">
            <View className="w-4 h-4 border-2 border-purple-400 rounded-full">
              <View className="w-2 h-2 bg-purple-400 rounded-full m-0.5 animate-pulse" />
            </View>
          </View>
          <View className="absolute top-16 right-3">
            <View className="w-4 h-4 border-2 border-blue-400 rounded-full">
              <View className="w-2 h-2 bg-blue-400 rounded-full m-0.5 animate-pulse" />
            </View>
          </View>
        </View>
        
        {/* Informações flutuantes */}
        <View className="absolute -bottom-20 left-0 right-0">
          <View className="bg-black bg-opacity-90 rounded-xl px-4 py-2 mx-6">
            <Text className="text-white text-xs text-center">
              🎬 Vídeo em Realidade Aumentada
            </Text>
            <Text className="text-gray-400 text-xs text-center mt-1">
              Toque nos controles para interagir
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

