import { View, Text, Dimensions } from 'react-native';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import { colors } from '@/styles/colors';
import RealFakeImag from '@/assets/backgrounds/vectors/RealFakeImg';

type VerdadeFakeData = {
  id: number;
  titulo: string;
  descricao: string;
  status: number;
  created_at: string;
};

export function VerdadeFake() {
  const { data, loading } = useSupabaseTable<VerdadeFakeData>(
    'verdadeoufake',
    {
      useCache: true,
      cacheKey: 'verdade_ou_fake_data',
      orderBy: { column: 'created_at', ascending: false },
      limit: 1,
    }
  );

  const screenWidth = Dimensions.get('window').width;

  if (loading) {
    return (
      <View className="items-center px-4 py-3">
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View className="items-center px-4 py-3">
        <Text>Nenhum dado disponível</Text>
      </View>
    );
  }

  const item = data[0];
  const isTrue = item.status === 1;
  const statusText = isTrue ? 'VERDADE' : 'FAKE';
  const statusColor = isTrue ? '#10B981' : '#EF4444';

  return (
    <View className="items-center px-4 py-3">
      {/* Card de visualização */}
      <View
        className="w-full rounded-2xl overflow-hidden shadow-lg"
        style={{
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <View
          className="w-full py-2 px-5"
          style={{ backgroundColor: colors.light['--color-roxo-80'] }}
        >
          <Text
            className="text-base font-poppins-bold text-center tracking-wide"
            style={{ color: 'white' }}
          >
            VERDADE OU FAKE?
          </Text>
        </View>

        <View className="flex-col">
          <View className="flex-row items-center">
            <View className="mr-4">
              <RealFakeImag width={85} height={85} />
            </View>

            <View className="flex-1 mt-2">
              <Text
                className="text-base font-poppins-semibold mb-2 leading-tight"
                style={{ color: colors.light['--color-roxo-90'] }}
              >
                {item.titulo}
              </Text>

              <Text
                className="text-sm font-poppins-regular leading-tight mb-1"
                style={{ color: colors.default['--color-texto'] }}
              >
                {item.descricao}
              </Text>

              <View className="flex-row justify-end ">
                <View
                  className="px-3 py-1 rounded-tl-full"
                  style={{ backgroundColor: statusColor }}
                >
                  <Text className="text-white font-poppins-bold text-base">
                    {statusText}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
