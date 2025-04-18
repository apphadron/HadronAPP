import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { niveis } from './imgQuebra';

export default function QuebraCabecaScreen() {
  return (
    <View className="flex-1 bg-indigo-50 pt-12">
      <StatusBar style="dark" />
      <View className="px-4 pb-4">
        <Text className="text-3xl font-bold text-indigo-800 mb-2">Quebra-Cabeça</Text>
        <Text className="text-lg text-indigo-600 mb-6">
          Escolha um nível para começar a jogar
        </Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {niveis.map((nivel) => (
          <Link
            key={nivel.id}
            href={{pathname: '/fisica/jogos/QuebraCabeca/[id]', params: {id: nivel.id, type: nivel.nome}}}
            asChild
          >
            <TouchableOpacity
              className="bg-white rounded-lg overflow-hidden mb-4 shadow-md"
              activeOpacity={0.7}
            >
              <View className="flex-row">
                <Image
                  source={nivel.imagens[0].source}
                  className="w-24 h-24 rounded-l-lg"
                  resizeMode="cover"
                />
                <View className="p-4 flex-1 justify-center">
                  <Text className="text-xl font-bold text-indigo-800">{nivel.nome}</Text>
                  <Text className="text-indigo-600 mt-1">
                    {nivel.dificuldade === 'facil' ? '3x3 peças' : 
                     nivel.dificuldade === 'medio' ? '4x4 peças' : '5x5 peças'}
                  </Text>
                  <View className="flex-row mt-2">
                    {Array(nivel.dificuldade === 'facil' ? 1 : 
                          nivel.dificuldade === 'medio' ? 2 : 3).fill(0).map((_, i) => (
                      <View key={i} className="w-4 h-4 rounded-full bg-indigo-500 mr-1" />
                    ))}
                    {Array(3 - (nivel.dificuldade === 'facil' ? 1 : 
                               nivel.dificuldade === 'medio' ? 2 : 3)).fill(0).map((_, i) => (
                      <View key={i} className="w-4 h-4 rounded-full bg-indigo-200 mr-1" />
                    ))}
                  </View>
                </View>
                <View className="justify-center pr-4">
                  <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center">
                    <Text className="text-indigo-800 font-bold text-lg">→</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
    </View>
  );
}