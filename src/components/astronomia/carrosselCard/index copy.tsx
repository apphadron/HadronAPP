import * as React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import * as Filme from "@/assets/cardsTeste/index"; // Dados de imagens

// Dados do carrossel
const items = [
  { id: "1", image: Filme.cosmos, title: "Cosmos" },
  { id: "2", image: Filme.estrelas, title: "Estrelas Além do Tempo" },
  { id: "3", image: Filme.inter, title: "Interestelar" },
  { id: "4", image: Filme.oppen, title: "Oppenheimer" },
  { id: "5", image: Filme.perdidoemmarte, title: "Perdido em Marte" },
];

// Dimensões da tela
const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.5; // 60% da largura da tela
const ITEM_HEIGHT = ITEM_WIDTH * 1.4; // Altura proporcional (poster vertical)

export function CarouselCard() {
  return (
    <View className="flex-1 justify-center items-center bg-gray-primary">
      <Text className="text-2xl font-bold text-white/80 mt-3">Que tal sugestões de filmes?</Text>
      <Carousel
        data={items} // Ajusta a largura individual do item
        height={ITEM_HEIGHT}
        loop
        width={ITEM_WIDTH}
        style={{
          width: width,
          justifyContent: 'center'
        }}
        autoPlay={false}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.85,
          parallaxScrollingOffset: 40,
        }}
        pagingEnabled={true} // Desabilita o snap completo para rolagem suave
        snapEnabled={true} // Habilita "encaixe" suave
        renderItem={({ item }) => (
          <View className="justify-end items-center bg-gray-primary rounded-[12px] overflow-hidden" style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT, backgroundColor: 'gray', aspectRatio: 2 / 3, }}>
            <Image source={item.image} style={{ resizeMode: "cover",}} className="w-full h-full" />
            <Text className="text-[18px] text-bold text-white">{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}
