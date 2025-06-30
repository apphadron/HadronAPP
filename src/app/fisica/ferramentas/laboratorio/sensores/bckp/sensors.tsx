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
import { SensorData, BarometerData, LightSensorData } from '../types/sensors';

interface SensorCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onToggle: () => void;
  data: any;
  unit?: string;
}

function SensorCard({ title, icon, isActive, onToggle, data, unit = 'm/s²' }: SensorCardProps) {
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
      
      {isActive && data && (
        <View className="space-y-2">
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
                  {data.y.toFixed(3)} {unit}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Z:</Text>
                <Text className="font-mono text-gray-800">
                  {data.z.toFixed(3)} {unit}
                </Text>
              </View>
            </>
          )}
          {typeof data.pressure !== 'undefined' && (
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Pressão:</Text>
              <Text className="font-mono text-gray-800">
                {data.pressure.toFixed(2)} hPa
              </Text>
            </View>
          )}
          {typeof data.illuminance !== 'undefined' && (
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Luminosidade:</Text>
              <Text className="font-mono text-gray-800">
                {data.illuminance.toFixed(1)} lux
              </Text>
            </View>
          )}
          <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-200">
            <Text className="text-gray-500 text-sm">Magnitude:</Text>
            <Text className="font-mono text-gray-700 text-sm">
              {data.x !== undefined ? 
                Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z).toFixed(3) :
                data.pressure !== undefined ? data.pressure.toFixed(2) :
                data.illuminance !== undefined ? data.illuminance.toFixed(1) : '0.000'
              } {unit}
            </Text>
          </View>
        </View>
      )}
      
      {!isActive && (
        <Text className="text-gray-500 text-center py-4">
          Sensor desativado
        </Text>
      )}
    </View>
  );
}

export function SensorsScreen() {
  const [accelerometerData, setAccelerometerData] = useState<SensorData | null>(null);
  const [gyroscopeData, setGyroscopeData] = useState<SensorData | null>(null);
  const [magnetometerData, setMagnetometerData] = useState<SensorData | null>(null);
  const [barometerData, setBarometerData] = useState<BarometerData | null>(null);
  const [lightData, setLightData] = useState<LightSensorData | null>(null);

  const [sensors, setSensors] = useState({
    accelerometer: false,
    gyroscope: false,
    magnetometer: false,
    barometer: false,
    light: false,
  });

  useEffect(() => {
    let subscriptions: any[] = [];

    if (sensors.accelerometer) {
      Accelerometer.setUpdateInterval(100);
      const subscription = Accelerometer.addListener((data) => {
        setAccelerometerData({
          x: data.x,
          y: data.y,
          z: data.z,
          timestamp: Date.now(),
        });
      });
      subscriptions.push(subscription);
    }

    if (sensors.gyroscope) {
      Gyroscope.setUpdateInterval(100);
      const subscription = Gyroscope.addListener((data) => {
        setGyroscopeData({
          x: data.x,
          y: data.y,
          z: data.z,
          timestamp: Date.now(),
        });
      });
      subscriptions.push(subscription);
    }

    if (sensors.magnetometer) {
      Magnetometer.setUpdateInterval(100);
      const subscription = Magnetometer.addListener((data) => {
        setMagnetometerData({
          x: data.x,
          y: data.y,
          z: data.z,
          timestamp: Date.now(),
        });
      });
      subscriptions.push(subscription);
    }

    if (sensors.barometer) {
      Barometer.setUpdateInterval(1000);
      const subscription = Barometer.addListener((data) => {
        setBarometerData({
          pressure: data.pressure,
          relativeAltitude: data.relativeAltitude ?? 0,
          timestamp: Date.now(),
        });
      });
      subscriptions.push(subscription);
    }

    if (sensors.light) {
      LightSensor.setUpdateInterval(1000);
      const subscription = LightSensor.addListener((data) => {
        setLightData({
          illuminance: data.illuminance,
          timestamp: Date.now(),
        });
      });
      subscriptions.push(subscription);
    }

    return () => {
      subscriptions.forEach(subscription => subscription.remove());
    };
  }, [sensors]);

  const toggleSensor = (sensorName: keyof typeof sensors) => {
    setSensors(prev => ({
      ...prev,
      [sensorName]: !prev[sensorName],
    }));
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
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
            💡 Dica
          </Text>
          <Text className="text-yellow-700">
            Ative os sensores que deseja monitorar. Os dados são atualizados em tempo real.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
} 