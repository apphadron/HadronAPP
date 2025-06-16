import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '@/db/supabaseClient';
import { colors } from '@/styles/colors';
import GLTFModelView from './GLTFModelView';
import Sheet from '@/components/geral/BottomSheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Perseverance from '@/assets/astronomia/rovers/3dObjetos/Perseverance.glb';

// Types
interface ObjectData {
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
  objectUrl_path?: string;
}

interface InfoItem {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Constants
const DEFAULT_MODEL = Perseverance;

// Configuração dos campos de informação
const INFO_FIELD_CONFIG: Record<string, { icon: string; color: string; title: string }> = {
  nome: { icon: 'tag', color: '#3498db', title: 'Nome' },
  categoria: { icon: 'folder', color: '#2ecc71', title: 'Categoria' },
  tipo: { icon: 'rocket', color: '#e74c3c', title: 'Tipo' },
  fabricante: { icon: 'industry', color: '#9b59b6', title: 'Fabricante' },
  ano_lancamento: { icon: 'calendar', color: '#f39c12', title: 'Ano de Lançamento' },
  massa: { icon: 'weight', color: '#1abc9c', title: 'Massa (kg)' },
  altura: { icon: 'ruler-vertical', color: '#34495e', title: 'Altura' },
  velocidade_orbital: { icon: 'tachometer-alt', color: '#d35400', title: 'Velocidade (km/s)' },
  status: { icon: 'info-circle', color: '#27ae60', title: 'Status' },
  operador: { icon: 'user-tie', color: '#2980b9', title: 'Operador' },
  missoes_realizadas: { icon: 'flag-checkered', color: '#8e44ad', title: 'Missões' },
  proposito: { icon: 'bullseye', color: '#c0392b', title: 'Propósito' },
  localizacao: { icon: 'map-marker-alt', color: '#16a085', title: 'Localização' },
};

// Hooks customizados
const useObjectData = (id: string | string[]) => {
  const [state, setState] = useState<{
    objectData: ObjectData | null;
    infoData: InfoItem[];
    loadingState: LoadingState;
    modelUrl: string | null;
  }>({
    objectData: null,
    infoData: [],
    loadingState: { isLoading: true, error: null },
    modelUrl: null,
  });

  const getPublicUrl = useCallback((path: string): string | null => {
    if (!path) return null;
    
    try {
      const { data } = supabase.storage
        .from('objetos3d')
        .getPublicUrl(path);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error generating public URL:', error);
      return null;
    }
  }, []);

  const processObjectInfo = useCallback((data: ObjectData): InfoItem[] => {
    const infoItems: InfoItem[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && key !== 'id' && key !== 'objectUrl_path') {
        const config = INFO_FIELD_CONFIG[key];
        if (config) {
          infoItems.push({
            icon: config.icon,
            title: config.title,
            description: String(value),
            color: config.color,
          });
        }
      }
    });
    
    return infoItems;
  }, []);

  const fetchObjectData = useCallback(async () => {
    if (!id) {
      setState(prev => ({
        ...prev,
        loadingState: { isLoading: false, error: 'ID do objeto não fornecido' }
      }));
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        loadingState: { isLoading: true, error: null }
      }));

      const { data, error } = await supabase
        .from('objetos_3d')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Erro ao buscar dados: ${error.message}`);
      }

      if (!data) {
        throw new Error('Objeto não encontrado');
      }

      // Processa URL do modelo
      let modelUrl: string | null = null;
      if (data.objectUrl_path) {
        modelUrl = getPublicUrl(data.objectUrl_path);
        if (!modelUrl) {
          console.warn('Failed to generate public URL, using default model');
        }
      }

      // Processa informações
      const infoData = processObjectInfo(data);

      setState({
        objectData: data,
        infoData,
        modelUrl,
        loadingState: { isLoading: false, error: null }
      });

    } catch (error) {
      console.error('Error fetching object data:', error);
      setState(prev => ({
        ...prev,
        loadingState: { 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }
      }));
    }
  }, [id, getPublicUrl, processObjectInfo]);

  useEffect(() => {
    fetchObjectData();
  }, [fetchObjectData]);

  return { ...state, refetch: fetchObjectData };
};

// Componentes
const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#e88e14" />
    <Text style={styles.loadingText}>Carregando visualizador 3D...</Text>
  </View>
);

const ErrorScreen: React.FC<{ error: string; onRetry: () => void; onGoBack: () => void }> = ({ 
  error, 
  onRetry, 
  onGoBack 
}) => (
  <SafeAreaView style={styles.errorContainer}>
    <FontAwesome5 name="exclamation-triangle" size={50} color="#e74c3c" />
    <Text style={styles.errorTitle}>Erro ao carregar objeto</Text>
    <Text style={styles.errorDescription}>{error}</Text>
    <View style={styles.errorButtonContainer}>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.buttonText}>Tentar Novamente</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const InfoSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  infoData: InfoItem[];
  objectName?: string;
}> = ({ isOpen, onClose, infoData, objectName }) => {
  const renderInfoItem = useCallback(({ item }: { item: InfoItem }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{item.title}:</Text>
      <Text style={styles.infoValue}>{item.description}</Text>
    </View>
  ), []);

  if (!isOpen) return null;

  return (
    <Sheet
      height={400}
      onClose={onClose}
      containerStyle={{ backgroundColor: colors.dark["--color-cinza-80"] }}
    >
      <View style={styles.infoHeader}>
        <Text style={styles.infoHeaderTitle}>
          {objectName ? `Informações - ${objectName}` : 'Informações do Objeto'}
        </Text>
        <View style={styles.infoHeaderLine} />
      </View>

      <FlatList
        data={infoData}
        showsVerticalScrollIndicator={false}
        renderItem={renderInfoItem}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        contentContainerStyle={styles.infoList}
      />
    </Sheet>
  );
};

// Componente principal
const ObjectScene: React.FC = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const { objectData, infoData, loadingState, modelUrl, refetch } = useObjectData(id);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenSheet = useCallback(() => {
    setIsSheetOpen(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  // Memoized model URL
  const finalModelUrl = useMemo(() => {
    return modelUrl || DEFAULT_MODEL;
  }, [modelUrl]);

  if (loadingState.isLoading) {
    return <LoadingScreen />;
  }

  if (loadingState.error) {
    return (
      <ErrorScreen 
        error={loadingState.error} 
        onRetry={handleRetry}
        onGoBack={handleGoBack}
      />
    );
  }

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={styles.gestureContainer}>
        {/* Visualizador 3D */}
        <View style={styles.modelContainer}>
          <GLTFModelView
            modelUrl={finalModelUrl}
            backgroundColor={colors.dark["--color-cinza-80"]}
            minZoom={3}
            maxZoom={20}
            rotationSpeed={5}
            autoRotate={false}
            enableAnimation={true}
          />
        </View>

        {/* Botão de informações */}
        <View style={styles.infoButtonContainer}>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={handleOpenSheet}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="info-circle" size={16} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.infoButtonText}>Informações</Text>
          </TouchableOpacity>
        </View>

        {/* Sheet de informações */}
        <InfoSheet
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
          infoData={infoData}
          objectName={objectData?.nome}
        />
      </GestureHandlerRootView>
    </View>
  );
};

// Styles otimizados
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
  },
  gestureContainer: {
    flex: 1,
  },
  modelContainer: {
    flex: 1,
  },
  infoButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark["--color-cinza-80"],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoHeader: {
    marginBottom: 16,
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
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark["--color-cinza-70"],
    marginBottom: 8,
  },
  infoLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  infoValue: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    flex: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
  },
  loadingText: {
    marginTop: 12,
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
    textAlign: 'center',
  },
  errorDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  errorButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#e88e14',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ObjectScene;