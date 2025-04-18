import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as planetImages from '../../../assets/astronomia/planetas';
import { useRouter, router } from 'expo-router';
import { colors } from '@/styles/colors';

interface PlanetData {
  id: string;
  name: string;
  image: any;
}

const planetData: PlanetData[] = [
  {
    id: '1',
    name: 'Mercurio',
    image: planetImages.mercurio,
  },
  {
    id: '2',
    name: 'Venus',
    image: planetImages.venus,
  },
  {
    id: '3',
    name: 'Marte',
    image: planetImages.marte,
  },
];

export function CardPlanets() {
  const router = useRouter();

  function goTo3D() {
    router.push('/astronomia/PlanetasTelas');
  }

  return (
    <View className="p-3">
      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text className="font-orbitron text-white text-2xl">
            Planetas
          </Text>
          <Text className="text-sm text-white/70">
            Veja informações completas sobre planetas
          </Text>
        </View>

        <TouchableOpacity 
          onPress={goTo3D} 
          className="flex-row items-center gap-0 bg-white p-1 rounded-[50] "
        >
          <Text className="font-poppins-medium text-black text-xs">
            VER TUDO
          </Text>
          <AntDesign name="right" size={15} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2.5"
        className="flex-row"
      >
        {planetData.map((planet) => (
          <TouchableOpacity
            key={planet.id}
            style={{backgroundColor: colors.dark["--color-cinza-90"]}}
            className="w-[130px] h-[160px] rounded-xl overflow-hidden items-center border border-[#2F2F2F] p-2.5 gap-4"
          >
            <Text className="font-orbitron text-white mt-3 text-xl font-bold uppercase z-10">
              {planet.name}
            </Text>
            <View className="w-full h-4/5 items-center relative">
              <Image
                source={planet.image}
                className="w-[130%] h-[150%] object-cover"
              />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
                className="absolute bottom-0 top-0 w-[130%] h-[150%] justify-center"
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
