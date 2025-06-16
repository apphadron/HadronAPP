import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Image, Dimensions, View, Text, TouchableOpacity, Animated, ImageBackground } from 'react-native';
import PagerView from 'react-native-pager-view';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { supabase } from '@/db/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface ImagemDestaque {
  id: string;
  image_url: string;
  title: string;
  area?: string;
  description?: string;
}

interface DestaquesProps {
  area: string;
  onShowAll?: () => void;
}

export function Destaques({ area, onShowAll }: DestaquesProps) {
  const pagerRef = useRef<PagerView>(null);
  const [imagens, setImagens] = useState<ImagemDestaque[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const cacheKey = `cards_destaques_${area}`;

  const fetchDestaquesFromSupabase = async () => {
    const { data, error } = await supabase
      .from('cards_destaques')
      .select('id, image_url, title, area, description')
      .eq('area', area);

    if (error) {
      console.error('Erro ao buscar destaques:', error.message);
      return null;
    }
    return data || [];
  };

  const loadDestaques = async () => {
    try {
      setLoading(true);
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        setImagens(JSON.parse(cachedData));
      }
      const freshData = await fetchDestaquesFromSupabase();
      if (freshData) {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(freshData));
        setImagens(freshData);
      }
    } catch (error) {
      console.error('Erro ao carregar destaques:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDestaques();
  }, [area]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (pagerRef.current && imagens.length > 0) {
        const nextPage = (currentPage + 1) % imagens.length;
        pagerRef.current.setPage(nextPage);
        setCurrentPage(nextPage);
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [currentPage, imagens.length]);

  const handlePageSelected = (e: any) => {
    const newPosition = e.nativeEvent.position;
    setCurrentPage(newPosition);
    Animated.spring(scrollX, {
      toValue: newPosition * width,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <PagerView style={styles.pagerView} initialPage={0}>
          {[1, 2, 3].map((_, index) => (
            <View key={index} style={styles.pageContainer}>
              <ShimmerPlaceholder
                style={styles.shimmerImage}
                shimmerColors={['#ebebeb', '#c5c5c5', '#ebebeb']}
              />
            </View>
          ))}
        </PagerView>
      ) : (
        <>
          <PagerView
            ref={pagerRef}
            style={styles.pagerView}
            initialPage={0}
            onPageSelected={handlePageSelected}
          >
            {imagens.map((item) => (
              <TouchableOpacity key={item.id} style={styles.pageContainer}>
                <View style={styles.imageContainer}>
                  <ImageBackground
                    source={{ uri: item.image_url }}
                    style={styles.imageBackground}
                    imageStyle={styles.image}
                    resizeMode="cover"
                  >
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.gradientOverlay}
                    >
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.descricao}>{item.description}</Text>
                    </LinearGradient>
                  </ImageBackground>
                </View>
              </TouchableOpacity>
            ))}
          </PagerView>
          
          <View style={styles.indicatorsContainer}>
            {imagens.map((_, index) => {
              const inputRange = [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ];
              
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [1, 1.2, 1],
                extrapolate: 'clamp',
              });
              
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.indicator,
                    { 
                      opacity,
                      transform: [{ scale }],
                      width: index === currentPage ? 24 : 8,
                    },
                  ]}
                />
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 220,
    marginVertical: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#7141A1',
    fontSize: 14,
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    padding: 10,
    overflow: 'hidden',
  },
  imageContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 180,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: 20,
  },
  shimmerImage: {
    width: width - 20,
    height: 180,
    borderRadius: 20,
  },
  gradientOverlay: {
    padding: 15,
    //height: '50%',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  descricao: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    gap: 6,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7141A1',
    marginHorizontal: 4,
  },
});