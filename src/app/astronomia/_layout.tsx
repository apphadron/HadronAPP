import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View } from "react-native";
import { ThemeProvider, useTheme } from "@/components/geral/ThemeContext";
import { colors } from "@/styles/colors";



export default function LayoutAstronomia() {
  const Router = useRouter();
  const { isLight } = useTheme();

  return (
    <ThemeProvider>
      <Stack
        screenOptions={({ route }) => {
          const params = route.params as { type?: string; disableHeader?: boolean };
          return {
            animation: "fade_from_bottom",
            title: params.type ? String(params.type) : "Título Padrão",
            headerShown: params.disableHeader ? false : true,
            headerStyle: {
              backgroundColor: isLight ? colors.dark["--color-cinza-100"] : colors.default["--color-branco"],
            },
            headerTitleStyle: {
              color: colors.default["--color-branco"],
              fontSize: 18,
            },
            headerTitleAlign: "center",
            headerTintColor: "white",

            headerLeft: () => (
              <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 100, borderColor: "white" }}>
                <MaterialIcons
                  name="keyboard-arrow-left"
                  size={24}
                  color={colors.default["--color-branco"]}
                  onPress={() => Router.back()} />
              </View>
            ),
          };
        }}
      >

        <Stack.Screen
          name="filmes/filmeDetalhes"
          options={{
            headerShown: false
          }}
        />

      </Stack>
    </ThemeProvider>
  );
}
