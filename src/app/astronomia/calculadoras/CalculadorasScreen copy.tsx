import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { calculationsByCategory } from '@/app/astronomia/calculadoras/formulas2';
import { colors } from '@/styles/colors';


export default function CalculadorasIndex() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 p-2" style={{backgroundColor: colors.dark["--color-cinza-100"]}}>
      {Object.entries(calculationsByCategory).map(([category, calculations]) => (
        <View key={category} className='w-full '>
          <Text className='text-[20px] text-white mb-3 '>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>

          <View className="flex-row justify-around flex-wrap w-full">
            {Object.entries(calculations).map(([key, calculation]) => (
              <TouchableOpacity
                key={key}
                onPress={() => router.push({pathname: `/astronomia/calculadoras/[id]`, params: {id: key,  type: `Calculadora de ${calculation.title}`}})}
                style={{backgroundColor: colors.dark["--color-cinza-90"]}}
                className="mb-3 w-[45%] h-[60px] items-center justify-center rounded-md"
              >
                <Text className='text-white/90 text-[16px] text-center'
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {calculation.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
