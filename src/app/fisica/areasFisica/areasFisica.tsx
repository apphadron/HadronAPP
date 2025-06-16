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

// Interface definitions
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
// Helper functions
const adjustColor = (hex: string, amount: number): string => {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
// Componente de Icone para renderização consistente de icones
const AreaIcon = ({ iconName, color, size = 24 }: { iconName: string; color: string; size?: number }) => {
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
}
// Componente de Categorias
const CategoryTabs = ({ categories, activeCategory, setActiveCategory, flatListRef }: { categories: string[], activeCategory: string, setActiveCategory: (category: string) => void, flatListRef: React.RefObject<null> }) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
        >
            {categories.map((category) => {
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
            })}
        </ScrollView>
    );
};
// Featured area card component
const FeaturedAreaCard = ({ area, index, onPress }: { area: any, index: number, onPress: (area: any) => void }) => {
    const isFirst = index === 0;
    return (
        <TouchableOpacity
            style={[
                styles.featuredCard,
                { marginLeft: isFirst ? 8 : 0 }
            ]}
            onPress={() => onPress(area)}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={[area.cor, adjustColor(area.cor, -30)]}
                style={styles.featuredGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View className='flex-row gap-2'>
                    <View style={styles.featuredIconContainer}>
                        <AreaIcon iconName={area.icon} color="#fff" size={28} />
                    </View>
                    <Text style={styles.featuredTitle} numberOfLines={2}>{area.nome}</Text>
                </View>

                <Text style={styles.featuredDescription} numberOfLines={2}>{area.descricao}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};
// Componente do item da grade
const AreaGridItem = ({ item, onPress }: { item: any, onPress: (item: any) => void }) => {
    return (
        <TouchableOpacity
            style={styles.gridCard}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.gridCardContent}>
                <View style={[styles.iconContainer, { backgroundColor: item.cor }]}>
                    <AreaIcon iconName={item.icon} color="#fff" size={22} />
                </View>
                <View style={styles.gridCardTextContainer}>
                    <Text style={styles.gridCardTitle} numberOfLines={1}>{item.nome}</Text>
                    <Text style={styles.gridCardDescription} numberOfLines={2}>{item.descricao}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};
// Componente de detalhes da área
const AreaDetailsSheet = ({ area, isOpen, onClose }: { area: any, isOpen: boolean, onClose: () => void }) => {
    if (!isOpen || !area) return null;
    
    return (
        <Sheet
            onClose={onClose}
            height={500}
        >
            <View style={styles.sheetContent}>
                <View style={styles.sheetHeader} className='flex-row'>
                    <Text style={styles.sheetTitle}>{area.nome}</Text>
                </View>

                <ScrollView
                    style={styles.sheetBody}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Ionicons name="information-circle" size={22} color={area.cor} />
                            <Text style={[styles.sectionTitle, { color: area.cor }]}>Descrição</Text>
                        </View>
                        <Text style={styles.sectionText}>{area.descricao}</Text>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Ionicons name="briefcase" size={22} color={area.cor} />
                            <Text style={[styles.sectionTitle, { color: area.cor }]}>Área de Atuação</Text>
                        </View>
                        <Text style={styles.sectionText}>{area.atuacao}</Text>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Ionicons name="flask" size={22} color={area.cor} />
                            <Text style={[styles.sectionTitle, { color: area.cor }]}>Exemplos de Aplicação</Text>
                        </View>
                        <Text style={styles.sectionText}>{area.exemplos}</Text>
                    </View>
                </ScrollView>
            </View>
        </Sheet>
    );
};
// Seção de áreas destacadas
const FeaturedAreas = ({ areas, onAreaPress }: { areas: any[], onAreaPress: (area: any) => void }) => {
    return (
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
                {areas.map((area: any, index: number) => (
                    <FeaturedAreaCard 
                        key={`featured-${area.id}`} 
                        area={area} 
                        index={index} 
                        onPress={onAreaPress} 
                    />
                ))}
            </ScrollView>
        </View>
    );
};
// Seção do Header com seção hero
const Header = ({ scrollY }: { scrollY: Animated.Value }) => {
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });

    return (
        <>
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
        </>
    );
};

// Main component
const AreasFisicaScreen = () => {
    const { width } = useWindowDimensions();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState(null);
    const [scrollY] = useState(new Animated.Value(0));
    const [activeCategory, setActiveCategory] = useState('Todos');
    const flatListRef = useRef(null);

    // Categories list
    const categories = [
        'Todos',
        'Pesquisa',
        'Indústria',
        'Tecnologia',
        'Saúde',
        'Educação'
    ];

    // Filter areas based on active category
    const getFilteredAreas = () => {
        if (activeCategory === 'Todos') return areasData.areas;
        return areasData.areas.filter((area) => area.categoria.includes(activeCategory));
    };
    const openAreaDetails = (area: any) => {
        setSelectedArea(area);
        setIsOpen(true);
    };

    // Get areas for display
    const featuredAreas = areasData.areas.slice(0, 5);
    const filteredAreas = getFilteredAreas();
    const numColumns = width > 768 ? 3 : width > 480 ? 2 : 1;

    // List header component
    const ListHeader = () => (
        <>
            <CategoryTabs 
                categories={categories} 
                activeCategory={activeCategory} 
                setActiveCategory={setActiveCategory} 
                flatListRef={flatListRef} 
            />

            <FeaturedAreas 
                areas={featuredAreas} 
                onAreaPress={openAreaDetails} 
            />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    {activeCategory === 'Todos' ? 'Todas as Áreas' : `Áreas: ${activeCategory}`}
                </Text>
                <Text style={styles.sectionSubtitle}>
                    {filteredAreas.length} áreas encontradas
                </Text>
            </View>
        </>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Header scrollY={scrollY} />

                <Animated.FlatList
                    ref={flatListRef}
                    data={filteredAreas}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={numColumns}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContainer}
                    columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
                    renderItem={({ item }) => <AreaGridItem item={item} onPress={openAreaDetails} />}
                    ListHeaderComponent={ListHeader}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                />

                <AreaDetailsSheet 
                    area={selectedArea} 
                    isOpen={isOpen} 
                    onClose={() => setIsOpen(false)} 
                />
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
        height: 150,
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
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
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
        padding: 5,
        alignItems: 'center',
    },
    sheetIconContainer: {
        width: 50,
        height: 50,
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
        padding: 10,
    },
    section: {
        marginBottom: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderTopWidth: 1
    },
    sectionText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#555',
    }
});

export default AreasFisicaScreen;