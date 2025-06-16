import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, Image, Dimensions, TouchableOpacity, ScrollView, Animated, NativeScrollEvent } from "react-native";
import { supabase } from '@/db/supabaseClient';
import { router } from 'expo-router';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from "@/styles/colors";
import * as Network from 'expo-network';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ITEM_WIDTH = Dimensions.get("window").width * 0.38;
const ITEM_HEIGHT = ITEM_WIDTH * 1.7;
const SPACING = 5;

export function ReadingSection() {
  const [livros, setLivros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<typeof Animated.ScrollView>(null);
  const autoScrollAnimationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIndexRef = useRef<number>(0);
  const userScrollingRef = useRef<boolean>(false);
  const userScrollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Função para animar o scroll automaticamente de forma suave
  const scrollToIndex = useCallback((index: number) => {
    if (scrollViewRef.current && livros.length > 0) {
      scrollViewRef.current.scrollTo({
        x: index * (ITEM_WIDTH + SPACING),
        animated: true
      });
    }
  }, [livros.length]);

  // Iniciar ou continuar o auto-scroll
  const startAutoScroll = useCallback(() => {
    if (loading || livros.length === 0) return;

    // Limpar qualquer timeout anterior
    if (autoScrollAnimationRef.current) {
      clearTimeout(autoScrollAnimationRef.current);
    }

    // Configurar o próximo scroll
    autoScrollAnimationRef.current = setTimeout(() => {
      // Calcular próximo índice
      const nextIndex = (currentIndexRef.current + 1) % livros.length;

      // Atualizar o índice atual
      currentIndexRef.current = nextIndex;

      // Fazer o scroll suavemente para o próximo item
      scrollToIndex(nextIndex);

      // Continuar com a animação automática
      if (!userScrollingRef.current) {
        startAutoScroll();
      }
    }, 5000); // Intervalo de 4 segundos entre cada scroll
  }, [loading, livros.length, scrollToIndex]);

  // Iniciar auto-scroll quando o componente montar e os livros carregarem
  useEffect(() => {
    if (!loading && livros.length > 0 && !userScrollingRef.current) {
      startAutoScroll();
    }

    return () => {
      if (autoScrollAnimationRef.current) {
        clearTimeout(autoScrollAnimationRef.current);
      }

      if (userScrollingTimeoutRef.current) {
        clearTimeout(userScrollingTimeoutRef.current);
      }
    };
  }, [loading, livros.length, startAutoScroll]);

  // Manipuladores para interação do usuário
  const handleUserScrollBegin = () => {
    userScrollingRef.current = true;

    // Parar animação automática quando o usuário rola
    if (autoScrollAnimationRef.current) {
      clearTimeout(autoScrollAnimationRef.current);
    }

    // Limpar qualquer timeout existente
    if (userScrollingTimeoutRef.current) {
      clearTimeout(userScrollingTimeoutRef.current);
    }
  };

  const handleUserScrollEnd = (event: React.SyntheticEvent<NativeScrollEvent>) => {
    // Calcular o índice mais próximo com base na posição atual
    const position = event.nativeEvent.contentOffset?.x;
    if (position !== undefined) {
      currentIndexRef.current = Math.round(position / (ITEM_WIDTH + SPACING));
    }
    // Reiniciar autoscroll após 5 segundos de inatividade
    if (userScrollingTimeoutRef.current) {
      clearTimeout(userScrollingTimeoutRef.current);
    }

    userScrollingTimeoutRef.current = setTimeout(() => {
      userScrollingRef.current = false;
      startAutoScroll();
    }, 5000);
  };

  useEffect(() => {
    const fetchLivros = async () => {
      const networkState = await Network.getNetworkStateAsync();

      let livrosData: any[] = [];

      if (networkState.isConnected) {
        const { data, error } = await supabase
          .from('livros')
          .select('id, nome, image_url, destaque')
          .order('id', { ascending: true });

        if (error) {
          console.error('Erro ao buscar livros:', error);
        } else {
          livrosData = data;
          await AsyncStorage.setItem('livros', JSON.stringify(data));
        }
      } else {
        const storedLivros = await AsyncStorage.getItem('livros');
        if (storedLivros) {
          livrosData = JSON.parse(storedLivros);
        } else {
          console.error('Sem conexão e sem dados no armazenamento');
        }
      }

      setLivros(livrosData);
      setLoading(false);
    };

    fetchLivros();

    // Limpar timeouts quando o componente for desmontado
    return () => {
      if (autoScrollAnimationRef.current) {
        clearTimeout(autoScrollAnimationRef.current);
      }

      if (userScrollingTimeoutRef.current) {
        clearTimeout(userScrollingTimeoutRef.current);
      }
    };
  }, []);

  const handleLivroPress = (id: string) => {
    router.push(`/fisica/livros/livroDetalhes?id=${id}`)
    console.log(id)
  };

  const handleVerTodos = () => {
    // Navegar para tela com todos os livros
    router.push('/fisica/livros/LivrosHome');
  };
  // Função para renderizar um item do carrossel com animação
  const renderBookItem = (book: any, index: number) => {
    // Calcular a posição do item em relação ao scroll
    const inputRange = [
      (index - 1) * (ITEM_WIDTH + SPACING),
      index * (ITEM_WIDTH + SPACING),
      (index + 1) * (ITEM_WIDTH + SPACING)
    ];

    // Animação de escala
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.92, 1, 0.92],
      extrapolate: 'clamp'
    });

    // Animação de opacidade
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp'
    });

    return (
      <Animated.View
        key={book.id}
        style={{
          marginRight: SPACING,
          transform: [{ scale }],
          opacity,
          width: ITEM_WIDTH,
          height: ITEM_HEIGHT,
        }}
      >
        <TouchableOpacity
          className="rounded-xl overflow-hidden"
          style={{
            flex: 1,
            backgroundColor: colors.light["--color-roxo-70"]
          }}
          onPress={() => handleLivroPress(book.id)}
          activeOpacity={0.9}
        >
          <View className="flex-1">
            <Image
              source={{ uri: book.image_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'transparent']}
              className="absolute inset-x-0 top-0 h-16"
            />
          </View>
          <View className="p-2 bg-gray-100">
            <Text
              className="text-gray-80 font-semibold text-sm"
              numberOfLines={2}
            >
              {book.nome}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View className="py-4">
      <View className="flex-row justify-between items-center px-4 mb-3">
        <View className="flex-row items-center">
          <Ionicons name="book-outline" size={20} color="#7141A1" />
          <Text className="text-lg font-semibold ml-2" style={{ color: colors.default["--color-texto"] }}>Pausa para leitura</Text>
        </View>
        <TouchableOpacity onPress={handleVerTodos}>
          <Text style={{ color: colors.light["--color-roxo-100"] }}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
          {[1, 2, 3].map((_, index) => (
            <View
              key={index}
              className="mr-4 rounded-xl overflow-hidden"
              style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
            >
              <ShimmerPlaceholder
                style={{ width: '100%', height: '100%' }}
                shimmerColors={["#f2f2f2", "#e6e6e6", "#f2f2f2"]}
                LinearGradient={LinearGradient}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16 }}
          snapToInterval={ITEM_WIDTH + SPACING}
          snapToAlignment="start"
          decelerationRate="fast"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => handleUserScrollBegin()}
          onMomentumScrollEnd={(e) => handleUserScrollEnd(e)}
        >
          {livros.map((book, index) => renderBookItem(book, index))}
        </Animated.ScrollView>
      )}
    </View>
  );
}