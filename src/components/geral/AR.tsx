import React, { memo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { GLView } from 'expo-gl';
import type { ARContent } from '../types';

type AROverlayProps = {
  content: ARContent;
  qrLocation: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export const AROverlay = memo(({ content, qrLocation }: AROverlayProps) => {
  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      left: content.position?.x ?? (qrLocation.x + qrLocation.width / 2),
      top: content.position?.y ?? (qrLocation.y - qrLocation.height),
      transform: [{ scale: content.position?.scale ?? 1 }],
    },
    media: {
      width: 200,
      height: 200,
    },
  });

  if (content.type === 'image') {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: content.url }}
          style={styles.media}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (content.type === 'video') {
    return (
      <View style={styles.container}>
        <Video
          source={{ uri: content.url }}
          style={styles.media}
          shouldPlay
          isLooping
          resizeMode="contain"
        />
      </View>
    );
  }

  if (content.type === '3d') {
    return (
      <View style={styles.container}>
        <GLView
          style={styles.media}
          onContextCreate={() => {
            // Implementação 3D aqui
          }}
        />
      </View>
    );
  }

  return null;
});

AROverlay.displayName = 'AROverlay';