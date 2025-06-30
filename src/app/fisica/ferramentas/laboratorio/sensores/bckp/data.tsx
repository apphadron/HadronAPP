import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export function DataScreen() {
  const [selectedSensor, setSelectedSensor] = useState('accelerometer');
  const screenWidth = Dimensions.get('window').width;

  const sensors = [
    {
      id: 'accelerometer',
      name: 'Acelerômetro',
      icon: 'speedometer',
      data: {
        labels: ['0s', '1s', '2s', '3s', '4s', '5s'],
        datasets: [
          {
            data: [0, 1.2, 2.4, 1.8, 0.9, 0.3],
            color: () => '#3B82F6',
          },
        ],
      },
    },
    {
      id: 'gyroscope',
      name: 'Giroscópio',
      icon: 'refresh',
      data: {
        labels: ['0s', '1s', '2s', '3s', '4s', '5s'],
        datasets: [
          {
            data: [0, 0.8, 1.5, 1.2, 0.6, 0.2],
            color: () => '#10B981',
          },
        ],
      },
    },
    {
      id: 'magnetometer',
      name: 'Magnetômetro',
      icon: 'magnet',
      data: {
        labels: ['0s', '1s', '2s', '3s', '4s', '5s'],
        datasets: [
          {
            data: [0, 45, 60, 45, 30, 15],
            color: () => '#8B5CF6',
          },
        ],
      },
    },
  ];

  const selectedSensorData = sensors.find(sensor => sensor.id === selectedSensor);

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Dados dos sensores do Laboratório de Física',
        title: 'Dados dos Sensores',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-800">
            Dados dos Sensores
          </Text>
          <TouchableOpacity
            onPress={handleShare}
            className="bg-blue-500 p-2 rounded-full"
          >
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          <View className="flex-row space-x-2">
            {sensors.map((sensor) => (
              <TouchableOpacity
                key={sensor.id}
                onPress={() => setSelectedSensor(sensor.id)}
                className={`px-4 py-2 rounded-full flex-row items-center ${
                  selectedSensor === sensor.id
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                }`}
              >
                <Ionicons
                  name={sensor.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={selectedSensor === sensor.id ? 'white' : '#4B5563'}
                />
                <Text
                  className={`ml-2 ${
                    selectedSensor === sensor.id
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {sensor.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {selectedSensorData && (
          <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Gráfico de {selectedSensorData.name}
            </Text>
            <LineChart
              data={selectedSensorData.data}
              width={screenWidth - 48}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        )}

        <View className="mt-6 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <Text className="text-yellow-800 font-semibold mb-2">
            💡 Dica
          </Text>
          <Text className="text-yellow-700">
            Use o botão de compartilhar para exportar os dados dos sensores.
            Os gráficos são atualizados em tempo real conforme novos dados são coletados.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
} 