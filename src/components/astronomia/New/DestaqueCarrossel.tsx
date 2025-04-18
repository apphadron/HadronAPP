import React from 'react';
import { View, Text, Image, Pressable, Dimensions } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Rover from '@/assets/img/rover.jpg';

interface DestaqueItem {
  id: string;
  titulo: string;
  subtitulo: string;
  imagem: any;
  link: string;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.85;

const destaques: DestaqueItem[] = [
  {
    id: '1',
    titulo: 'James Webb',
    subtitulo: 'Nova descoberta nas nebulosas',
    imagem: Rover,
    link: '/astronomia/destaques/james-webb'
  },
  {
    id: '2',
    titulo: 'Missão Artemis',
    subtitulo: 'O retorno à Lua em 2025',
    imagem: Rover,
    link: '/astronomia/destaques/artemis'
  },
  {
    id: '3',
    titulo: 'Eclipse Solar',
    subtitulo: 'Prepare-se para o próximo evento',
    imagem: Rover,
    link: '/astronomia/destaques/eclipse'
  },
  {
    id: '4',
    titulo: 'Buraco Negro',
    subtitulo: 'Nova imagem capturada',
    imagem: Rover,
    link: '/astronomia/destaques/buraco-negro'
  },
];

const DestaqueCard = ({ item }: { item: DestaqueItem }) => {
  return (
    <Link href={item.link} asChild>
      <Pressable>
        <View className="rounded-2xl overflow-hidden bg-gray-900 h-48">
          <Image 
            source={item.imagem}
            className="absolute w-full h-full opacity-60"
            resizeMode="cover"
          />
          <View className="flex-1 p-4 justify-end">
            <View className="flex-row items-center mb-1">
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text className="text-white font-bold ml-1">Destaque</Text>
            </View>
            <Text className="text-white text-xl font-bold">{item.titulo}</Text>
            <Text className="text-gray-300">{item.subtitulo}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};

const DestaqueCarrossel = () => {
  // Componente de renderização separado para evitar problemas de referência
  const renderItem = ({ item }: { item: DestaqueItem }) => {
    return <DestaqueCard item={item} />;
  };

  return (
    <View>
      <Carousel
        data={destaques}
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

export default DestaqueCarrossel;