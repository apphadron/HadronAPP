import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  Accelerometer, 
  Gyroscope, 
  Magnetometer,
  Barometer,
  LightSensor 
} from 'expo-sensors';

// Tipos simplificados
interface SensorData {
  x?: number;
  y?: number;
  z?: number;
  pressure?: number;
  illuminance?: number;
  timestamp: number;
}

interface SensorCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onToggle: () => void;
  data: SensorData | null;
  unit: string;
}

function SensorCard({ title, icon, isActive, onToggle, data, unit }: SensorCardProps) {
  return (
    <View className="bg-white rounded-xl p-6 mb-4 shadow-sm border border-gray-200">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <Ionicons name={icon} size={24} color="#3B82F6" />
          <Text className="text-lg font-semibold text-gray-800 ml-3">
            {title}
          </Text>
        </View>
        <Switch
          value={isActive}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
          thumbColor={isActive ? '#3B82F6' : '#9CA3AF'}
        />
      </View>
      
      {isActive && data ? (
        <View className="space-y-2">
          {/* Dados X, Y, Z para sensores 3D */}
          {typeof data.x !== 'undefined' && (
            <>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">X:</Text>
                <Text className="font-mono text-gray-800">
                  {data.x.toFixed(3)} {unit}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Y:</Text>
                <Text className="font-mono text-gray-800">
                  {data.y!.toFixed(3)} {unit}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Z:</Text>
                <Text className="font-mono text-gray-800">
                  {data.z!.toFixed(3)} {unit}
                </Text>
              </View>
              <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-200">
                <Text className="text-gray-500 text-sm">Magnitude:</Text>
                <Text className="font-mono text-gray-700 text-sm">
                  {Math.sqrt(data.x * data.x + data.y! * data.y! + data.z! * data.z!).toFixed(3)} {unit}
                </Text>
              </View>
            </>
          )}
          
          {/* Dados de pressão */}
          {typeof data.pressure !== 'undefined' && (
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Pressão:</Text>
              <Text className="font-mono text-gray-800">
                {data.pressure.toFixed(2)} hPa
              </Text>
            </View>
          )}
          
          {/* Dados de luminosidade */}
          {typeof data.illuminance !== 'undefined' && (
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Luminosidade:</Text>
              <Text className="font-mono text-gray-800">
                {data.illuminance.toFixed(1)} lux
              </Text>
            </View>
          )}
        </View>
      ) : (
        <Text className="text-gray-500 text-center py-4">
          {isActive ? 'Aguardando dados...' : 'Sensor desativado'}
        </Text>
      )}
    </View>
  );
}

export default function SensorsScreen() {
  // Estados dos dados dos sensores
  const [accelerometerData, setAccelerometerData] = useState<SensorData | null>(null);
  const [gyroscopeData, setGyroscopeData] = useState<SensorData | null>(null);
  const [magnetometerData, setMagnetometerData] = useState<SensorData | null>(null);
  const [barometerData, setBarometerData] = useState<SensorData | null>(null);
  const [lightData, setLightData] = useState<SensorData | null>(null);

  // Estados de ativação dos sensores
  const [sensors, setSensors] = useState({
    accelerometer: false,
    gyroscope: false,
    magnetometer: false,
    barometer: false,
    light: false,
  });

  // Gerenciamento das assinaturas dos sensores
  useEffect(() => {
    const subscriptions: any[] = [];

    // Acelerômetro
    if (sensors.accelerometer) {
      try {
        Accelerometer.setUpdateInterval(200); // Reduzido para 200ms para melhor performance
        const subscription = Accelerometer.addListener((data) => {
          setAccelerometerData({
            x: data.x,
            y: data.y,
            z: data.z,
            timestamp: Date.now(),
          });
        });
        subscriptions.push(subscription);
      } catch (error) {
        console.error('Erro ao iniciar acelerômetro:', error);
      }
    }

    // Giroscópio
    if (sensors.gyroscope) {
      try {
        Gyroscope.setUpdateInterval(200);
        const subscription = Gyroscope.addListener((data) => {
          setGyroscopeData({
            x: data.x,
            y: data.y,
            z: data.z,
            timestamp: Date.now(),
          });
        });
        subscriptions.push(subscription);
      } catch (error) {
        console.error('Erro ao iniciar giroscópio:', error);
      }
    }

    // Magnetômetro
    if (sensors.magnetometer) {
      try {
        Magnetometer.setUpdateInterval(200);
        const subscription = Magnetometer.addListener((data) => {
          setMagnetometerData({
            x: data.x,
            y: data.y,
            z: data.z,
            timestamp: Date.now(),
          });
        });
        subscriptions.push(subscription);
      } catch (error) {
        console.error('Erro ao iniciar magnetômetro:', error);
      }
    }

    // Barômetro
    if (sensors.barometer) {
      try {
        Barometer.setUpdateInterval(1000);
        const subscription = Barometer.addListener((data) => {
          setBarometerData({
            pressure: data.pressure,
            timestamp: Date.now(),
          });
        });
        subscriptions.push(subscription);
      } catch (error) {
        console.error('Erro ao iniciar barômetro:', error);
      }
    }

    // Sensor de Luz
    if (sensors.light) {
      try {
        LightSensor.setUpdateInterval(1000);
        const subscription = LightSensor.addListener((data) => {
          setLightData({
            illuminance: data.illuminance,
            timestamp: Date.now(),
          });
        });
        subscriptions.push(subscription);
      } catch (error) {
        console.error('Erro ao iniciar sensor de luz:', error);
      }
    }

    // Limpeza das assinaturas
    return () => {
      subscriptions.forEach(subscription => {
        try {
          subscription.remove();
        } catch (error) {
          console.error('Erro ao remover assinatura:', error);
        }
      });
    };
  }, [sensors]);

  const toggleSensor = (sensorName: keyof typeof sensors) => {
    setSensors(prev => ({
      ...prev,
      [sensorName]: !prev[sensorName],
    }));

    // Limpar dados quando desativar sensor
    if (sensors[sensorName]) {
      switch (sensorName) {
        case 'accelerometer':
          setAccelerometerData(null);
          break;
        case 'gyroscope':
          setGyroscopeData(null);
          break;
        case 'magnetometer':
          setMagnetometerData(null);
          break;
        case 'barometer':
          setBarometerData(null);
          break;
        case 'light':
          setLightData(null);
          break;
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          Sensores do Dispositivo
        </Text>

        <SensorCard
          title="Acelerômetro"
          icon="speedometer"
          isActive={sensors.accelerometer}
          onToggle={() => toggleSensor('accelerometer')}
          data={accelerometerData}
          unit="m/s²"
        />

        <SensorCard
          title="Giroscópio"
          icon="refresh"
          isActive={sensors.gyroscope}
          onToggle={() => toggleSensor('gyroscope')}
          data={gyroscopeData}
          unit="rad/s"
        />

        <SensorCard
          title="Magnetômetro"
          icon="magnet"
          isActive={sensors.magnetometer}
          onToggle={() => toggleSensor('magnetometer')}
          data={magnetometerData}
          unit="μT"
        />

        <SensorCard
          title="Barômetro"
          icon="cloud"
          isActive={sensors.barometer}
          onToggle={() => toggleSensor('barometer')}
          data={barometerData}
          unit="hPa"
        />

        <SensorCard
          title="Sensor de Luz"
          icon="sunny"
          isActive={sensors.light}
          onToggle={() => toggleSensor('light')}
          data={lightData}
          unit="lux"
        />

        <View className="mt-6 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <Text className="text-yellow-800 font-semibold mb-2">
            💡 Dicas de Uso
          </Text>
          <Text className="text-yellow-700">
            • Ative apenas os sensores necessários para economizar bateria{'\n'}
            • Mova o dispositivo para ver mudanças nos valores{'\n'}
            • Os dados são atualizados em tempo real{'\n'}
            • Se um sensor não funcionar, tente reiniciar o app
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}