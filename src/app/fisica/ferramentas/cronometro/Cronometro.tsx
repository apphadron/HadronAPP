import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Timer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
  const [timeRecords, setTimeRecords] = useState<{ hours: number; minutes: number; seconds: number; milliseconds: number; }[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadRecords = async () => {
      const storedRecords = await AsyncStorage.getItem('timeRecords');
      if (storedRecords) {
        setTimeRecords(JSON.parse(storedRecords));
      }
    };
    loadRecords();
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => {
          const newMilliseconds = prevTime.milliseconds + 1;

          if (newMilliseconds >= 100) {
            const newSeconds = prevTime.seconds + 1;
            return {
              hours: newSeconds >= 60 ? prevTime.hours + 1 : prevTime.hours,
              minutes: newSeconds >= 60 ? (prevTime.minutes + 1) % 60 : prevTime.minutes,
              seconds: newSeconds % 60,
              milliseconds: 0,
            };
          }

          return {
            ...prevTime,
            milliseconds: newMilliseconds,
          };
        });
      }, 10);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = async () => {
    setIsRunning(false);
    setTime({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
    setTimeRecords([]);
    await AsyncStorage.removeItem('timeRecords');
  };

  const handleRecordTime = async () => {
    const newRecord = {
      hours: time.hours,
      minutes: time.minutes,
      seconds: time.seconds,
      milliseconds: time.milliseconds,
    };
    const updatedRecords = [...timeRecords, newRecord];
    setTimeRecords(updatedRecords);
    await AsyncStorage.setItem('timeRecords', JSON.stringify(updatedRecords));
  };

  const formatTime = ({ hours, minutes, seconds, milliseconds }: { hours: number; minutes: number; seconds: number; milliseconds: number }) => {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{formatTime(time)}</Text>
      <View className="flex-row gap-3 items-center justify-center">
        <TouchableOpacity onPress={handleStartStop} className="bg-red-400 p-2 rounded-full items-center justify-center">
          <Ionicons name={isRunning ? 'pause' : 'play'} size={50} color="green" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleReset}>
          <Ionicons name="stop" size={50} color="green" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRecordTime} className="bg-blue-400 p-2 rounded-full items-center justify-center">
          <Ionicons name="save" size={50} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={timeRecords}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Text style={styles.record}>
            {index + 1}. {formatTime(item)}
          </Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 48,
    marginBottom: 20,
  },
  record: {
    fontSize: 16,
    marginVertical: 5,
  },
});

export default Timer;
