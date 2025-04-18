import React from 'react';
import { View, Text, Image, Pressable, Dimensions } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import Rover from '@/assets/img/rover.jpg'

interface Filme {
  id: string;
  titulo: string;
  ano: string;
  rating: string;
  imagem: any;
  link: string;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.65;

const filmes: Filme[] = [
  {
    id: '1',
    titulo: 'Interestelar',
    ano: '2014',
    rating: '8.6',
    imagem: Rover,
    link: '/astronomia/filmes/interstellar'
  },
  {
    id: '2',
    titulo: 'Contato',
    ano: '1997',
    rating: '7.5',
    imagem: Rover,
    link: '/astronomia/filmes/contact'
  },
  {
    id: '3',
    titulo: 'Perdido em Marte',
    ano: '2015',
    rating: '8.0',
    imagem: Rover,
    link: '/astronomia/filmes/martian'
  },
  {
    id: '4',
    titulo: 'Ad Astra',
    ano: '2019',
    rating: '6.5',
    imagem: Rover,
    link: '/astronomia/filmes/ad-astra'
  },
  {
    id: '5',
    titulo: 'Primeiro Homem',
    ano: '2018',
    rating: '7.3',
    imagem: Rover,
    link: '/astronomia/filmes/first-man'
  },
];

const FilmeCard = ({ item }: { item: Filme }) => {
  return (
    <Link href={item.link} asChild>
      <Pressable>
        <View className="mr-3 bg-gray-900 rounded-xl overflow-hidden w-full">
          <Image 
            source={item.imagem}
            className="w-full h-40"
            resizeMode="cover"
          />
          <View className="p-3">
            <Text className="text-white font-bold">{item.titulo}</Text>
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-gray-400 text-xs">{item.ano}</Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text className="text-gray-400 text-xs ml-1">{item.rating}</Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};

const FilmesCarrossel = () => {
  // Componente de renderização separado para evitar problemas de referência
  const renderItem = ({ item }: { item: Filme }) => {
    return <FilmeCard item={item} />;
  };

  return (
    <View>
      <Carousel
        data={filmes}
        renderItem={renderItem}
        sliderWidth={width - 32}
        itemWidth={ITEM_WIDTH}
        activeSlideAlignment="start"
        inactiveSlideScale={1}
        inactiveSlideOpacity={1}
        // Remover esta linha pode resolver o problema
        // containerCustomStyle={{ overflow: 'visible' }}
        useScrollView={true}
      />
    </View>
  );
};

export default FilmesCarrossel;