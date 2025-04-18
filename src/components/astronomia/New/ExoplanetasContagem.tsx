import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface DadosExoplanetas {
  total: number;
  tess: number;
  kepler: number;
  k2: number;
}

// Estes dados podem vir de uma API em uma situação real
const dadosExoplanetas: DadosExoplanetas = {
  total: 5273,
  tess: 342,
  kepler: 2712,
  k2: 517,
};

const CardContagem = ({ 
  titulo, 
  valor, 
  cores, 
  icone 
}: { 
  titulo: string, 
  valor: number, 
  cores: string[], 
  icone: keyof typeof Ionicons.glyphMap 
}) => {
  return (
    <View className="flex-1 mr-3 mb-3 rounded-xl overflow-hidden">
      <LinearGradient
        colors={cores}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 16, height: 112 }} // Usando style diretamente em vez de className para o LinearGradient
      >
        <View className="flex-row justify-between items-start">
          <Text className="text-white font-semibold mb-1">{titulo}</Text>
          <Ionicons name={icone} size={20} color="white" />
        </View>
        <Text className="text-white text-3xl font-bold mt-2">{valor.toLocaleString()}</Text>
      </LinearGradient>
    </View>
  );
};

const ExoplanetasContagem = () => {
  return (
    <View>
      <View className="flex-row mb-3">
        <CardContagem 
          titulo="Total Confirmados" 
          valor={dadosExoplanetas.total} 
          cores={['#1A202C', '#2D3748']} 
          icone="planet" 
        />
        <CardContagem 
          titulo="TESS Confirmados" 
          valor={dadosExoplanetas.tess} 
          cores={['#2A4365', '#1A365D']} 
          icone="telescope" 
        />
      </View>
      <View className="flex-row">
        <CardContagem 
          titulo="Kepler Confirmados" 
          valor={dadosExoplanetas.kepler} 
          cores={['#322659', '#553C9A']} 
          icone="aperture" 
        />
        <CardContagem 
          titulo="K2 Confirmados" 
          valor={dadosExoplanetas.k2} 
          cores={['#44337A', '#322659']} 
          icone="search" 
        />
      </View>
    </View>
  );
};

export default ExoplanetasContagem;