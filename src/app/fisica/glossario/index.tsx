import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { View, TouchableOpacity, Text, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/db/supabaseClient';
import { SearchBar } from '@/components/geral/SearchBar';
import WordsCloudsGLossario from '@/assets/backgrounds/glossary/wordsCloudsGlossario';
import { colors } from '@/styles/colors';
import { Container } from '@/components/geral/Container';

type GlossarioItem = {
    id: number;
    letra: string;
    termo: string;
    definicao: string;
};

const TermModal = memo(({ isVisible, term, onClose }: { isVisible: boolean; term: GlossarioItem | null; onClose: () => void }) => (
    <Modal animationType="slide" visible={isVisible}>
        <View className="flex-1 justify-center items-center">
            <LinearGradient colors={['rgba(73, 217, 131, 1)', 'rgba(0, 135, 116, 0.6)']} className="w-full h-full flex-1 items-center justify-center">
                <StatusBar style="light" hidden={true} />
                <Text className="text-xl text-white font-bold uppercase bg-[#7141A1] p-2.5 rounded-t-2xl mb-[-5px]">
                    {term?.termo}
                </Text>
                <Text className="text-black bg-white rounded-2xl p-5 m-1.5 text-base">{term?.definicao}</Text>
                <TouchableOpacity className="bg-[#8A76C6] rounded-full p-2.5 mt-5 self-center w-[250px]" onPress={onClose}>
                    <Text className="text-white text-center text-base">Fechar</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    </Modal>
));

const LetrasTabs = memo(({ letras, selectedLetra, onSelectLetra, loading }: { letras: string[]; selectedLetra: string; onSelectLetra: (letra: string) => void; loading: boolean }) => (
    <View className="w-full px-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {loading
                ? Array(10)
                    .fill(null)
                    .map((_, index) => (
                        <ShimmerPlaceholder key={index} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, height: 32, width: 48 }} />
                    ))
                : ['Todos', ...letras].map((letra) => (
                    <TouchableOpacity
                        key={letra}
                        onPress={() => onSelectLetra(letra)}
                        className={`px-4 py-2 mx-1 rounded-full ${selectedLetra === letra ? 'bg-[#7141A1]' : 'bg-[#ECEFF3]'
                            }`}
                    >
                        <Text className={`text-base font-semibold ${selectedLetra === letra ? 'text-white' : 'text-[#818898]'}`}>{letra}</Text>
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
        style={{backgroundColor: colors.light["--color-roxo-100"]}}
            className="h-10 self-end w-32 justify-center rounded-tl-[50px]"
            onPress={() => onShowDetail(item)}
        >
            <Text className="text-white font-semibold text-center">Ver detalhe</Text>
        </TouchableOpacity>
    </View>
));

const Glossario = () => {
    const [selectedLetra, setSelectedLetra] = useState<string>('Todos');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [glossarioData, setGlossarioData] = useState<GlossarioItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState<GlossarioItem | null>(null);

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
        setModalVisible(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalVisible(false);
        setSelectedTerm(null);
    }, []);

    const handleClear = useCallback(() => {
        setSearchQuery('');
    }, []);

    return (

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

            <View className="p-4">
                {loading
                    ? Array(5)
                        .fill(null)
                        .map((_, index) => (
                            <ShimmerPlaceholder key={index} style={{ borderRadius: 16, height: 96, marginBottom: 16 }} />
                        ))
                    : filteredGlossario.map((item) => <GlossarioItem key={item.id} item={item} onShowDetail={handleShowDetail} />)}
            </View>

            <TermModal isVisible={modalVisible} term={selectedTerm} onClose={handleCloseModal} />
        </Container>
    );
};

export default Glossario;
