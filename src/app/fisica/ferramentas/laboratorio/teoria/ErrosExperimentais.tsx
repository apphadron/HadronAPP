import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export default function ErrosExperimentaisScreen() {
    const router = useRouter();
    const [expandedSection, setExpandedSection] = useState('intro');

    const toggleSection = (section: string) => {
        if (expandedSection === section) {
            setExpandedSection('');
        } else {
            setExpandedSection(section);
        }
    };

    const sections = [
        {
            id: 'intro',
            title: 'O que são erros experimentais?',
            content: `Erros experimentais representam a diferença entre um valor medido e o valor "verdadeiro" de uma grandeza física. Em toda medição experimental, existem fatores que afetam o resultado, tornando impossível obter o valor exato. A compreensão e análise dos erros são fundamentais para validar resultados experimentais e determinar a confiabilidade das medições.`
        },
        {
            id: 'tipos',
            title: 'Tipos de erros',
            content: `Existem principalmente dois tipos de erros:

1. Erros sistemáticos: São erros que afetam todas as medições da mesma maneira, causando um desvio constante do valor verdadeiro. Podem ser causados por:
   • Calibração incorreta de instrumentos
   • Método de medição inadequado
   • Condições ambientais não controladas
   • Erros pessoais consistentes

2. Erros aleatórios: São flutuações imprevisíveis nas medições que variam de uma medição para outra, mesmo quando feitas nas mesmas condições. Causas incluem:
   • Limitação na precisão dos instrumentos
   • Variações imperceptíveis nas condições experimentais
   • Flutuações estatísticas naturais

3. Erros grosseiros: São erros causados por falhas evidentes no procedimento experimental, como leitura incorreta, registro equivocado ou uso inadequado do equipamento.`
        },
        {
            id: 'medidas',
            title: 'Medidas de erros',
            content: `Para quantificar erros experimentais, utilizamos:

• Erro absoluto: É a diferença entre o valor medido e o valor verdadeiro (ou aceito)
  Δx = |xmedido - xverdadeiro|

• Erro relativo: É o erro absoluto dividido pelo valor verdadeiro, frequentemente expresso em porcentagem
  εr = (Δx/xverdadeiro) × 100%

• Desvio padrão (σ): Quantifica a dispersão das medidas em relação à média
  σ = √[Σ(xi - x̄)² / (n-1)]

• Erro padrão da média: Estima a incerteza na determinação do valor médio
  σx̄ = σ/√n`
        },
        {
            id: 'minimizacao',
            title: 'Minimização de erros',
            content: `Para minimizar erros experimentais:

• Erros sistemáticos: Podem ser reduzidos por:
  - Calibração adequada dos instrumentos
  - Controle das condições ambientais
  - Técnicas de medição apropriadas
  - Procedimentos de correção

• Erros aleatórios: Podem ser reduzidos por:
  - Aumentar o número de medições
  - Usar instrumentos mais precisos
  - Controlar melhor as condições experimentais
  - Aplicar métodos estatísticos para análise

• Boas práticas gerais:
  - Documentar detalhadamente o procedimento experimental
  - Registrar todas as condições do experimento
  - Verificar os instrumentos antes do uso
  - Realizar medições repetidas`
        },
        {
            id: 'significado',
            title: 'Significado físico dos erros',
            content: `Compreender o significado físico dos erros é essencial para:

• Validação de teorias: Os erros determinam se os resultados experimentais confirmam ou refutam uma teoria física.

• Comparação entre experimentos: Permite avaliar se dois resultados experimentais são estatisticamente compatíveis.

• Qualidade da medição: O tamanho relativo do erro indica a qualidade e confiabilidade da medição.

• Limites de precisão: Ajuda a entender os limites fundamentais de precisão em medições físicas.

• Tomada de decisões: Em aplicações práticas, os erros influenciam decisões baseadas em medições.

Uma medida sem a estimativa do erro associado não tem significado científico completo, pois não permite avaliar sua confiabilidade.`
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen
                options={{
                    title: 'Erros Experimentais',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: '#f9fafb' },
                }}
            />
            <StatusBar style="dark" />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 40 }}
                className="flex-1 px-4 pt-2"
            >
                <View className="bg-blue-500 rounded-2xl p-5 mb-6">
                    <Text className="text-white text-2xl font-bold mb-2">Erros Experimentais</Text>
                    <Text className="text-blue-100 mb-4">
                        Compreenda como surgem os erros em medições e como quantificá-los corretamente.
                    </Text>
                    <View className="flex-row">
                        <View className="bg-white/20 self-start px-3 py-1 rounded-full mr-2">
                            <Text className="text-white text-xs font-medium">Física Experimental</Text>
                        </View>
                        <View className="bg-white/20 self-start px-3 py-1 rounded-full">
                            <Text className="text-white text-xs font-medium">Metrologia</Text>
                        </View>
                    </View>
                </View>

                {sections.map(section => (
                    <View key={section.id} className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm">
                        <TouchableOpacity
                            className="flex-row items-center justify-between p-4"
                            onPress={() => toggleSection(section.id)}
                        >
                            <Text className="text-lg font-semibold text-gray-800">{section.title}</Text>
                            <Feather
                                name={expandedSection === section.id ? "chevron-up" : "chevron-down"}
                                size={20}
                                color="#4b5563"
                            />
                        </TouchableOpacity>

                        {expandedSection === section.id && (
                            <View className="p-4 pt-0 border-t border-gray-100">
                                <Text className="text-gray-700 leading-6">{section.content}</Text>
                            </View>
                        )}
                    </View>
                ))}

                <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
                    <Text className="text-xl font-bold text-gray-800 mb-3">Ferramentas relacionadas</Text>

                    <TouchableOpacity
                        className="flex-row items-center bg-gray-100 p-3 rounded-lg mb-3"
                        onPress={() => router.push('/laboratorio/calculadoras/propagacao-erro')}
                    >
                        <View className="bg-blue-100 h-10 w-10 rounded-full items-center justify-center mr-3">
                            <MaterialCommunityIcons name="calculator-variant" size={20} color="#2563eb"/>
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-800 font-medium">Calculadora de Propagação de Erros</Text>
                            <Text className="text-gray-600 text-sm">Calcule como os erros se propagam em operações</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#4b5563" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center bg-gray-100 p-3 rounded-lg mb-3"
                        onPress={() => router.push('/laboratorio/calculadoras/desvio-padrao')}
                    >
                        <View className="bg-blue-100 h-10 w-10 rounded-full items-center justify-center mr-3">
                            <MaterialCommunityIcons name="sigma" size={20} color="#2563eb" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-800 font-medium">Calculadora de Desvio Padrão</Text>
                            <Text className="text-gray-600 text-sm">Calcule o desvio padrão e erro padrão da média</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#4b5563" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center bg-gray-100 p-3 rounded-lg"
                        onPress={() => router.push('/laboratorio/teoria/propagacao-erros')}
                    >
                        <View className="bg-blue-100 h-10 w-10 rounded-full items-center justify-center mr-3">
                            <MaterialCommunityIcons name="book-open-variant" size={20} color="#2563eb" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-800 font-medium">Teoria: Propagação de Erros</Text>
                            <Text className="text-gray-600 text-sm">Entenda como os erros se propagam em cálculos</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#4b5563" />
                    </TouchableOpacity>
                </View>

                <View className="bg-white rounded-2xl p-4 shadow-sm">
                    <Text className="text-xl font-bold text-gray-800 mb-3">Material complementar</Text>

                    <View className="bg-gray-100 p-4 rounded-lg">
                        <Text className="text-gray-700 mb-4">
                            Para aprofundar seus conhecimentos sobre erros experimentais,
                            recomendamos a consulta às seguintes referências:
                        </Text>

                        <View className="mb-2">
                            <Text className="text-gray-800 font-medium">• J. R. Taylor, "An Introduction to Error Analysis"</Text>
                            <Text className="text-gray-600 text-sm">Uma referência clássica sobre análise de erros experimentais</Text>
                        </View>

                        <View className="mb-2">
                            <Text className="text-gray-800 font-medium">• BIPM, "Guide to the Expression of Uncertainty in Measurement (GUM)"</Text>
                            <Text className="text-gray-600 text-sm">Guia internacional para expressão de incertezas</Text>
                        </View>

                        <View>
                            <Text className="text-gray-800 font-medium">• H. H. Ku, "Notes on the Use of Propagation of Error Formulas"</Text>
                            <Text className="text-gray-600 text-sm">Artigo sobre as fórmulas de propagação de erros</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}