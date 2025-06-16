import React, { useEffect, useRef, useState, useMemo, Suspense, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
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
  onSuccess: () => void;
}

// Hook melhorado para carregamento de modelos com detecção de Draco e fallback automático
const useModelLoader = (modelUrl: string | number) => {
  const [state, setState] = useState({
    localModelUrl: null as string | null,
    isLoading: true,
    error: null as string | null,
    isUsingFallback: false,
    isDracoModel: false,
    skipDracoModels: true // React Native não suporta WASM/Draco nativamente
  });

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateGLTFFile = async (filePath: string): Promise<{ isValid: boolean; isDraco: boolean }> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists || fileInfo.size === 0) {
        console.warn('File does not exist or has zero size:', filePath);
        return { isValid: false, isDraco: false };
      }

      // Verifica se o arquivo tem um tamanho mínimo razoável
      if (fileInfo.size < 100) {
        console.warn('File too small to be a valid GLTF/GLB:', fileInfo.size);
        return { isValid: false, isDraco: false };
      }

      // Tenta detectar se é um arquivo com compressão Draco
      try {
        const sampleSize = Math.min(fileInfo.size, 2048); // Lê até 2KB
        const fileContent = await FileSystem.readAsStringAsync(filePath, {
          length: sampleSize,
          encoding: FileSystem.EncodingType.Base64
        });
        
        // Converte base64 para string para procurar por indicadores
        const binaryString = atob(fileContent);
        
        // Procura por indicadores de extensão Draco
        const hasDracoExtension = binaryString.includes('KHR_draco_mesh_compression');
        
        console.log(`File validation - Size: ${fileInfo.size}, Draco detected: ${hasDracoExtension}`);
        
        return { isValid: true, isDraco: hasDracoExtension };
      } catch (readError) {
        console.warn('Could not analyze file content, assuming valid:', readError);
        return { isValid: true, isDraco: false };
      }
    } catch (error) {
      console.error('Error validating GLTF file:', error);
      return { isValid: false, isDraco: false };
    }
  };

  const loadDefaultModel = async (): Promise<string> => {
    try {
      const defaultAsset = Asset.fromModule(Perseverance);
      await defaultAsset.downloadAsync();
      
      if (!defaultAsset.localUri) {
        throw new Error('Default asset localUri is null');
      }

      return defaultAsset.localUri;
    } catch (error) {
      console.error('Failed to load default model:', error);
      throw new Error('Failed to load default model');
    }
  };

  const loadRemoteModel = async (url: string): Promise<{ uri: string; isDraco: boolean }> => {
    const filename = `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.glb`;
    const localUri = `${FileSystem.cacheDirectory}${filename}`;

    try {
      // Remove arquivo existente se houver
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(localUri);
      }

      console.log('Downloading model from:', url);
      
      // Download do modelo com timeout
      const downloadResult = await Promise.race([
        FileSystem.downloadAsync(url, localUri),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Download timeout')), 30000)
        )
      ]) as FileSystem.FileSystemDownloadResult;
      
      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }

      console.log('Download completed, validating file...');

      // Valida o arquivo baixado e detecta Draco
      const { isValid, isDraco } = await validateGLTFFile(localUri);
      if (!isValid) {
        throw new Error('Downloaded file is not a valid GLTF/GLB file');
      }

      console.log(`File validation successful - Draco compression: ${isDraco}`);
      
      // Se é um modelo Draco e estamos pulando modelos Draco, joga erro para usar fallback
      if (isDraco && state.skipDracoModels) {
        console.warn('Draco model detected, but React Native does not support WASM. Using fallback.');
        throw new Error('Draco models not supported in React Native (WASM limitation)');
      }
      
      return { uri: localUri, isDraco };
    } catch (error) {
      // Limpa arquivo parcialmente baixado
      try {
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(localUri);
        }
      } catch (cleanupError) {
        console.warn('Failed to cleanup partial download:', cleanupError);
      }
      
      throw error;
    }
  };

  const loadLocalModel = async (modelRef: any): Promise<{ uri: string; isDraco: boolean }> => {
    try {
      const asset = Asset.fromModule(modelRef);
      await asset.downloadAsync();
      
      if (!asset.localUri) {
        throw new Error('Asset localUri is null');
      }

      // Verifica se o modelo local tem compressão Draco
      const { isValid, isDraco } = await validateGLTFFile(asset.localUri);
      if (!isValid) {
        throw new Error('Local asset is not a valid GLTF/GLB file');
      }

      // Se é um modelo Draco e estamos pulando modelos Draco, joga erro para usar fallback
      if (isDraco && state.skipDracoModels) {
        console.warn('Local Draco model detected, but React Native does not support WASM. Using fallback.');
        throw new Error('Draco models not supported in React Native (WASM limitation)');
      }

      return { uri: asset.localUri, isDraco };
    } catch (error) {
      console.error('Error loading local asset:', error);
      throw error;
    }
  };

  const loadModel = async () => {
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null, 
        isUsingFallback: false,
        isDracoModel: false
      }));

      let assetUri: string | null = null;
      let isUsingFallback = false;
      let isDracoModel = false;

      if (typeof modelUrl === 'string' && isValidUrl(modelUrl)) {
        // Tenta carregar modelo remoto
        try {
          const result = await loadRemoteModel(modelUrl);
          assetUri = result.uri;
          isDracoModel = result.isDraco;
          console.log('Remote model loaded successfully');
        } catch (remoteError) {
          console.warn('Failed to load remote model, using fallback:', remoteError);
          assetUri = await loadDefaultModel();
          isUsingFallback = true;
          isDracoModel = false;
          
          // Se o erro foi por causa do Draco, marca como modelo Draco para exibir aviso
          if (remoteError instanceof Error && remoteError.message.includes('Draco')) {
            isDracoModel = true;
          }
        }
      } else {
        // Tenta carregar modelo local
        try {
          const modelRef = typeof modelUrl === 'string' ? Perseverance : modelUrl;
          const result = await loadLocalModel(modelRef);
          assetUri = result.uri;
          isDracoModel = result.isDraco;
          console.log('Local model loaded successfully');
        } catch (localError) {
          console.warn('Failed to load local model, using fallback:', localError);
          assetUri = await loadDefaultModel();
          isUsingFallback = true;
          isDracoModel = false;
          
          // Se o erro foi por causa do Draco, marca como modelo Draco para exibir aviso
          if (localError instanceof Error && localError.message.includes('Draco')) {
            isDracoModel = true;
          }
        }
      }

      if (!assetUri) {
        throw new Error('No valid asset URI obtained');
      }

      setState({
        localModelUrl: assetUri,
        isLoading: false,
        error: null,
        isUsingFallback,
        isDracoModel,
        skipDracoModels: true
      });

    } catch (error: any) {
      console.error('Complete failure in loadModel:', error);
      setState(prev => ({
        ...prev,
        localModelUrl: null,
        isLoading: false,
        error: `Failed to load any model: ${error?.message || 'Unknown error'}`,
        isUsingFallback: false,
        isDracoModel: false,
        skipDracoModels: true
      }));
    }
  };

  useEffect(() => {
    loadModel();
  }, [modelUrl]);

  return state;
};

// Componente do modelo 3D simplificado (sem tentativas de Draco)
const Model: React.FC<ModelProps> = ({ url, autoRotate, enableAnimation, onError, onSuccess }) => {
  const groupRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const { camera } = useThree();
  const [isModelReady, setIsModelReady] = useState(false);
  const [hasErrored, setHasErrored] = useState(false);

  // Usa useGLTF simples (sem configuração Draco, já que não funciona no React Native)
  let gltf;
  try {
    gltf = useGLTF(url);
  } catch (error: any) {
    console.error('useGLTF error:', error);
    if (!hasErrored) {
      setHasErrored(true);
      onError(`Failed to load GLTF: ${error?.message || 'Unknown error'}`);
    }
    return null;
  }

  const scene = gltf?.scene;
  const animations = gltf?.animations;

  // Configuração inicial do modelo
  useEffect(() => {
    if (!scene || !groupRef.current || hasErrored) return;

    try {
      console.log('Setting up model scene...');
      
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
        console.warn('Model has zero dimensions, using default scale');
        clonedScene.scale.setScalar(1);
        clonedScene.position.set(0, 0, 0);
      } else {
        // Calcula escala baseada na maior dimensão
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetSize = 2.5;
        const scale = maxDimension > 0 ? targetSize / maxDimension : 1;

        clonedScene.scale.setScalar(scale);
        clonedScene.position.copy(center.multiplyScalar(-scale));
      }

      // Configura animações se habilitadas
      if (enableAnimation && animations && animations.length > 0) {
        try {
          if (mixerRef.current) {
            mixerRef.current.stopAllAction();
          }
          
          mixerRef.current = new AnimationMixer(clonedScene);
          
          animations.forEach((clip, index) => {
            try {
              if (mixerRef.current && clip.tracks && clip.tracks.length > 0) {
                const action = mixerRef.current.clipAction(clip);
                action.setLoop(2201, Infinity); // LoopRepeat
                action.play();
                console.log(`Animation ${index} started successfully`);
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
      const distance = Math.max(size.x || 5, size.y || 5, size.z || 5) * 1.5;
      camera.position.set(distance, distance * 0.8, distance);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      setIsModelReady(true);
      onSuccess();
      console.log('Model setup completed successfully');

    } catch (setupError: any) {
      console.error('Error setting up model:', setupError);
      setHasErrored(true);
      onError(`Model setup failed: ${setupError?.message || 'Unknown error'}`);
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
    };
  }, [scene, animations, enableAnimation, camera, onError, onSuccess, hasErrored]);

  // Loop de animação
  useFrame((_, delta) => {
    if (!groupRef.current || !isModelReady || hasErrored) return;

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

  if (!scene || !isModelReady || hasErrored) {
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
const ErrorFallback: React.FC<{ backgroundColor: string; error: string; onRetry?: () => void }> = ({ 
  backgroundColor, 
  error,
  onRetry
}) => (
  <View style={[styles.errorContainer, { backgroundColor }]}>
    <Text style={styles.errorText}>Falha ao carregar modelo 3D</Text>
    <Text style={styles.errorDetails}>{error}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    )}
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
  const { localModelUrl, isLoading, error, isUsingFallback, isDracoModel } = useModelLoader(modelUrl);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [modelLoadSuccess, setModelLoadSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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

  // Handler para sucesso do modelo
  const handleModelSuccess = useCallback(() => {
    setModelLoadSuccess(true);
    setRenderError(null);
  }, []);

  // Handler para retry
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setRenderError(null);
    setModelLoadSuccess(false);
    // Force re-render by changing the key
  }, []);

  // Estados de loading
  if (isLoading) {
    const message = isUsingFallback ? 
      "Carregando modelo padrão..." : 
      "Carregando modelo 3D...";
    return <LoadingFallback backgroundColor={backgroundColor} message={message} />;
  }

  // Estados de erro
  if (error && !localModelUrl) {
    return <ErrorFallback backgroundColor={backgroundColor} error={error} onRetry={handleRetry} />;
  }

  if (renderError && !modelLoadSuccess) {
    return <ErrorFallback backgroundColor={backgroundColor} error={renderError} onRetry={handleRetry} />;
  }

  if (!localModelUrl) {
    return <ErrorFallback backgroundColor={backgroundColor} error="URL do modelo não disponível" onRetry={handleRetry} />;
  }

  return (
    <View style={styles.container}>
      {/* Indicadores de status */}
      <View style={styles.statusContainer}>
        {isUsingFallback && (
          <View style={styles.fallbackNotice}>
            <Text style={styles.fallbackText}>
              {isDracoModel ? 'Modelo Draco não suportado - Usando padrão' : 'Modelo padrão'}
            </Text>
          </View>
        )}
        
        {isDracoModel && !isUsingFallback && (
          <View style={styles.dracoNotice}>
            <Text style={styles.dracoText}>⚠️ Draco detectado - Limitação do React Native</Text>
          </View>
        )}
      </View>
      
      <Canvas
        key={`canvas-${retryCount}`} // Force re-render on retry
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
            key={`model-${retryCount}`} // Force re-render on retry
            url={localModelUrl}
            autoRotate={autoRotate}
            enableAnimation={enableAnimation}
            onError={handleModelError}
            onSuccess={handleModelSuccess}
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
  statusContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  fallbackNotice: {
    backgroundColor: 'rgba(233, 142, 20, 0.9)',
    padding: 8,
    borderRadius: 4,
    flex: 1,
  },
  fallbackText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  dracoNotice: {
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    padding: 8,
    borderRadius: 4,
    flex: 1,
  },
  dracoText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#e88e14',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GLTFModelView;

