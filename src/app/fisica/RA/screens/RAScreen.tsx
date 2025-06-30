import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { QRScanner } from '../components/QRScanner';
import { ARCamera } from '../components/ARCamera';
import { ARImage } from '../components/ARImage';
import { ARVideo } from '../components/ARVideo';
import { AR3DObject } from '../components/AR3DObject';
import { QRCodeData, ARContent } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';

type AppMode = 'scanner' | 'ar';

const MainScreen: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('scanner');
  const [arContent, setARContent] = useState<ARContent | null>(null);

  const handleQRCodeScanned = (qrData: QRCodeData) => {
    // Converter QRCodeData para ARContent
    const content: ARContent = {
      id: Date.now().toString(),
      type: qrData.type,
      url: qrData.url,
      title: qrData.title,
      description: qrData.description,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    };

    setARContent(content);
    setMode('ar');
  };

  const resetToScanner = () => {
    setARContent(null);
    setMode('scanner');
  };

  const renderARContent = () => {
    if (!arContent) return null;

    switch (arContent.type) {
      case 'image':
        return <ARImage content={arContent} isVisible={mode === 'ar'} />;
      case 'video':
        return <ARVideo content={arContent} isVisible={mode === 'ar'} />;
      case '3d':
        return <AR3DObject content={arContent} isVisible={mode === 'ar'} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View className="bg-gray-900 px-4 py-3 border-b border-gray-700 z-10">
        <Text className="text-white text-xl font-bold text-center">
          AR QR Scanner
        </Text>
        <Text className="text-gray-400 text-sm text-center mt-1">
          {mode === 'scanner' ? 'Escaneie um QR code para começar' : 'Conteúdo em Realidade Aumentada'}
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 ">
        {mode === 'scanner' && (
          <QRScanner
            onQRCodeScanned={handleQRCodeScanned}
            isActive={mode === 'scanner'}
          />
        )}

        {mode === 'ar' && (
          <ARCamera arContent={arContent}>
            <View className="flex-1 w-full h-full">
              {/* Conteúdo AR sobreposto */}
              <View className='absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center'>
                {renderARContent()}
              </View>

              {/* Indicadores de tracking nos cantos da tela */}
              {!arContent && (
                <>
                  <View className="absolute top-20 left-4 z-10">
                    <View className="w-8 h-8 border-2 border-green-400 rounded-tl-lg border-r-0 border-b-0" />
                  </View>
                  <View className="absolute top-20 right-4 z-10">
                    <View className="w-8 h-8 border-2 border-green-400 rounded-tr-lg border-l-0 border-b-0" />
                  </View>
                  <View className="absolute bottom-32 left-4 z-10">
                    <View className="w-8 h-8 border-2 border-green-400 rounded-bl-lg border-r-0 border-t-0" />
                  </View>
                  <View className="absolute bottom-32 right-4 z-10">
                    <View className="w-8 h-8 border-2 border-green-400 rounded-br-lg border-l-0 border-t-0" />
                  </View>
                </>
              )}
            </View>
          </ARCamera>
        )}
      </View>

      {/* Bottom Controls */}
      <View className="bg-gray-900 px-4 py-4 border-t border-gray-700 z-10">
        {mode === 'scanner' && (
          <View className="flex-row justify-center">
            <View className="bg-gray-800 rounded-lg px-4 py-2">
              <Text className="text-white text-sm text-center">
                📱 Aponte para um QR code
              </Text>
            </View>
          </View>
        )}

        {mode === 'ar' && (
          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              onPress={resetToScanner}
              className="bg-blue-600 rounded-lg px-6 py-3 flex-1 mr-2"
            >
              <Text className="text-white font-semibold text-center">
                🔍 Escanear Novo QR
              </Text>
            </TouchableOpacity>

            <View className="bg-gray-800 rounded-lg px-4 py-3 flex-1 ml-2">
              <Text className="text-white text-xs text-center">
                Tipo: {arContent?.type?.toUpperCase()}
              </Text>
              <Text className="text-gray-400 text-xs text-center mt-1">
                {arContent?.title || 'Sem título'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default MainScreen;