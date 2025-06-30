export interface SensorData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface AccelerometerData extends SensorData {}
export interface GyroscopeData extends SensorData {}
export interface MagnetometerData extends SensorData {}

export interface BarometerData {
  pressure: number;
  relativeAltitude: number;
  timestamp: number;
}

export interface LightSensorData {
  illuminance: number;
  timestamp: number;
}

export interface SensorReading {
  id: string;
  name: string;
  type: 'accelerometer' | 'gyroscope' | 'magnetometer' | 'barometer' | 'light';
  data: SensorData | BarometerData | LightSensorData;
  isActive: boolean;
}

export interface ChartDataPoint {
  x: number;
  y: number;
}

export interface PhysicsCalculation {
  name: string;
  value: number;
  unit: string;
  formula?: string;
}

export interface SensorData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface BarometerData {
  pressure: number;
  relativeAltitude: number;
  timestamp: number;
}

export interface LightSensorData {
  illuminance: number;
  timestamp: number;
}