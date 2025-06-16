import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Accelerometer } from 'expo-sensors';

const { width } = Dimensions.get('window');

type AccelerometerData = {
  x: number;
  y: number;
  z: number;
  timestamp: number;
};

export default function AcelerometroScreen() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [data, setData] = useState<AccelerometerData>({ x: 0, y: 0, z: 0, timestamp: 0 });
  const [history, setHistory] = useState<AccelerometerData[]>([]);
  const [updateInterval, setUpdateInterval] = useState(100); // ms
  const [maxG, setMaxG] = useState(1); // Valor máximo para visualização (em g)
  
  useEffect(() => {
    let subscription: any = null;
    
    if (isSubscribed) {
      // Configurar a frequência de atualização do sensor
      Accelerometer.setUpdateInterval(updateInterval);
      
      // Iniciar a assinatura do sensor
      subscription = Accelerometer.addListener(accelerometerData => {
        const timestamp = Date.now();
        const newData = { ...accelerometerData, timestamp };
        
        setData(newData);
        
        // Adicionar dados ao histórico (limitando a 100 pontos)
        setHistory(prevHistory => {
          const newHistory = [...prevHistory, newData];
          if (newHistory.length > 100) {
            return newHistory.slice(newHistory.length - 100);
          }
          return newHistory;
        });
      });
    }
    
    return () => {
      subscription && subscription.remove();
    };
  }, [isSubscribed, updateInterval]);
  
  const toggleSubscription = () => {
    setIsSubscribed(!isSubscribed);
  };
  
  const resetData = () => {
    setHistory([]);
  };
  
  const calculateMagnitude = (x: number, y: number, z: number) => {
    return Math.sqrt(x * x + y * y + z * z);
  };
  
  const renderColoredValue = (value: number) => {
    // Normalizar o valor (assumindo que -1 a 1 é o intervalo normal)
    const absValue = Math.abs(value);
    let color = '#22c55e'; // Verde para valores baixos
    
    if (absValue > 0.7) {
      color = '#ef4444'; // Vermelho para valores altos
    } else if (absValue > 0.3) {
      color = '#f59e0b'; // Laranja para valores médios
    }
    
    return <Text style={{ color }}>{value.toFixed(3)}</Text>;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{
          title: 'Acelerômetro',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#f9fafb' },
        }}
      />
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1 px-4 pt-2"
      >
        <View className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 mb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-2xl font-bold mb-2">Acelerômetro</Text>
              <Text className="text-indigo-100 mb-3">
                Meça a aceleração do dispositivo nos três eixos (x, y, z)
              </Text>
            </View>
            <View className="bg-white/20 h-16 w-16 rounded-full items-center justify-center">
              <MaterialCommunityIcons name="speedometer" size={32} color="white" />
            </View>
          </View>
          
          <TouchableOpacity
            className={`self-start px-4 py-2 rounded-full mt-2 ${isSubscribed ? 'bg-red-500' : 'bg-white'}`}
            onPress={toggleSubscription}
          >
            <Text className={`font-medium ${isSubscribed ? 'text-white' : 'text-indigo-600'}`}>
              {isSubscribed ? 'Parar medição' : 'Iniciar medição'}
            </Text>
          </TouchableOpacity>
        </View>
      
        <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">Leituras em tempo real</Text>
          
          <View className="flex-row mb-5">
            <View className="flex-1 items-center">
              <View className="bg-red-100 h-12 w-12 rounded-full items-center justify-center mb-2">
                <FontAwesome5 name="arrow-right" size={20} color="#dc2626" />
              </View>
              <Text className="text-gray-800 font-medium mb-1">Eixo X</Text>
              <Text className="text-lg font-bold">{renderColoredValue(data.x)}</Text>
              <Text className="text-gray-500 text-xs">g</Text>
            </View>
            
            <View className="flex-1 items-center">
              <View className="bg-green-100 h-12 w-12 rounded-full items-center justify-center mb-2">
                <FontAwesome5 name="arrow-up" size={20} color="#16a34a" />
              </View>
              <Text className="text-gray-800 font-medium mb-1">Eixo Y</Text>
              <Text className="text-lg font-bold">{renderColoredValue(data.y)}</Text>
              <Text className="text-gray-500 text-xs">g</Text>
            </View>
            
            <View className="flex-1 items-center">
              <View className="bg-blue-100 h-12 w-12 rounded-full items-center justify-center mb-2">
                <FontAwesome5 name="arrow-down" size={20} color="#2563eb" />
              </View>
              <Text className="text-gray-800 font-medium mb-1">Eixo Z</Text>
              <Text className="text-lg font-bold">{renderColoredValue(data.z)}</Text>
              <Text className="text-gray-500 text-xs">g</Text>
            </View>
          </View>
          
          <View className="bg-gray-100 rounded-lg p-3 mb-3">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-gray-700 font-medium">Magnitude:</Text>
              <Text className="text-lg font-bold">
                {calculateMagnitude(data.x, data.y, data.z).toFixed(3)} g
              </Text>
            </View>
            <Text className="text-gray-600 text-sm">
              Magnitude resultante da aceleração nos três eixos
            </Text>
          </View>
          
          <View className="flex-row justify-between mt-2">
            <TouchableOpacity 
              className="bg-gray-200 px-3 py-2 rounded-lg flex-row items-center"
              onPress={resetData}
            >
              <Ionicons name="refresh" size={16} color="#4b5563" />
              <Text className="text-gray-700 ml-1">Resetar</Text>
            </TouchableOpacity>
            
            <View className="flex-row">
              <TouchableOpacity 
                className="bg-gray-200 px-3 py-2 rounded-lg flex-row items-center mr-2"
                onPress={() => setUpdateInterval(Math.max(updateInterval - 50, 50))}
              >
                <Text className="text-gray-700">Mais rápido</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-gray-200 px-3 py-2 rounded-lg flex-row items-center"
                onPress={() => setUpdateInterval(updateInterval + 50)}
              >
                <Text className="text-gray-700">Mais lento</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-3">Visualização 3D</Text>
          
          <View className="h-64 bg-gray-100 rounded-lg items-center justify-center">
            <Text className="text-gray-500">
              Visualização 3D da orientação do dispositivo
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              (Implementação com Three.js ou biblioteca similar)
            </Text>
          </View>
        </View>
        
        <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-gray-800">Histórico</Text>
            <View className="flex-row">
              <View className="bg-gray-100 px-2 py-1 rounded mr-2">
                <Text className="text-xs text-gray-700">{history.length} pontos</Text>
              </View>
              <TouchableOpacity className="bg-blue-100 px-2 py-1 rounded">
                <Text className="text-xs text-blue-700">Exportar</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="h-48 bg-gray-100 rounded-lg p-2 items-center justify-center">
            <Text className="text-gray-500">
              Gráfico do histórico de acelerações
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              (Implementação com biblioteca de gráficos)
            </Text>
          </View>
        </View>
        
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-3">Aplicações práticas</Text>
          
          <View className="flex-row mb-4">
            <View className="bg-purple-100 h-10 w-10 rounded-full items-center justify-center mr-3">
              <MaterialCommunityIcons name="test-tube" size={20} color="#7e22ce" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Experimentos de queda livre</Text>
              <Text className="text-gray-600 text-sm">Medir a aceleração da gravidade</Text>
            </View>
          </View>
          
          <View className="flex-row mb-4">
            <View className="bg-purple-100 h-10 w-10 rounded-full items-center justify-center mr-3">
              <MaterialCommunityIcons name="sine-wave" size={20} color="#7e22ce" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Análise de vibrações</Text>
              <Text className="text-gray-600 text-sm">Estudar movimentos oscilatórios</Text>
            </View>
          </View>
          
          <View className="flex-row">
            <View className="bg-purple-100 h-10 w-10 rounded-full items-center justify-center mr-3">
              <MaterialCommunityIcons name="car" size={20} color="#7e22ce" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Cinemática de movimentos</Text>
              <Text className="text-gray-600 text-sm">Analisar aceleração em diferentes situações</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}