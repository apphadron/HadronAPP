import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ARContent } from '../types';

interface ARCameraProps {
  children?: React.ReactNode;
  arContent?: ARContent | null;
}

export const ARCamera: React.FC<ARCameraProps> = ({ children, arContent }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const { width, height } = Dimensions.get('window');

  if (!permission?.granted) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        {children}
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Câmera como fundo */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        // Desabilita o scanner quando há conteúdo AR ativo
        onBarcodeScanned={arContent ? undefined : undefined}
      />
      
      {/* Overlay para conteúdo AR */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
};

