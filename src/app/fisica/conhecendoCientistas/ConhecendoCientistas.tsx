import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
  ImageBackground,
  Pressable,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { scientists, categories, Scientist } from './data';

const { width, height } = Dimensions.get('window');

export default function ConhecendoCientistas() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [filteredScientists, setFilteredScientists] = useState<Scientist[]>(scientists);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(searchAnim, {
      toValue: searchVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [searchVisible]);

  const filterByCategory = (category: string) => {
    setSelectedCategory(category);
    let filtered = scientists;
    
    if (category !== 'Todos') {
      filtered = scientists.filter(scientist => 
        scientist.category.includes(category)
      );
    }
    
    if (searchText) {
      filtered = filtered.filter(scientist =>
        scientist.name.toLowerCase().includes(searchText.toLowerCase()) ||
        scientist.area.toLowerCase().includes(searchText.toLowerCase()) ||
        scientist.contribution.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    setFilteredScientists(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    let filtered = scientists;
    
    if (selectedCategory !== 'Todos') {
      filtered = scientists.filter(scientist => 
        scientist.category.includes(selectedCategory)
      );
    }
    
    if (text) {
      filtered = filtered.filter(scientist =>
        scientist.name.toLowerCase().includes(text.toLowerCase()) ||
        scientist.area.toLowerCase().includes(text.toLowerCase()) ||
        scientist.contribution.toLowerCase().includes(text.toLowerCase())
      );
    }
    
    setFilteredScientists(filtered);
  };

  const toggleFavorite = (scientistName: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(scientistName)) {
      newFavorites.delete(scientistName);
    } else {
      newFavorites.add(scientistName);
    }
    setFavorites(newFavorites);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Dynamic Header with Parallax Effect */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#0a0a0f', '#1a1a2e', '#16213e', '#0f3460', '#533483', '#6b46c1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Animated.View 
            style={[
              styles.headerContent, 
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Header Top Bar */}
            <View style={styles.headerTop}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <View style={styles.logoContainer}>
                  <Ionicons name="telescope" size={28} color="#ffffff" />
                  <View style={styles.logoGlow} />
                </View>
              </Animated.View>
              
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                >
                  <Ionicons 
                    name={viewMode === 'list' ? 'grid' : 'list'} 
                    size={20} 
                    color="#ffffff" 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setSearchVisible(!searchVisible)}
                >
                  <Ionicons name="search" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Main Title with Animated Underline */}
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>Cientistas</Text>
              <Text style={styles.headerTitleAccent}>em Destaque</Text>
              <View style={styles.titleUnderline} />
            </View>
            
            <Text style={styles.headerSubtitle}>
              Explorando mentes brilhantes que mudaram o mundo
            </Text>
            
            {/* Enhanced Stats with Icons */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="people" size={20} color="#6b46c1" />
                <Text style={styles.statNumber}>{scientists.length}</Text>
                <Text style={styles.statLabel}>Cientistas</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="library" size={20} color="#3b82f6" />
                <Text style={styles.statNumber}>{categories.length}</Text>
                <Text style={styles.statLabel}>Áreas</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="heart" size={20} color="#ef4444" />
                <Text style={styles.statNumber}>{favorites.size}</Text>
                <Text style={styles.statLabel}>Favoritos</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>
        
        {/* Floating Search Bar */}
        <Animated.View 
          style={[
            styles.searchContainer,
            {
              opacity: searchAnim,
              transform: [{
                translateY: searchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                })
              }]
            }
          ]}
        >
          {searchVisible && (
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar cientistas, áreas ou contribuições..."
                placeholderTextColor="#6b7280"
                value={searchText}
                onChangeText={handleSearch}
                autoFocus
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Ionicons name="close-circle" size={20} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      </View>

      {/* Modern Category Filter */}
      <View style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>Filtrar por área</Text>
          <Text style={styles.resultsCount}>
            {filteredScientists.length} resultado{filteredScientists.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContainer}
        >
          <CategoryChip
            title="Todos"
            icon="grid"
            isActive={selectedCategory === 'Todos'}
            onPress={() => filterByCategory('Todos')}
          />
          
          {categories.map((category) => (
            <CategoryChip
              key={category}
              title={category}
              isActive={selectedCategory === category}
              onPress={() => filterByCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Scientists Grid/List */}
      <ScrollView
        style={styles.scientistsList}
        contentContainerStyle={[
          styles.scientistsContainer,
          viewMode === 'grid' && styles.gridContainer
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredScientists.map((scientist, index) => (
          <ScientistCard
            key={`${scientist.name}-${index}`}
            scientist={scientist}
            index={index}
            viewMode={viewMode}
            isFavorite={favorites.has(scientist.name)}
            onToggleFavorite={() => toggleFavorite(scientist.name)}
          />
        ))}
        
        {filteredScientists.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Nenhum cientista encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Tente ajustar seus filtros ou termo de busca
            </Text>
          </View>
        )}
      </ScrollView>
    </ScrollView>
  );
}

// Category Chip Component
interface CategoryChipProps {
  title: string;
  icon?: string;
  isActive: boolean;
  onPress: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({ title, icon, isActive, onPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.categoryChip,
        isActive && styles.categoryChipActive,
        pressed && styles.categoryChipPressed,
      ]}
      onPress={onPress}
    >
      {icon && (
        <Ionicons 
          name={icon as any} 
          size={16} 
          color={isActive ? '#ffffff' : '#6b7280'} 
          style={styles.categoryChipIcon}
        />
      )}
      <Text style={[
        styles.categoryChipText,
        isActive && styles.categoryChipTextActive,
      ]}>
        {title}
      </Text>
    </Pressable>
  );
};

// Enhanced Scientist Card Component
interface ScientistCardProps {
  scientist: Scientist;
  index: number;
  viewMode: 'grid' | 'list';
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ScientistCard: React.FC<ScientistCardProps> = ({ 
  scientist, 
  index, 
  viewMode, 
  isFavorite, 
  onToggleFavorite 
}) => {
  const [expanded, setExpanded] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 600,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleFavoritePress = () => {
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    onToggleFavorite();
  };

  const cardTransform = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const cardStyle = viewMode === 'grid' 
    ? [styles.card, styles.gridCard]
    : styles.card;

  return (
    <Animated.View
      style={[
        cardStyle,
        {
          opacity: animatedValue,
          transform: [{ translateY: cardTransform }],
        },
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && styles.cardPressed,
        ]}
        onPress={() => setExpanded(!expanded)}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.scientistName}>{scientist.name}</Text>
              <View style={styles.nationalityContainer}>
                <View style={styles.nationalityBadge}>
                  <Ionicons name="location" size={12} color="#3b82f6" />
                  <Text style={styles.nationalityText}>{scientist.nationality}</Text>
                </View>
              </View>
            </View>
            
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <TouchableOpacity 
                style={styles.favoriteButton}
                onPress={handleFavoritePress}
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? "#ef4444" : "#d1d5db"} 
                />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Area Badge */}
          <View style={styles.areaContainer}>
            <View style={styles.areaBadge}>
              <Ionicons name="flask" size={14} color="#7c3aed" />
              <Text style={styles.areaText}>{scientist.area}</Text>
            </View>
          </View>
          
          {/* Contribution Card */}
          <View style={styles.contributionCard}>
            <View style={styles.contributionHeader}>
              <Ionicons name="bulb" size={16} color="#f59e0b" />
              <Text style={styles.contributionLabel}>Principal Contribuição</Text>
            </View>
            <Text style={styles.contributionText}>{scientist.contribution}</Text>
          </View>

          {/* Categories Tags */}
          <View style={styles.tagsContainer}>
            {scientist.category.slice(0, 3).map((cat, catIndex) => (
              <View key={catIndex} style={styles.tag}>
                <Text style={styles.tagText}>{cat}</Text>
              </View>
            ))}
            {scientist.category.length > 3 && (
              <View style={styles.tagMore}>
                <Text style={styles.tagMoreText}>+{scientist.category.length - 3}</Text>
              </View>
            )}
          </View>

          {/* Expand Button */}
          <TouchableOpacity 
            style={styles.expandButton}
            onPress={() => setExpanded(!expanded)}
          >
            <Text style={styles.expandText}>
              {expanded ? 'Ocultar biografia' : 'Ver biografia completa'}
            </Text>
            <Ionicons 
              name={expanded ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#7c3aed" 
            />
          </TouchableOpacity>

          {/* Expanded Biography */}
          {expanded && (
            <Animated.View style={styles.bioSection}>
              <View style={styles.bioHeader}>
                <Ionicons name="book" size={16} color="#6b7280" />
                <Text style={styles.bioTitle}>Biografia</Text>
              </View>
              <Text style={styles.bioText}>{scientist.bio}</Text>
            </Animated.View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Header Styles
  headerContainer: {
    position: 'relative',
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  logoContainer: {
    position: 'relative',
    padding: 8,
  },
  logoGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    opacity: 0.2,
    borderRadius: 20,
    transform: [{ scale: 1.5 }],
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerTitleAccent: {
    fontSize: 36,
    fontWeight: '300',
    color: '#e0e7ff',
    textAlign: 'center',
    marginTop: -8,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#6b46c1',
    borderRadius: 2,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2,
    fontWeight: '500',
  },
  
  // Search Styles
  searchContainer: {
    position: 'absolute',
    bottom: -25,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  
  // Category Styles
  categorySection: {
    backgroundColor: '#ffffff',
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryScrollContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  categoryChipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  categoryChipPressed: {
    transform: [{ scale: 0.95 }],
  },
  categoryChipIcon: {
    // No additional styles needed
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  
  // List/Grid Styles
  scientistsList: {
    flex: 1,
  },
  scientistsContainer: {
    padding: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  // Card Styles
  card: {
    marginBottom: 20,
  },
  gridCard: {
    width: '48%',
    marginBottom: 16,
  },
  cardPressable: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardGradient: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  scientistName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  nationalityContainer: {
    alignSelf: 'flex-start',
  },
  nationalityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  nationalityText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
  },
  areaContainer: {
    marginBottom: 16,
  },
  areaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  areaText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '600',
  },
  contributionCard: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  contributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contributionLabel: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '600',
  },
  contributionText: {
    fontSize: 15,
    color: '#78350f',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tagText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  tagMore: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagMoreText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  expandText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '600',
  },
  bioSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  bioText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});