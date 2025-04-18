import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, useWindowDimensions, Animated, FlatList } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Sheet } from '@/components/geral/BottomSheet';
import areasData from '@/assets/json/fisicaAreas.json';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import Rover from '@/assets/img/rover.jpg';
import { LinearGradient } from 'expo-linear-gradient';

// Interface para definir o tipo de área
interface Area {
    id: number;
    nome: string;
    icon: string;
    cor: string;
    descricao: string;
    atuacao: string;
    exemplos: string;
    categoria: string[];
}

const AreasFisicaScreen = () => {
    const { width, height } = useWindowDimensions();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [scrollY] = useState(new Animated.Value(0));
    const [activeCategory, setActiveCategory] = useState('Todos');
    const flatListRef = useRef(null);
    const horizontalScrollRef = useRef(null);

    // Definindo as categorias
    const categories = [
        'Todos',
        'Pesquisa',
        'Indústria',
        'Tecnologia',
        'Saúde',
        'Educação'
    ];


    // Função para renderizar cada categoria
    const renderCategory = (category: string) => {
        const isActive = category === activeCategory;
        return (
            <TouchableOpacity
                key={category}
                style={[
                    styles.categoryTab,
                    isActive && styles.categoryTabActive
                ]}
                onPress={() => {
                    setActiveCategory(category);
                    // Reset para o topo quando mudar categoria
                    if (flatListRef.current) {
                        (flatListRef.current as any).scrollToOffset({ offset: 0, animated: true });
                    }
                }}
            >
                <Text
                    style={[
                        styles.categoryText,
                        isActive && styles.categoryTextActive
                    ]}
                >
                    {category}
                </Text>
            </TouchableOpacity>
        );
    };

    // Função para filtrar as áreas
    const getFilteredAreas = () => {
        if (activeCategory === 'Todos') return areasData.areas;

        return areasData.areas.filter((area: Area) => {
            return area.categoria.includes(activeCategory);
        });
    };


    // Calcula a opacidade do título com base no scroll
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });

    // Função para renderizar o ícone correto baseado no nome
    const renderIcon = (iconName: string, color: string, size: number = 24) => {
        switch (iconName) {
            case 'zap': return <MaterialCommunityIcons name="lightning-bolt" size={size} color={color} />;
            case 'thermometer': return <FontAwesome5 name="thermometer-half" size={size} color={color} />;
            case 'atom': return <MaterialCommunityIcons name="atom" size={size} color={color} />;
            case 'target': return <Ionicons name="radio-button-on" size={size} color={color} />;
            case 'eye': return <Ionicons name="eye" size={size} color={color} />;
            case 'activity': return <FontAwesome5 name="heartbeat" size={size} color={color} />;
            case 'cpu': return <MaterialCommunityIcons name="cpu-64-bit" size={size} color={color} />;
            case 'star': return <Ionicons name="star" size={size} color={color} />;
            case 'bar-chart-2': return <Ionicons name="bar-chart" size={size} color={color} />;
            case 'volume-2': return <Ionicons name="volume-high" size={size} color={color} />;
            case 'grid': return <Ionicons name="grid" size={size} color={color} />;
            case 'trending-up': return <Ionicons name="trending-up" size={size} color={color} />;
            case 'cloud': return <Ionicons name="cloud" size={size} color={color} />;
            case 'sun': return <Ionicons name="sunny" size={size} color={color} />;
            case 'minimize-2': return <MaterialCommunityIcons name="arrow-collapse" size={size} color={color} />;
            case 'layers': return <Ionicons name="layers" size={size} color={color} />;
            case 'movement': return <MaterialCommunityIcons name="atom-variant" size={size} color={color} />;
            case 'galaxy': return <MaterialCommunityIcons name="star-shooting" size={size} color={color} />;
            case 'nucleus': return <MaterialCommunityIcons name="atom" size={size} color={color} />;
            case 'dna': return <MaterialCommunityIcons name="dna" size={size} color={color} />;
            case 'tool': return <Ionicons name="construct" size={size} color={color} />;
            case 'sliders': return <Ionicons name="options" size={size} color={color} />;
            case 'search': return <Ionicons name="search" size={size} color={color} />;
            case 'book-open': return <Ionicons name="book" size={size} color={color} />;
            case 'globe': return <Ionicons name="globe" size={size} color={color} />;
            case 'navigation': return <Ionicons name="navigate" size={size} color={color} />;
            case 'check-circle': return <Ionicons name="checkmark-circle" size={size} color={color} />;
            case 'code': return <Ionicons name="code-slash" size={size} color={color} />;
            case 'heart': return <Ionicons name="heart" size={size} color={color} />;
            case 'briefcase': return <Ionicons name="briefcase" size={size} color={color} />;
            case 'box': return <Ionicons name="cube" size={size} color={color} />;
            default: return <MaterialCommunityIcons name="atom" size={size} color={color} />;
        }
    };

    // Função para abrir o modal com a área selecionada
    const openAreaDetails = (area: Area) => {
        setSelectedArea(area);
        setIsOpen(true);
    };


    // Renderiza um item na grade destacada
    const renderFeaturedItem = (item: Area, index: number) => {
        const isFirst = index === 0;
        return (
            <TouchableOpacity
                style={[
                    styles.featuredCard,
                    { marginLeft: isFirst ? 8 : 0 }
                ]}
                onPress={() => openAreaDetails(item)}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[item.cor, adjustColor(item.cor, -30)]}
                    style={styles.featuredGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View className='flex-row gap-2'>
                        <View style={styles.featuredIconContainer}>
                            {renderIcon(item.icon, '#fff', 28)}
                        </View>
                        <Text style={styles.featuredTitle} numberOfLines={2}>{item.nome}</Text>
                    </View>

                    <Text style={styles.featuredDescription} numberOfLines={2}>{item.descricao}</Text>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    // Renderiza um item na grade normal
    const renderGridItem = ({ item }: { item: Area }) => {
        return (
            <TouchableOpacity
                style={styles.gridCard}
                onPress={() => openAreaDetails(item)}
                activeOpacity={0.7}
            >
                <View style={styles.gridCardContent}>
                    <View style={[styles.iconContainer, { backgroundColor: item.cor }]}>
                        {renderIcon(item.icon, '#fff', 22)}
                    </View>
                    <View style={styles.gridCardTextContainer}>
                        <Text style={styles.gridCardTitle} numberOfLines={1}>{item.nome}</Text>
                        <Text style={styles.gridCardDescription} numberOfLines={2}>{item.descricao}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Função para ajustar a cor (escurecer ou clarear)
    const adjustColor = (hex: string, amount: number) => {
        // Remove o # se existir
        hex = hex.replace('#', '');

        // Converte para RGB
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        // Ajusta os valores
        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));

        // Converte de volta para hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    // Filtrar áreas em destaque (usando as 5 primeiras como exemplo)
    const featuredAreas = areasData.areas.slice(0, 5);
    const filteredAreas = getFilteredAreas();

    // Cálculo para definir o número de colunas com base na largura da tela
    const numColumns = width > 768 ? 3 : width > 480 ? 2 : 1;

    const primaryColor = '#3d5af1';
    const accentColor = '#22d1ee';

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <GestureHandlerRootView style={{ flex: 1 }}>
                {/* Header com efeito parallax */}
                <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
                    <BlurView intensity={90} style={styles.blurHeader}>
                        <Text style={styles.headerTitle}>Áreas da Física</Text>
                    </BlurView>
                </Animated.View>

                {/* Hero section */}
                <View style={styles.heroContainer}>
                    <Image
                        source={Rover}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                        style={styles.heroOverlay}
                    >
                        <Text style={styles.heroTitle}>Áreas da Física</Text>
                        <Text style={styles.heroSubtitle}>Explore os diversos campos de estudo e atuação profissional</Text>
                    </LinearGradient>
                </View>

                <Animated.FlatList
                    ref={flatListRef}
                    data={filteredAreas}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={numColumns}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContainer}
                    columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
                    renderItem={renderGridItem}
                    ListHeaderComponent={() => (
                        <>
                            {/* Menu de categorias */}
                            <ScrollView
                                ref={horizontalScrollRef}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoriesContainer}
                            >
                                {categories.map(renderCategory)}
                            </ScrollView>

                            {/* Seção Destaques */}
                            <View style={styles.featuredSection}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Destaques</Text>
                                    <TouchableOpacity>
                                        <Text style={styles.seeAllText}>Ver todos</Text>
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.featuredScrollContainer}
                                >
                                    {featuredAreas.map((area, index) => renderFeaturedItem(area, index))}
                                </ScrollView>
                            </View>

                            {/* Título da seção principal */}
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>
                                    {activeCategory === 'Todos' ? 'Todas as Áreas' : `Áreas: ${activeCategory}`}
                                </Text>
                                <Text style={styles.sectionSubtitle}>
                                    {filteredAreas.length} áreas encontradas
                                </Text>
                            </View>
                        </>
                    )}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                />

                {isOpen && selectedArea && (
                    <Sheet
                        onClose={() => setIsOpen(false)}
                        height={500}
                    >
                        <View style={styles.sheetContent}>
                            <View style={styles.sheetTopBar}>
                                <View style={styles.sheetHandle} />
                            </View>
                            <View style={styles.sheetHeader}>
                                <LinearGradient
                                    colors={[selectedArea.cor, adjustColor(selectedArea.cor, -30)]}
                                    style={styles.sheetIconContainer}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    {renderIcon(selectedArea.icon, '#fff', 32)}
                                </LinearGradient>
                                <Text style={styles.sheetTitle}>{selectedArea.nome}</Text>
                            </View>

                            <ScrollView
                                style={styles.sheetBody}
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.section}>
                                    <View style={styles.sectionHeaderRow}>
                                        <Ionicons name="information-circle" size={22} color={selectedArea.cor} />
                                        <Text style={[styles.sectionTitle, { color: selectedArea.cor }]}>Descrição</Text>
                                    </View>
                                    <Text style={styles.sectionText}>{selectedArea.descricao}</Text>
                                </View>

                                <View style={styles.section}>
                                    <View style={styles.sectionHeaderRow}>
                                        <Ionicons name="briefcase" size={22} color={selectedArea.cor} />
                                        <Text style={[styles.sectionTitle, { color: selectedArea.cor }]}>Área de Atuação</Text>
                                    </View>
                                    <Text style={styles.sectionText}>{selectedArea.atuacao}</Text>
                                </View>

                                <View style={styles.section}>
                                    <View style={styles.sectionHeaderRow}>
                                        <Ionicons name="flask" size={22} color={selectedArea.cor} />
                                        <Text style={[styles.sectionTitle, { color: selectedArea.cor }]}>Exemplos de Aplicação</Text>
                                    </View>
                                    <Text style={styles.sectionText}>{selectedArea.exemplos}</Text>
                                </View>
                            </ScrollView>
                        </View>
                    </Sheet>
                )}
            </GestureHandlerRootView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    animatedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    blurHeader: {
        height: 60,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    heroContainer: {
        height: 220,
        width: '100%',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    heroOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        justifyContent: 'flex-end',
        padding: 20,
        paddingBottom: 30,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    heroSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    flatListContainer: {
        paddingBottom: 40,
    },
    columnWrapper: {
        paddingHorizontal: 15,
        justifyContent: 'space-between',
    },
    categoriesContainer: {
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    categoryTabActive: {
        backgroundColor: '#3d5af1',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    categoryTextActive: {
        color: '#fff',
    },
    featuredSection: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3d5af1',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#757575',
    },
    featuredScrollContainer: {
        paddingBottom: 15,
    },
    featuredCard: {
        width: 220,
        height: 130,
        marginRight: 15,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    featuredGradient: {
        flex: 1,
        padding: 16,
        gap: 5
    },
    featuredIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        //marginBottom: 12,
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        //marginBottom: 4,
    },
    featuredDescription: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
    },
    gridCard: {
        flex: 1,
        marginHorizontal: 5,
        marginVertical: 8,
        borderRadius: 16,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        overflow: 'hidden',
    },
    gridCardContent: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
    },
    gridCardTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridCardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    gridCardDescription: {
        fontSize: 12,
        color: '#666',
    },
    sheetContent: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    sheetTopBar: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#e0e0e0',
    },
    sheetHeader: {
        padding: 20,
        alignItems: 'center',
    },
    sheetIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    sheetTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    sheetBody: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#555',
    }
});

export default AreasFisicaScreen;