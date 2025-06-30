/*import React, { useRef, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { ARContent } from '../types';

interface ARViewerProps {
  content: ARContent | null;
  isVisible: boolean;
}

export const ARViewer: React.FC<ARViewerProps> = ({ content, isVisible }) => {
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const currentObjectRef = useRef<THREE.Object3D | null>(null);

  const { width, height } = Dimensions.get('window');

  const onContextCreate = async (gl: any) => {
    // Configurar renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Transparente para AR
    rendererRef.current = renderer;

    // Configurar cena
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Configurar câmera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Adicionar iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Função de renderização
    const render = () => {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  useEffect(() => {
    if (!content || !sceneRef.current || !isVisible) {
      // Remove objeto atual se existir
      if (currentObjectRef.current && sceneRef.current) {
        sceneRef.current.remove(currentObjectRef.current);
        currentObjectRef.current = null;
      }
      return;
    }

    loadContent(content);
  }, [content, isVisible]);

  const loadContent = async (arContent: ARContent) => {
    if (!sceneRef.current) return;

    // Remove objeto anterior
    if (currentObjectRef.current) {
      sceneRef.current.remove(currentObjectRef.current);
    }

    try {
      let object: THREE.Object3D;

      switch (arContent.type) {
        case 'image':
          object = await createImageObject(arContent.url);
          break;
        case 'video':
          object = await createVideoObject(arContent.url);
          break;
        case '3d':
          object = await create3DObject(arContent.url);
          break;
        default:
          return;
      }

      // Aplicar transformações
      if (arContent.position) {
        object.position.set(
          arContent.position.x,
          arContent.position.y,
          arContent.position.z
        );
      }

      if (arContent.rotation) {
        object.rotation.set(
          arContent.rotation.x,
          arContent.rotation.y,
          arContent.rotation.z
        );
      }

      if (arContent.scale) {
        object.scale.set(
          arContent.scale.x,
          arContent.scale.y,
          arContent.scale.z
        );
      }

      sceneRef.current.add(object);
      currentObjectRef.current = object;

    } catch (error) {
      console.error('Erro ao carregar conteúdo AR:', error);
    }
  };

  const createImageObject = async (url: string): Promise<THREE.Object3D> => {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        url,
        (texture) => {
          const geometry = new THREE.PlaneGeometry(2, 2);
          const material = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true 
          });
          const plane = new THREE.Mesh(geometry, material);
          resolve(plane);
        },
        undefined,
        (error) => reject(error)
      );
    });
  };

  const createVideoObject = async (url: string): Promise<THREE.Object3D> => {
    // Para vídeo, criamos um plano com textura de vídeo
    // Nota: Em React Native, o vídeo precisa ser tratado de forma especial
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00, // Verde temporário para indicar vídeo
      transparent: true 
    });
    const plane = new THREE.Mesh(geometry, material);
    return plane;
  };

  const create3DObject = async (url: string): Promise<THREE.Object3D> => {
    // Para modelos 3D GLB, usaríamos GLTFLoader
    // Por simplicidade, criamos um cubo colorido
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x0077ff });
    const cube = new THREE.Mesh(geometry, material);
    
    // Adicionar rotação automática
    const animate = () => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      requestAnimationFrame(animate);
    };
    animate();
    
    return cube;
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View className="absolute inset-0">
      <GLView
        style={{ flex: 1 }}
        onContextCreate={onContextCreate}
      />
    </View>
  );
};

*/