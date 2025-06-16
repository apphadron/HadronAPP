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
import MathJaxSvg from 'react-native-mathjax-svg';
import Sheet from '@/components/geral/BottomSheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import constantesData from '@/assets/json/constantes.json';

const { width } = Dimensions.get('window');

type Constante = {
  nome: string;
  simbolo: string | null;
  incerteza: string;
  unidade: string;
  valor: string;
  categoria?: string;
};

const CATEGORIAS = [
  { id: 'todas', nome: 'Todas', cor: '#7C3AED', icon: 'apps' },
  { id: 'fundamental', nome: 'Fundamental', cor: '#3B82F6', icon: 'atom' },
  { id: 'quantica', nome: 'Quântica', cor: '#10B981', icon: 'radio-button-on' },
  { id: 'eletromagnetica', nome: 'Eletromagnética', cor: '#F59E0B', icon: 'flash' },
  { id: 'termodinamica', nome: 'Termodinâmica', cor: '#EF4444', icon: 'thermometer' },
];

const ConstanteCard = React.memo(({ 
  constante, 
  onPress, 
  index 
}: { 
  constante: Constante; 
  onPress: () => void;
  index: number;
}) => {
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      delay: index * 100,
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
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.constanteCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.symbolContainer}>
            <MathJaxSvg fontSize={24} color="#7C3AED" style={styles.symbolMath}>
              {constante.simbolo || "?"}
            </MathJaxSvg>
          </View>
          <View style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={20} color="#94A3B8" />
          </View>
        </View>
        
        <Text style={styles.constanteName} numberOfLines={2}>
          {constante.nome}
        </Text>
        
        <View style={styles.valueContainer}>
          <MathJaxSvg fontSize={16} color="#1E293B" style={styles.valueMath}>
            {constante.valor}
          </MathJaxSvg>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {constante.categoria || 'Geral'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const ConstanteDetalhes = ({ constante }: { constante: Constante }) => (
  <View style={styles.detalhesContainer}>
    <View style={styles.detalhesHeader}>
      <View style={styles.detalhesSymbolContainer}>
        <MathJaxSvg fontSize={32} color="#7C3AED">
          {constante.simbolo || "?"}
        </MathJaxSvg>
      </View>
      <Text style={styles.detalhesTitle}>{constante.nome}</Text>
    </View>
    
    <View style={styles.detalhesContent}>
      {[
        { label: 'Valor', value: constante.valor, icon: 'calculator' },
        { label: 'Incerteza', value: constante.incerteza, icon: 'stats-chart' },
        { label: 'Unidade', value: constante.unidade, icon: 'cube' },
        { label: 'Categoria', value: constante.categoria || 'Geral', icon: 'folder' }
      ].map(({ label, value, icon }) => (
        <View key={label} style={styles.detalhesItem}>
          <View style={styles.detalhesItemHeader}>
            <Ionicons name={icon as any} size={20} color="#7C3AED" />
            <Text style={styles.detalhesLabel}>{label}</Text>
          </View>
          <View style={styles.detalhesValueContainer}>
            <MathJaxSvg fontSize={18} color="#1E293B" style={styles.detalhesMath}>
              {value}
            </MathJaxSvg>
          </View>
        </View>
      ))}
    </View>
  </View>
);

const ConstantesScreen = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedConstante, setSelectedConstante] = useState<Constante | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  const constantes = useMemo(() =>
    constantesData.map((constante: any) => ({
      ...constante,
      simbolo: constante.simbolo ?? "",
      categoria: constante.categoria || 'Geral'
    })) as Constante[],
    []
  );

  const filteredConstantes = useMemo(() => {
    return constantes.filter(c => {
      const matchesSearch = c.nome.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'todas' || 
        c.categoria?.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, constantes]);

  const handleConstantePress = useCallback((constante: Constante) => {
    setSelectedConstante(constante);
    setIsSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setIsSheetVisible(false);
  }, []);

  const renderConstanteItem = useCallback(({ item, index }: { item: Constante; index: number }) => (
    <ConstanteCard 
      constante={item} 
      onPress={() => handleConstantePress(item)}
      index={index}
    />
  ), [handleConstantePress]);

  const renderCategoryItem = useCallback(({ item }: { item: typeof CATEGORIAS[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        { 
          backgroundColor: selectedCategory === item.id ? item.cor : '#F8FAFC',
          borderColor: selectedCategory === item.id ? item.cor : '#E2E8F0'
        }
      ]}
      onPress={() => setSelectedCategory(item.id)}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={item.icon as any} 
        size={18} 
        color={selectedCategory === item.id ? '#FFFFFF' : item.cor} 
      />
      <Text style={[
        styles.categoryItemText,
        { color: selectedCategory === item.id ? '#FFFFFF' : '#64748B' }
      ]}>
        {item.nome}
      </Text>
    </TouchableOpacity>
  ), [selectedCategory]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar backgroundColor="#7C3AED" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Constantes Físicas</Text>
        <Text style={styles.headerSubtitle}>
          {filteredConstantes.length} constante{filteredConstantes.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar constantes..."
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

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIAS}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Constants List */}
      <FlatList
        data={filteredConstantes}
        renderItem={renderConstanteItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.constantesList}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />

      {/* Details Sheet */}
      {isSheetVisible && selectedConstante && (
        <Sheet onClose={handleCloseSheet} height={500}>
          <ConstanteDetalhes constante={selectedConstante} />
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
    backgroundColor: '#7C3AED',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#C4B5FD',
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
  categoriesContainer: {
    paddingBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  categoryItemText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  constantesList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 10,
    marginBottom: 16,
  },
  constanteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 180,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbolContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolMath: {
    //textAlign: 'center',
  },
  favoriteButton: {
    padding: 4,
  },
  constanteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    lineHeight: 22,
  },
  valueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  valueMath: {
    //textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#7C3AED',
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
  detalhesSymbolContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  detalhesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 32,
  },
  detalhesContent: {
    flex: 1,
  },
  detalhesItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  detalhesValueContainer: {
    paddingLeft: 28,
  },
  detalhesMath: {
    //textAlign: 'left',
  },
});

export default ConstantesScreen;