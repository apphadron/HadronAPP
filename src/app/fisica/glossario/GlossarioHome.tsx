import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { View, TouchableOpacity, Text, Modal, ScrollView } from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/db/supabaseClient';
import { SearchBar } from '@/components/geral/SearchBar';
import { colors } from '@/styles/colors';
import { Container } from '@/components/geral/Container';
import Sheet from '@/components/geral/BottomSheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


type GlossarioItem = {
    id: number;
    letra: string;
    termo: string;
    definicao: string;
};


const LetrasTabs = memo(({ letras, selectedLetra, onSelectLetra, loading }: { letras: string[]; selectedLetra: string; onSelectLetra: (letra: string) => void; loading: boolean }) => (
    <View className="w-full px-2 mt-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-2">
            {loading
                ? Array(10)
                    .fill(null)
                    .map((_, index) => (
                        <ShimmerPlaceholder key={index} style={{ margin: 4, borderRadius: 50, height: 36, width: 48 }} />
                    ))
                : ['Todos', ...letras].map((letra) => (
                    <TouchableOpacity
                        key={letra}
                        onPress={() => onSelectLetra(letra)}
                        className={`px-5 py-2 mx-1.5 rounded-full shadow-sm ${selectedLetra === letra
                                ? 'bg-[#7141A1]'
                                : 'bg-[#ECEFF3]'
                            }`}
                    >
                        <Text className={`text-base font-semibold ${selectedLetra === letra ? 'text-white' : 'text-[#818898]'
                            }`}>
                            {letra}
                        </Text>
                    </TouchableOpacity>
                ))}
        </ScrollView>
    </View>
));

const GlossarioItem = memo(({ item, onShowDetail }: { item: GlossarioItem; onShowDetail: (item: GlossarioItem) => void }) => (
    <View className="bg-white rounded-2xl mx-2 mb-4 overflow-hidden border border-gray-200">
        <View className="p-4">
            <Text className="text-xl text-[#505050] uppercase mb-2">{item.termo}</Text>
            <Text className="text-sm text-[#505050]">
                {item.definicao.length > 200 ? `${item.definicao.substring(0, 200)}...` : item.definicao}
            </Text>
        </View>
        <TouchableOpacity
            style={{ backgroundColor: colors.light["--color-roxo-100"] }}
            className="h-10 self-end w-32 justify-center rounded-tl-[50px]"
            onPress={() => onShowDetail(item)}
        >
            <Text className="text-white font-semibold text-center">Ver detalhe</Text>
        </TouchableOpacity>
    </View>
));

// Componente de mensagem vazia para quando não há resultados
const EmptyResults = ({ searchQuery }: { searchQuery: string }) => (
    <View className="items-center justify-center py-10">
        <View className="w-16 h-16 bg-[#F5F7FA] rounded-full items-center justify-center mb-4">
            <Text className="text-2xl">🔍</Text>
        </View>
        <Text className="text-lg text-[#505050] font-semibold text-center">
            Nenhum resultado encontrado
        </Text>
        <Text className="text-sm text-[#818898] text-center mt-1">
            Não encontramos resultados para "{searchQuery}"
        </Text>
        <TouchableOpacity
            className="mt-4 bg-[#7141A1] px-4 py-2 rounded-full"
        >
            <Text className="text-white">Limpar busca</Text>
        </TouchableOpacity>
    </View>
);


const Glossario = () => {
    const [selectedLetra, setSelectedLetra] = useState<string>('Todos');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [glossarioData, setGlossarioData] = useState<GlossarioItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedTerm, setSelectedTerm] = useState<GlossarioItem | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        const fetchGlossario = async () => {
            try {
                setLoading(true);
                const cachedData = await AsyncStorage.getItem('glossarioData');
                if (cachedData) {
                    setGlossarioData(JSON.parse(cachedData));
                } else {
                    const { data, error } = await supabase.from('glossary').select('*');
                    if (error) throw error;
                    if (data) {
                        setGlossarioData(data);
                        await AsyncStorage.setItem('glossarioData', JSON.stringify(data));
                    }
                }
            } catch (err) {
                console.error('Erro ao carregar o glossário:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGlossario();
    }, []);

    const letras = useMemo(() => [...new Set(glossarioData.map((item) => item.letra))].sort(), [glossarioData]);

    const filteredGlossario = useMemo(
        () =>
            glossarioData.filter(
                (item) =>
                    (selectedLetra === 'Todos' || item.letra === selectedLetra) &&
                    (searchQuery === '' || item.termo.toLowerCase().includes(searchQuery.toLowerCase()))
            ),
        [glossarioData, selectedLetra, searchQuery]
    );

    const handleShowDetail = useCallback((item: GlossarioItem) => {
        setSelectedTerm(item);
        setIsSheetOpen(true);
    }, []);

    const handleSheetClose = useCallback(() => {
        setIsSheetOpen(false);
        setTimeout(() => setSelectedTerm(null), 300);
    }, []);

    const handleClear = useCallback(() => {
        setSearchQuery('');
    }, []);

    return (
        <View className="flex-1 bg-white items-center justify-center">
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Container className="gap-3">
                    <View className="flex-1 items-center">
                        <Text className="text-xl text-center font-poppins-medium text-black/70">
                            Busque por termos e encontre suas definições e exemplos
                        </Text>
                    </View>

                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        containerStyle={{ borderWidth: 1, borderColor: '#ECEFF3', backgroundColor: 'transparent', borderRadius: 50 }}
                        inputStyle={{ fontSize: 14, color: 'black' }}
                        iconStyle={{ backgroundColor: 'transparent' }}
                        placeholderStyle={{ color: 'black' }}
                        iconColor="#a7a7a7"
                    />

                    <LetrasTabs letras={letras} selectedLetra={selectedLetra} onSelectLetra={setSelectedLetra} loading={loading} />

                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        <View className="p-4">
                            {loading ? (
                                Array(5)
                                    .fill(null)
                                    .map((_, index) => (
                                        <ShimmerPlaceholder
                                            key={index}
                                            style={{ borderRadius: 16, height: 140, marginBottom: 16 }}
                                        />
                                    ))
                            ) : filteredGlossario.length > 0 ? (
                                filteredGlossario.map((item) => (
                                    <GlossarioItem
                                        key={item.id}
                                        item={item}
                                        onShowDetail={handleShowDetail}
                                    />
                                ))
                            ) : (
                                <EmptyResults searchQuery={searchQuery} />
                            )}
                        </View>
                    </ScrollView>
                </Container>

                {isSheetOpen && selectedTerm && (
                    <Sheet
                        onClose={handleSheetClose}
                        height={500}
                    >
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-xl text-black font-bold uppercase rounded-t-2xl">
                                {selectedTerm.termo}
                            </Text>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text className="text-black bg-white rounded-2xl mt-3 text-base">{selectedTerm.definicao}</Text>
                            </ScrollView>
                        </View>
                    </Sheet>
                )}
            </GestureHandlerRootView>
        </View>
    );
};

export default Glossario;
