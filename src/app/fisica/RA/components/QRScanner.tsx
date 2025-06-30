import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { QRCodeData } from '../types';
import { parseQRCodeData } from '../utils/qrParser';

interface QRScannerProps {
  onQRCodeScanned: (data: QRCodeData) => void;
  isActive: boolean;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onQRCodeScanned, isActive }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    const qrData = parseQRCodeData(data);
    
    if (qrData) {
      onQRCodeScanned(qrData);
    } else {
      Alert.alert(
        'QR Code Inválido',
        'O QR code escaneado não contém dados válidos para realidade aumentada.',
        [
          {
            text: 'OK',
            onPress: () => setScanned(false),
          },
        ]
      );
    }
  };

  const resetScanner = () => {
    setScanned(false);
  };

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-lg">Solicitando permissão da câmera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-lg text-center px-4 mb-4">
          Sem acesso à câmera. Por favor, permita o acesso à câmera nas configurações do dispositivo.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-blue-600 rounded-lg px-6 py-3"
        >
          <Text className="text-white font-semibold">Solicitar Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isActive) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-lg">Scanner desativado</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      
      {/* Overlay com guias visuais */}
      <View className="flex-1 justify-center items-center">
        <View className="w-64 h-64 border-2 border-white border-opacity-50 rounded-lg">
          <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
          <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
          <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
          <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
        </View>
        
        <Text className="text-white text-center mt-8 px-4 text-lg">
          Aponte a câmera para um QR code
        </Text>
        
        {scanned && (
          <View className="absolute bottom-20 left-0 right-0 px-4">
            <Text className="text-white text-center text-lg mb-4">
              QR Code escaneado com sucesso!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
