import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Ferramenta {
  id: string;
  titulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  cor: string;
  link: string;
}

const ferramentas: Ferramenta[] = [
  {
    id: '1',
    titulo: 'Calculadoras\nAstronômicas',
    icone: 'calculator',
    cor: '#4A5568',
    link: '/astronomia/ferramentas/calculadoras'
  },
  {
    id: '2',
    titulo: 'Conversores',
    icone: 'swap-horizontal',
    cor: '#553C9A',
    link: '/astronomia/ferramentas/conversores'
  },
  {
    id: '3',
    titulo: 'Olhos da\nNASA',
    icone: 'eye',
    cor: '#2A4365',
    link: '/astronomia/ferramentas/nasa'
  },
  {
    id: '4',
    titulo: 'Exoplanet',
    icone: 'planet',
    cor: '#1A365D',
    link: '/astronomia/ferramentas/exoplanet'
  },
  {
    id: '5',
    titulo: 'Satélites',
    icone: 'radio',
    cor: '#2D3748',
    link: '/astronomia/ferramentas/satelites'
  },
  {
    id: '6',
    titulo: 'Visualização\n3D',
    icone: 'cube',
    cor: '#322659',
    link: '/astronomia/ferramentas/3d'
  },
];

const FerramentaCard = ({ ferramenta }: { ferramenta: Ferramenta }) => {
  return (
    <Link href={ferramenta.link} asChild>
      <Pressable>
        <View 
          className="rounded-xl p-4 h-28 w-32 mr-3 mb-3 justify-center items-center"
          style={{ backgroundColor: ferramenta.cor }}
        >
          <Ionicons name={ferramenta.icone} size={28} color="white" />
          <Text className="text-white text-center text-xs mt-2 font-medium">
            {ferramenta.titulo}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
};

const SecaoFerramentas = () => {
  return (
    <View className="flex-row flex-wrap">
      {ferramentas.map(ferramenta => (
        <FerramentaCard key={ferramenta.id} ferramenta={ferramenta} />
      ))}
    </View>
  );
};

export default SecaoFerramentas;