// app/favorites.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  ScrollView,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { Exoplanet, styles } from './SearchExoplanet';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Exoplanet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExoplanet, setSelectedExoplanet] = useState<Exoplanet | null>(null);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const storedKeys = await AsyncStorage.getItem('favorites');
      
      if (storedKeys) {
        const favoriteKeys = JSON.parse(storedKeys) as string[];
        const loadedFavorites: Exoplanet[] = [];
        
        for (const key of favoriteKeys) {
          const storedData = await AsyncStorage.getItem(`exoplanet_${key}`);
          if (storedData) {
            loadedFavorites.push(JSON.parse(storedData));
          }
        }
        
        setFavorites(loadedFavorites);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (exoplanet: Exoplanet) => {
    try {
      const exoplanetKey = `${exoplanet.pl_name}-${exoplanet.rowupdate}`;
      const storedKeys = await AsyncStorage.getItem('favorites');
      
      if (storedKeys) {
        const favoriteKeys = JSON.parse(storedKeys) as string[];
        const updatedKeys = favoriteKeys.filter(key => key !== exoplanetKey);
        
        await AsyncStorage.setItem('favorites', JSON.stringify(updatedKeys));
        await AsyncStorage.removeItem(`exoplanet_${exoplanetKey}`);
        
        // Atualiza a lista local
        setFavorites(favorites.filter(item => 
          `${item.pl_name}-${item.rowupdate}` !== exoplanetKey
        ));
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const renderExoplanetItem = ({ item }: { item: Exoplanet }) => (
    <TouchableOpacity
      style={styles.exoplanetItem}
      className="bg-white rounded-2xl mx-2 mb-4 overflow-hidden border border-gray-200"
      onPress={() => setSelectedExoplanet(item)}
    >
      <View className='flex-row items-center mb-2 gap-3'>
        <Text style={styles.exoplanetName}>{item.pl_name}</Text>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => removeFavorite(item)}
        >
          <Ionicons name="bookmark" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <Text style={styles.hostName}>Estrela: {item.hostname}</Text>

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exoplanetas Salvos</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text>Carregando exoplanetas salvos...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={50} color="#999" />
          <Text style={styles.emptyText}>
            Você ainda não salvou nenhum exoplaneta
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderExoplanetItem}
          keyExtractor={(item) => `${item.pl_name}-${item.rowupdate}`}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Modal de Detalhes do Exoplaneta (mesma do ExoplanetScreen) */}
      <Modal
        visible={!!selectedExoplanet}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedExoplanet(null)}
      >
        {selectedExoplanet && (
          <View style={styles.modalOverlay}>
            <View style={styles.detailsModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedExoplanet.pl_name}</Text>
                <TouchableOpacity onPress={() => setSelectedExoplanet(null)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.detailsScrollView}>
                <View style={styles.planetImageContainer}>
                  <View style={styles.planetPlaceholder}>
                    <Ionicons name="planet" size={60} color="#4a90e2" />
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
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}