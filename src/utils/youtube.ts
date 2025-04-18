import { getYoutubeMeta } from 'react-native-youtube-iframe';

export async function getVideoMetadata(videoId: string) {
  try {
    const metadata = await getYoutubeMeta(videoId);
    return {
      title: metadata.title,
      thumbnail: metadata.thumbnail_url,
    };
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    return {
      title: 'Video não disponível',
      thumbnail: 'https://via.placeholder.com/480x360.png?text=Video+não+disponível',
    };
  }
}