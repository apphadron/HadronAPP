import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Image, Dimensions, View, ImageSourcePropType } from 'react-native';
import PagerView from 'react-native-pager-view';

const { width } = Dimensions.get('window');

interface ImagemDestaque {
  id: string;
  imagem: ImageSourcePropType;
}

interface DestaquesProps {
  imagens: ImagemDestaque[];
}

export function Destaques({ imagens }: DestaquesProps) {
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (pagerRef.current) {
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
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {imagens.map((item) => (
          <View key={item.id} style={styles.pageContainer}>
            <Image
              source={item.imagem}
              style={styles.imagem}
              resizeMode="cover"
            />
          </View>
        ))}
      </PagerView>
      <View style={styles.indicators}>
        {imagens.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentPage && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
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
  imagem: {
    width: width - 20,
    height: '100%',
    borderRadius: 20,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#007AFF',
  },
}); 