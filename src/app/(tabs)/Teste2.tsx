import React, { useState, useRef } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Image, 
  Dimensions, StatusBar, Animated, ImageBackground 
} from 'react-native';
import { 
  MaterialIcons, 
  Ionicons, 
  FontAwesome5, 
  MaterialCommunityIcons,
  AntDesign
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Componente principal da Home
export default function HomeScreen() {
  // Para o carrossel de destaques
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const windowWidth = Dimensions.get('window').width;
  
  // Dados de exemplo para os carrosséis com placeholders reais
  const featuredCards = [
    { 
      id: 1, 
      title: 'Teoria da Relatividade', 
      image: 'https://picsum.photos/id/1002/800/400', 
      desc: 'Entenda os conceitos básicos' 
    },
    { 
      id: 2, 
      title: 'Física Quântica', 
      image: 'https://picsum.photos/id/1025/800/400', 
      desc: 'O mundo microscópico' 
    },
    { 
      id: 3, 
      title: 'Mecânica Clássica', 
      image: 'https://picsum.photos/id/1031/800/400', 
      desc: 'Fundamentos essenciais' 
    },
  ];
  
  const readingCards = [
    { 
      id: 1, 
      title: 'Breve História do Tempo', 
      author: 'Stephen Hawking', 
      image: 'https://picsum.photos/id/24/300/450' 
    },
    { 
      id: 2, 
      title: 'Física para Leigos', 
      author: 'Steven Holzner', 
      image: 'https://picsum.photos/id/106/300/450' 
    },
    { 
      id: 3, 
      title: 'O Universo Elegante', 
      author: 'Brian Greene', 
      image: 'https://picsum.photos/id/240/300/450' 
    },
  ];
  
  const videoCards = [
    { 
      id: 1, 
      title: 'Leis de Newton', 
      duration: '12:34', 
      image: 'https://picsum.photos/id/1040/400/250',
      views: '14K' 
    },
    { 
      id: 2, 
      title: 'O que é energia escura?', 
      duration: '8:21', 
      image: 'https://picsum.photos/id/1050/400/250',
      views: '22K' 
    },
    { 
      id: 3, 
      title: 'Princípio de Arquimedes', 
      duration: '15:47', 
      image: 'https://picsum.photos/id/1015/400/250',
      views: '8.5K' 
    },
  ];

  const tools = [
    { 
      id: 1, 
      name: 'Calculadora', 
      icon: <MaterialIcons name="calculate" size={28} color="#fff" />,
      color: ['#9C27B0', '#7B1FA2']
    },
    { 
      id: 2, 
      name: 'Conversores', 
      icon: <Ionicons name="swap-horizontal" size={28} color="#fff" />,
      color: ['#673AB7', '#512DA8']
    },
    { 
      id: 3, 
      name: 'Fórmulas', 
      icon: <MaterialIcons name="functions" size={28} color="#fff" />,
      color: ['#3F51B5', '#303F9F']
    },
    { 
      id: 4, 
      name: 'Laboratório', 
      icon: <FontAwesome5 name="flask" size={25} color="#fff" />,
      color: ['#2196F3', '#1976D2']
    },
    { 
      id: 5, 
      name: 'Jogos', 
      icon: <Ionicons name="game-controller" size={28} color="#fff" />,
      color: ['#00BCD4', '#0097A7']
    },
    { 
      id: 6, 
      name: 'Gráficos', 
      icon: <Ionicons name="stats-chart" size={28} color="#fff" />,
      color: ['#4CAF50', '#388E3C']
    },
    { 
      id: 7, 
      name: 'RA', 
      icon: <MaterialCommunityIcons name="augmented-reality" size={28} color="#fff" />,
      color: ['#FFC107', '#FFA000']
    },
    { 
      id: 8, 
      name: 'Eventos', 
      icon: <MaterialIcons name="event" size={28} color="#fff" />,
      color: ['#FF5722', '#E64A19']
    },
  ];

  const truthOrFakeItems = [
    {
      statement: "A luz é tanto uma onda quanto uma partícula, o que é conhecido como dualidade onda-partícula.",
      isTrue: true
    }
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar backgroundColor="#7141A1" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#9C27B0', '#7141A1', '#5E35B1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="pt-12 pb-6 px-4 rounded-b-3xl"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-3xl font-bold">Physics</Text>
            <Text className="text-white text-sm opacity-80">Aprenda física de forma divertida</Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity className="p-2 mr-2 bg-white/20 rounded-full">
              <Ionicons name="notifications-outline" color="white" size={24} />
            </TouchableOpacity>
            <TouchableOpacity className="p-2 bg-white/20 rounded-full">
              <Ionicons name="search" color="white" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Carrossel de Destaques */}
        <View className="py-4">
          <View className="flex-row justify-between items-center px-4 mb-2">
            <Text className="text-xl font-bold text-gray-800">Destaques</Text>
            <TouchableOpacity>
              <Text className="text-[#7141A1]">Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          <Animated.ScrollView 
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.floor(
                e.nativeEvent.contentOffset.x / (windowWidth - 40)
              );
              setActiveSlide(newIndex);
            }}
          >
            {featuredCards.map((item, index) => {
              const inputRange = [
                (index - 1) * (windowWidth - 40),
                index * (windowWidth - 40),
                (index + 1) * (windowWidth - 40)
              ];
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.9, 1, 0.9],
                extrapolate: 'clamp'
              });
              
              return (
                <Animated.View 
                  key={item.id}
                  style={{ transform: [{ scale }], width: windowWidth - 40 }}
                  className="mx-2"
                >
                  <TouchableOpacity className="rounded-2xl overflow-hidden shadow-lg bg-white">
                    <ImageBackground 
                      source={{ uri: item.image }}
                      className="h-56 w-full justify-end"
                    >
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        className="p-4"
                      >
                        <Text className="text-white text-xl font-bold">{item.title}</Text>
                        <Text className="text-white opacity-80">{item.desc}</Text>
                      </LinearGradient>
                    </ImageBackground>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.ScrollView>
          
          {/* Indicadores do carrossel - Versão fixa sem animação de largura */}
          <View className="flex-row justify-center mt-3 items-center">
            {featuredCards.map((_, index) => {
              const inputRange = [
                (index - 1) * (windowWidth - 40),
                index * (windowWidth - 40),
                (index + 1) * (windowWidth - 40)
              ];

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp'
              });

              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [1, 1.2, 1],
                extrapolate: 'clamp'
              });

              return (
                <Animated.View
                  key={index}
                  style={{ 
                    opacity, 
                    transform: [{ scale }],
                    backgroundColor: '#7141A1',
                    height: 8,
                    width: index === activeSlide ? 24 : 8,
                    borderRadius: 4,
                    marginHorizontal: 4
                  }}
                />
              );
            })}
          </View>
        </View>
        
        {/* Ferramentas */}
        <View className="py-4">
          <Text className="px-4 text-xl font-bold mb-3 text-gray-800">Ferramentas</Text>
          <View className="flex-row flex-wrap px-2">
            {tools.map((tool) => (
              <TouchableOpacity 
                key={tool.id} 
                className="w-1/4 items-center mb-6"
              >
                <View className="mb-2 rounded-2xl overflow-hidden shadow-md">
                  <LinearGradient
                    colors={tool.color}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-16 h-16 items-center justify-center"
                  >
                    {tool.icon}
                  </LinearGradient>
                </View>
                <Text className="text-xs font-medium text-center text-gray-700">{tool.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Card de Astronomia */}
        <View className="mx-4 my-2">
          <TouchableOpacity className="rounded-2xl overflow-hidden shadow-lg">
            <ImageBackground 
              source={{ uri: 'https://picsum.photos/id/30/800/400' }}
              className="h-56 justify-between"
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.8)']}
                className="absolute inset-0"
              />
              
              {/* Stars animation - simplified version */}
              <View className="absolute inset-0">
                {[...Array(30)].map((_, i) => (
                  <View 
                    key={i} 
                    className="absolute bg-white rounded-full"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.8 + 0.2,
                      width: Math.random() * 2 + 1,
                      height: Math.random() * 2 + 1
                    }}
                  />
                ))}
              </View>
              
              <View className="p-4">
                <Text className="text-white text-xs font-medium bg-[#7141A1] self-start px-3 py-1 rounded-full">ASTRONOMIA</Text>
              </View>
              <View className="p-4">
                <Text className="text-white text-2xl font-bold mb-2">Descubra os mistérios do universo</Text>
                <TouchableOpacity className="bg-[#7141A1] px-6 py-3 rounded-full self-start flex-row items-center">
                  <Text className="text-white font-bold mr-2">EXPLORAR</Text>
                  <AntDesign name="arrowright" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>
        
        {/* Pausa para leitura */}
        <View className="py-4">
          <View className="flex-row justify-between items-center px-4 mb-3">
            <View className="flex-row items-center">
              <Ionicons name="book-outline" size={20} color="#7141A1" />
              <Text className="text-xl font-bold ml-2 text-gray-800">Pausa para leitura</Text>
            </View>
            <TouchableOpacity>
              <Text className="text-[#7141A1]">Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
            {readingCards.map((book) => (
              <TouchableOpacity 
                key={book.id}
                className="mr-4 bg-white rounded-xl shadow-md overflow-hidden w-36"
              >
                <View className="relative">
                  <Image 
                    source={{ uri: book.image }}
                    className="h-52 w-full"
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.7)', 'transparent']}
                    className="absolute inset-x-0 top-0 h-16"
                  />
                  <View className="absolute top-2 right-2 bg-[#7141A1] rounded-full p-2">
                    <Ionicons name="bookmark-outline" size={16} color="white" />
                  </View>
                </View>
                <View className="p-3">
                  <Text className="text-sm font-bold text-gray-800" numberOfLines={2}>{book.title}</Text>
                  <Text className="text-xs text-gray-500 mt-1">{book.author}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Verdade ou Fake */}
        <View className="mx-4 my-2">
          <View className="bg-white rounded-xl shadow-md overflow-hidden">
            <LinearGradient
              colors={['#7141A1', '#9C27B0']}
              className="py-3 px-4"
            >
              <Text className="text-lg font-bold text-white">Verdade ou Fake?</Text>
            </LinearGradient>
            
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-700 flex-1 pr-4">
                  {truthOrFakeItems[0].statement}
                </Text>
                <View className={`${truthOrFakeItems[0].isTrue ? 'bg-green-500' : 'bg-red-500'} px-3 py-1 rounded-full`}>
                  <Text className="text-white text-xs font-bold">
                    {truthOrFakeItems[0].isTrue ? 'VERDADE' : 'FAKE'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity className="flex-row items-center mt-2 bg-gray-100 py-2 px-4 rounded-full self-start">
                <Text className="text-[#7141A1] font-bold mr-1">Saiba mais</Text>
                <AntDesign name="arrowright" size={14} color="#7141A1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Assista e Aprenda */}
        <View className="py-4">
          <View className="flex-row justify-between items-center px-4 mb-3">
            <View className="flex-row items-center">
              <Ionicons name="play-circle-outline" size={22} color="#7141A1" />
              <Text className="text-xl font-bold ml-2 text-gray-800">Assista e Aprenda</Text>
            </View>
            <TouchableOpacity>
              <Text className="text-[#7141A1]">Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          <View className="px-4">
            {videoCards.map((video) => (
              <TouchableOpacity 
                key={video.id}
                className="flex-row bg-white mb-4 rounded-xl shadow-md overflow-hidden"
              >
                <View className="relative">
                  <Image 
                    source={{ uri: video.image }}
                    className="h-24 w-40"
                  />
                  <View className="absolute inset-0 flex items-center justify-center">
                    <View className="bg-black/50 rounded-full p-2">
                      <Ionicons name="play" size={24} color="white" />
                    </View>
                  </View>
                  <View className="absolute bottom-1 right-1 bg-black/70 px-2 py-1 rounded-md">
                    <Text className="text-white text-xs">{video.duration}</Text>
                  </View>
                </View>
                <View className="flex-1 p-3 justify-center">
                  <Text className="font-bold text-gray-800">{video.title}</Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="eye-outline" size={14} color="#7141A1" />
                    <Text className="text-xs text-gray-500 ml-1">{video.views} visualizações</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Menu de acesso rápido */}
        <View className="px-4 py-5 mt-2">
          <Text className="text-xl font-bold mb-3 text-gray-800">Conteúdos Especiais</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-white rounded-xl shadow-md overflow-hidden w-[31%]">
              <LinearGradient
                colors={['#3F51B5', '#5E35B1']}
                className="p-4 items-center"
              >
                <MaterialIcons name="menu-book" size={28} color="white" />
              </LinearGradient>
              <View className="p-3 items-center">
                <Text className="font-bold text-center text-gray-800">Glossário</Text>
                <Text className="text-xs text-center text-gray-500 mt-1">Termos científicos</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-white rounded-xl shadow-md overflow-hidden w-[31%]">
              <LinearGradient
                colors={['#00BCD4', '#2196F3']}
                className="p-4 items-center"
              >
                <MaterialCommunityIcons name="atom" size={28} color="white" />
              </LinearGradient>
              <View className="p-3 items-center">
                <Text className="font-bold text-center text-gray-800">Áreas</Text>
                <Text className="text-xs text-center text-gray-500 mt-1">Campos da física</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-white rounded-xl shadow-md overflow-hidden w-[31%]">
              <LinearGradient
                colors={['#E91E63', '#9C27B0']}
                className="p-4 items-center"
              >
                <MaterialCommunityIcons name="account-group" size={28} color="white" />
              </LinearGradient>
              <View className="p-3 items-center">
                <Text className="font-bold text-center text-gray-800">Mulheres</Text>
                <Text className="text-xs text-center text-gray-500 mt-1">Na ciência</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Padding no final para melhor experiência de scroll */}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
}