import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {ThemedTouchableOpacity} from '@/components/geral/astro/ThemeComponents';
import NasaIcon from '@/assets/icons/NasaIcon';
import { colors } from '@/styles/colors';

interface FerramentaItem {
  id: number;
  icon: keyof typeof Ionicons.glyphMap | React.ReactNode;
  title: string;
  rota: string;
  isCustomIcon?: boolean;
}

const ferramentas: FerramentaItem[] = [
  { id: 1, icon: 'telescope-outline', title: 'Calculadoras Astronômicas', rota: '/astronomia/calculadoras/CalculadorasScreen' },
  { id: 2, icon: 'swap-horizontal', title: 'Conversores', rota: '/astronomia/eyseOn' },
  { id: 3, icon: <NasaIcon width={50} height={50}/>, title: 'Olhos da Nasa', rota: '/astronomia/eyseOn', isCustomIcon: true },
  { id: 4, icon: 'planet', title: 'Exoplanet Archive', rota: '/astronomia/BuscaExoplanetas/SearchExoplanet' },
  { id: 5, icon: 'radio', title: 'Satelites', rota: '/astronomia/rastrearSatelite/rastrearSateliteScreen' },
  { id: 6, icon: 'cube', title: 'Objetos 3D', rota: '/astronomia/Objetos3D' },
];

export function AcessoRapido() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  function goToRouter(rota: any, title: string) {
    router.push({ pathname: rota, params: { type: title } });
  }

  return (
    <View className="p-3 ">
      <Text className="text-white text-lg font-bold mb-3 font-poppins-400">
        Ferramentas
      </Text>

      <View className="flex flex-row flex-wrap gap-3 justify-center">
        {ferramentas.map((item) => (
          <ThemedTouchableOpacity
            key={item.id}
            onPress={() => goToRouter(item.rota, item.title)}
            style={{backgroundColor: `${colors.dark["--color-cinza-90"]}80`}}
            className={`rounded-lg items-center justify-center 
              ${isTablet ? 'flex-1 basis-32 h-32' : 'w-[31%] h-[95px]'}`}
          >
            {item.isCustomIcon ? (
              item.icon // Renderiza o ícone personalizado diretamente
            ) : (
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={32} color="#FFFFFF" />
            )}
            <Text className="text-white text-base text-center mt-2 font-poppins-500">
              {item.title}
            </Text>
          </ThemedTouchableOpacity>
        ))}
      </View>
    </View>
  );
}
