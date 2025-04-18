// app/iss.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polygon, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import ISSIcon from '@/assets/icons/ISSIcon.png';

interface ISSPosition {
    satlatitude: number;
    satlongitude: number;
    sataltitude: number;
    timestamp: number;
}

interface OrbitPoint {
    satlatitude: number;
    satlongitude: number;
}

interface FootprintPoint {
    latitude: number;
    longitude: number;
}

export default function ISSTracker() {
    const [issPosition, setIssPosition] = useState<ISSPosition | null>(null);
    const [orbitPoints, setOrbitPoints] = useState<OrbitPoint[]>([]);
    const [footprint, setFootprint] = useState<FootprintPoint[]>([]);
    const [mapRegion, setMapRegion] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 50,
        longitudeDelta: 50,
    });

  const [nextPass, setNextPass] = useState<string | null>(null);
    const mapViewRef = useRef<MapView | null>(null);
    const N2YO_API_KEY = 'RL4VUN-HQ74R9-NED4EC-5FAS';
    const ISS_NORAD_ID = 25544;
    const [shouldCenter, setShouldCenter] = useState(true);

    const isValidCoordinate = (lat: number, lon: number) => {
        return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    };

    useEffect(() => {
        const fetchISSData = async () => {
          try {
            const posResponse = await fetch(
              `https://api.n2yo.com/rest/v1/satellite/positions/${ISS_NORAD_ID}/0/0/0/1/&apiKey=${N2YO_API_KEY}`
            );
            const posData = await posResponse.json();
            if (posData.positions && posData.positions[0]) {
              const position = posData.positions[0];
              if (isValidCoordinate(position.satlatitude, position.satlongitude)) {
                setIssPosition(position);
                setMapRegion(prevRegion => ({
                  ...prevRegion,
                  latitude: position.satlatitude,
                  longitude: position.satlongitude,
                }));
              }
            }
          } catch (error) {
            console.error('Erro ao buscar dados da ISS:', error);
          }
        };
    
        const fetchNextPass = async () => {
          try {
            const location = await Location.getCurrentPositionAsync({});
            const passResponse = await fetch(
              `https://api.n2yo.com/rest/v1/satellite/radiopasses/${ISS_NORAD_ID}/${location.coords.latitude}/${location.coords.longitude}/0/1/40/&apiKey=${N2YO_API_KEY}`
            );
            const passData = await passResponse.json();
            if (passData.passes && passData.passes.length > 0) {
              const timestamp = passData.passes[0].startUTC;
              const date = new Date(timestamp * 1000);
              setNextPass(date.toLocaleString());
            } else {
              setNextPass('Sem passagens nos próximos 40 dias');
            }
          } catch (error) {
            console.error('Erro ao buscar próxima passagem:', error);
          }
        };
    
        fetchISSData();
        fetchNextPass();
        const interval = setInterval(fetchISSData, 5000);
        return () => clearInterval(interval);
      }, []);

    const zoomIn = () => {
        setMapRegion(prevRegion => ({
            ...prevRegion,
            latitudeDelta: prevRegion.latitudeDelta / 2,
            longitudeDelta: prevRegion.longitudeDelta / 2,
        }));
    };

    const zoomOut = () => {
        setMapRegion(prevRegion => ({
            ...prevRegion,
            latitudeDelta: prevRegion.latitudeDelta * 2,
            longitudeDelta: prevRegion.longitudeDelta * 2,
        }));
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={(ref) => (mapViewRef.current = ref)}
                style={styles.map}
                region={mapRegion}
                onTouchStart={() => setShouldCenter(false)}
            >
                {issPosition && (
                    <Marker
                        coordinate={{
                            latitude: issPosition.satlatitude,
                            longitude: issPosition.satlongitude,
                        }}
                        title="ISS"
                        description={`Altitude: ${Math.round(issPosition.sataltitude)}km`}
                    >
                        <Image source={ISSIcon} style={{ width: 32, height: 32 }} />
                    </Marker>
                )}

                {orbitPoints.length > 0 && (
                    <Polyline
                        coordinates={orbitPoints.map(point => ({
                            latitude: point.satlatitude,
                            longitude: point.satlongitude,
                        }))}
                        strokeColor="#FF0000"
                        strokeWidth={1}
                    />
                )}

                {footprint.length > 0 && (
                    <Polygon
                        coordinates={footprint}
                        strokeColor="#00FF00"
                        fillColor="rgba(0, 255, 0, 0.1)"
                        strokeWidth={1}
                    />
                )}
            </MapView>
            <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.button} onPress={zoomIn}>
                    <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={zoomOut}>
                    <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Latitude: {issPosition?.satlatitude.toFixed(2)}</Text>
                <Text style={styles.infoText}>Longitude: {issPosition?.satlongitude.toFixed(2)}</Text>
                <Text style={styles.infoText}>Altitude: {Math.round(issPosition?.sataltitude || 0)} km</Text>
                <Text style={styles.infoText}>Próxima passagem: {nextPass || 'Calculando...'}</Text>
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
        marginBottom: 5,
    },
    controlsContainer: {
      position: 'absolute',
      top: 20,
      right: 20,
      flexDirection: 'column',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      padding: 10,
      borderRadius: 10,
    },
    button: {
      padding: 10,
      backgroundColor: '#007AFF',
      borderRadius: 5,
      marginVertical: 5,
    },
    buttonText: {
      color: 'white',
      fontSize: 20,
      textAlign: 'center',
    },
});
