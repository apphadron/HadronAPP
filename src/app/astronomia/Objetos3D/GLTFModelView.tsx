/*import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { useGLTF, OrbitControls } from '@react-three/drei/native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { AnimationMixer, Box3, Vector3, Group } from 'three';
import { FontAwesome5 } from '@expo/vector-icons';
import { Renderer } from 'expo-three';

// Importação do modelo padrão
import DefaultModel from '@/assets/astronomia/rovers/3dObjetos/Perseverance.glb';

const { width, height } = Dimensions.get('window');

// Types
interface ModelViewerProps {
  modelUrl: string | null;
  backgroundColor?: string;
  onError?: (error: string) => void;
  onLoadComplete?: () => void;
}

interface SceneModelProps {
  modelPath: string;
  onLoad: () => void;
  onError: (error: string) => void;
}

// Hook para gerenciar o carregamento do modelo
const useModelPath = (remoteUrl: string | null) => {
  const [state, setState] = useState({
    localPath: null as string | null,
    isLoading: true,
    error: null as string | null,
    isUsingDefault: false,
  });

  const getDefaultModelPath = async (): Promise<string> => {
    try {
      const asset = Asset.fromModule(DefaultModel);
      await asset.downloadAsync();
      if (!asset.localUri) {
        throw new Error('Failed to load default model');
      }
      return asset.localUri;
    } catch (error) {
      console.error('Error loading default model:', error);
      throw error;
    }
  };

  const downloadRemoteModel = async (url: string): Promise<string> => {
    const filename = `model_${Date.now()}.glb`;
    const localPath = `${FileSystem.cacheDirectory}${filename}`;

    console.log('Downloading model from:', url);

    const downloadResult = await FileSystem.downloadAsync(url, localPath);
    
    if (downloadResult.status !== 200) {
      throw new Error(`Download failed with status: ${downloadResult.status}`);
    }

    // Verifica se o arquivo foi baixado corretamente
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    if (!fileInfo.exists || fileInfo.size === 0) {
      throw new Error('Downloaded file is invalid');
    }

    console.log('Model downloaded successfully:', localPath);
    return localPath;
  };

  const loadModel = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let finalPath: string;
      let usingDefault = false;

      // Tenta carregar modelo remoto primeiro
      if (remoteUrl && remoteUrl.trim() !== '') {
        try {
          // Valida se é uma URL válida
          new URL(remoteUrl);
          finalPath = await downloadRemoteModel(remoteUrl);
        } catch (downloadError) {
          console.warn('Failed to download remote model, using default:', downloadError);
          finalPath = await getDefaultModelPath();
          usingDefault = true;
        }
      } else {
        // Usa modelo padrão se não há URL
        finalPath = await getDefaultModelPath();
        usingDefault = true;
      }

      setState({
        localPath: finalPath,
        isLoading: false,
        error: null,
        isUsingDefault: usingDefault,
      });

    } catch (error: any) {
      console.error('Complete model loading failure:', error);
      setState({
        localPath: null,
        isLoading: false,
        error: error.message || 'Failed to load model',
        isUsingDefault: false,
      });
    }
  }, [remoteUrl]);

  useEffect(() => {
    loadModel();
  }, [loadModel]);

  return { ...state, retry: loadModel };
};

// Componente do modelo 3D
const SceneModel: React.FC<SceneModelProps> = ({ modelPath, onLoad, onError }) => {
  const groupRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const { camera } = useThree();
  const [isModelReady, setIsModelReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Carrega o modelo GLB usando useGLTF diretamente
  let gltf: any;
  try {
    gltf = useGLTF(modelPath);
  } catch (error: any) {
    // Captura erros de carregamento do useGLTF
    useEffect(() => {
      const errorMsg = error.message || 'Failed to load GLTF model';
      console.error('GLTF loading error:', error);
      setLoadError(errorMsg);
      onError(errorMsg);
    }, [error, onError]);
    return null; // Não renderiza nada se houver erro no useGLTF
  }

  // Configura o modelo quando carregado
  useEffect(() => {
    if (!gltf || !gltf.scene || !groupRef.current || isModelReady || loadError) {
      return;
    }

    try {
      console.log('Setting up 3D model scene...');

      // Limpa o grupo
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }

      // Clona e adiciona a cena
      const scene = gltf.scene.clone();
      
      // Verifica se a cena tem geometria
      let hasGeometry = false;
      scene.traverse((child: any) => {
        if (child.geometry) {
          hasGeometry = true;
        }
      });

      if (!hasGeometry) {
        throw new Error('Model has no geometry');
      }

      groupRef.current.add(scene);

      // Calcula dimensões e centraliza
      const box = new Box3().setFromObject(scene);
      const size = box.getSize(new Vector3());
      const center = box.getCenter(new Vector3());

      console.log('Model dimensions:', { size, center });

      // Normaliza o tamanho
      if (size.length() > 0) {
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxDim > 0 ? 2 / maxDim : 1;
        scene.scale.setScalar(scale);
        scene.position.copy(center.multiplyScalar(-scale));
      }

      // Configura animações se existirem
      if (gltf.animations && gltf.animations.length > 0) {
        console.log('Setting up animations:', gltf.animations.length);
        mixerRef.current = new AnimationMixer(scene);
        gltf.animations.forEach((clip: any) => {
          if (mixerRef.current) {
            const action = mixerRef.current.clipAction(clip);
            action.play();
          }
        });
      }

      // Posiciona câmera
      const distance = Math.max(3, Math.max(size.x, size.y, size.z) * 1.5);
      camera.position.set(distance, distance * 0.8, distance);
      camera.lookAt(0, 0, 0);

      console.log('Model setup complete');
      setIsModelReady(true);
      onLoad();

    } catch (error: any) {
      console.error('Model setup error:', error);
      const errorMsg = error.message || 'Model setup failed';
      setLoadError(errorMsg);
      onError(errorMsg);
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
    };
  }, [gltf, camera, onLoad, onError, isModelReady, loadError]);

  // Loop de animação
  useFrame((_, delta) => {
    if (mixerRef.current && isModelReady && !loadError) {
      mixerRef.current.update(delta);
    }
    
    // Rotação automática suave
    if (groupRef.current && isModelReady && !loadError) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  // Renderiza apenas se o modelo estiver pronto e sem erro
  if (loadError) {
    return null;
  }

  if (!isModelReady) {
    return null;
  }

  return <group ref={groupRef} />;
};

// Componente de Loading
const ModelLoading: React.FC<{ backgroundColor: string }> = ({ backgroundColor }) => (
  <View style={[styles.centerContainer, { backgroundColor }]}>
    <ActivityIndicator size="large" color="#e88e14" />
    <Text style={styles.loadingText}>Carregando modelo 3D...</Text>
  </View>
);

// Componente de Erro
const ModelError: React.FC<{ 
  backgroundColor: string; 
  error: string; 
  onRetry: () => void;
  onClose?: () => void;
}> = ({ backgroundColor, error, onRetry, onClose }) => (
  <View style={[styles.centerContainer, { backgroundColor }]}>
    <FontAwesome5 name="exclamation-triangle" size={50} color="#ff6b6b" />
    <Text style={styles.errorTitle}>Erro ao carregar modelo</Text>
    <Text style={styles.errorMessage}>{error}</Text>
    
    <View style={styles.errorButtons}>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <FontAwesome5 name="redo" size={16} color="#fff" />
        <Text style={styles.buttonText}>Tentar Novamente</Text>
      </TouchableOpacity>
      
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <FontAwesome5 name="times" size={16} color="#fff" />
          <Text style={styles.buttonText}>Fechar</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// Componente principal do visualizador - VERSÃO OTIMIZADA
const ModelViewer: React.FC<ModelViewerProps> = ({
  modelUrl,
  backgroundColor = '#2a2a2a',
  onError,
  onLoadComplete,
}) => {
  const { localPath, isLoading, error, isUsingDefault, retry } = useModelPath(modelUrl);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [renderTimeout, setRenderTimeout] = useState(false);

  // Timeout para detectar problemas de renderização
  useEffect(() => {
    if (!isLoading && localPath && !renderError && !isModelLoaded) {
      const timeout = setTimeout(() => {
        console.warn('Model rendering timeout detected');
        setRenderTimeout(true);
        setRenderError('Tempo limite de renderização excedido. O modelo pode estar corrompido.');
      }, 15000); // 15 segundos de timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading, localPath, renderError, isModelLoaded]);

  const handleModelLoad = useCallback(() => {
    console.log('Model loaded and rendered successfully');
    setIsModelLoaded(true);
    setRenderTimeout(false);
    onLoadComplete?.();
  }, [onLoadComplete]);

  const handleModelError = useCallback((errorMsg: string) => {
    console.error('Model render error:', errorMsg);
    setRenderError(errorMsg);
    setRenderTimeout(false);
    onError?.(errorMsg);
  }, [onError]);

  const handleRetry = useCallback(() => {
    console.log('Retrying model load...');
    setRenderError(null);
    setIsModelLoaded(false);
    setRenderTimeout(false);
    retry();
  }, [retry]);

  const handleClose = useCallback(() => {
    console.log('Model viewer closed');
  }, []);

  // Estados de carregamento
  if (isLoading) {
    return <ModelLoading backgroundColor={backgroundColor} />;
  }

  // Estados de erro
  if (error || renderError || renderTimeout) {
    const errorMessage = error || renderError || 'Erro de renderização';
    return (
      <ModelError
        backgroundColor={backgroundColor}
        error={errorMessage}
        onRetry={handleRetry}
        onClose={handleClose}
      />
    );
  }

  // Verifica se tem path local
  if (!localPath) {
    return (
      <ModelError
        backgroundColor={backgroundColor}
        error="Caminho do modelo não disponível"
        onRetry={handleRetry}
        onClose={handleClose}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Canvas
        style={styles.canvas}
        camera={{ 
          position: [3, 3, 3], 
          fov: 60,
          near: 0.1,
          far: 100
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "default",
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(backgroundColor);
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          console.log('Canvas created successfully');
        }}
        onPointerMissed={() => {
          console.log('Canvas interaction detected');
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.0} castShadow />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <pointLight position={[0, 0, 10]} intensity={0.4} />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={20}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />

        <Suspense 
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#444" wireframe />
            </mesh>
          }
        >
          <SceneModel
            modelPath={localPath}
            onLoad={handleModelLoad}
            onError={handleModelError}
          />
        </Suspense>
      </Canvas>

      {isUsingDefault && (
        <View style={styles.defaultModelIndicator}>
          <FontAwesome5 name="cube" size={12} color="#e88e14" />
          <Text style={styles.indicatorText}>Modelo padrão</Text>
        </View>
      )}

      {!isModelLoaded && !renderError && !renderTimeout && (
        <View style={styles.renderingIndicator}>
          <ActivityIndicator size="small" color="#e88e14" />
          <Text style={styles.indicatorText}>Renderizando modelo...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2a2a',
  },
  canvas: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#2a2a2a',
  },
  modelContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#e88e14',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e88e14',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#666',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  defaultModelIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 142, 20, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 6,
  },
  renderingIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 6,
  },
  indicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ModelViewer;

*/