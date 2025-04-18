import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../styles/global.css";
import { TouchableOpacity } from "react-native";

import {
  useFonts,
  Orbitron_400Regular, Orbitron_500Medium, Orbitron_600SemiBold
} from '@expo-google-fonts/orbitron';
import {
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold
} from '@expo-google-fonts/poppins';
import { ScrollView } from "react-native";
import { ThemeProvider } from "@/components/geral/ThemeContext";

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Orbitron_400Regular,
    Inter_400Regular,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Orbitron_500Medium,
    Orbitron_600SemiBold,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null; // Retorna um indicador de carregamento, se necessário
  }

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade_from_bottom",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
