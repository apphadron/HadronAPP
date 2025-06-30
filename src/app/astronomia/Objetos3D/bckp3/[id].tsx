/*import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  retryCount: number;
}

// Constants
const DEFAULT_MODEL = Perseverance;
const MAX_RETRY_ATTEMPTS = 3;

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

// Hook customizado melhorado para dados do objeto
const useObjectData = (id: string | string[]) => {
  const [state, setState] = useState<{
    objectData: ObjectData | null;
    infoData: InfoItem[];
    loadingState: LoadingState;
    modelUrl: string | null;
  }>({
    objectData: null,
    infoData: [],
    loadingState: { isLoading: true, error: null, retryCount: 0 },
    modelUrl: null,
  });

  const getPublicUrl = useCallback((path: string): string | null => {
    if (!path || typeof path !== 'string') {
      console.warn('Invalid path provided to getPublicUrl:', path);
      return null;
    }
    
    try {
      // Remove barras duplas e normalize o path
      const normalizedPath = path.replace(/\/+/g, '/').replace(/^\//, '');
      
      const { data } = supabase.storage
        .from('objetos3d')
        .getPublicUrl(normalizedPath);
      
      if (!data?.publicUrl) {
        console.warn('No public URL generated for path:', normalizedPath);
        return null;
      }

      console.log('Generated public URL:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Error generating public URL:', error);
      return null;
    }
  }, []);

  const processObjectInfo = useCallback((data: ObjectData): InfoItem[] => {
    const infoItems: InfoItem[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && 
          key !== 'id' && key !== 'objectUrl_path') {
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

  const validateObjectData = (data: any): data is ObjectData => {
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // Verifica se tem pelo menos os campos obrigatórios
    const requiredFields = ['id', 'nome'];
    return requiredFields.every(field => data[field] && typeof data[field] === 'string');
  };

  const fetchObjectData = useCallback(async (retryAttempt = 0) => {
    if (!id) {
      setState(prev => ({
        ...prev,
        loadingState: { 
          isLoading: false, 
          error: 'ID do objeto não fornecido',
          retryCount: retryAttempt
        }
      }));
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        loadingState: { 
          isLoading: true, 
          error: null,
          retryCount: retryAttempt
        }
      }));

      console.log(`Fetching object data for ID: ${id} (attempt ${retryAttempt + 1})`);

      // Timeout para a query
      const queryPromise = supabase
        .from('objetos_3d')
        .select('*')
        .eq('id', id)
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 10000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        throw new Error(`Erro ao buscar dados: ${error.message}`);
      }

      if (!data) {
        throw new Error('Objeto não encontrado no banco de dados');
      }

      // Valida os dados recebidos
      if (!validateObjectData(data)) {
        throw new Error('Dados do objeto inválidos ou incompletos');
      }

      console.log('Object data fetched successfully:', data);

      // Processa URL do modelo
      let modelUrl: string | null = null;
      if (data.objectUrl_path) {
        modelUrl = getPublicUrl(data.objectUrl_path);
        if (!modelUrl) {
          console.warn('Failed to generate public URL, will use default model');
        }
      } else {
        console.log('No objectUrl_path found, will use default model');
      }

      // Processa informações
      const infoData = processObjectInfo(data);

      setState({
        objectData: data,
        infoData,
        modelUrl,
        loadingState: { isLoading: false, error: null, retryCount: retryAttempt }
      });

    } catch (error) {
      console.error(`Error fetching object data (attempt ${retryAttempt + 1}):`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setState(prev => ({
        ...prev,
        loadingState: { 
          isLoading: false, 
          error: errorMessage,
          retryCount: retryAttempt
        }
      }));
    }
  }, [id, getPublicUrl, processObjectInfo]);

  const retryFetch = useCallback(() => {
    const currentRetryCount = state.loadingState.retryCount;
    if (currentRetryCount < MAX_RETRY_ATTEMPTS) {
      fetchObjectData(currentRetryCount + 1);
    } else {
      Alert.alert(
        'Erro',
        'Número máximo de tentativas excedido. Verifique sua conexão e tente novamente.',
        [{ text: 'OK' }]
      );
    }
  }, [fetchObjectData, state.loadingState.retryCount]);

  useEffect(() => {
    fetchObjectData(0);
  }, [fetchObjectData]);

  return { ...state, refetch: fetchObjectData, retryFetch };
};

// Componentes
const LoadingScreen: React.FC<{ retryCount?: number }> = ({ retryCount = 0 }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#e88e14" />
    <Text style={styles.loadingText}>
      Carregando visualizador 3D...
      {retryCount > 0 && ` (Tentativa ${retryCount + 1})`}
    </Text>
  </View>
);

const ErrorScreen: React.FC<{ 
  error: string; 
  onRetry: () => void; 
  onGoBack: () => void;
  retryCount: number;
  canRetry: boolean;
}> = ({ error, onRetry, onGoBack, retryCount, canRetry }) => (
  <SafeAreaView style={styles.errorContainer}>
    <FontAwesome5 name="exclamation-triangle" size={50} color="#e74c3c" />
    <Text style={styles.errorTitle}>Erro ao carregar objeto</Text>
    <Text style={styles.errorDescription}>{error}</Text>
    
    {retryCount > 0 && (
      <Text style={styles.retryInfo}>
        Tentativas realizadas: {retryCount + 1}/{MAX_RETRY_ATTEMPTS + 1}
      </Text>
    )}
    
    <View style={styles.errorButtonContainer}>
      {canRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <FontAwesome5 name="redo" size={16} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
        <FontAwesome5 name="arrow-left" size={16} color="#fff" style={styles.buttonIcon} />
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
      <View style={styles.infoIconContainer}>
        <FontAwesome5 name={item.icon} size={16} color={item.color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{item.title}:</Text>
        <Text style={styles.infoValue}>{item.description}</Text>
      </View>
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

      {infoData.length > 0 ? (
        <FlatList
          data={infoData}
          showsVerticalScrollIndicator={false}
          renderItem={renderInfoItem}
          keyExtractor={(item, index) => `${item.title}-${index}`}
          contentContainerStyle={styles.infoList}
        />
      ) : (
        <View style={styles.noInfoContainer}>
          <FontAwesome5 name="info-circle" size={40} color="#666" />
          <Text style={styles.noInfoText}>Nenhuma informação adicional disponível</Text>
        </View>
      )}
    </Sheet>
  );
};

// Componente principal
const ObjectScene: React.FC = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const { objectData, infoData, loadingState, modelUrl, retryFetch } = useObjectData(id);

  const handleRetry = useCallback(() => {
    retryFetch();
  }, [retryFetch]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenSheet = useCallback(() => {
    if (infoData.length > 0) {
      setIsSheetOpen(true);
    } else {
      Alert.alert(
        'Informações',
        'Nenhuma informação adicional disponível para este objeto.',
        [{ text: 'OK' }]
      );
    }
  }, [infoData.length]);

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  // Memoized model URL
  const finalModelUrl = useMemo(() => {
    return modelUrl || DEFAULT_MODEL;
  }, [modelUrl]);

  // Memoized model view props
  const modelViewProps = useMemo(() => ({
    modelUrl: finalModelUrl,
    backgroundColor: colors.dark["--color-cinza-80"],
    minZoom: 3,
    maxZoom: 20,
    rotationSpeed: 5,
    autoRotate: false,
    enableAnimation: true,
  }), [finalModelUrl]);

  if (loadingState.isLoading) {
    return <LoadingScreen retryCount={loadingState.retryCount} />;
  }

  if (loadingState.error) {
    const canRetry = loadingState.retryCount < MAX_RETRY_ATTEMPTS;
    return (
      <ErrorScreen 
        error={loadingState.error} 
        onRetry={handleRetry}
        onGoBack={handleGoBack}
        retryCount={loadingState.retryCount}
        canRetry={canRetry}
      />
    );
  }

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={styles.gestureContainer}>
        <View style={styles.modelContainer}>
          <GLTFModelView {...modelViewProps} />
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              infoData.length === 0 && styles.actionButtonDisabled
            ]}
            onPress={handleOpenSheet}
            activeOpacity={0.8}
            disabled={infoData.length === 0}
          >
            <FontAwesome5 
              name="info-circle" 
              size={16} 
              color={infoData.length > 0 ? "#fff" : "#666"} 
              style={styles.buttonIcon} 
            />
            <Text style={[
              styles.actionButtonText,
              infoData.length === 0 && styles.actionButtonTextDisabled
            ]}>
              Informações {infoData.length > 0 && `(${infoData.length})`}
            </Text>
          </TouchableOpacity>

          {!modelUrl && (
            <View style={styles.modelIndicator}>
              <FontAwesome5 name="cube" size={12} color="#e88e14" />
              <Text style={styles.modelIndicatorText}>Modelo padrão</Text>
            </View>
          )}
        </View>

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
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  actionButton: {
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
    marginBottom: 8,
  },
  actionButtonDisabled: {
    backgroundColor: colors.dark["--color-cinza-70"],
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextDisabled: {
    color: '#666',
  },
  modelIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 142, 20, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  modelIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  buttonIcon: {
    marginRight: 8,
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
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark["--color-cinza-70"],
    marginBottom: 8,
  },
  infoIconContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
  },
  noInfoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noInfoText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
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
    textAlign: 'center',
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
    marginBottom: 10,
  },
  retryInfo: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e88e14',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
*/