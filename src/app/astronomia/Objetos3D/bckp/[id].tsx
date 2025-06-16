import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '@/db/supabaseClient';
import { colors } from '@/styles/colors';
import GLTFModelView from './GLTFModelView';
import Sheet from '@/components/geral/BottomSheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Perseverance from '@/assets/astronomia/rovers/3dObjetos/Perseverance.glb';

// Constants
const DEFAULT_MODEL = Perseverance;

// Types
type ObjectData = {
  id: string;
  nome: string;
  categoria: string;
  tipo: string;
  fabricante: string;
  ano_lancamento?: number;
  massa?: number;
  altura?: string;
  velocidade_orbital?: number;
  status?: string;
  operador?: string;
  missoes_realizadas?: number;
  proposito?: string;
  localizacao?: string;
  object_url?: string;
};

type InfoItem = {
  icon: string;
  title: string;
  description: string;
  color?: string;
};

// Component to display information item
const InfoCard: React.FC<{ info: InfoItem }> = React.memo(({ info }) => {
  return (
    <View style={styles.infoCard}>
      <View style={[styles.iconContainer, { backgroundColor: info.color || '#3498db' }]}>
        <FontAwesome5 name={info.icon} size={16} color="#fff" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{info.title}</Text>
        <Text style={styles.infoDescription}>{info.description}</Text>
      </View>
    </View>
  );
});

// Loader component
const LoaderView: React.FC = React.memo(() => (
  <View style={styles.loaderContainer}>
    <ActivityIndicator size="large" color="#e88e14" />
    <Text style={styles.loaderText}>Carregando visualizador 3D...</Text>
  </View>
));

// Main component
export default function ObjectScene() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [objectData, setObjectData] = useState<ObjectData | null>(null);
  const [infoData, setInfoData] = useState<InfoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showError, setShowError] = useState(false);
  const [isOpenSheet, setIsOpenSheet] = useState(false);

  // Loading object data
  useEffect(() => {
    async function fetchObjectData() {
      if (!id) {
        setShowError(true);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('objetos_3d')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Erro ao buscar dados:', error);
          setShowError(true);
          setIsLoading(false);
          return;
        }

        setObjectData(data);

        // Convert data to display format with icons
        const processedInfo: InfoItem[] = [];

        if (data.nome) processedInfo.push({
          icon: 'tag', title: 'Nome', description: data.nome, color: '#3498db'
        });

        if (data.categoria) processedInfo.push({
          icon: 'folder', title: 'Categoria', description: data.categoria, color: '#2ecc71'
        });

        if (data.tipo) processedInfo.push({
          icon: 'rocket', title: 'Tipo', description: data.tipo, color: '#e74c3c'
        });

        if (data.fabricante) processedInfo.push({
          icon: 'industry', title: 'Fabricante', description: data.fabricante, color: '#9b59b6'
        });

        if (data.ano_lancamento) processedInfo.push({
          icon: 'calendar', title: 'Ano de Lançamento', description: data.ano_lancamento.toString(), color: '#f39c12'
        });

        if (data.massa) processedInfo.push({
          icon: 'weight', title: 'Massa (kg)', description: data.massa.toString(), color: '#1abc9c'
        });

        if (data.altura) processedInfo.push({
          icon: 'ruler-vertical', title: 'Altura', description: data.altura, color: '#34495e'
        });

        if (data.velocidade_orbital) processedInfo.push({
          icon: 'tachometer-alt', title: 'Velocidade (km/s)', description: data.velocidade_orbital.toString(), color: '#d35400'
        });

        if (data.status) processedInfo.push({
          icon: 'info-circle', title: 'Status', description: data.status, color: '#27ae60'
        });

        if (data.operador) processedInfo.push({
          icon: 'user-tie', title: 'Operador', description: data.operador, color: '#2980b9'
        });

        if (data.missoes_realizadas) processedInfo.push({
          icon: 'flag-checkered', title: 'Missões', description: data.missoes_realizadas.toString(), color: '#8e44ad'
        });

        if (data.proposito) processedInfo.push({
          icon: 'bullseye', title: 'Propósito', description: data.proposito, color: '#c0392b'
        });

        if (data.localizacao) processedInfo.push({
          icon: 'map-marker-alt', title: 'Localização', description: data.localizacao, color: '#16a085'
        });

        setInfoData(processedInfo);
        setIsLoading(false);

      } catch (err) {
        console.error('Erro ao processar dados:', err);
        setShowError(true);
        setIsLoading(false);
      }
    }

    fetchObjectData();
  }, [id]);

  // Render error screen
  if (showError) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <FontAwesome5 name="exclamation-triangle" size={50} color="#e74c3c" />
        <Text style={styles.errorTitle}>Não foi possível carregar o objeto</Text>
        <Text style={styles.errorDescription}>Verifique sua conexão e tente novamente</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Render loader
  if (isLoading) {
    return <LoaderView />;
  }

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* 3D Model Container */}
        <View style={styles.modelContainer}>
          {objectData && (
            <GLTFModelView
              modelUrl={objectData.object_url ? objectData.object_url : DEFAULT_MODEL}
              backgroundColor={colors.dark["--color-cinza-80"]}
              minZoom={3}
              maxZoom={20}
              rotationSpeed={5}
            />
          )}
        </View>

        {/* Button to open the Sheet */}
        <View style={styles.infoContainer}>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setIsOpenSheet(true)}
          >
            <Text style={styles.infoButtonText}>Informações do Objeto</Text>
          </TouchableOpacity>
        </View>

        {/* Sheet to display information */}
        {isOpenSheet && (
          <Sheet
            height={400}
            onClose={() => setIsOpenSheet(false)}
            containerStyle={{ backgroundColor: colors.dark["--color-cinza-80"] }}
          >
            <View style={styles.infoHeader}>
              <Text style={styles.infoHeaderTitle}>Informações do Objeto</Text>
              <View style={styles.infoHeaderLine} />
            </View>

            {/*<FlatList
              data={infoData}
              renderItem={({ item }) => <InfoCard info={item} />}
              keyExtractor={(item) => item.title}
              showsVerticalScrollIndicator={false}
              initialNumToRender={6}
              contentContainerStyle={styles.infoList}
            />*/}

            <FlatList
              data={infoData}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View className='flex-row gap-3 mb-5 w-full items-center' style={{borderBottomWidth: 1, borderColor: colors.dark["--color-cinza-70"]}}>
                  <Text className='text-white font-semibold text-lg '>{item.title}:</Text>
                  <Text className='text-white/90 text-lg'>{item.description}</Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </Sheet>
        )}
      </GestureHandlerRootView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
  },
  modelContainer: {
    flex: 1,
    // The Model component in GLTFModelView already handles centering via Three.js
  },
  infoContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoHeader: {
    marginBottom: 15,
  },
  infoHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoHeaderLine: {
    height: 3,
    width: 50,
    backgroundColor: '#e88e14',
    borderRadius: 2,
  },
  infoList: {
    paddingBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
  },
  loaderText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
    padding: 20,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  errorDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#e88e14',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoButton: {
    width: 200,
    backgroundColor: colors.dark["--color-cinza-80"],
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    zIndex: 1
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});