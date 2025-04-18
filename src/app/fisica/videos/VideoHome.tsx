import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { VideoCard } from '@/components/fisica/videos/VideoCard';
import { colors } from '@/styles/colors';

export const FEATURED_VIDEOS: { [key: string]: string[] } = {
  astronomia_indigena: ['8TqXHNBpAbk', 'NyuIjxkjoY0', 'AoAMQuehFOc'],
  filosofia: ['ifbUyM3W0fY', 'NoPHfH9Di44', 'qF07cgpruPc'],
};

const CATEGORIES = [
  { id: 'astronomia_indigena', name: 'Astronomia Indígena' },
  { id: 'filosofia', name: 'Filosofia' },
  // ... outras categorias
];

export default function VideoHome() {
  return (
    <ScrollView className='flex-1 bg-white'>
      {CATEGORIES.map((category) => (
        <View className='mb-6' key={category.id}>

          <View className='flex-row justify-between items-center mb-2 p-4'>
            <Text className='text-xl font-bold'>{category.name}</Text>

            <Link href={{
              pathname: `/fisica/videos/category/[id]`,
              params: {id: category.id, type: category.name }
            }} asChild>
              <TouchableOpacity style={{ backgroundColor: colors.light["--color-roxo-100"] }} className='rounded-full p-1'>
                <Text className='text-white text-sm px-1'>Ver todos</Text>
              </TouchableOpacity>
            </Link>

          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {FEATURED_VIDEOS[category.id]?.slice(0, 3).map((videoId) => (
              <View key={videoId} className='gap-2 mb-2 ml-4'>
                <VideoCard key={videoId} videoId={videoId} />
              </View>
            ))}
          </ScrollView>

        </View>
      ))}
    </ScrollView>
  );
}
