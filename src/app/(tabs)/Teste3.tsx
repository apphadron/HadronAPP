import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Linking
} from 'react-native';
import axios from 'axios';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/colors';
import Sheet from '@/components/geral/BottomSheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import RocketAnim from '@/assets/anim/rocket.json';


// Interface para os dados do exoplaneta
export interface Exoplanet {
  pl_name: string;
  hostname: string;
  pl_orbper: number | null;
  pl_radj: number | null;
  pl_bmassj: number | null;
  pl_orbeccen: number | null;
  pl_eqt: number | null;
  disc_year: number | null;
  discoverymethod: string;
  disc_facility: string;
  sy_dist: number | null;
  pl_orbsmax: number | null;
  rowupdate: string;
  sy_snum: number | null;
  sy_pnum: number | null;
  pl_refname: string | null;
  pl_rade: number | null;
  pl_masse: number | null;
  pl_orbincl: number | null;
  pl_orblper: number | null;
  pl_rvamp: number | null;
  st_teff: number | null;
  st_rad: number | null;
  st_mass: number | null;
  st_met: number | null; // Metalicidade da estrela
  st_logg: number | null; // Gravidade superficial da estrela
  st_age: number | null; // Idade da estrela
  pl_dens: number | null; // Densidade do planeta
  pl_insol: number | null; // Insolação do planeta
  pl_trandep: number | null; // Profundidade do trânsito
  pl_ratdor: number | null; // Razão de distância orbital
  pl_ratror: number | null; // Razão de raio orbital
  pl_tranmid: number | null; // Tempo de trânsito médio
  pl_orbpererr1: number | null; // Erro superior no período orbital
  pl_orbpererr2: number | null; // Erro inferior no período orbital
  pl_radeerr1: number | null; // Erro superior no raio do planeta
  pl_radeerr2: number | null; // Erro inferior no raio do planeta
  pl_masseerr1: number | null; // Erro superior na massa do planeta
  pl_masseerr2: number | null; // Erro inferior na massa do planeta
}

// Interface para os filtros
interface Filters {
  discoverymethod?: string;
  disc_facility?: string;
  pl_orbperMin?: string;
  pl_orbperMax?: string;
  pl_radjMin?: string;
  pl_radjMax?: string;
  pl_massjMin?: string;
  pl_massjMax?: string;
  pl_eqtMin?: string;
  pl_eqtMax?: string;
  pl_discMin?: string;
  pl_discMax?: string;
}

export default function ExoplanetScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [exoplanets, setExoplanets] = useState<Exoplanet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [selectedExoplanet, setSelectedExoplanet] = useState<Exoplanet | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isSheetOpenFilters, setIsSheetOpenFilters] = useState(false);
  const [isSheetOpenDetails, setIsSheetOpenDetails] = useState(false);

  // Métodos de descoberta para o filtro
  const discoveryMethods = [
    'Transit', 'Radial Velocity', 'Microlensing', 'Imaging',
    'Transit Timing Variations', 'Astrometry', 'Eclipse Timing Variations'
  ];

  // Instalações de descoberta para o filtro
  const facilities = [
    'Kepler', 'TESS', 'K2', 'CoRoT', 'Spitzer', 'HST',
    'HARPS', 'KECK', 'Subaru', 'Gemini', 'Other'
  ];

  // Função para buscar os exoplanetas
  const fetchExoplanets = async (newSearch = false) => {
    try {
      setLoading(true);
      setError('');

      const currentPage = newSearch ? 1 : page;
      const pageSize = 20;

      if (newSearch) {
        setExoplanets([]);
        setPage(1);
        setHasMore(true);
      }

      let query = `SELECT pl_name, hostname, pl_orbper, pl_radj, pl_bmassj, pl_orbeccen, 
pl_eqt, disc_year, discoverymethod, disc_facility, sy_dist, pl_orbsmax, rowupdate,
sy_snum, sy_pnum, pl_refname, pl_rade, pl_masse, pl_orbincl, pl_orblper, pl_rvamp,
st_teff, st_rad, st_mass, st_met, st_logg, st_age, pl_dens, pl_insol, pl_trandep,
pl_ratdor, pl_ratror, pl_tranmid, pl_orbpererr1, pl_orbpererr2, pl_radeerr1, 
pl_radeerr2, pl_masseerr1, pl_masseerr2 
FROM ps`;

      const conditions = [];

      if (searchQuery) {
        conditions.push(`(pl_name LIKE '%${searchQuery}%' OR hostname LIKE '%${searchQuery}%')`);
      }

      if (filters.discoverymethod) {
        conditions.push(`discoverymethod = '${filters.discoverymethod}'`);
      }

      if (filters.disc_facility) {
        conditions.push(`disc_facility LIKE '%${filters.disc_facility}%'`);
      }

      if (filters.pl_orbperMin) conditions.push(`pl_orbper >= ${filters.pl_orbperMin}`);
      if (filters.pl_orbperMax) conditions.push(`pl_orbper <= ${filters.pl_orbperMax}`);
      if (filters.pl_radjMin) conditions.push(`pl_radj >= ${filters.pl_radjMin}`);
      if (filters.pl_radjMax) conditions.push(`pl_radj <= ${filters.pl_radjMax}`);
      if (filters.pl_massjMin) conditions.push(`pl_bmassj >= ${filters.pl_massjMin}`);
      if (filters.pl_massjMax) conditions.push(`pl_bmassj <= ${filters.pl_massjMax}`);
      if (filters.pl_eqtMin) conditions.push(`pl_eqt >= ${filters.pl_eqtMin}`);
      if (filters.pl_eqtMax) conditions.push(`pl_eqt <= ${filters.pl_eqtMax}`);
      if (filters.pl_discMin) conditions.push(`disc_year >= ${filters.pl_discMin}`);
      if (filters.pl_discMax) conditions.push(`disc_year <= ${filters.pl_discMax}`);

      if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
      }

      const encodedQuery = encodeURIComponent(query);
      const url = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodedQuery}&format=json&order=rowupdate+desc&limit=${pageSize}&offset=${(currentPage - 1) * pageSize}`;

      console.log('URL da requisição:', url);

      const response = await axios.get(url);

      // No bloco de tratamento da resposta
      // No bloco de tratamento da resposta
      if (response.data && Array.isArray(response.data)) {
        if (response.data.length === 0) {
          setHasMore(false);
        } else {
          // Após receber a resposta da API, antes de atualizar o estado
          setExoplanets(prevExoplanets => {
            // Obtém os novos dados (filtrados ou não)
            let newData;
            if (!newSearch) {
              const existingIds = new Set(prevExoplanets.map(item => item.pl_name + item.rowupdate));
              const filteredNewData = response.data.filter(
                (item: any) => !existingIds.has(item.pl_name + item.rowupdate)
              );

              if (filteredNewData.length === 0) {
                setHasMore(false);
                return prevExoplanets;
              }

              newData = [...prevExoplanets, ...filteredNewData];
            } else {
              newData = response.data;
            }

            // Ordena os dados por data de atualização (rowupdate) em ordem decrescente
            return newData.sort((a: any, b: any) => {
              // Converte as strings de data para objetos Date para comparação
              const dateA = new Date(a.rowupdate);
              const dateB = new Date(b.rowupdate);
              return dateB.getTime() - dateA.getTime(); // Ordem decrescente (do mais recente para o mais antigo)
            });
          });

          if (!newSearch) {
            setPage(currentPage + 1);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar exoplanetas:', err);
      setError('Erro ao buscar dados. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para gerenciar favoritos
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const saveFavorite = async (exoplanet: Exoplanet) => {
    try {
      // Chave única para identificar o exoplaneta
      const exoplanetKey = `${exoplanet.pl_name}-${exoplanet.rowupdate}`;

      // Verificar se já está nos favoritos
      if (favorites.includes(exoplanetKey)) {
        // Remover dos favoritos
        const updatedFavorites = favorites.filter(key => key !== exoplanetKey);
        setFavorites(updatedFavorites);
        await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      } else {
        // Adicionar aos favoritos
        const updatedFavorites = [...favorites, exoplanetKey];
        setFavorites(updatedFavorites);

        // Salvar o exoplaneta completo
        await AsyncStorage.setItem(`exoplanet_${exoplanetKey}`, JSON.stringify(exoplanet));
        await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      }
    } catch (error) {
      console.error('Erro ao salvar favorito:', error);
    }
  };

  // Carregar favoritos ao iniciar
  useEffect(() => {
    loadFavorites();
  }, []);

  // Função para lidar com a busca
  const handleSearch = () => {
    // Executa a busca diretamente sem navegar
    fetchExoplanets(true);
  };

  // Função para aplicar filtros
  const applyFilters = () => {
    setIsSheetOpenFilters(false)
    fetchExoplanets(true);
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setFilters({});
  };

  // Função para carregar mais exoplanetas
  const loadMore = () => {
    if (!loading && hasMore && exoplanets.length > 0) {
      fetchExoplanets();
    }
  };

  const handleDetails = (item: Exoplanet) => {
    setIsSheetOpenDetails(true);
    setSelectedExoplanet(item)
  };

  // Renderizar cada item da lista
  const renderExoplanetItem = ({ item }: { item: Exoplanet }) => {
    const exoplanetKey = `${item.pl_name}-${item.rowupdate}`;
    const isFavorite = favorites.includes(exoplanetKey);

    return (
      <TouchableOpacity
        style={styles.exoplanetItem}
        className="bg-white rounded-2xl mx-2 mb-4 overflow-hidden border border-gray-200"
        onPress={() => handleDetails(item)}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.exoplanetName}>{item.pl_name}</Text>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => saveFavorite(item)}
          >
            <Ionicons
              name={isFavorite ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isFavorite ? "#FFD700" : "#999"}
            />
          </TouchableOpacity>

          <Text style={styles.hostName}>Estrela: {item.hostname}</Text>
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Período Orbital:</Text>
              <Text style={styles.detailValue}>{item.pl_orbper ? `${item.pl_orbper.toFixed(2)} dias` : 'N/A'}</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Tamanho:</Text>
              <Text style={styles.detailValue}>{item.pl_radj ? `${item.pl_radj.toFixed(2)} RJ` : 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Massa:</Text>
              <Text style={styles.detailValue}>{item.pl_bmassj ? `${item.pl_bmassj.toFixed(2)} MJ` : 'N/A'}</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Temperatura:</Text>
              <Text style={styles.detailValue}>{item.pl_eqt ? `${item.pl_eqt} K` : 'N/A'}</Text>
            </View>
          </View>

          <Text style={styles.discoveryMethod}>
            Descoberto por {item.discoverymethod} em {item.disc_year || 'data desconhecida'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const LoadingComponent = ({ loading }: { loading: boolean }) => {
    const [currentPhrase, setCurrentPhrase] = useState(0);

    const phrases = [
      "Isso pode demorar um pouco...",
      "Preparando tudo para você...",
      "Aguarde só mais um instante...",
      "Quase lá...",
      "Carregando os últimos detalhes..."
    ];

    useEffect(() => {
      if (loading) {
        const interval = setInterval(() => {
          setCurrentPhrase((prevPhrase) => (prevPhrase + 1) % phrases.length);
        }, 3000); // Altera a frase a cada 3 segundos

        return () => clearInterval(interval); // Limpa o intervalo quando o componente é desmontado
      }
    }, [loading]);

    const renderFooter = () => {
      if (!loading) return null;

      return (
        <View style={styles.footerLoader}>
          <LottieView
            source={RocketAnim}
            autoPlay
            loop
            cacheComposition={true}
            style={{ width: 200, height: 200 }}
            renderMode="SOFTWARE"
            resizeMode="contain"
          />

          <Text style={styles.loadingText}>{phrases[currentPhrase]}</Text>
        </View>
      );
    };

    return renderFooter();
  };

  const handleSheetClose = useCallback(() => {
    setIsSheetOpenDetails(false);
    setIsSheetOpenFilters(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Buscador de Exoplanetas</Text>
          <Text style={styles.subtitle}>Encontre dados de exoplanetas disponibilizados no NASA Exoplanet Archive de forma prática. Salve e acompanhe para ficar por dentro das atualizações.</Text>
        </View>

        <View style={styles.searchContainer} className='gap-1 items-center justify-cente'>
          <View className='h-14 rounded-md' style={{ flex: 1, flexDirection: 'row', borderWidth: 1, borderColor: colors.dark["--color-cinza-60"], }}>

            <TextInput
              style={{ flex: 1, fontSize: 14, color: 'black', paddingHorizontal: 10, paddingVertical: 0 }}
              placeholder="Buscar por nome do exoplaneta ou estrela..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>


          <TouchableOpacity className='w-14 h-14 rounded-md' style={styles.searchButton} onPress={handleSearch}>
            <Feather
              name="search"
              size={20}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            className='w-14 h-14'
            style={styles.filterButton}
            onPress={() => setIsSheetOpenFilters(true)}
          >
            <Ionicons name="options-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <LoadingComponent loading={loading} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={30} color="#cc0000" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchExoplanets(true)}
            >
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : exoplanets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="planet-outline" size={50} color="#999" />
            <Text style={styles.emptyText}>
              {searchQuery ?
                `Nenhum exoplaneta encontrado para "${searchQuery}"` :
                'Digite um termo para buscar exoplanetas'}
            </Text>
            <TouchableOpacity
              style={styles.startSearchButton}
              onPress={() => fetchExoplanets(true)}
            >
              <Text style={styles.startSearchText}>Buscar Todos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={exoplanets}
            renderItem={renderExoplanetItem}
            keyExtractor={(item) => `${item.pl_name}-${item.rowupdate}`}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={hasMore ? <LoadingComponent loading={loading} /> : null}
            contentContainerStyle={styles.list}
          />
        )}

        {/* Modal de Filtros */}
        {isSheetOpenFilters && (
          <Sheet
            onClose={handleSheetClose}
            //onRequestClose={() => setShowFilters(false)}
            height={500} // Você pode ajustar a altura conforme necessário
          >
            <View style={styles.modalOverlay}>
              <Text style={styles.modalTitle}>Filtros de Busca</Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Método de Descoberta */}
                <Text style={styles.filterSectionTitle}>Método de Descoberta</Text>
                <View style={styles.chipContainer}>
                  {discoveryMethods.map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.chip,
                        filters.discoverymethod === method && styles.chipSelected
                      ]}
                      onPress={() => setFilters(prev => ({
                        ...prev,
                        discoverymethod: prev.discoverymethod === method ? undefined : method
                      }))}
                    >
                      <Text style={[
                        styles.chipText,
                        filters.discoverymethod === method && styles.chipTextSelected
                      ]}>
                        {method}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Instalação de Descoberta */}
                <Text style={styles.filterSectionTitle}>Instalação de Descoberta</Text>
                <View style={styles.chipContainer}>
                  {facilities.map((facility) => (
                    <TouchableOpacity
                      key={facility}
                      style={[
                        styles.chip,
                        filters.disc_facility === facility && styles.chipSelected
                      ]}
                      onPress={() => setFilters(prev => ({
                        ...prev,
                        disc_facility: prev.disc_facility === facility ? undefined : facility
                      }))}
                    >
                      <Text style={[
                        styles.chipText,
                        filters.disc_facility === facility && styles.chipTextSelected
                      ]}>
                        {facility}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Período Orbital (dias) */}
                <Text style={styles.filterSectionTitle}>Período Orbital (dias)</Text>
                <View style={styles.rangeContainer}>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Min:</Text>
                    <TextInput
                      style={styles.rangeInputField}
                      placeholder="Min"
                      value={filters.pl_orbperMin}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, pl_orbperMin: text }))}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Max:</Text>
                    <TextInput
                      style={styles.rangeInputField}
                      placeholder="Max"
                      value={filters.pl_orbperMax}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, pl_orbperMax: text }))}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Raio (RJupiter) */}
                <Text style={styles.filterSectionTitle}>Raio (RJupiter)</Text>
                <View style={styles.rangeContainer}>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Min:</Text>
                    <TextInput
                      style={styles.rangeInputField}
                      placeholder="Min"
                      value={filters.pl_radjMin}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, pl_radjMin: text }))}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Max:</Text>
                    <TextInput
                      style={styles.rangeInputField}
                      placeholder="Max"
                      value={filters.pl_radjMax}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, pl_radjMax: text }))}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Massa (MJupiter) */}
                <Text style={styles.filterSectionTitle}>Massa (MJupiter)</Text>
                <View style={styles.rangeContainer}>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Min:</Text>
                    <TextInput
                      style={styles.rangeInputField}
                      placeholder="Min"
                      value={filters.pl_massjMin}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, pl_massjMin: text }))}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Max:</Text>
                    <TextInput
                      style={styles.rangeInputField}
                      placeholder="Max"
                      value={filters.pl_massjMax}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, pl_massjMax: text }))}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Temperatura (K) */}
                <Text style={styles.filterSectionTitle}>Temperatura (K)</Text>
                <View style={styles.rangeContainer}>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Min:</Text>
                    <TextInput
                      style={styles.rangeInputField}
                      placeholder="Min"
                      value={filters.pl_eqtMin}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, pl_eqtMin: text }))}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Max:</Text>
                    <TextInput
                      style={styles.rangeInputField}
                      placeholder="Max"
                      value={filters.pl_eqtMax}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, pl_eqtMax: text }))}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Ano de Descoberta */}
                <Text style={styles.filterSectionTitle}>Ano de Descoberta</Text>
                <View style={styles.rangeContainer}>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Min:</Text>
                    <TextInput
                      style={styles.rangeInputField}
                      placeholder="Min"
                      value={filters.pl_discMin}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, pl_discMin: text }))}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.rangeInput}>
                    <Text style={styles.rangeLabel}>Max:</Text>
                    <TextInput
                      style={styles.rangeInputField}
                      placeholder="Max"
                      value={filters.pl_discMax}
                      onChangeText={(text) => setFilters(prev => ({ ...prev, pl_discMax: text }))}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalApplyButton}
                  onPress={applyFilters}
                >
                  <Text style={styles.modalApplyButtonText}>Aplicar Filtros</Text>
                </TouchableOpacity>

                {Object.keys(filters).length > 0 && (
                  <TouchableOpacity
                    style={styles.clearFiltersButton}
                    onPress={clearFilters}
                  >
                    <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Sheet>
        )}

        {/* Modal de Detalhes do Exoplaneta */}
        {isSheetOpenDetails && (
          <Sheet
            onClose={handleSheetClose}
            //onRequestClose={() => setShowFilters(false)}
            height={500} // Você pode ajustar a altura conforme necessário
          >
            {selectedExoplanet && (
              <View style={styles.modalOverlay}>
                <Text style={styles.modalTitle}>{selectedExoplanet.pl_name}</Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.planetImageContainer}>
                    <View style={styles.planetPlaceholder}>
                      <Ionicons name="planet" size={30} color="#4a90e2" />
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Informações Básicas</Text>
                    <View style={styles.detailGrid}>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Estrela Hospedeira:</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.hostname}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Método de Descoberta:</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.discoverymethod}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Ano de Descoberta:</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.disc_year || 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Instalação:</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.disc_facility || 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Última Atualização:</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.rowupdate || 'N/A'}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Nova seção de parâmetros estelares */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Parâmetros Estelares</Text>
                    <View style={styles.detailGrid}>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Temperatura Efetiva (K):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.st_teff ? selectedExoplanet.st_teff.toFixed(0) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Raio Estelar (Rsol):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.st_rad ? selectedExoplanet.st_rad.toFixed(3) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Massa Estelar (Msol):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.st_mass ? selectedExoplanet.st_mass.toFixed(3) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Metalicidade:</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.st_met ? selectedExoplanet.st_met.toFixed(3) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Gravidade Superficial (log g):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.st_logg ? selectedExoplanet.st_logg.toFixed(3) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Idade da Estrela (Gyr):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.st_age ? selectedExoplanet.st_age.toFixed(3) : 'N/A'}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Expandir a seção de características físicas com mais dados */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Características Físicas</Text>
                    <View style={styles.detailGrid}>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Raio (RJupiter):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_radj ? selectedExoplanet.pl_radj.toFixed(3) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Raio (RTerra):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_rade ? selectedExoplanet.pl_rade.toFixed(3) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Massa (MJupiter):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_bmassj ? selectedExoplanet.pl_bmassj.toFixed(3) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Massa (MTerra):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_masse ? selectedExoplanet.pl_masse.toFixed(3) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Densidade (g/cm³):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_dens ? selectedExoplanet.pl_dens.toFixed(3) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Insolação (S⊕):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_insol ? selectedExoplanet.pl_insol.toFixed(3) : 'N/A'}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Expandir a seção de características orbitais com mais dados */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Características Orbitais</Text>
                    <View style={styles.detailGrid}>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Período Orbital (dias):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_orbper ? selectedExoplanet.pl_orbper.toFixed(3) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Excentricidade:</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_orbeccen ? selectedExoplanet.pl_orbeccen.toFixed(5) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Semieixo Maior (AU):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_orbsmax ? selectedExoplanet.pl_orbsmax.toFixed(3) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Inclinação (graus):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_orbincl ? selectedExoplanet.pl_orbincl.toFixed(2) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Argumento do Periastro (graus):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_orblper ? selectedExoplanet.pl_orblper.toFixed(2) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Amplitude RV (m/s):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_rvamp ? selectedExoplanet.pl_rvamp.toFixed(2) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Distância da Terra (pc):</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.sy_dist ? selectedExoplanet.sy_dist.toFixed(2) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Profundidade do Trânsito:</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_trandep ? selectedExoplanet.pl_trandep.toFixed(5) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Razão de Distância Orbital:</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_ratdor ? selectedExoplanet.pl_ratdor.toFixed(3) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Razão de Raio Orbital:</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_ratror ? selectedExoplanet.pl_ratror.toFixed(3) : 'N/A'}</Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailGridLabel}>Tempo de Trânsito Médio:</Text>
                        <Text style={styles.detailGridValue}>{selectedExoplanet.pl_tranmid ? selectedExoplanet.pl_tranmid.toFixed(3) : 'N/A'}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Link para o NASA Exoplanet Archive */}
                  <View style={styles.detailSection}>
                    <TouchableOpacity
                      style={styles.nasaLinkButton}
                      onPress={() => {
                        Linking.openURL(`https://exoplanetarchive.ipac.caltech.edu/overview/${selectedExoplanet.hostname}`);
                      }}
                    >
                      <Ionicons name="link" size={20} color="white" />
                      <Text style={styles.nasaLinkText}>Ver no NASA Exoplanet Archive</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            )}
          </Sheet>
        )}
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

// Estilos
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.default["--color-texto"],
  },
  subtitle: {
    fontSize: 15,
    color: colors.default["--color-texto"],
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 12,
    //backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5eb',
  },
  searchInput: {
    flex: 1,
    //borderWidth: 1,
    //borderColor: '#ECEFF3',
    //borderRadius: 50,
    //paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  searchButton: {
    //width: 40,
    //height: 40,
    backgroundColor: colors.dark["--color-cinza-100"],
    justifyContent: 'center',
    alignItems: 'center',
    //marginLeft: 8,
    left: 0,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f4f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5eb',
  },
  filterButton: {
    //flexDirection: 'row',
    backgroundColor: colors.dark["--color-cinza-100"],
    //paddingHorizontal: 10,
    //paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  clearFiltersButton: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0066cc',
    justifyContent: 'center',
  },
  clearFiltersText: {
    color: '#0066cc',
    fontWeight: '500',
  },
  list: {
    padding: 8,
  },
  exoplanetItem: {
    marginVertical: 6,
    marginHorizontal: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemHeader: {
    marginBottom: 8,

  },
  exoplanetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  hostName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  discoveryMethod: {
    fontSize: 12,
    color: '#0066cc',
    marginTop: 6,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  startSearchButton: {
    backgroundColor: colors.dark["--color-cinza-100"],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startSearchText: {
    color: 'white',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#cc0000',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#cc0000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16
  },
  loadingContainer: {
    marginTop: 10,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 0,
    overflow: 'hidden',
  },
  detailsModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
    padding: 0,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsScrollView: {
    padding: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#f0f4f8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  chipSelected: {
    backgroundColor: colors.dark["--color-cinza-100"],
    borderColor: colors.dark["--color-cinza-90"],
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  chipTextSelected: {
    color: 'white',
  },
  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rangeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  rangeLabel: {
    width: 40,
    fontSize: 14,
    color: '#666',
  },
  rangeInputField: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e5eb',
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 10,
  },
  modalCancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  modalApplyButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalApplyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  planetImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planetPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 75,
    backgroundColor: '#e1e5eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5eb',
    paddingBottom: 8,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailGridItem: {
    width: '50%',
    paddingVertical: 6,
    paddingRight: 8,
  },
  detailGridLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailGridValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  habitabilitySection: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  habitabilityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 8,
  },
  habitabilityText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  nasaLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 6,
    marginVertical: 10,
  },
  nasaLinkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  favoriteButton: {
    padding: 5,
  },
});