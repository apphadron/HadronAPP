import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, Alert, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  withTiming, 
  useAnimatedStyle, 
  Easing
} from 'react-native-reanimated';

import { img1, img2, img3, img4, img5, img6, img7, img8, img9, img10 } from './images/images';

const cardImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];
const windowWidth = Dimensions.get('window').width;

type Card = {
  id: number;
  pairId: number;
  image: any;
};

type CardProps = {
  image: any;
  isFlipped: boolean;
  isSolved: boolean;
  onPress: () => void;
};

export default function GameScreen() {
  const { level } = useLocalSearchParams();
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const gridSize = level === 'easy' ? 6 : level === 'medium' ? 12 : 20;
  const cardSize = Math.min(80, (windowWidth - 40) / Math.sqrt(gridSize));

  useEffect(() => {
    initializeGame();
  }, [level]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (startTime && solved.length < gridSize) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, solved.length]);

  useEffect(() => {
    if (solved.length === gridSize) {
      Alert.alert(
        'Parabéns!',
        `Você completou o jogo em ${clickCount} cliques e ${elapsedTime} segundos!`,
        [{ text: 'Jogar Novamente', onPress: initializeGame }]
      );
    }
  }, [solved.length]);

  const initializeGame = () => {
    const pairs = cardImages.slice(0, gridSize / 2);
    const shuffledCards = [...pairs, ...pairs]
      .map((image, index) => ({ id: index, pairId: Math.floor(index / 2), image }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlipped([]);
    setSolved([]);
    setClickCount(0);
    setStartTime(new Date());
    setElapsedTime(0);
    setIsProcessing(false);
  };

  const handleCardPress = (index: number) => {
    if (
      isProcessing || 
      flipped.includes(index) || 
      solved.includes(index) || 
      flipped.length === 2
    ) return;

    if (!startTime) {
      setStartTime(new Date());
    }
    
    setClickCount(prev => prev + 1);
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [first, second] = newFlipped;
      
      if (cards[first].pairId === cards[second].pairId) {
        setTimeout(() => {
          setSolved(prev => [...prev, first, second]);
          setFlipped([]);
          setIsProcessing(false);
        }, 500);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Cliques: {clickCount}</Text>
        <Text style={styles.statsText}>Tempo: {elapsedTime}s</Text>
      </View>
      <View style={[styles.grid, { width: Math.sqrt(gridSize) * (cardSize + 10) }]}>
        {cards.map((card, index) => (
          <CardComponent
            key={index}
            image={card.image}
            isFlipped={flipped.includes(index) || solved.includes(index)}
            isSolved={solved.includes(index)}
            onPress={() => handleCardPress(index)}
          />
        ))}
      </View>
    </View>
  );
}

const CardComponent: React.FC<CardProps> = ({ image, isFlipped, isSolved, onPress }) => {
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withTiming(
      isFlipped ? 180 : 0,
      {
        duration: 300,
        easing: Easing.inOut(Easing.ease)
      }
    );
  }, [isFlipped]);

  const frontStyle = useAnimatedStyle(() => {
    const rotateValue = spin.value;
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateValue = spin.value - 180;
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.cardContainer}
      activeOpacity={0.7}
      disabled={isFlipped}
    >
      <View style={styles.cardWrapper}>
        <Animated.View style={[styles.cardFace, frontStyle]}>
          <Image 
            source={image} 
            style={styles.cardImage}
            resizeMode="contain"
          />
        </Animated.View>
        
        <Animated.View style={[styles.cardFace, backStyle]}>
          <View style={[
            styles.cardBack,
            isSolved && styles.cardSolved
          ]} />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: 80,
    height: 80,
    margin: 5,
  },
  cardWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  cardFace: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardImage: {
    width: '90%',
    height: '90%',
    borderRadius: 5,
  },
  cardBack: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 10,
  },
  cardSolved: {
    backgroundColor: '#4CAF50',
  },
});