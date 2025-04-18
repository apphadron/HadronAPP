import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/db/supabaseClient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from "@/styles/colors";
import { SafeAreaView } from "react-native-safe-area-context";


export default function MovieDetails() {
    const { id } = useLocalSearchParams(); // Acessando o parâmetro id com useLocalSearchParams
    const [movieDetails, setMovieDetails] = useState<any>(null);
    const [streamingLogos, setStreamingLogos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchMovieDetails = async () => {
            setLoading(true); // Começa o carregamento

            // Buscando os detalhes do filme no banco de dados
            const { data, error } = await supabase
                .from('movies')
                .select('*')
                .eq('id', id)
                .single(); // Obtém um único filme

            if (error) {
                console.error('Erro ao buscar detalhes do filme:', error);
                setLoading(false);
            } else {
                setMovieDetails(data);
            }

            // Buscando as plataformas de streaming associadas ao filme
            const { data: logos, error: logoError } = await supabase
                .from('movie_streamings')
                .select('image_logo')
                .eq('movie_id', id); // Aqui estamos utilizando 'movie_id', não 'id'

            if (logoError) {
                console.error('Erro ao buscar logos de streaming:', logoError);
                setLoading(false);
            } else {
                setStreamingLogos(logos);
            }

            // Salvando no AsyncStorage após a primeira busca
            if (data && logos) {
                await AsyncStorage.setItem(`movieDetails_${id}`, JSON.stringify(data));
                await AsyncStorage.setItem(`streamingLogos_${id}`, JSON.stringify(logos));
            }

            setLoading(false); // Fim do carregamento
        };

        fetchMovieDetails();
    }, [id]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ShimmerPlaceholder
                    style={{ width: 250, height: 250, borderRadius: 10 }}
                    shimmerColors={["#f2f2f2", "#e6e6e6", "#f2f2f2"]}
                />
                <ShimmerPlaceholder
                    style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 10 }}
                    shimmerColors={["#f2f2f2", "#e6e6e6", "#f2f2f2"]}
                />
                <ShimmerPlaceholder
                    style={{ width: '100%', height: 50, marginTop: 20, borderRadius: 10 }}
                    shimmerColors={["#f2f2f2", "#e6e6e6", "#f2f2f2"]}
                />
            </View>
        );
    }

    if (!movieDetails) {
        return <Text>Carregando...</Text>;
    }

    return (
        <SafeAreaView className="flex-1">
            <ScrollView className="flex-1 bg-black">
                {/* Imagem de destaque */}

                <View className="relative w-full h-[500px] overflow-hidden rounded-b-3xl">


                    {movieDetails.banner ? (
                        <View>
                            <Image
                                source={{ uri: movieDetails.banner }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                            <View className="w-full mt-1 bg-gray-400/20 absolute justify-center">
                                <View className="w-8 h-8 ml-4 " style={{ flexDirection: "row", alignItems: "center", borderWidth: 2, borderRadius: 100, borderColor: "white" }}>
                                    <MaterialIcons
                                        name="keyboard-arrow-left"
                                        size={24}
                                        color={colors.default["--color-branco"]}
                                        onPress={() => router.back()} />
                                </View>
                            </View>

                        </View>

                    ) : (
                        <Text style={{ color: 'white' }}>Imagem não disponível</Text>
                    )}
                    <LinearGradient
                        colors={["transparent", "black"]}
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 200,
                        }}
                    />
                </View>
                {/* Tags */}
                <View className="flex-row justify-start items-center space-x-2 mt-4 px-4 gap-4">
                    <Text className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md">
                        {movieDetails.rating}
                    </Text>
                    <Text className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md">
                        {movieDetails.category}
                    </Text>
                    <Text className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md">
                        {movieDetails.duration}
                    </Text>
                    <View className="flex-row gap-1 items-center bg-blue-600 px-2 py-1 rounded-md mx-5">
                        <AntDesign name="clockcircleo" size={10} color="white" />
                        <Text className="text-xs text-white ml-auto">{movieDetails.duration}</Text>
                    </View>
                </View>

                {/* Conteúdo principal */}
                <View className="mt-4 px-4">
                    <Text className="text-2xl font-bold text-white mb-2">
                        {movieDetails.title}
                    </Text>
                    <Text className="text-gray-400 text-sm leading-6">
                        {movieDetails.synopsis}
                        <Text className="text-orange-500"> More</Text>
                    </Text>
                </View>

                <Text className="text-white w-[100px] text-center font-semibold mt-4 mx-4 bg-gray-700 py-2 rounded-md">Onde assistir</Text>

                {/* Ícones circulares de plataformas de streaming */}
                <View className="flex-row justify-center space-x-4 mt-2 mb-8 gap-5">
                    {streamingLogos.map((logo, index) => (
                        logo.image_logo ? (
                            <Image
                                key={index}
                                source={{ uri: logo.image_logo }}
                                style={{ width: 40, height: 40, borderRadius: 20 }}
                            />
                        ) : (
                            <Text key={index} className="text-white" >Logo não disponível</Text>
                        )
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
