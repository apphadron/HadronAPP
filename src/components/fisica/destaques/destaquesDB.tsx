import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Image, Dimensions, View, Text, TouchableOpacity } from 'react-native';
import PagerView from 'react-native-pager-view';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder'; // Biblioteca de Shimmer
import { supabase } from '@/db/supabaseClient'; // Supabase
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface ImagemDestaque {
  id: string;
  image_url: string;
  title: string;
  area?: string;
}

interface DestaquesProps {
  area: string; // Parâmetro para filtro
}

export function Destaques({ area }: DestaquesProps) {
  const pagerRef = useRef<PagerView>(null);
  const [imagens, setImagens] = useState<ImagemDestaque[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const cacheKey = `cards_destaques_${area}`;

  const fetchDestaquesFromSupabase = async () => {
    const { data, error } = await supabase
      .from('cards_destaques')
      .select('id, image_url, title, area')
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

      // Carrega do cache
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        setImagens(JSON.parse(cachedData));
      }

      // Atualiza do Supabase
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
    }, 5000);

    return () => clearInterval(timer);
  }, [currentPage, imagens.length]);

  const handlePageSelected = (e: any) => {
    setCurrentPage(e.nativeEvent.position);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        // Skeleton Loading usando ShimmerPlaceholder
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
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={handlePageSelected}
        >
          {imagens.map((item) => (
            <TouchableOpacity key={item.id} style={styles.pageContainer}>
              <Image
                source={{ uri: item.image_url }}
                style={styles.imagem}
                resizeMode="cover"
              />
              {/*<View style={styles.overlay}>
                <Text style={styles.title}>{item.title}</Text>
              </View>*/}
            </TouchableOpacity>
          ))}
        </PagerView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginVertical: 10,
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    padding: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  shimmerImage: {
    width: width - 20,
    height: 200,
    borderRadius: 20,
  },
  imagem: {
    width: width - 20,
    height: '100%',
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 5,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
