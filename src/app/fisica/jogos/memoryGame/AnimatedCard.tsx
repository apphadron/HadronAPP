// AnimatedCard.tsx
import React from 'react';
import { Pressable, Image, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { TapGestureHandler } from 'react-native-gesture-handler';
import question from '@/assets/img/stars.png';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type Props = {
  card: {
    id: number;
    image: any;
    isFlipped: boolean;
    isMatched: boolean;
  };
  onPress: () => void;
  cardSize: number;
};

export default function AnimatedCard({ card, onPress, cardSize }: Props) {
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    rotate.value = withTiming(card.isFlipped || card.isMatched ? 180 : 0, { 
      duration: 600 
    });
    
    if (card.isMatched) {
      scale.value = withSpring(1.05, { damping: 8 });
    } else {
      scale.value = withSpring(1, { damping: 10 });
    }
  }, [card.isFlipped, card.isMatched]);

  const tapHandler = () => {
    'worklet';
    scale.value = withSpring(0.95, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 15 });
    });
    runOnJS(onPress)();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotate.value, [0, 180], [0, 180]);
    const opacity = interpolate(rotate.value, [0, 90, 180], [1, 0, 0]);
    
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity,
      backfaceVisibility: 'hidden',
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotate.value, [0, 180], [180, 360]);
    const opacity = interpolate(rotate.value, [0, 90, 180], [0, 0, 1]);
    
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity,
      backfaceVisibility: 'hidden',
    };
  });

  const imageSize = cardSize * 0.90;

  return (
    <TapGestureHandler onHandlerStateChange={tapHandler}>
      <Animated.View style={[containerStyle, { margin: 1.5 }]}>
        {/* Carta virada para baixo (frente) */}
        <Animated.View 
          style={[
            frontStyle,
            {
              position: 'absolute',
              width: cardSize,
              height: cardSize,
              backgroundColor: '#4c51bf',
              borderRadius: Math.max(8, cardSize * 0.1),
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              borderWidth: 1,
              borderColor: '#6366f1',
            }
          ]}
        >
          <Image 
            source={question} 
            style={{ 
              width: imageSize, 
              height: imageSize,
              tintColor: 'white'
            }} 
            resizeMode="contain"
          />
        </Animated.View>

        {/* Carta virada para cima (verso) */}
        <Animated.View 
          style={[
            backStyle,
            {
              width: cardSize,
              height: cardSize,
              backgroundColor: card.isMatched ? '#10b981' : '#ffffff',
              borderRadius: Math.max(8, cardSize * 0.1),
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              borderWidth: card.isMatched ? 2 : 1,
              borderColor: card.isMatched ? '#059669' : '#e5e7eb',
            }
          ]}
        >
          <Image 
            source={card.image} 
            style={{ 
              width: imageSize, 
              height: imageSize 
            }} 
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
    </TapGestureHandler>
  );
}