import React, { useEffect, useState } from "react";
import { View, Text, Image, Dimensions, TouchableOpacity } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { supabase } from '@/db/supabaseClient'; 
import { router } from 'expo-router';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { themes } from "@/styles/colors";
import * as Network from 'expo-network'; // Importando a API de rede do Expo

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.5; 
const ITEM_HEIGHT = ITEM_WIDTH * 1.4;

const CarouselItem = React.memo(({ item, onPress, isHighlight }: { item: any, onPress: () => void, isHighlight: boolean }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View className="justify-end items-center rounded-[12px] overflow-hidden" style={{width: ITEM_WIDTH, height: ITEM_HEIGHT, backgroundColor: 'green', aspectRatio: 2 / 3 }}>
        <Image source={{ uri: item.image_url }} style={{ resizeMode: "cover" }} className="w-full h-full" />
        <Text className="text-[18px] text-bold text-white p-1 text-center">{item.nome}</Text>
      </View>
    </TouchableOpacity>
  );
});

export function CarouselCard() {
  const [livros, setLivros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLivros = async () => {
      const networkState = await Network.getNetworkStateAsync();
      
      let livrosDestacados: any[] = [];
      let livrosRestantes: any[] = [];

      if (networkState.isConnected) {
        const { data, error } = await supabase
          .from('livros')
          .select('id, nome, image_url, destaque')
          .order('id', { ascending: true });

        if (error) {
          console.error('Erro ao buscar livros:', error);
        } else {
          livrosDestacados = data.filter(item => item.destaque === 'true');
          livrosRestantes = data.filter(item => item.destaque !== 'true');
          
          livrosDestacados = livrosDestacados.slice(0, 3);
          setLivros([...livrosDestacados, ...livrosRestantes]);
          await AsyncStorage.setItem('livros', JSON.stringify(data)); 
        }
      } else {
        const storedLivros = await AsyncStorage.getItem('livros');
        if (storedLivros) {
          const storedData = JSON.parse(storedLivros) as { destaque: string; id: string; nome: string; image_url: string }[];
          livrosDestacados = storedData.filter((item: { destaque: string }) => item.destaque === 'true');
          livrosRestantes = storedData.filter((item: { destaque: string }) => item.destaque !== 'true');
          setLivros([...livrosDestacados.slice(0, 3), ...livrosRestantes]);
        } else {
          console.error('Sem conexão e sem dados no armazenamento');
        }
      }

      setLoading(false);
    };

    fetchLivros();
  }, []);

  const handleLivroPress = (id: string) => {
    router.push(`/astronomia/filmes/filmeDetalhes?id=${id}`);
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-90">
      <Text className="text-2xl font-bold text-black/80 mt-3">Pausa para leitura</Text>

      {loading ? (
        <Carousel
          data={Array(3).fill({})} 
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
          overscrollEnabled={true}
          renderItem={() => (
            <View
              className="justify-end items-center bg-gray-primary rounded-[12px] overflow-hidden"
              style={{
                width: ITEM_WIDTH,
                height: ITEM_HEIGHT,
                marginHorizontal: 10, // Adicione espaçamento
                aspectRatio: 2 / 3,
              }}
            >
              <ShimmerPlaceholder
                style={{ width: '100%', height: '100%' }}
                shimmerColors={["#f2f2f2", "#e6e6e6", "#f2f2f2"]}
              />
            </View>
          )}
        />
      ) : (
        <Carousel
          data={livros} 
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
          overscrollEnabled={true}
          renderItem={({ item }) => {
            const isHighlight = item.destaque === 'true';
            return (
              <CarouselItem
                item={item}
                onPress={() => handleLivroPress(item.id)}
                isHighlight={isHighlight}
              />
            );
          }}
        />
      )}
    </View>
  );
}

