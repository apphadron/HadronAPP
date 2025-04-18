import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione o que deseja rastrear</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/astronomia/rastrearSatelite/rastrearISS')}
      >
        <MaterialIcons name="satellite" size={32} color="white" />
        <Text style={styles.buttonText}>ISS</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/astronomia/rastrearSatelite/rastrearStarLink')}
      >
        <MaterialIcons name="stars" size={32} color="white" />
        <Text style={styles.buttonText}>Starlink</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    marginLeft: 10,
  },
});