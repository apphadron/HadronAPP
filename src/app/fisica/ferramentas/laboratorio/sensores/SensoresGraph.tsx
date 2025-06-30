import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';

interface DataPoint {
  value: number;
  timestamp: number;
}

export default function DataScreen() {
  const [selectedSensor, setSelectedSensor] = useState('accelerometer');
  const [isCollecting, setIsCollecting] = useState(false);
  const [dataHistory, setDataHistory] = useState<{
    accelerometer: DataPoint[];
    gyroscope: DataPoint[];
    magnetometer: DataPoint[];
  }>({
    accelerometer: [],
    gyroscope: [],
    magnetometer: [],
  });

  const screenWidth = Dimensions.get('window').width;

  const sensors = [
    {
      id: 'accelerometer',
      name: 'Acelerômetro',
      icon: 'speedometer',
      unit: 'm/s²',
      color: '#3B82F6',
    },
    {
      id: 'gyroscope',
      name: 'Giroscópio',
      icon: 'refresh',
      unit: 'rad/s',
      color: '#10B981',
    },
    {
      id: 'magnetometer',
      name: 'Magnetômetro',
      icon: 'magnet',
      unit: 'μT',
      color: '#8B5CF6',
    },
  ];

  // Coleta de dados em tempo real
  useEffect(() => {
    const subscriptions: any[] = [];

    if (!isCollecting) return;

    // Acelerômetro
    if (selectedSensor === 'accelerometer') {
      Accelerometer.setUpdateInterval(100);
      const subscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        setDataHistory(prev => ({
          ...prev,
          accelerometer: [...prev.accelerometer.slice(-29), { // Manter apenas 30 pontos
            value: magnitude,
            timestamp: Date.now(),
          }],
        }));
      });
      subscriptions.push(subscription);
    }

    // Giroscópio
    if (selectedSensor === 'gyroscope') {
      Gyroscope.setUpdateInterval(100);
      const subscription = Gyroscope.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        setDataHistory(prev => ({
          ...prev,
          gyroscope: [...prev.gyroscope.slice(-29), {
            value: magnitude,
            timestamp: Date.now(),
          }],
        }));
      });
      subscriptions.push(subscription);
    }

    // Magnetômetro
    if (selectedSensor === 'magnetometer') {
      Magnetometer.setUpdateInterval(100);
      const subscription = Magnetometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        setDataHistory(prev => ({
          ...prev,
          magnetometer: [...prev.magnetometer.slice(-29), {
            value: magnitude,
            timestamp: Date.now(),
          }],
        }));
      });
      subscriptions.push(subscription);
    }

    return () => {
      subscriptions.forEach(subscription => subscription.remove());
    };
  }, [selectedSensor, isCollecting]);

  const selectedSensorData = sensors.find(sensor => sensor.id === selectedSensor);
  const currentData = dataHistory[selectedSensor as keyof typeof dataHistory];

  // Preparar dados para o gráfico
  const chartData = {
    labels: currentData.map((_, index) => `${index * 0.1}s`).slice(-10), // Últimos 10 pontos
    datasets: [
      {
        data: currentData.map(point => point.value).slice(-10),
        color: () => selectedSensorData?.color || '#3B82F6',
        strokeWidth: 2,
      },
    ],
  };

  const handleShare = async () => {
    try {
      const sensorName = selectedSensorData?.name || 'Sensor';
      const dataCount = currentData.length;
      await Share.share({
        message: `Dados do ${sensorName}: ${dataCount} pontos coletados`,
        title: 'Dados dos Sensores - Laboratório de Física',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const toggleCollection = () => {
    if (isCollecting) {
      setIsCollecting(false);
    } else {
      // Limpar dados anteriores ao iniciar nova coleta
      setDataHistory(prev => ({
        ...prev,
        [selectedSensor]: [],
      }));
      setIsCollecting(true);
    }
  };

  const clearData = () => {
    setDataHistory({
      accelerometer: [],
      gyroscope: [],
      magnetometer: [],
    });
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-2">
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

        {/* Seletor de Sensor */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          <View className="flex-row space-x-2">
            {sensors.map((sensor) => (
              <TouchableOpacity
                key={sensor.id}
                onPress={() => {
                  setSelectedSensor(sensor.id);
                  setIsCollecting(false); // Parar coleta ao trocar sensor
                }}
                className={`px-4 py-2 mx-1 rounded-full flex-row items-center ${
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

        {/* Gráfico */}
        {selectedSensorData && (
          <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              {selectedSensorData.name} - {currentData.length} pontos
            </Text>
            
            {currentData.length > 0 ? (
              <LineChart
                data={chartData}
                width={screenWidth * 0.90}
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
            ) : (
              <View className="h-[220px] items-center justify-center">
                <Text className="text-gray-500">
                  {isCollecting ? 'Coletando dados...' : 'Nenhum dado coletado'}
                </Text>
                <Text className="text-gray-400 text-sm mt-2">
                  Clique em "Iniciar Coleta" para começar
                </Text>
              </View>
            )}

            {/* Estatísticas */}
            {currentData.length > 0 && (
              <View className="mt-4 pt-4 border-t border-gray-200">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Valor Atual:</Text>
                  <Text className="font-mono text-gray-800">
                    {currentData[currentData.length - 1]?.value.toFixed(3)} {selectedSensorData.unit}
                  </Text>
                </View>
                <View className="flex-row justify-between mt-2">
                  <Text className="text-gray-600">Máximo:</Text>
                  <Text className="font-mono text-gray-800">
                    {Math.max(...currentData.map(d => d.value)).toFixed(3)} {selectedSensorData.unit}
                  </Text>
                </View>
                <View className="flex-row justify-between mt-2">
                  <Text className="text-gray-600">Mínimo:</Text>
                  <Text className="font-mono text-gray-800">
                    {Math.min(...currentData.map(d => d.value)).toFixed(3)} {selectedSensorData.unit}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
        
        {/* Controles */}
        <View className="flex-row space-x-3 mt-5 mb-6 gap-2">
          <TouchableOpacity
            onPress={toggleCollection}
            className={`flex-1 py-3 rounded-lg ${
              isCollecting ? 'bg-red-500' : 'bg-green-500'
            }`}
          >
            <Text className="text-white text-center font-semibold">
              {isCollecting ? 'Parar Coleta' : 'Iniciar Coleta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={clearData}
            className="bg-gray-500 px-4 py-3 rounded-lg"
          >
            <Ionicons name="trash-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Status da Coleta */}
        <View className={`mt-6 rounded-xl p-4 border ${
          isCollecting 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <Text className={`font-semibold mb-2 ${
            isCollecting ? 'text-green-800' : 'text-yellow-800'
          }`}>
            {isCollecting ? '🟢 Coletando Dados' : '💡 Dica'}
          </Text>
          <Text className={isCollecting ? 'text-green-700' : 'text-yellow-700'}>
            {isCollecting 
              ? `Coletando dados do ${selectedSensorData?.name}. Mova o dispositivo para ver mudanças nos valores.`
              : 'Selecione um sensor e clique em "Iniciar Coleta" para começar a visualizar dados em tempo real.'
            }
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}