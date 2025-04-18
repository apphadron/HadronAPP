import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { calculationsByCategory } from './formulas2';
import MathJaxSvg from 'react-native-mathjax-svg';
import { colors } from '@/styles/colors';

// Definição de tipo local para o identificador de cálculo
type CalculationIdType = string;

export default function CalculationScreen() {
  const { id } = useLocalSearchParams();

  const calculationId = Array.isArray(id) ? id[0] : id as CalculationIdType;

  // Procurar o cálculo na categoria certa, com base no id
  const category = Object.entries(calculationsByCategory).find(([_, calculations]) =>
    Object.keys(calculations).includes(calculationId)
  );

  if (!category) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-[18px] text-red text-center font-bold">
          Cálculo não encontrado!
        </Text>
      </View>
    );
  }

  // Obter o cálculo da categoria
  const [categoryName, calculations] = category;
  const calculation = calculations[calculationId as keyof typeof calculations];

  if (!calculation) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-[18px] text-red text-center font-bold">
          Cálculo não encontrado!
        </Text>
      </View>
    );
  }

  const [inputs, setInputs] = useState<string[]>(new Array(calculation.inputs.length).fill(''));
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const numericInputs = inputs.map((input) => parseFloat(input));
    if (numericInputs.some(isNaN)) {
      setResult(null);
      return;
    }
    const calcResult = calculation.formula(...numericInputs);
    setResult(calcResult.toString());
  }, [inputs]);

  return (
    <ScrollView
      className="px-5"
      style={{ backgroundColor: colors.dark["--color-cinza-100"] }}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <Text className="text-2xl font-bold text-center text-white mb-4">
        {calculation.title}
      </Text>

      {/* Seção de descrição */}
      {calculation.description && (
        <View className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <Text className="text-white text-[16px]">
            {calculation.description}
          </Text>
        </View>
      )}

      {/* Seção de fórmula */}
      {calculation.formulaRepresentation && (
        <View className="bg-gray-800/50 rounded-lg p-4 mb-6 items-center">
          <Text className="text-white text-[16px] mb-2">Fórmula:</Text>
          <MathJaxSvg
            fontSize={16}
            color="white"
            style={styles.mathJax}
          >
            {calculation.formulaRepresentation}
          </MathJaxSvg>
        </View>
      )}

      <View className="bg-gray-800/50 rounded-lg p-5 mb-6">
        {calculation.inputs.map((label, index) => (
          <View key={index} className="mb-6">
            <Text className="text-white text-[16px] mb-2">{label}:</Text>
            <TextInput
              className="w-full h-14 text-black text-[18px] text-center rounded-md bg-white/90"
              keyboardType="numeric"
              value={inputs[index]}
              onChangeText={(text) => {
                const newInputs = [...inputs];
                newInputs[index] = text;
                setInputs(newInputs);
              }}
            />
          </View>
        ))}

        <View style={{ backgroundColor: colors.dark["--color-cinza-90"] }} className="min-h-[100px] w-full mt-4 justify-center items-center rounded-lg p-4">
          <Text className="text-[18px] font-bold text-white mb-2">Resultado:</Text>
          {result !== null ? (
            <Text className="text-[22px] font-bold text-white">{result}</Text>
          ) : (
            <Text className="text-[16px] text-white/70">Insira os valores para calcular</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mathJax: {
    width: '100%',
    alignSelf: 'center',
  }
});