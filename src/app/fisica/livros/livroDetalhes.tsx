import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Linking, TouchableOpacity, Animated, StatusBar, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/db/supabaseClient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { colors } from "@/styles/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { getImageUrl } from "@/utils/getImageUrl";
import { getImageFromCache } from "@/utils/imageCache";


const HEADER_HEIGHT = 60;

export default function BookDetails() {
    const { id } = useLocalSearchParams();
    const [bookDetails, setBookDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scrollY] = useState(new Animated.Value(0));
    const router = useRouter();


    // Animações para o header dinâmico
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 150, 200],
        outputRange: [0, 0.8, 1],
        extrapolate: 'clamp'
    });

    const imageScale = scrollY.interpolate({
        inputRange: [-100, 0, 100],
        outputRange: [1.2, 1, 0.9],
        extrapolate: 'clamp'
    });

    const imageTranslateY = scrollY.interpolate({
        inputRange: [-100, 0, 100],
        outputRange: [10, 0, -30],
        extrapolate: 'clamp'
    });

    useEffect(() => {
        const fetchBookDetails = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('livros')
                    .select('*')
                    .eq('id', Number(id))
                    .single();

                if (error) {
                    console.error('Erro ao buscar detalhes do livro:', error);
                    const cachedData = await AsyncStorage.getItem(`bookDetails_${id}`);
                    if (cachedData) {
                        setBookDetails(JSON.parse(cachedData));
                    } else {
                        setBookDetails({
                            id,
                            nome: "Livro não encontrado",
                            image_url: null
                        });
                    }
                } else {
                    // Obter URL da imagem (com cache)
                    const imageUrl = data.image_path
                        ? await getImageUrl(data.image_path)
                        : null;

                    const completeData = {
                        ...data,
                        image_url: imageUrl
                    };

                    setBookDetails(completeData);
                    await AsyncStorage.setItem(`bookDetails_${id}`, JSON.stringify(completeData));
                }
            } catch (err) {
                console.error('Erro inesperado:', err);
                setBookDetails({
                    id,
                    nome: "Erro ao carregar",
                    image_url: null
                });
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetails();
    }, [id]);

    const handleBuyLinkPress = () => {
        if (bookDetails?.buy_link) {
            Linking.openURL(bookDetails.buy_link);
        }
    };

    const renderRatingStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const stars = [];

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <AntDesign key={`star-${i}`} name="star" size={14} color="#FFD700" style={{ marginRight: 2 }} />
                );
            } else if (i === fullStars && halfStar) {
                stars.push(
                    <AntDesign key={`star-half-${i}`} name="staro" size={14} color="#FFD700" style={{ marginRight: 2 }} />
                );
            } else {
                stars.push(
                    <AntDesign key={`star-empty-${i}`} name="staro" size={14} color="#D1D5DB" style={{ marginRight: 2 }} />
                );
            }
        }

        return stars;
    };

    // Componente de loading com shimmer
    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                <StatusBar barStyle="light-content" />
                <View style={{ height: 250, backgroundColor: '#F3F4F6', width: '100%' }}>
                    <ShimmerPlaceholder
                        style={{ width: 180, height: 280, borderRadius: 12, position: 'absolute', bottom: -40, alignSelf: 'center' }}
                        shimmerColors={["#f2f2f2", "#e6e6e6", "#f2f2f2"]}
                    />
                </View>
                <View style={{ padding: 20, marginTop: 55 }}>
                    <ShimmerPlaceholder
                        style={{ width: '80%', height: 30, marginBottom: 8, borderRadius: 5 }}
                        shimmerColors={["#f2f2f2", "#e6e6e6", "#f2f2f2"]}
                    />
                    <ShimmerPlaceholder
                        style={{ width: '50%', height: 20, marginBottom: 20, borderRadius: 5 }}
                        shimmerColors={["#f2f2f2", "#e6e6e6", "#f2f2f2"]}
                    />

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                        <ShimmerPlaceholder
                            style={{ width: 80, height: 24, borderRadius: 12 }}
                            shimmerColors={["#f2f2f2", "#e6e6e6", "#f2f2f2"]}
                        />
                        <ShimmerPlaceholder
                            style={{ width: 100, height: 24, borderRadius: 12 }}
                            shimmerColors={["#f2f2f2", "#e6e6e6", "#f2f2f2"]}
                        />
                    </View>

                    <ShimmerPlaceholder
                        style={{ width: '100%', height: 120, marginBottom: 20, borderRadius: 8 }}
                        shimmerColors={["#f2f2f2", "#e6e6e6", "#f2f2f2"]}
                    />

                    <ShimmerPlaceholder
                        style={{ width: '100%', height: 50, borderRadius: 25, marginTop: 20 }}
                        shimmerColors={["#f2f2f2", "#e6e6e6", "#f2f2f2"]}
                    />
                </View>
            </View>
        );
    }

    if (!bookDetails || !bookDetails.id) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Ionicons name="alert-circle-outline" size={60} color="#9CA3AF" />
                <Text className="text-lg text-gray-500 mt-4">Livro não encontrado</Text>
                <TouchableOpacity
                    className="mt-6 bg-gray-200 px-6 py-3 rounded-full"
                    onPress={() => router.back()}
                >
                    <Text className="text-gray-800 font-medium">Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="light-content" />

            {/* Header animado */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: HEADER_HEIGHT + (StatusBar.currentHeight || 0),
                    paddingTop: StatusBar.currentHeight || 0,
                    zIndex: 100,
                    opacity: headerOpacity,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                }}
            >
                <BlurView
                    intensity={90}
                    tint="dark"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                />
                <TouchableOpacity
                    className="w-10 h-10 items-center justify-center rounded-full"
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text numberOfLines={1} className="text-white font-medium text-lg flex-1 ml-4">
                    {bookDetails.nome}
                </Text>
            </Animated.View>

            <Animated.ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
            >
                {/* Hero section with book cover */}
                <View className="relative h-72">
                    <LinearGradient
                        colors={['rgba(76, 29, 149, 0.9)', 'rgba(124, 58, 237, 0.8)']}
                        className="absolute top-0 left-0 right-0 bottom-0"
                    />

                    {/* Background pattern */}
                    <View className="absolute top-0 left-0 right-0 bottom-0 opacity-10">
                        <View className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white/20" />
                        <View className="absolute top-40 left-40 w-16 h-16 rounded-full bg-white/20" />
                        <View className="absolute top-20 right-20 w-24 h-24 rounded-full bg-white/20" />
                    </View>

                    <SafeAreaView className="flex-row justify-between px-4 absolute top-0 left-0 right-0 z-10">
                        <TouchableOpacity
                            className="w-10 h-10 items-center justify-center rounded-full bg-black/20 mt-2"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-black/20 mt-2">
                            <Ionicons name="share-outline" size={22} color="white" />
                        </TouchableOpacity>
                    </SafeAreaView>

                    {/* Book cover with animation */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            bottom: -100,
                            left: '50%',
                            marginLeft: -75,
                            width: 175,
                            height: 270,
                            transform: [
                                { translateY: imageTranslateY },
                                { scale: imageScale }
                            ],
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.3,
                            shadowRadius: 15,
                            elevation: 10,
                        }}
                    >
                        {bookDetails.image_path ? (
                            <Image
                                source={{ uri: bookDetails.image_url }}
                                style={{ width: "100%", height: "100%", borderRadius: 12 }}
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-full h-full bg-gray-200 rounded-lg items-center justify-center">
                                <Ionicons name="book-outline" size={60} color={colors.light["--color-roxo-70"]} />
                            </View>
                        )}

                    </Animated.View>
                </View>

                {/* Content section */}
                <View className="pt-24 px-5">
                    {/* Title and author */}
                    <View className="items-center mb-6">
                        <Text className="text-2xl font-semibold text-gray-900 text-center mb-1 mt-5">
                            {bookDetails.nome}
                        </Text>
                        <Text className="text-base text-gray-600 mb-3">
                            por {bookDetails.autor}
                        </Text>

                        {/* Rating */}
                        <View className="flex-row items-center mb-2">
                            <View className="flex-row mr-2">
                                {renderRatingStars(bookDetails.rating || 4.5)}
                            </View>
                            <Text className="text-gray-600 text-sm">
                                {bookDetails.rating || "4.5"} • 238 avaliações
                            </Text>
                        </View>
                    </View>

                    {/* Quick info cards */}
                    <View className="flex-row justify-between mb-5">
                        <View className="bg-purple-50 rounded-xl px-2 py-3 flex-1 mr-2 items-center">
                            <Text className="text-purple-900 text-xs mb-1">Edição</Text>
                            <Text className="text-purple-800 font-medium">{bookDetails.edicao}</Text>
                        </View>
                        <View className="bg-purple-50 rounded-xl px-2 py-3 flex-1 mx-2 items-center">
                            <Text className="text-purple-900 text-xs mb-1">Publicação</Text>
                            <Text className="text-purple-800 font-medium">{bookDetails.data_publicacao}</Text>
                        </View>
                        <View className="bg-purple-50 rounded-xl px-2 py-3 flex-1 ml-2 items-center">
                            <Text className="text-purple-900 text-xs mb-1">Idioma</Text>
                            <Text className="text-purple-800 font-medium">{bookDetails.idioma}</Text>
                        </View>
                    </View>

                    {/* Tags */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-6"
                        contentContainerStyle={{ paddingHorizontal: 4 }}
                    >
                        {bookDetails.genero && (
                            <View className="bg-indigo-100 px-4 py-2 rounded-full mr-2">
                                <Text className="text-indigo-800 font-medium">
                                    {bookDetails.genero}
                                </Text>
                            </View>
                        )}
                        {bookDetails.classificacao && (
                            <View className="bg-sky-100 px-4 py-2 rounded-full mr-2">
                                <Text className="text-sky-800 font-medium">
                                    {bookDetails.classificacao}
                                </Text>
                            </View>
                        )}
                        <View className="bg-amber-100 px-4 py-2 rounded-full mr-2">
                            <Text className="text-amber-800 font-medium">
                                Bestseller
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Resumo */}
                    <View className="mb-8">
                        <View className="flex-row items-center mb-4">
                            <View className="w-1 h-6 bg-purple-600 rounded-full mr-2" />
                            <Text className="text-xl font-bold text-gray-900">
                                Resumo
                            </Text>
                        </View>
                        <Text className="text-gray-700 text-base leading-relaxed">
                            {bookDetails.resumo}
                        </Text>
                    </View>

                    {/* Botão de compra */}
                    {bookDetails.buy_link && (
                        <TouchableOpacity
                            className="bg-purple-600 py-4 rounded-2xl flex-row items-center justify-center mb-6 shadow-lg shadow-purple-300"
                            onPress={handleBuyLinkPress}
                            style={{
                                shadowColor: colors.light["--color-roxo-70"],
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 5,
                            }}
                        >
                            <Ionicons name="cart-outline" size={20} color="white" />
                            <Text className="text-white font-bold ml-2 text-lg">
                                COMPRAR LIVRO
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Botões secundários */}
                    <View className="flex-row justify-between mb-8">
                        <TouchableOpacity className="flex-1 mr-2 bg-gray-100 rounded-2xl py-3 items-center">
                            <Ionicons name="bookmark-outline" size={22} color={colors.light["--color-roxo-70"]} />
                            <Text className="text-gray-700 text-xs mt-1">Salvar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 mx-2 bg-gray-100 rounded-2xl py-3 items-center">
                            <Ionicons name="heart-outline" size={22} color={colors.light["--color-roxo-70"]} />
                            <Text className="text-gray-700 text-xs mt-1">Favorito</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 ml-2 bg-gray-100 rounded-2xl py-3 items-center">
                            <Ionicons name="share-social-outline" size={22} color={colors.light["--color-roxo-70"]} />
                            <Text className="text-gray-700 text-xs mt-1">Compartilhar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.ScrollView>
        </View>
    );
}