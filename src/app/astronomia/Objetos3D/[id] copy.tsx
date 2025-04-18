import React, { useState, useEffect, Suspense } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei/native';
import { AnimationMixer, Group, Box3, Vector3, BoxHelper } from 'three';
import { FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '@/db/supabaseClient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/styles/colors';

// Modelo para carregar o objeto GLTF da URL
interface GLTFResult {
    scene: Group;
    animations: any[];
}

const Model: React.FC<{ url: string }> = ({ url }) => {
    const { scene, animations } = useGLTF(url) as GLTFResult;
    const [mixer, setMixer] = useState<AnimationMixer | null>(null);
    const [boxHelper, setBoxHelper] = useState<BoxHelper | null>(null);

    useEffect(() => {
        if (scene) {
            // Calcula os limites do objeto e ajusta escala e posição
            const box = new Box3().setFromObject(scene);
            const size = new Vector3();
            const center = new Vector3();

            box.getSize(size); // Tamanho do objeto
            box.getCenter(center); // Centro do objeto

            // Ajusta a escala com base no maior eixo do objeto
            const maxAxis = Math.max(size.x, size.y, size.z);
            const scaleFactor = 1 / maxAxis;
            scene.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // Centraliza o objeto na origem (0, 0, 0)
            scene.position.set(-center.x * scaleFactor, -center.y * scaleFactor, -center.z * scaleFactor);

            // Se houver animações, inicialize o mixer
            if (animations.length) {
                const newMixer = new AnimationMixer(scene);
                const action = newMixer.clipAction(animations[0]);
                action.play();
                setMixer(newMixer);
            }

            // Cria a caixa envolta do objeto (opcional)
            const helper = new BoxHelper(scene, 0xff0000); // Caixa com a cor vermelha
            setBoxHelper(helper);
        }
    }, [scene, animations]);

    useFrame((_, delta) => {
        mixer?.update(delta);
        if (boxHelper) {
            boxHelper.update(); // Atualiza a caixa a cada frame
        }
    });

    return scene ? (
        <>
            <primitive object={scene} castShadow receiveShadow />
            {boxHelper && <primitive object={boxHelper} />}
        </>
    ) : null;
};

// Fallback para o Suspense fora do Canvas
const FallbackLoader = () => (
    <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#e88e14" />
    </View>
);

export default function ObjectScene() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const [infoData, setInfoData] = useState<any[]>([]); // Dados para exibir no FlatList
    const [flexValue, setFlexValue] = useState(0.6); // Controla a altura da view 3D

    // URL padrão para o modelo 3D
    const defaultModelUrl = 'https://raw.githubusercontent.com/ofccarlosborges/AppDocs/main/Perseverance.glb'; // Substitua pela URL padrão desejada

    // Carregar URL do modelo 3D do banco de dados (Supabase ou outro)
    useEffect(() => {
        const fetchObjectData = async () => {
            try {
                const { data, error } = await supabase
                    .from('objetos_3d')
                    .select('*') // Seleciona todas as colunas
                    .eq('id', id) // ID do objeto (exemplo, altere conforme sua necessidade)
                    .single();

                if (error) {
                    console.error('Erro ao buscar dados:', error);
                    return;
                }

                // Verifica se o campo `object_url` está vazio e usa a URL padrão
                const objectUrl = data?.object_url ? data.object_url : defaultModelUrl;
                setModelUrl(objectUrl);

                // Carrega os dados para o FlatList apenas se não forem vazios
                const info = [
                    { title: 'Nome', description: data.nome },
                    { title: 'Categoria', description: data.categoria },
                    { title: 'Tipo', description: data.tipo },
                    { title: 'Fabricante', description: data.fabricante },
                    { title: 'Ano de Lançamento', description: data.ano_lancamento ? data.ano_lancamento.toString() : '' },
                    { title: 'Massa (kg)', description: data.massa ? data.massa.toString() : '' },
                    { title: 'Altura', description: data.altura ? data.altura.toString() : '' },
                    { title: 'Velocidade Orbital (km/s)', description: data.velocidade_orbital ? data.velocidade_orbital.toString() : '' },
                    { title: 'Status', description: data.status },
                    { title: 'Operador', description: data.operador },
                    { title: 'Missões Realizadas', description: data.missoes_realizadas ? data.missoes_realizadas.toString() : '' },
                    { title: 'Propósito', description: data.proposito },
                    { title: 'Localização', description: data.localizacao },
                ];

                // Filtra informações vazias e valida as descrições
                setInfoData(info.filter(item => item.description?.trim() !== ''));

            } catch (err) {
                console.error('Erro:', err);
            }
        };

        fetchObjectData();
    }, []);

    const toggleFullScreen = () => {
        setFlexValue(flexValue === 1 ? 0.6 : 1);
    };

    if (!modelUrl) {
        return <Text>Carregando o modelo 3D...</Text>;
    }

    return (
        <View className='flex-1 flex-column'>
            <View style={{ flex: flexValue, backgroundColor: 'rgb(235, 235, 235)' }}>

                <Suspense fallback={<FallbackLoader />}>
                    <Canvas shadows>
                        <OrbitControls minDistance={1} maxDistance={20} rotateSpeed={2.0} dampingFactor={0.1} />
                        <pointLight
                            position={[0, 1, 0]}
                            intensity={5}
                            color="black"
                            castShadow
                            shadow-mapSize-width={1024}
                            shadow-mapSize-height={1024}
                            shadow-camera-near={0.5}
                            shadow-camera-far={20}
                            shadow-bias={-0.001}
                        />
                        {/* Carrega o modelo da URL */}
                        <Model url={modelUrl} />
                        <Environment preset="studio" />
                    </Canvas>
                </Suspense>

                {/* Botão para alternar o tamanho da view 3D */}
                <View style={styles.expandButton}>
                    <TouchableOpacity onPress={toggleFullScreen}>
                        <FontAwesome5 name="expand" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Informações do modelo com FlatList */}
            <View className='p-3 gap-3' style={{backgroundColor: colors.dark["--color-cinza-100"], flex: 1 - flexValue, display: flexValue === 1 ? 'none' : 'flex' }}>
                <Text className='text-white text-[20px] text-center '>Informações</Text>

                <FlatList
                    data={infoData}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View className='flex-row gap-3 mb-5 p-0  w-[90%] '>
                            <Text className='text-white text-bold text-[16px]'>{item.title}:</Text>
                            <Text className='text-white/90 text-bold text-[14px]'>{item.description}</Text>
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({

    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandButton: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        backgroundColor: 'transparent',
        padding: 10,
    },
});
