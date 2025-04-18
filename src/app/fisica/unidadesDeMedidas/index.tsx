import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { DataTable } from 'react-native-paper';
import MathJaxSvg from 'react-native-mathjax-svg';
import { Tab, TabView } from '@rneui/themed';
import constantesData from '@/assets/json/constantes.json';
import unidadesData from '@/assets/json/unidades.json';

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

// Componente para renderizar cada constante
const ConstanteCard = React.memo(({ constante }: { constante: Constante }) => (
    <View className='bg-white rounded-2xl mx-2 mb-4 overflow-hidden border border-gray-200 p-3'>
        <Text style={styles.title}>{constante.nome}</Text>
        {[
            { label: 'Símbolo', value: constante.simbolo || "" },
            { label: 'Valor', value: constante.valor },
            { label: 'Incerteza', value: constante.incerteza },
            { label: 'Unidade', value: constante.unidade }
        ].map(({ label, value }) => (
            <View key={label} style={styles.row}>
                <Text style={styles.label}>{label}:</Text>
                <MathJaxSvg
                    fontSize={16}
                    color="#565555"
                    style={styles.mathView}
                >
                    {value}
                </MathJaxSvg>
            </View>
        ))}
    </View>
));

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
            <ScrollView>
                <DataTable>
                    {unidades.map((unidade, index) => (
                        <DataTable.Row key={index}>
                            {[unidade.grandeza, unidade.unidade, unidade.simbolo].map((value, cellIndex) => (
                                <DataTable.Cell key={cellIndex} style={{ justifyContent: 'center' }}>
                                    {value}
                                </DataTable.Cell>
                            ))}
                        </DataTable.Row>
                    ))}
                </DataTable>
            </ScrollView>
        </DataTable>
    </View>
));

const Unidades = () => {
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>('');

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

    return (
        <View className='flex-1 bg-white'>
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
                    <ScrollView className='p-2'>
                        {filteredData.constantes.map((constante, index) => (
                            <ConstanteCard key={index} constante={constante} />
                        ))}
                    </ScrollView>
                </TabView.Item>
            </TabView>
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
    }
});

export default Unidades;