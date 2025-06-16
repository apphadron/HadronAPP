import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import unidadesData from '@/assets/json/unidades.json';
import Sheet from '@/components/geral/BottomSheet';

const { width } = Dimensions.get('window');

type Unidade = {
  grandeza: string;
  tipo: string;
  simbolo: string;
  unidade: string;
  definicao?: string;
  categoria?: string;
};

const TIPOS = [
  { id: 'todas', nome: 'Todas', cor: '#6366F1', icon: 'apps' },
  { id: 'fundamental', nome: 'Fundamentais', cor: '#059669', icon: 'cube' },
  { id: 'derivada', nome: 'Derivadas', cor: '#DC2626', icon: 'git-branch' },
];

const UnidadeCard = React.memo(({ 
  unidade, 
  index,
  onPress 
}: { 
  unidade: Unidade; 
  index: number;
  onPress?: () => void;
}) => {
  const animatedValue = new Animated.Value(0);
  
  const tipoColor = unidade.tipo === 'Fundamental' ? '#059669' : '#DC2626';
  const tipoIcon = unidade.tipo === 'Fundamental' ? 'cube' : 'git-branch';

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 400,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.unidadeCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.tipoIndicator, { backgroundColor: tipoColor }]}>
            <Ionicons name={tipoIcon as any} size={16} color="#FFFFFF" />
          </View>
          <View style={styles.simboloContainer}>
            <Text style={styles.simboloText}>{unidade.simbolo}</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.grandezaText}>{unidade.grandeza}</Text>
          <Text style={styles.unidadeText}>{unidade.unidade}</Text>
          
          <View style={styles.cardFooter}>
            <View style={[styles.tipoBadge, { backgroundColor: `${tipoColor}15` }]}>
              <Text style={[styles.tipoText, { color: tipoColor }]}>
                {unidade.tipo}
              </Text>
            </View>
            
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const UnidadeDetalhes = ({ unidade }: { unidade: Unidade }) => {
  const tipoColor = unidade.tipo === 'Fundamental' ? '#059669' : '#DC2626';
  const tipoIcon = unidade.tipo === 'Fundamental' ? 'cube' : 'git-branch';

  return (
    <View style={styles.detalhesContainer}>
      <View style={styles.detalhesHeader}>
        <View style={[styles.detalhesSimboloContainer, { borderColor: tipoColor }]}>
          <Text style={[styles.detalhesSimboloText, { color: tipoColor }]}>
            {unidade.simbolo}
          </Text>
        </View>
        <Text style={styles.detalhesTitle}>{unidade.grandeza}</Text>
        <Text style={styles.detalhesSubtitle}>{unidade.unidade}</Text>
      </View>
      
      <View style={styles.detalhesContent}>
        <View style={[styles.detalhesItem, { borderLeftColor: tipoColor }]}>
          <View style={styles.detalhesItemHeader}>
            <Ionicons name={tipoIcon as any} size={20} color={tipoColor} />
            <Text style={styles.detalhesLabel}>Tipo</Text>
          </View>
          <Text style={styles.detalhesValue}>{unidade.tipo}</Text>
        </View>

        <View style={[styles.detalhesItem, { borderLeftColor: '#6366F1' }]}>
          <View style={styles.detalhesItemHeader}>
            <Ionicons name="text" size={20} color="#6366F1" />
            <Text style={styles.detalhesLabel}>Símbolo</Text>
          </View>
          <Text style={styles.detalhesValue}>{unidade.simbolo}</Text>
        </View>

        <View style={[styles.detalhesItem, { borderLeftColor: '#F59E0B' }]}>
          <View style={styles.detalhesItemHeader}>
            <Ionicons name="library" size={20} color="#F59E0B" />
            <Text style={styles.detalhesLabel}>Unidade</Text>
          </View>
          <Text style={styles.detalhesValue}>{unidade.unidade}</Text>
        </View>

        {unidade.definicao && (
          <View style={[styles.detalhesItem, { borderLeftColor: '#8B5CF6' }]}>
            <View style={styles.detalhesItemHeader}>
              <Ionicons name="information-circle" size={20} color="#8B5CF6" />
              <Text style={styles.detalhesLabel}>Definição</Text>
            </View>
            <Text style={styles.detalhesValue}>{unidade.definicao}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const UnidadesScreen = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTipo, setSelectedTipo] = useState<string>('todas');
  const [selectedUnidade, setSelectedUnidade] = useState<Unidade | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState<boolean>(false);

  const unidades = useMemo(() => unidadesData.unidades as Unidade[], []);

  const filteredUnidades = useMemo(() => {
    return unidades.filter(u => {
      const matchesSearch = u.grandeza.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           u.unidade.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           u.simbolo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTipo = selectedTipo === 'todas' || 
        u.tipo.toLowerCase() === selectedTipo.toLowerCase();
      return matchesSearch && matchesTipo;
    });
  }, [searchQuery, selectedTipo, unidades]);

  const handleUnidadePress = useCallback((unidade: Unidade) => {
    setSelectedUnidade(unidade);
    setIsSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setIsSheetVisible(false);
  }, []);

  const renderUnidadeItem = useCallback(({ item, index }: { item: Unidade; index: number }) => (
    <UnidadeCard 
      unidade={item} 
      index={index}
      onPress={() => handleUnidadePress(item)}
    />
  ), [handleUnidadePress]);

  const renderTipoItem = useCallback(({ item }: { item: typeof TIPOS[0] }) => (
    <TouchableOpacity
      style={[
        styles.tipoItem,
        { 
          backgroundColor: selectedTipo === item.id ? item.cor : '#F8FAFC',
          borderColor: selectedTipo === item.id ? item.cor : '#E2E8F0'
        }
      ]}
      onPress={() => setSelectedTipo(item.id)}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={item.icon as any} 
        size={18} 
        color={selectedTipo === item.id ? '#FFFFFF' : item.cor} 
      />
      <Text style={[
        styles.tipoItemText,
        { color: selectedTipo === item.id ? '#FFFFFF' : '#64748B' }
      ]}>
        {item.nome}
      </Text>
    </TouchableOpacity>
  ), [selectedTipo]);

  const fundamentaisCount = unidades.filter(u => u.tipo === 'Fundamental').length;
  const derivadasCount = unidades.filter(u => u.tipo === 'Derivada').length;

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar backgroundColor="#6366F1" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Unidades de Medida</Text>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{fundamentaisCount}</Text>
            <Text style={styles.statLabel}>Fundamentais</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{derivadasCount}</Text>
            <Text style={styles.statLabel}>Derivadas</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar unidades..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tipos Filter */}
      <View style={styles.tiposContainer}>
        <FlatList
          data={TIPOS}
          renderItem={renderTipoItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tiposList}
        />
      </View>

      {/* Results Counter */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredUnidades.length} unidade{filteredUnidades.length !== 1 ? 's' : ''} encontrada{filteredUnidades.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Unidades List */}
      <FlatList
        data={filteredUnidades}
        renderItem={renderUnidadeItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.unidadesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Details Sheet */}
      {isSheetVisible && selectedUnidade && (
        <Sheet onClose={handleCloseSheet} height={400}>
          <UnidadeDetalhes unidade={selectedUnidade} />
        </Sheet>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#6366F1',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#C7D2FE',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#C7D2FE',
    marginHorizontal: 24,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  tiposContainer: {
    paddingBottom: 16,
  },
  tiposList: {
    paddingHorizontal: 20,
  },
  tipoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  tipoItemText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  unidadesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardContainer: {
    marginBottom: 12,
  },
  unidadeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipoIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simboloContainer: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  simboloText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  cardContent: {
    flex: 1,
  },
  grandezaText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  unidadeText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tipoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Detalhes Sheet
  detalhesContainer: {
    flex: 1,
    padding: 20,
  },
  detalhesHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  detalhesSimboloContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
  },
  detalhesSimboloText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  detalhesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  detalhesSubtitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
  },
  detalhesContent: {
    flex: 1,
  },
  detalhesItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  detalhesItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detalhesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 8,
  },
  detalhesValue: {
    fontSize: 16,
    color: '#1E293B',
    paddingLeft: 28,
    lineHeight: 22,
  },
});

export default UnidadesScreen;