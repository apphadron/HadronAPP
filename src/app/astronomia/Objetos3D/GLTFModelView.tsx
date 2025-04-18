import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { OrbitControls, useGLTF } from '@react-three/drei/native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { AnimationMixer, Box3, Vector3 } from 'three';
import { colors } from '@/styles/colors';
import Perseverance from '@/assets/astronomia/rovers/3dObjetos/Perseverance.glb';


// Propriedades do componente
interface GLTFModelViewProps {
  modelUrl: string;
  backgroundColor?: string;
  minZoom?: number;
  maxZoom?: number;
  rotationSpeed?: number;
}

// Componente do modelo que será renderizado dentro do Canvas
const Model: React.FC<{ url: string, minZoom: number, maxZoom: number, rotationSpeed: number }> = ({url, minZoom, maxZoom, rotationSpeed }) => {
  const { scene, animations } = useGLTF(url);
  const mixer = useRef<AnimationMixer | null>(null);
  const model = useRef(scene);

  useEffect(() => {
    if (model.current) {
      // Ajusta a escala e posição do modelo
      const box = new Box3().setFromObject(model.current);
      const size = box.getSize(new Vector3());
      const center = box.getCenter(new Vector3());

      // Escala o modelo para caber na visualização
      const maxDimension = Math.max(size.x, size.y, size.z);
      const scale = 3 / maxDimension;
      model.current.scale.set(scale, scale, scale);

      // Centraliza o modelo
      model.current.position.set(
        -center.x * scale,
        -center.y * scale,
        -center.z * scale
      );

      // Configuração do mixer de animação se o modelo tiver animações
      if (animations && animations.length > 0) {
        mixer.current = new AnimationMixer(model.current);
        const action = mixer.current.clipAction(animations[0]);
        action.play();
      }
    }
  }, [scene, animations]);

  // Atualiza as animações
  useFrame((_, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
  });

  return <primitive object={scene} />;
};


/**
 * Componente para renderizar modelos 3D GLTF com interatividade usando OrbitControls
 */
export default function GLTFModelView({
  modelUrl,
  backgroundColor = colors.dark["--color-cinza-80"],
  minZoom = 2,
  maxZoom = 10,
  rotationSpeed = 0.5, // valor menor para rotação mais lenta
}: GLTFModelViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [localModelUrl, setLocalModelUrl] = useState<string | null>(null);
  
  // Baixa o modelo 3D e o converte em um arquivo local
  useEffect(() => {
    async function loadModel() {
      try {
        setIsLoading(true);
        
        // Verifica se o modelUrl é uma string (URL) ou um módulo (modelo local)
        if (typeof modelUrl === 'string') {
          // Se for uma URL, faz o download
          const filename = modelUrl.split('/').pop() || 'model.glb';
          const localUri = `${FileSystem.cacheDirectory}${filename}`;
          
          const fileInfo = await FileSystem.getInfoAsync(localUri);
          
          if (!fileInfo.exists) {
            await FileSystem.downloadAsync(modelUrl, localUri);
          }
          
          const asset = Asset.fromURI(localUri);
          await asset.downloadAsync();
          setLocalModelUrl(asset.localUri);
        } else {
          // Se for um modelo local, usa diretamente
          const asset = Asset.fromModule(modelUrl);
          await asset.downloadAsync();
          setLocalModelUrl(asset.localUri);
        }
      } catch (error) {
        console.error('Erro ao carregar modelo:', error);
        // Tenta usar o modelo padrão em caso de erro
        try {
          const defaultAsset = Asset.fromModule(Perseverance);
          await defaultAsset.downloadAsync();
          setLocalModelUrl(defaultAsset.localUri);
        } catch (defaultError) {
          console.error('Erro ao carregar modelo padrão:', defaultError);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadModel();
  }, [modelUrl]);
  
  
  return (
    <View style={styles.container}>
      {isLoading || !localModelUrl ? (
        <View style={[styles.loadingContainer, { backgroundColor: backgroundColor }]}>
          <ActivityIndicator size="large" color="#e88e14" />
        </View>
      ) : (
        <Canvas style={{ flex: 1 }}>
          {/* Luzes */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[1, 1, 1]} intensity={1} />
          <directionalLight position={[-1, -1, -1]} intensity={0.5} />
          
          {/* Controles de órbita */}
          <OrbitControls 
            minDistance={minZoom}
            maxDistance={maxZoom}
            rotateSpeed={rotationSpeed}
            enableDamping
            dampingFactor={0.05}
            enableZoom
            zoomSpeed={1.0}
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI * 5/6}
          />
          
          {/* Componente do modelo */}
          <Model 
            url={localModelUrl} 
            minZoom={minZoom}
            maxZoom={maxZoom}
            rotationSpeed={rotationSpeed}
          />
        </Canvas>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark["--color-cinza-90"]
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});