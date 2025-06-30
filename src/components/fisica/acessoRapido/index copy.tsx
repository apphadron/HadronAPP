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

  function handlePress(rota: string) {
    if (onItemPress) {
      onItemPress(rota);
    } else {
      //console.log(rota);
      router.push(rota as any);
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
            onPress={() => handlePress(item.rota)}
            className='border border-1 border-slate-200'
            style={{
              backgroundColor: `${isLight ? colors.light["--color-verde-100"] : colors.dark["--color-cinza-40"]}30`,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 8,
              height: isTablet ? 128 : 100,
              width: isTablet ? '32%' : 80,

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
