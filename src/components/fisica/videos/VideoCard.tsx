import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, Text, View, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { getVideoMetadata } from '@/utils/youtube';
import { colors } from '@/styles/colors';
import { useTheme } from '@/components/geral/ThemeContext';

interface VideoCardProps {
  videoId: string;
  style?: object;
  className?: string;
  classNameImage?: string;
  classNameText?: string;
  imageStyle?: object;
  textStyle?: object;
}

export function VideoCard({ videoId, style, className, imageStyle, classNameImage, textStyle, classNameText }: VideoCardProps) {
  const [metadata, setMetadata] = useState<{ title: string; thumbnail: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLight } = useTheme();

  useEffect(() => {
    getVideoMetadata(videoId)
      .then(setMetadata)
      .finally(() => setLoading(false));
  }, [videoId]);

  if (loading) {
    return (
      <View style={{
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Link href={`/fisica/videos/assistir/${videoId}`} asChild>
      <TouchableOpacity
        style={StyleSheet.flatten([{
          backgroundColor: isLight ? colors.default["--color-branco-90"] : colors.dark["--color-cinza-90"],
          borderWidth: 1,
          borderColor: colors.dark["--color-cinza-40"]
        }, style])}
        className={`w-64 h-48 rounded-lg ${className}`}
      >
        <Image
          source={{ uri: metadata?.thumbnail }}
          style={StyleSheet.flatten([imageStyle])}
          className={`w-full h-36 rounded-t-lg ${classNameImage}`}
          resizeMode="cover"
        />
        <Text
          style={textStyle}
          className={`p-2 text-base ${classNameText}`}
          numberOfLines={1}
        >
          {metadata?.title}
        </Text>
      </TouchableOpacity>
    </Link>
  );
}
