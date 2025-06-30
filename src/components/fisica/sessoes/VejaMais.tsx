import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList, Image, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import MulheresCiencia from '@/assets/img/mulheres_ciencia.png';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedRef,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = width * 0.90;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface CardProps {
    title: string;
    description: string;
    buttonText: string;
    gradientColors: string[];
    icon: React.ReactNode;
    rota: string;
    onPress: () => void;
}

const Card = ({ title, description, buttonText, gradientColors, icon, onPress, rota }: CardProps) => {
    const router = useRouter();

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.cardContainer}>
            <LinearGradient
                colors={gradientColors}
                style={styles.gradientBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContainer}>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{title}</Text>
                    </View>
                    <View style={styles.iconContainer}>
                        {icon}
                    </View>
                </View>
                <Text style={styles.description}>{description}</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.push(rota as any)}>
                    <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const PhysicsCarousel = () => {
    const flatListRef = useRef<FlatList>(null);
    const router = useRouter();
    const scrollOffset = useSharedValue(0);
    const paused = useSharedValue(false); // controle de pausa
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const carouselData = [
        {
            id: '1',
            title: 'Mulheres na Ciência',
            description: 'Conheça as cientistas que revolucionaram a física e suas contribuições',
            buttonText: 'Conhecer cientistas',
            gradientColors: ['#E4C087', '#E4C087'],
            icon: <Image source={MulheresCiencia} style={styles.imageIcon} />,
            rota: '/fisica/glossario',
        },
        {
            id: '2',
            title: 'Áreas da Física',
            description: 'Explore os fascinantes campos de estudo e atuação na física moderna',
            buttonText: 'Explorar áreas',
            gradientColors: ['#a18cd1', '#6b5ce7'],
            icon: <MaterialCommunityIcons name="atom" size={40} color="#fff" />,
            rota: '/fisica/areasFisica/areasFisica',
        },
        {
            id: '3',
            title: 'Ei! Será um alien?',
            description: 'Acompanhe a ISS e os satélites Starlink em tempo real',
            buttonText: 'Ver satélites',
            gradientColors: ['#b721ff', '#5e3dc3'],
            icon: <MaterialCommunityIcons name="satellite-variant" size={40} color="#fff" />,
            rota: '/fisica/glossario',
        }
    ];

    const scrollToNext = () => {
        if (paused.value) return;

        const nextOffset = scrollOffset.value + CARD_WIDTH + 20;
        const maxOffset = (carouselData.length - 1) * (CARD_WIDTH + 20);
        scrollOffset.value = nextOffset > maxOffset ? 0 : nextOffset;

        flatListRef.current?.scrollToOffset({
            offset: scrollOffset.value,
            animated: true,
        });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            runOnJS(scrollToNext)();
        }, 4000);

        return () => clearInterval(interval);
    }, []);


    const handleTouchStart = () => {
        paused.value = true;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            paused.value = false;
        }, 6000); // retoma após 6 segundos de inatividade
    };


    return (
        <TouchableWithoutFeedback onPressIn={handleTouchStart}>
            <View style={styles.container}>
                <AnimatedFlatList
                    ref={flatListRef}
                    data={carouselData}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={CARD_WIDTH + 20}
                    decelerationRate="fast"
                    renderItem={({ item }: { item: any }) => (
                        <Card
                            title={item.title}
                            description={item.description}
                            buttonText={item.buttonText}
                            gradientColors={item.gradientColors}
                            icon={item.icon}
                            rota={item.rota}
                            onPress={() => router.push(item.rota as any)}
                        />
                    )}
                    keyExtractor={(item: any) => item.id}
                    contentContainerStyle={styles.carouselContent}
                    onScroll={(event) => {
                        scrollOffset.value = event.nativeEvent.contentOffset.x;
                    }}
                    scrollEventThrottle={16}
                />
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    carouselContent: {
        paddingHorizontal: 5,
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: 'auto',
        marginHorizontal: 10,
        borderRadius: 16,
        overflow: 'hidden',
    },
    gradientBg: {
        flex: 1,
        padding: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    textContainer: {
        flex: 1,
    },
    iconContainer: {
        marginLeft: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageIcon: {
        width: 100,
        height: 100,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    description: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.85)',
        marginVertical: 10,
    },
    button: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 30,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',

    },
    disabledButton: {
        backgroundColor: 'rgba(230, 230, 230, 0.9)',
    },
});

export default PhysicsCarousel;