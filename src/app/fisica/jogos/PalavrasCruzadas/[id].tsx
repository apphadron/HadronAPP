import { useLocalSearchParams } from "expo-router";
import { View, Text, TextInput, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { Audio } from "expo-av";

const words = require("./words.json");

export default function Game() {
  const { id } = useLocalSearchParams();
  const level = words[parseInt(id as string)];
  const [answers, setAnswers] = useState(Array(level.words.length).fill(""));
  const [correct, setCorrect] = useState(Array(level.words.length).fill(false));

  useEffect(() => {
    checkAnswers();
  }, [answers]);

  const handleChange = (text: string, index: number) => {
    const updated = [...answers];
    updated[index] = text;
    setAnswers(updated);
  };

  const playSound = async (type: 'success' | 'error') => {
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync(
        type === 'success'
          ? require("../../assets/success.wav")
          : require("../../assets/error.wav")
      );
      await sound.playAsync();
    } catch (e) {
      console.warn("Erro ao carregar som", e);
    }
  };

  const checkAnswers = () => {
    const updated = answers.map((answer, index) => {
      const isCorrect = answer.trim().toLowerCase() === level.words[index].answer.toLowerCase();
      return isCorrect;
    });

    // Toca som se houver mudança
    updated.forEach((status, index) => {
      if (status !== correct[index]) {
        playSound(status ? 'success' : 'error');
      }
    });

    setCorrect(updated);
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black p-4">
      <Text className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">
        {level.title}
      </Text>
      {level.words.map((item: any, index: number) => (
        <View key={index} className="mb-6">
          <Text className="text-lg text-gray-700 dark:text-gray-300 mb-2">
            {index + 1}. {item.hint}
          </Text>
          <TextInput
            className={`border rounded-lg p-3 text-lg ${
              correct[index]
                ? 'border-green-500 text-green-700 dark:text-green-400'
                : 'border-gray-400 text-gray-800 dark:border-gray-600 dark:text-white'
            }`}
            value={answers[index]}
            onChangeText={(text) => handleChange(text, index)}
          />
        </View>
      ))}
    </ScrollView>
  );
}
