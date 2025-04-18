import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';
import { getVideoMetadata } from '@/utils/youtube';

export default function WatchScreen() {
  const { id } = useLocalSearchParams();
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    getVideoMetadata(id as string).then(metadata => setTitle(metadata.title));
  }, [id]);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <YoutubePlayer
        height={220}
        play={playing}
        videoId={id as string}
        onChangeState={onStateChange}
      />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    width: 200,
    marginHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingCard: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    padding: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});