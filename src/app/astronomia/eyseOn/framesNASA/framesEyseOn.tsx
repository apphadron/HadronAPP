import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';

export default function FramesEyseOn() {
  const { uri } = useLocalSearchParams<{ uri: string }>();

  useEffect(() => {
    // Permite todas as orientações
    ScreenOrientation.unlockAsync();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <WebView 
        source={{ 
          uri: uri
        }}
        style={styles.webview}
        allowsFullscreenVideo
        javaScriptEnabled
        domStorageEnabled
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
});
