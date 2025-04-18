import React from 'react';
import { ScrollView } from 'react-native';
import HeaderAstronomia from '@/components/astronomia/header';
import { AcessoRapido } from '@/components/astronomia/acessoRapido';
import { CardPlanets } from '@/components/astronomia/cardPlanets';
import { ExoplanetCounter } from '@/components/astronomia/exoplanetCounter';
import { Objects3DBanner } from '@/components/astronomia/banners/3dObjects';
import { CarouselCard } from '@/components/astronomia/carrosselCard';
import { Destaques } from '@/components/fisica/destaques/destaquesDB';
import { useTheme } from "@/components/geral/ThemeContext";
import { colors } from '@/styles/colors';

const HomeAstronomia: React.FC = () => {
  const { isLight } = useTheme();
  return (
    <ScrollView
    showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        backgroundColor: isLight
          ? colors.dark["--color-cinza-100"]
          : colors.dark["--color-cinza-100"],
        paddingBottom: 90,
      }}
      contentContainerStyle={{ paddingBottom: 90 }} >
        <Destaques area="ASTRONOMIA" />
        
        <AcessoRapido />

        <CarouselCard />

        <CardPlanets />

        <ExoplanetCounter />

        <Objects3DBanner />
    </ScrollView>
  );
};


export default HomeAstronomia; 