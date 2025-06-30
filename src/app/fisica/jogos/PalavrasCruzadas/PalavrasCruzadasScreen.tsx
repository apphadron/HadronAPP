import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";

const words = require("./words.json");

export default function Home() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
        Palavras Cruzadas
      </Text>
      <FlatList
        data={words}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.push(`/fisica/jogos/PalavrasCruzadas/${index}` as any)}
            className="px-6 py-3 bg-indigo-500 rounded-xl mb-4"
          >
            <Text className="text-white text-lg font-medium">
              Nível {index + 1}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
