import React, { useEffect, useState } from "react";
import { View, Text, Image, Dimensions, TouchableOpacity } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { supabase } from '@/db/supabaseClient'; 
import { router } from 'expo-router';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { colors } from "@/styles/colors";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.5; 
const ITEM_HEIGHT = ITEM_WIDTH * 1.4;

// Componente otimizado para cada item do carrossel
const CarouselItem = React.memo(({ item, onPress }: { item: any, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <View  className="justify-end items-center rounded-xl overflow-hidden" style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT, backgroundColor: colors.dark["--color-cinza-100"], aspectRatio: 2 / 3 }}>
      <Image source={{ uri: item.banner }} style={{ resizeMode: "cover" }} className="w-full h-full" />
      <Text className="text-[18px] text-bold text-white p-1">{item.title}</Text>
    </View>
  </TouchableOpacity>
));

export function CarouselCard() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Estado de carregamento

  useEffect(() => {
    const fetchMovies = async () => {
      const storedMovies = await AsyncStorage.getItem('movies'); // Verificar se os filmes estão no AsyncStorage

      if (storedMovies) {
        setMovies(JSON.parse(storedMovies)); // Carregar filmes do AsyncStorage
        setLoading(false);
      } else {
        const { data, error } = await supabase
          .from('movies')
          .select('id, title, banner')
          .order('id', { ascending: true });

        if (error) {
          console.error('Erro ao buscar filmes:', error);
        } else {
          setMovies(data);
          await AsyncStorage.setItem('movies', JSON.stringify(data)); // Salvar filmes no AsyncStorage
        }
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleMoviePress = (movieId: string) => {
    // Navegar para a tela de detalhes do filme
    router.push(`/astronomia/filmes/filmeDetalhes?id=${movieId}`);
  };

  return (
    <View style={{backgroundColor: `${colors.dark["--color-cinza-90"]}80`}} className="flex-1 justify-center items-center ">
      <Text className="text-2xl font-bold text-white/80 mt-3">Que tal sugestões de filmes?</Text>

      {loading ? (
        // Exibindo o efeito shimmer enquanto os dados estão carregando
        <Carousel
          data={Array(3).fill({})} // Cria 5 placeholders para o shimmer
          height={ITEM_HEIGHT}
          loop
          width={ITEM_WIDTH}
          style={{ width: width, justifyContent: 'center' }}
          autoPlay={false}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.85,
            parallaxScrollingOffset: 40,
          }}
          pagingEnabled={true}
          snapEnabled={true}
          overscrollEnabled={false} // Impede o overscroll
          renderItem={() => (
            <View className="justify-end items-center rounded-[12px] overflow-hidden" style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT, backgroundColor: colors.dark["--color-cinza-80"], aspectRatio: 2 / 3 }}>
              <ShimmerPlaceholder
                style={{ width: '100%', height: '100%' }}
                shimmerColors={["#f2f2f2", "#e6e6e6", "#f2f2f2"]}
              />
            </View>
          )}
        />
      ) : (
        // Exibindo os filmes após o carregamento
        <Carousel
          data={movies} // Exibindo os filmes carregados
          height={ITEM_HEIGHT}
          loop
          width={ITEM_WIDTH}
          style={{ width: width, justifyContent: 'center' }}
          autoPlay={false}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.85,
            parallaxScrollingOffset: 40,
          }}
          pagingEnabled={true}
          snapEnabled={true}
          overscrollEnabled={false} // Impede o overscroll
          renderItem={({ item }) => <CarouselItem item={item} onPress={() => handleMoviePress(item.id)} />}
        />
      )}
    </View>
  );
}
