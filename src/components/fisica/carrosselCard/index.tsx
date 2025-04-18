import React, { useEffect, useState } from "react";
import { View, Text, Image, Dimensions, TouchableOpacity, ScrollView } from "react-native";
import { supabase } from '@/db/supabaseClient'; 
import { router } from 'expo-router';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { colors } from "@/styles/colors";
import * as Network from 'expo-network';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ITEM_WIDTH = Dimensions.get("window").width * 0.38; 
const ITEM_HEIGHT = ITEM_WIDTH * 1.7;

export function ReadingSection() {
  const [livros, setLivros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLivros = async () => {
      const networkState = await Network.getNetworkStateAsync();
      
      let livrosData: any[] = [];

      if (networkState.isConnected) {
        const { data, error } = await supabase
          .from('livros')
          .select('id, nome, image_url, destaque')
          .order('id', { ascending: true });

        if (error) {
          console.error('Erro ao buscar livros:', error);
        } else {
          livrosData = data;
          await AsyncStorage.setItem('livros', JSON.stringify(data)); 
        }
      } else {
        const storedLivros = await AsyncStorage.getItem('livros');
        if (storedLivros) {
          livrosData = JSON.parse(storedLivros);
        } else {
          console.error('Sem conexão e sem dados no armazenamento');
        }
      }

      setLivros(livrosData);
      setLoading(false);
    };

    fetchLivros();
  }, []);

  const handleLivroPress = (id: string) => {
    router.push(`/astronomia/filmes/filmeDetalhes?id=${id}`);
  };

  const handleVerTodos = () => {
    // Navegar para tela com todos os livros
    //router.push('/astronomia/filmes');
    console.log("CLique");
  };

  return (
    <View className="py-4">
      <View className="flex-row justify-between items-center px-4 mb-3">
        <View className="flex-row items-center">
          <Ionicons name="book-outline" size={20} color="#7141A1" />
          <Text className="text-lg font-semibold ml-2" style={{color: colors.default["--color-texto"]}}>Pausa para leitura</Text>
        </View>
        <TouchableOpacity onPress={handleVerTodos}>
          <Text style={{color: colors.light["--color-roxo-100"]}}>Ver todos</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
          {[1, 2, 3].map((_, index) => (
            <View 
              key={index}
              className="mr-4 rounded-xl overflow-hidden"
              style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
            >
              <ShimmerPlaceholder
                style={{ width: '100%', height: '100%' }}
                shimmerColors={["#f2f2f2", "#e6e6e6", "#f2f2f2"]}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
          {livros.map((book) => (
            <TouchableOpacity 
              key={book.id}
              className="mr-4 rounded-xl overflow-hidden"
              style={{ 
                width: ITEM_WIDTH, 
                height: ITEM_HEIGHT,
                backgroundColor: colors.light["--color-roxo-70"]
              }}
              onPress={() => handleLivroPress(book.id)}
            >
              <View className=" flex-1">
                <Image 
                  source={{ uri: book.image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.2)', 'transparent']}
                  className="absolute inset-x-0 top-0 h-16"
                />
              </View>
              <View className="p-2 bg-gray-100">
                <Text 
                  className="text-gray-80 font-semibold text-sm" 
                  numberOfLines={2}
                >
                  {book.nome}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}