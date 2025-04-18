import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from "@/styles/colors";
import { useTheme } from "@/components/geral/ThemeContext";

interface ConversionOption {
  name: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  keywords?: string[];
}

const options: ConversionOption[] = [
  {
    name: "Tempo",
    value: "time",
    icon: "time",
    description: "Converter entre segundos, minutos, horas, dias e mais",
    keywords: ["hora", "minuto", "segundo", "dia", "semana", "mês", "ano", "cronômetro"]
  },
  {
    name: "Comprimento",
    value: "length",
    icon: "resize-outline",
    description: "Medidas de metros a anos-luz",
    keywords: ["distância", "metro", "quilômetro", "centímetro", "polegada", "pé", "milha"]
  },
  {
    name: "Área",
    value: "area",
    icon: "square",
    description: "Conversões de área e superfície",
    keywords: ["superficie", "quadrado", "metro quadrado", "hectare", "acre"]
  },
  {
    name: "Volume",
    value: "volume",
    icon: "beaker",
    description: "Medidas de capacidade e volume",
    keywords: ["litro", "mililitro", "galão", "capacidade", "metro cúbico"]
  },
  {
    name: "Massa",
    value: "mass",
    icon: "scale",
    description: "Peso e massa em diferentes unidades",
    keywords: ["peso", "quilo", "grama", "tonelada", "libra", "onça"]
  },
  {
    name: "Temperatura",
    value: "temperature",
    icon: "thermometer",
    description: "Celsius, Fahrenheit e Kelvin",
    keywords: ["calor", "grau", "termômetro"]
  },
  {
    name: "Energia",
    value: "energy",
    icon: "flash",
    description: "Joules, calorias, watts-hora",
    keywords: ["caloria", "joule", "quilowatt-hora", "potencial"]
  },
  {
    name: "Potência",
    value: "power",
    icon: "battery-charging-outline",
    description: "Watts, cavalos-vapor e mais",
    keywords: ["watt", "cavalo-vapor", "hp", "força"]
  },
  {
    name: "Pressão",
    value: "pressure",
    icon: "speedometer-outline",
    description: "Pascal, bar, PSI e atmosferas",
    keywords: ["atmosfera", "pascal", "bar", "psi", "mmHg"]
  },
  {
    name: "Velocidade",
    value: "speed",
    icon: "car-outline",
    description: "Velocidade linear e angular",
    keywords: ["rapidez", "km/h", "mph", "nó", "movimento"]
  },
  {
    name: "Ângulo",
    value: "angle",
    icon: "compass-outline",
    description: "Graus, radianos e mais",
    keywords: ["grau", "radiano", "bússola", "direção"]
  },
  {
    name: "Frequência",
    value: "frequency",
    icon: "pulse-outline",
    description: "Hertz, RPM e ciclos",
    keywords: ["hz", "rotação", "ciclo", "período", "rpm"]
  },
  {
    name: "Dados",
    value: "dataSize",
    icon: "save-outline",
    description: "Bytes, KB, MB, GB e TB",
    keywords: ["byte", "megabyte", "gigabyte", "terabyte", "armazenamento", "memória"]
  },
];

const CategoryCard = ({ option, onPress }: { 
  option: ConversionOption; 
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="m-2 rounded-2xl overflow-hidden bg-white shadow-lg"
    style={{
      width: '45%',
      elevation: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    }}
    activeOpacity={0.8}
  >
    <View
      className="p-4 items-center justify-center"
      style={{
        backgroundColor: colors.light["--color-roxo-80"],
        height: 100,
      }}
    >
      <Ionicons name={option.icon} size={40} color="white" />
    </View>
    
    <View className="p-3">
      <Text className="text-center font-bold mb-1 text-[16px] text-gray-800">
        {option.name}
      </Text>
      <Text className="text-center text-[12px] text-gray-600">
        {option.description}
      </Text>
    </View>
  </TouchableOpacity>
);


// Componente da barra de pesquisa
const SearchBar = ({ value, onChangeText }: { 
  value: string; 
  onChangeText: (text: string) => void;
}) => (
  <View className="px-4 mb-4">
    <View 
      className="flex-row items-center bg-white rounded-full px-4 h-12 shadow-sm"
      style={{
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      }}
    >
      <Ionicons name="search" size={20} color={colors.light["--color-roxo-80"]} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar categoria..."
        className="flex-1 ml-2 text-gray-800"
        placeholderTextColor="#9CA3AF"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <Ionicons name="close-circle" size={20} color={colors.light["--color-roxo-80"]} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default function HomeConversores() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const {isLight} = useTheme();

  const handleCategoryPress = (option: ConversionOption) => {
    router.push({
      pathname: `/fisica/ferramentas/conversores/[id]`,
      params: {
        id: option.value,
        type: `Conversor de ${option.name}`
      }
    });
  };

  const filteredOptions = useCallback(() => {
    if (!searchQuery.trim()) return options;

    const query = searchQuery.toLowerCase();
    return options.filter(option => 
      option.name.toLowerCase().includes(query) ||
      option.description.toLowerCase().includes(query) ||
      option.keywords?.some(keyword => 
        keyword.toLowerCase().includes(query)
      )
    );
  }, [searchQuery]);

  return (
    <ScrollView 
      className="flex-1"
      contentContainerStyle={{
        paddingVertical: 16,
      }}
      style={{backgroundColor: isLight ? colors.default["--color-branco"] : colors.dark["--color-cinza-100"]}}
    >
      <View className="mb-4 px-4">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Conversor de Unidades
        </Text>
        <Text className="text-gray-600">
          Escolha uma categoria para começar a converter
        </Text>
      </View>

      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View className="flex-row flex-wrap justify-center">
        {filteredOptions().map((option) => (
          <CategoryCard
            key={option.value}
            option={option}
            onPress={() => handleCategoryPress(option)}
          />
        ))}
      </View>

      {filteredOptions().length === 0 && (
        <View className="p-8 items-center">
          <Ionicons 
            name="search-outline" 
            size={48} 
            color={colors.light["--color-roxo-80"]} 
          />
          <Text className="text-center text-gray-600 mt-4">
            Nenhuma categoria encontrada para "{searchQuery}"
          </Text>
        </View>
      )}
    </ScrollView>
  );
}