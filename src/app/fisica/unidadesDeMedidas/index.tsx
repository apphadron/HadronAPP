import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { DataTable } from 'react-native-paper';
import MathJaxSvg from 'react-native-mathjax-svg';
import { Tab, TabView } from '@rneui/themed';
import constantesData from '@/assets/json/constantes.json';
import unidadesData from '@/assets/json/unidades.json';
import Sheet from '@/components/geral/BottomSheet';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

type Constante = {
    nome: string;
    simbolo: string | null;
    incerteza: string;
    unidade: string;
    valor: string;
};

type Unidade = {
    grandeza: string;
    tipo: string;
    simbolo: string;
    unidade: string;
};

const TAB_OPTIONS = [
    { id: 0, label: 'Fundamentais' },
    { id: 1, label: 'Derivadas' },
    { id: 2, label: 'Constantes' }
] as const;

// Componente para renderizar cada item da lista de constantes
const ConstanteItem = React.memo(({ constante, onPress }: { constante: Constante, onPress: () => void }) => (
    <TouchableOpacity 
        className='bg-white rounded-2xl mx-2 mb-4 overflow-hidden border border-gray-200 p-3'
        onPress={onPress}
    >
        <Text style={styles.title}>{constante.nome}</Text>
        <View style={styles.row}>
            <Text style={styles.label}>Símbolo:</Text>
            <MathJaxSvg fontSize={16} color="#565555" style={styles.mathView}>
                {constante.simbolo || ""}
            </MathJaxSvg>
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>Valor:</Text>
            <MathJaxSvg fontSize={16} color="#565555" style={styles.mathView}>
                {constante.valor}
            </MathJaxSvg>
        </View>
    </TouchableOpacity>
));

// Componente para mostrar os detalhes completos de uma constante no Sheet
const ConstanteDetalhes = ({ constante }: { constante: Constante }) => (
    <View style={styles.detalhesContainer}>
        <Text style={styles.detalhesTitle}>{constante.nome}</Text>
        {[
            { label: 'Símbolo', value: constante.simbolo || "" },
            { label: 'Valor', value: constante.valor },
            { label: 'Incerteza', value: constante.incerteza },
            { label: 'Unidade', value: constante.unidade }
        ].map(({ label, value }) => (
            <View key={label} style={styles.detalhesRow}>
                <Text style={styles.detalhesLabel}>{label}:</Text>
                <MathJaxSvg
                    fontSize={18}
                    color="#333"
                    style={styles.detalhesMathView}
                >
                    {value}
                </MathJaxSvg>
            </View>
        ))}
    </View>
);

// Componente para renderizar a tabela de unidades
const UnidadesTable = React.memo(({ unidades }: { unidades: Unidade[] }) => (
    <View className='flex-1'>
        <DataTable>
            <DataTable.Header>
                {['Grandeza', 'Unidade', 'Símbolo'].map((title) => (
                    <DataTable.Title key={title} style={{ justifyContent: 'center' }}>
                        {title}
                    </DataTable.Title>
                ))}
            </DataTable.Header>
            <FlatList
                data={unidades}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item: unidade }) => (
                    <DataTable.Row>
                        {[unidade.grandeza, unidade.unidade, unidade.simbolo].map((value, cellIndex) => (
                            <DataTable.Cell key={cellIndex} style={{ justifyContent: 'center' }}>
                                {value}
                            </DataTable.Cell>
                        ))}
                    </DataTable.Row>
                )}
            />
        </DataTable>
    </View>
));

const Unidades = () => {
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedConstante, setSelectedConstante] = useState<Constante | null>(null);
    const [isSheetVisible, setIsSheetVisible] = useState<boolean>(false);

    // Memoize data transformations
    const constantes = useMemo(() =>
        constantesData.map((constante: any) => ({
            ...constante,
            simbolo: constante.simbolo ?? "",
        })) as Constante[],
        []
    );

    const unidades = useMemo(() => unidadesData.unidades as Unidade[], []);

    // Memoize filtered data
    const filteredData = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return {
            fundamentais: unidades.filter(u =>
                u.tipo === 'Fundamental' && u.grandeza.toLowerCase().includes(query)
            ),
            derivadas: unidades.filter(u =>
                u.tipo === 'Derivada' && u.grandeza.toLowerCase().includes(query)
            ),
            constantes: constantes.filter(c =>
                c.nome.toLowerCase().includes(query)
            )
        };
    }, [searchQuery, unidades, constantes]);

    const handleTabChange = useCallback((index: number) => {
        setSelectedTab(index);
    }, []);

    const handleConstantePress = useCallback((constante: Constante) => {
        setSelectedConstante(constante);
        setIsSheetVisible(true);
    }, []);

    const handleCloseSheet = useCallback(() => {
        setIsSheetVisible(false);
    }, []);

    const renderConstanteItem = useCallback(({ item }: { item: Constante }) => (
        <ConstanteItem 
            constante={item} 
            onPress={() => handleConstantePress(item)} 
        />
    ), [handleConstantePress]);

    return (
        <View className='flex-1 bg-white'>
            <GestureHandlerRootView>
            
            <Tab
                value={selectedTab}
                onChange={handleTabChange}
                indicatorStyle={{
                    height: 0,  // Hide default indicator since we're using custom styles
                }}
                containerStyle={{
                    backgroundColor: 'transparent',
                    width: '100%',
                    padding: 0,
                    margin: 0,
                    height: 45,
                }}
                scrollable
                disableIndicator
                buttonStyle={{
                    padding: 0,
                    minHeight: 0,
                    margin: 0,
                }}
                variant="default"
            >
                {TAB_OPTIONS.map(({ id, label }) => (
                    <Tab.Item
                        key={id}
                        title={label}
                        containerStyle={(active) => ({
                            backgroundColor: active ? '#7141A1' : '#ECEFF3',
                            borderRadius: 50,
                            padding: 0,
                            margin: 2,
                            minHeight: 30,
                            height: 'auto',
                        })}
                        titleStyle={(active) => ({
                            color: active ? '#fff' : '#818898',
                            fontSize: 14,
                            paddingHorizontal: 5,
                            paddingVertical: 4,
                        })}
                    />
                ))}
            </Tab>

            <TabView
                value={selectedTab}
                onChange={handleTabChange}
                animationType="spring"
                containerStyle={{ flex: 1 }}
            >
                <TabView.Item style={{ width: '100%', flex: 1 }}>
                    <UnidadesTable unidades={filteredData.fundamentais} />
                </TabView.Item>

                <TabView.Item style={{ width: '100%', flex: 1 }}>
                    <UnidadesTable unidades={filteredData.derivadas} />
                </TabView.Item>

                <TabView.Item style={{ width: '100%', flex: 1 }}>
                    <FlatList
                        data={filteredData.constantes}
                        renderItem={renderConstanteItem}
                        keyExtractor={(_, index) => index.toString()}
                        contentContainerStyle={{ padding: 8 }}
                    />
                </TabView.Item>
            </TabView>

            {isSheetVisible && selectedConstante && (
                <Sheet 
                    onClose={handleCloseSheet}
                    height={450}
                >
                    <ConstanteDetalhes constante={selectedConstante} />
                </Sheet>
                
            )}
            </GestureHandlerRootView>
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        color: 'rgba(0,0,0,0.7)',
        borderBottomWidth: 1,
        borderColor: '#CBCBCB',
        paddingBottom: 5,
        marginBottom: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        alignItems: 'center',
    },
    label: {
        fontSize: 15,
        fontWeight: '400',
        color: '#565555',
    },
    mathView: {
        marginRight: 5,
        fontWeight: 'bold',
    },
    // Estilos para o Sheet de detalhes
    detalhesContainer: {
        flex: 1,
        paddingTop: 10,
    },
    detalhesTitle: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#333',
        borderBottomWidth: 1,
        borderColor: '#CBCBCB',
        paddingBottom: 10,
        marginBottom: 15,
        textAlign: 'center',
    },
    detalhesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    detalhesLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    detalhesMathView: {
        marginRight: 5,
        fontWeight: 'bold',
    }
});

export default Unidades;