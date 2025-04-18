import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, useWindowDimensions } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '@/styles/colors';

// Interface para os dados de exoplanetas
interface ExoplanetData {
  id: string;
  label: string;
  value: number;
  color: string;
  apiEndpoint: string;
  apiResponseKey: string;
}

export function ExoplanetCounter() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768; // Consideramos tablet a partir de 768px

  // Estado para armazenar os dados dos exoplanetas
  const [exoplanetData, setExoplanetData] = useState<ExoplanetData[]>([
    {
      id: 'total',
      label: 'TOTAL CONFIRMADOS',
      value: 0,
      color: "#243E4A",
      apiEndpoint: 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=SELECT%20COUNT(*)%20AS%20confirmed_exoplanets,%20MAX(rowupdate)%20AS%20last_update%20FROM%20ps%20WHERE%20default_flag%20=%201&format=json',
      apiResponseKey: 'confirmed_exoplanets'
    },
    {
      id: 'tess',
      label: 'TESS CONFIRMADOS',
      value: 0,
      color: '#2A4365', // Você pode definir cores diferentes aqui
      apiEndpoint: 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=SELECT%20COUNT(*)%20AS%20tess_confirmed_planets,%20MAX(rowupdate)%20AS%20last_update%20FROM%20toi%20WHERE%20tfopwg_disp%20=%20\'CP\'&format=json',
      apiResponseKey: 'tess_confirmed_planets'
    },
    {
      id: 'kepler',
      label: 'KEPLER CONFIRMADOS',
      value: 0,
      color: '#322659', // Você pode definir cores diferentes aqui
      apiEndpoint: 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=SELECT%20COUNT(*)%20AS%20kepler_confirmed_planets%20FROM%20keplernames&format=json',
      apiResponseKey: 'kepler_confirmed_planets'
    },
    {
      id: 'k2',
      label: 'K2 CONFIRMADOS',
      value: 0,
      color: '#44337A', // Você pode definir cores diferentes aqui
      apiEndpoint: 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=SELECT%20COUNT(*)%20AS%20k2_confirmed,%20MAX(rowupdate)%20AS%20last_update%20FROM%20k2pandc%20WHERE%20disposition%20=%20%27CONFIRMED%27&format=json',
      apiResponseKey: 'k2_confirmed'
    }
  ]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExoplanetData = async () => {
      setError(null);

      try {
        // Usar Promise.all para buscar todos os dados em paralelo
        const results = await Promise.all(
          exoplanetData.map(async (planet) => {
            try {
              const response = await fetch(planet.apiEndpoint);
              const data = await response.json();
              return {
                ...planet,
                value: data[0][planet.apiResponseKey] || 0
              };
            } catch (err) {
              console.error(`Erro ao buscar dados para ${planet.id}:`, err);
              return planet; // Manter os valores antigos em caso de erro
            }
          })
        );

        setExoplanetData(results);
      } catch (err) {
        setError('Erro ao carregar dados dos exoplanetas.');
        console.error('Erro geral:', err);
      } finally {
      }
    };

    fetchExoplanetData();
  }, []);

  // Componente para renderizar cada card de exoplaneta
  const ExoplanetCard = ({ item }: { item: ExoplanetData }) => (
    <View
      style={{
        backgroundColor: item.color,
        width: isTablet ? '24%' : '49%',
        marginBottom: 0,
        marginRight: isTablet ? '1%' : 0,
      }}
      className="rounded-lg items-center h-[82px] justify-center"
    >
      <Text className="text-[#E0E0E0] text-center mb-2">
        {item.label}
      </Text>

      <Text className="font-poppins-semibold text-[#E0E0E0] text-2xl">
        {item.value}
      </Text>

    </View>
  );

  // Renderizar grid ou linha baseado no tamanho da tela
  const renderExoplanetCards = () => {
    if (isTablet) {
      // Layout horizontal para tablets
      return (
        <View className="flex-row justify-between">
          {exoplanetData.map((planet) => (
            <ExoplanetCard key={planet.id} item={planet} />
          ))}
        </View>
      );
    } else {
      // Layout de grid 2x2 para dispositivos menores
      const rows = [];
      for (let i = 0; i < exoplanetData.length; i += 2) {
        const row = (
          <View key={`row-${i}`} className="flex-row justify-between mb-2">
            <ExoplanetCard item={exoplanetData[i]} />
            {i + 1 < exoplanetData.length && (
              <ExoplanetCard item={exoplanetData[i + 1]} />
            )}
          </View>
        );
        rows.push(row);
      }
      return <>{rows}</>;
    }
  };

  return (
    <View className="p-5 w-full mt-3 mb-3">
      <View className="flex-row justify-between items-center mb-3 gap-3  px-2">
        <Text className="text-white text-lg">
          EXOPLANETAS DESCOBERTOS
        </Text>

        <TouchableOpacity
          onPress={() => { console.log('VER TUDO') }}
          className="flex-row items-center bg-white p-2 rounded-full"
        >
          <Text className="font-poppins text-black text-xs">
            VER TUDO
          </Text>
        </TouchableOpacity>
      </View>

      {renderExoplanetCards()}

      {error && (
        <Text className="text-red-500 mt-2 text-center">
          {error}
        </Text>
      )}
    </View>
  );
}