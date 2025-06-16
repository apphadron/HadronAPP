import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View } from "react-native";
import { ThemeProvider, useTheme } from "@/components/geral/ThemeContext";
import { colors } from "@/styles/colors";



export default function LayoutFisica() {
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
              backgroundColor: isLight ? colors.default["--color-branco"] : colors.dark["--color-cinza-100"],
            },
            headerTitleStyle: {
              color: colors.default["--color-texto"],
              fontSize: 18,
            },
            headerTitleAlign: "center",
            headerTintColor: "black",

            headerLeft: () => (
              <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 100, borderColor: "black" }}>
                <MaterialIcons
                  name="keyboard-arrow-left"
                  size={24}
                  color={colors.dark["--color-cinza-100"]}
                  onPress={() => Router.back()} />
              </View>
            ),
          };
        }}
      >

        <Stack.Screen
          name="livros/livroDetalhes"
          options={{
            headerShown: false
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
