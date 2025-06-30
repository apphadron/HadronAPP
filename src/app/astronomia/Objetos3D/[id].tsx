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
import GLBViewer from './GLTFModelView';
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

// Constants
const DEFAULT_MODEL = Perseverance;
const MAX_RETRY_ATTEMPTS = 2;

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

// Hook simplificado para dados do objeto
const useObjectData = (id: string | string[]) => {
  const [objectData, setObjectData] = useState<ObjectData | null>(null);
  const [infoData, setInfoData] = useState<InfoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const getPublicUrl = useCallback((path: string): string | null => {
    if (!path || typeof path !== 'string') {
      console.warn('Invalid path provided:', path);
      return null;
    }
    
    try {
      // Normaliza o path removendo barras duplas
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

  const fetchObjectData = useCallback(async () => {
    if (!id) {
      setError('ID do objeto não fornecido');
      setIsLoading(false);
      return;
    }

    console.log(`Fetching object data for ID: ${id}`);
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('objetos_3d')
        .select('*')
        .eq('id', id)
        .single();

      if (supabaseError) {
        throw new Error(`Erro na consulta: ${supabaseError.message}`);
      }

      if (!data) {
        throw new Error('Objeto não encontrado');
      }

      console.log('Object data fetched:', data);

      // Processa URL do modelo
      let publicUrl: string | null = null;
      if (data.objectUrl_path) {
        publicUrl = getPublicUrl(data.objectUrl_path);
        if (!publicUrl) {
          console.warn('Failed to generate public URL, will use default model');
        }
      }

      // Processa informações
      const processedInfo = processObjectInfo(data);

      setObjectData(data);
      setInfoData(processedInfo);
      setModelUrl(publicUrl);
      setIsLoading(false);

    } catch (err: any) {
      console.error('Error fetching object data:', err);
      setError(err.message || 'Erro desconhecido');
      setIsLoading(false);
    }
  }, [id, getPublicUrl, processObjectInfo]);

  const retryFetch = useCallback(() => {
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      setRetryCount(prev => prev + 1);
      fetchObjectData();
    } else {
      Alert.alert(
        'Erro',
        'Número máximo de tentativas excedido.',
        [{ text: 'OK' }]
      );
    }
  }, [fetchObjectData, retryCount]);

  useEffect(() => {
    fetchObjectData();
  }, [fetchObjectData]);

  return { 
    objectData, 
    infoData, 
    modelUrl, 
    isLoading, 
    error, 
    retryCount, 
    refetch: fetchObjectData, 
    retryFetch 
  };
};

// Componente de loading
const LoadingScreen: React.FC<{ retryCount?: number }> = ({ retryCount = 0 }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#e88e14" />
    <Text style={styles.loadingText}>
      Carregando dados do objeto...
      {retryCount > 0 && ` (Tentativa ${retryCount + 1})`}
    </Text>
  </View>
);

// Componente de erro
const ErrorScreen: React.FC<{ 
  error: string; 
  onRetry: () => void; 
  onGoBack: () => void;
  canRetry: boolean;
}> = ({ error, onRetry, onGoBack, canRetry }) => (
  <SafeAreaView style={styles.errorContainer}>
    <FontAwesome5 name="exclamation-triangle" size={50} color="#e74c3c" />
    <Text style={styles.errorTitle}>Erro ao carregar dados</Text>
    <Text style={styles.errorDescription}>{error}</Text>
    
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

// Componente de informações
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
  
  const { 
    objectData, 
    infoData, 
    modelUrl, 
    isLoading, 
    error, 
    retryCount, 
    retryFetch 
  } = useObjectData(id);

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
        'Nenhuma informação adicional disponível.',
        [{ text: 'OK' }]
      );
    }
  }, [infoData.length]);

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  // URL final do modelo
  const finalModelUrl = useMemo(() => {
    return modelUrl || DEFAULT_MODEL;
  }, [modelUrl]);

  if (isLoading) {
    return <LoadingScreen retryCount={retryCount} />;
  }

  if (error) {
    const canRetry = retryCount < MAX_RETRY_ATTEMPTS;
    return (
      <ErrorScreen 
        error={error} 
        onRetry={handleRetry}
        onGoBack={handleGoBack}
        canRetry={canRetry}
      />
    );
  }

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={styles.gestureContainer}>
        {/* Visualizador 3D */}
        <View style={styles.modelContainer}>
          <GLBViewer
            modelUrl={finalModelUrl}
  
            backgroundColor={colors.dark["--color-cinza-80"]}
          />
        </View>

        {/* Botões de ação */}
        <View style={styles.actionButtonsContainer}>
          {/* Botão de informações */}
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

          {/* Indicador de modelo */}
          {!modelUrl && (
            <View style={styles.modelIndicator}>
              <FontAwesome5 name="cube" size={12} color="#e88e14" />
              <Text style={styles.modelIndicatorText}>Modelo padrão</Text>
            </View>
          )}
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

