import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { VideoCard } from '@/components/fisica/videos/VideoCard';
import { FEATURED_VIDEOS } from '@/app/fisica/videos/VideoHome';
import { CATEGORIES } from '@/app/fisica/videos/categories';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const category = CATEGORIES.find(cat => cat.id === id);
  const videos = FEATURED_VIDEOS[id as keyof typeof FEATURED_VIDEOS] || [];

  if (!category) return null;

  return (
    <ScrollView className='flex-1 bg-blue-700'>
      <View style={styles.grid} className='mt-5'>
        {videos.map((videoId) => (
          <View key={videoId} style={styles.gridItem} className='mb-4'>
            <VideoCard className='w-full rounded-none' classNameImage='rounded-none' videoId={videoId} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'blue',
      //padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      //gap: 16,
    },
    gridItem: {
      flex: 1,
      minWidth: 300,
      maxWidth: '100%',
    },
  });