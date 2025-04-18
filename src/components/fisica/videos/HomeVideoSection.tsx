import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { VideoCard } from './VideoCard';
import { colors } from '@/styles/colors';
import { Ionicons } from '@expo/vector-icons';

// Você pode mover isso para um arquivo de configuração
const FEATURED_VIDEO_IDS = [
    '8TqXHNBpAbk', // Substitua pelos IDs reais do YouTube
    'qF07cgpruPc',
    '_pRrkioBzpM'
];

export function HomeVideoSection() {
    return (
        <View className='mt-3 mb-3'>
            <View className="flex-row justify-between items-center px-4 mb-3">
                <View className="flex-row items-center">
                    <Ionicons name="videocam-outline" size={20} color="#7141A1" />
                    <Text className="text-lg font-semibold ml-2" style={{ color: colors.default["--color-texto"] }}>Assista e Aprenda</Text>
                </View>
                <Link href={{
                    pathname: "/fisica/videos/VideoHome",
                    params: { type: 'Assista e Aprenda' }
                }} asChild>
                <TouchableOpacity>
                    <Text style={{ color: colors.light["--color-roxo-100"] }}>Ver todos</Text>
                </TouchableOpacity>
                </Link>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className='px-2'
            >
                {FEATURED_VIDEO_IDS.map((videoId) => (
                    <View key={videoId} className='gap-3 mr-2 mb-2'>
                        <VideoCard key={videoId} videoId={videoId} />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
