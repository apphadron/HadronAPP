import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/colors';
import { useTheme } from '@/components/geral/ThemeContext';

export interface FerramentaItem {
  id: number;
  icon: React.ComponentType<SvgProps>;
  title: string;
  rota: string;
}

// Interface para as props do componente
interface AcessoRapidoProps {
  titulo?: string;
  ferramentas: FerramentaItem[];
  backgroundColor?: string;
  textColor?: string;
  onItemPress?: (rota: string) => void;
}

export function AcessoRapido({
  titulo = 'Ferramentas',
  ferramentas,
  backgroundColor = colors.light['--color-verde-100'],
  onItemPress,
}: AcessoRapidoProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { isLight } = useTheme();

  function handlePress(rota: string, title: string) {
    if (onItemPress) {
      onItemPress(rota);
    } else {
      router.push({ pathname: rota as any, params: { type: title } }); // Passa o título como parâmetro
    }
  }


  return (
    <View className="p-0">
      {titulo && (
        <Text style={{ color: isLight ? colors.default["--color-texto"] : colors.default["--color-branco"] }} className={"text-lg font-medium mb-2 ml-3 font-poppins-400"}>
          {titulo}
        </Text>
      )}

      <View className="flex flex-row flex-wrap gap-2  items-center justify-center">
        {ferramentas.map((item) => (

          <TouchableOpacity
            key={item.id}
            activeOpacity={0.5}
            onPress={() => handlePress(item.rota, item.title)} // Passa o título ao navegar
            className=''
            style={{
              backgroundColor: `${isLight ? colors.light["--color-verde-100"] : colors.dark["--color-cinza-40"]}30`,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 8,
              height: isTablet ? 128 : 90,
              width: isTablet ? '32%' : 80,
              borderWidth: 1,
              borderColor: `${isLight ? colors.light["--color-verde-100"] : colors.dark["--color-cinza-40"]}30`,
            }}
          >
            <View className='p-2 rounded-full items-center mb-2' style={{ backgroundColor: colors.default["--color-branco"] }}>
              <item.icon width={32} height={32} style={{ borderRadius: 50, padding: 8, alignItems: 'center' }} />
            </View>
            <Text className="text-xs text-center font-poppins-medium" style={{ color: isLight ? colors.default["--color-texto"] : colors.default["--color-branco"] }}>
              {item.title}
            </Text>
          </TouchableOpacity>

        ))}
      </View>
    </View>
  );
}
