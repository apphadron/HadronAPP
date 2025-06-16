import React, { useEffect, useRef, useState, useMemo, Suspense, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { OrbitControls, useGLTF } from '@react-three/drei/native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { AnimationMixer, Box3, Vector3, Group } from 'three';
import { colors } from '@/styles/colors';
import Perseverance from '@/assets/astronomia/rovers/3dObjetos/Perseverance.glb';

interface GLTFModelViewProps {
  modelUrl: string | number;
  backgroundColor?: string;
  minZoom?: number;
  maxZoom?: number;
  rotationSpeed?: number;
  autoRotate?: boolean;
  enableAnimation?: boolean;
}

interface ModelProps {
  url: string;
  autoRotate: boolean;
  enableAnimation: boolean;
  onError: (error: string) => void;
}

// Hook melhorado para carregamento de modelos
const useModelLoader = (modelUrl: string | number) => {
  const [state, setState] = useState({
    localModelUrl: null as string | null,
    isLoading: true,
    error: null as string | null
  });

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const validateGLTFFile = async (filePath: string): Promise<boolean> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists || fileInfo.size === 0) {
        return false;
      }

      // Lê os primeiros bytes para verificar se é um arquivo GLB válido
      const firstBytes = await FileSystem.readAsStringAsync(filePath, {
        length: 12,
        encoding: FileSystem.EncodingType.Base64
      });
      
      // GLB files começam com "glTF" magic number
      return firstBytes.length > 0;
    } catch (error) {
      console.error('Error validating GLTF file:', error);
      return false;
    }
  };

  const loadModel = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      let assetUri: string | null = null;

      if (typeof modelUrl === 'string' && isValidUrl(modelUrl)) {
        // Carrega modelo remoto
        const filename = `model_${Date.now()}.glb`;
        const localUri = `${FileSystem.cacheDirectory}${filename}`;

        try {
          // Remove arquivo existente se houver
          const fileInfo = await FileSystem.getInfoAsync(localUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(localUri);
          }

          // Download do modelo
          const downloadResult = await FileSystem.downloadAsync(modelUrl, localUri);
          
          if (downloadResult.status !== 200) {
            throw new Error(`Download failed with status ${downloadResult.status}`);
          }

          // Valida o arquivo baixado
          const isValid = await validateGLTFFile(localUri);
          if (!isValid) {
            throw new Error('Downloaded file is not a valid GLTF/GLB file');
          }

          assetUri = localUri;
        } catch (downloadError) {
          console.warn('Error downloading remote model, falling back to default:', downloadError);
          throw downloadError;
        }
      } else {
        // Carrega modelo local
        try {
          const asset = Asset.fromModule(typeof modelUrl === 'string' ? Perseverance : modelUrl);
          await asset.downloadAsync();
          
          if (!asset.localUri) {
            throw new Error('Asset localUri is null');
          }

          assetUri = asset.localUri;
        } catch (assetError) {
          console.error('Error loading local asset:', assetError);
          throw assetError;
        }
      }

      if (!assetUri) {
        throw new Error('No valid asset URI obtained');
      }

      setState({
        localModelUrl: assetUri,
        isLoading: false,
        error: null
      });

    } catch (error: any) {
      console.error('Error in loadModel:', error);
      
      // Fallback para modelo padrão
      try {
        const defaultAsset = Asset.fromModule(Perseverance);
        await defaultAsset.downloadAsync();
        
        if (defaultAsset.localUri) {
          setState({
            localModelUrl: defaultAsset.localUri,
            isLoading: false,
            error: `Using default model: ${error?.message || 'Unknown error'}`
          });
        } else {
          throw new Error('Default asset localUri is null');
        }
      } catch (fallbackError: any) {
        console.error('Fallback also failed:', fallbackError);
        setState({
          localModelUrl: null,
          isLoading: false,
          error: `Failed to load model: ${error?.message || 'Unknown error'}`
        });
      }
    }
  };

  useEffect(() => {
    loadModel();
  }, [modelUrl]);

  return state;
};

// Componente do modelo 3D com melhor tratamento de erros
const Model: React.FC<ModelProps> = ({ url, autoRotate, enableAnimation, onError }) => {
  const groupRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const { camera } = useThree();
  const [isModelReady, setIsModelReady] = useState(false);

  // Carrega o modelo com tratamento de erro robusto
  let gltf;
  try {
    gltf = useGLTF(url);
  } catch (error: any) {
    console.error('useGLTF error:', error);
    useEffect(() => {
      onError(`Failed to load GLTF: ${error?.message || 'Unknown error'}`);
    }, []);
    return null;
  }

  const scene = gltf?.scene;
  const animations = gltf?.animations;

  // Configuração inicial do modelo
  useEffect(() => {
    if (!scene || !groupRef.current) return;

    try {
      // Clona a cena para evitar modificar o original
      const clonedScene = scene.clone();
      
      // Limpa o grupo antes de adicionar novo conteúdo
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
      
      groupRef.current.add(clonedScene);

      // Centraliza e escala o modelo
      const box = new Box3().setFromObject(clonedScene);
      const size = box.getSize(new Vector3());
      const center = box.getCenter(new Vector3());

      // Verifica se as dimensões são válidas
      if (size.x === 0 && size.y === 0 && size.z === 0) {
        throw new Error('Model has zero dimensions');
      }

      // Calcula escala baseada na maior dimensão
      const maxDimension = Math.max(size.x, size.y, size.z);
      const targetSize = 2.5;
      const scale = maxDimension > 0 ? targetSize / maxDimension : 1;

      clonedScene.scale.setScalar(scale);
      clonedScene.position.copy(center.multiplyScalar(-scale));

      // Configura animações se habilitadas
      if (enableAnimation && animations && animations.length > 0) {
        try {
          if (mixerRef.current) {
            mixerRef.current.stopAllAction();
          }
          
          mixerRef.current = new AnimationMixer(clonedScene);
          
          animations.forEach((clip, index) => {
            try {
              if (mixerRef.current && clip.tracks.length > 0) {
                const action = mixerRef.current.clipAction(clip);
                action.setLoop(2201, Infinity); // LoopRepeat
                action.play();
              }
            } catch (clipError) {
              console.warn(`Error with animation clip ${index}:`, clipError);
            }
          });
        } catch (animError) {
          console.warn('Error setting up animations:', animError);
        }
      }

      // Ajusta câmera para enquadrar o modelo
      const distance = Math.max(size.x, size.y, size.z) * 1.5;
      camera.position.set(distance, distance * 0.8, distance);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      setIsModelReady(true);

    } catch (setupError: any) {
      console.error('Error setting up model:', setupError);
      onError(`Model setup failed: ${setupError?.message || 'Unknown error'}`);
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
    };
  }, [scene, animations, enableAnimation, camera, onError]);

  // Loop de animação
  useFrame((_, delta) => {
    if (!groupRef.current || !isModelReady) return;

    try {
      // Atualiza mixer de animações
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Auto rotação
      if (autoRotate) {
        groupRef.current.rotation.y += delta * 0.5;
      }
    } catch (frameError) {
      console.warn('Error in animation frame:', frameError);
    }
  });

  if (!scene || !isModelReady) {
    return null;
  }

  return <group ref={groupRef} />;
};

// Componente de loading com informações de debug
const LoadingFallback: React.FC<{ backgroundColor: string; message?: string }> = ({ 
  backgroundColor, 
  message 
}) => (
  <View style={[styles.loadingContainer, { backgroundColor }]}>
    <ActivityIndicator size="large" color="#e88e14" />
    {message && (
      <Text style={styles.loadingText}>{message}</Text>
    )}
  </View>
);

// Componente de erro
const ErrorFallback: React.FC<{ backgroundColor: string; error: string }> = ({ 
  backgroundColor, 
  error 
}) => (
  <View style={[styles.errorContainer, { backgroundColor }]}>
    <Text style={styles.errorText}>Falha ao carregar modelo 3D</Text>
    <Text style={styles.errorDetails}>{error}</Text>
  </View>
);

// Componente principal melhorado
const GLTFModelView: React.FC<GLTFModelViewProps> = ({
  modelUrl,
  backgroundColor = colors.dark["--color-cinza-80"],
  minZoom = 1.5,
  maxZoom = 8,
  rotationSpeed = 0.5,
  autoRotate = false,
  enableAnimation = true,
}) => {
  const { localModelUrl, isLoading, error } = useModelLoader(modelUrl);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Configurações de controle memoizadas
  const controlsConfig = useMemo(() => ({
    minDistance: minZoom,
    maxDistance: maxZoom,
    rotateSpeed: rotationSpeed,
    enableDamping: true,
    dampingFactor: 0.05,
    enableZoom: true,
    zoomSpeed: 1.2,
    enablePan: true,
    panSpeed: 0.8,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI,
    autoRotate: false, // Controlamos a rotação manualmente no Model
    screenSpacePanning: false,
  }), [minZoom, maxZoom, rotationSpeed]);

  // Configurações de iluminação otimizadas
  const lighting = useMemo(() => (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-5, -5, -5]} intensity={0.4} />
      <pointLight position={[0, 5, 0]} intensity={0.3} />
    </>
  ), []);

  // Handler para erros do modelo
  const handleModelError = useCallback((errorMessage: string) => {
    console.error('Model error:', errorMessage);
    setRenderError(errorMessage);
  }, []);

  // Estados de loading
  if (isLoading) {
    return <LoadingFallback backgroundColor={backgroundColor} message="Carregando modelo 3D..." />;
  }

  // Estados de erro
  if (error && !localModelUrl) {
    return <ErrorFallback backgroundColor={backgroundColor} error={error} />;
  }

  if (renderError) {
    return <ErrorFallback backgroundColor={backgroundColor} error={renderError} />;
  }

  if (!localModelUrl) {
    return <ErrorFallback backgroundColor={backgroundColor} error="URL do modelo não disponível" />;
  }

  return (
    <View style={styles.container}>
      <Canvas
        style={{ flex: 1 }}
        camera={{ 
          position: [0, 0, 5], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        shadows
        gl={{ 
          antialias: true, 
          alpha: false,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(backgroundColor);
          scene.background = null;
        }}
      >
        {lighting}
        
        <OrbitControls {...controlsConfig} />
        
        <Suspense fallback={null}>
          <Model
            url={localModelUrl}
            autoRotate={autoRotate}
            enableAnimation={enableAnimation}
            onError={handleModelError}
          />
        </Suspense>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark["--color-cinza-90"],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#e88e14',
    marginTop: 16,
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
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetails: {
    color: '#cccccc',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default GLTFModelView;