import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

interface StarlinkSatellite {
  satlatitude: number;
  satlongitude: number;
  satname: string;
}

export default function StarlinkTracker() {
  const [satellites, setSatellites] = useState<StarlinkSatellite[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Substitua YOUR_API_KEY pela sua chave da API N2YO
  const N2YO_API_KEY = 'RL4VUN-HQ74R9-NED4EC-5FAS';
  
  useEffect(() => {
    const initializeTracker = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permissão de localização não concedida');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        setUserLocation(location);
        
        // Fetch Starlink satellites
        try {
          const response = await fetch(
            `https://api.n2yo.com/rest/v1/satellite/above/${location.coords.latitude}/${location.coords.longitude}/0/70/52/&apiKey=${N2YO_API_KEY}`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          if (data.above) {
            // Filtrar apenas satélites com coordenadas válidas
            const validSatellites = data.above.filter((sat: StarlinkSatellite) => 
              sat.satlatitude != null && 
              sat.satlongitude != null &&
              !isNaN(sat.satlatitude) && 
              !isNaN(sat.satlongitude)
            );
            setSatellites(validSatellites);
          }
        } catch (error) {
          console.error('Error fetching Starlink data:', error);
          setError('Erro ao buscar dados dos satélites Starlink');
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setError('Erro ao obter localização');
      }
    };

    initializeTracker();
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando sua localização...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 50,
          longitudeDelta: 50,
        }}
      >
        {satellites.map((satellite, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: satellite.satlatitude,
              longitude: satellite.satlongitude,
            }}
            title={satellite.satname}
            pinColor="red"
          />
        ))}
        
        <Marker
          coordinate={{
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          }}
          title="Sua localização"
          pinColor="blue"
        />
      </MapView>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Satélites Starlink visíveis: {satellites.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});