import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Tab } from '@rneui/themed';
import { create, all } from 'mathjs';
import { areas } from '@/components/fisica/calculadora/equations';
import { Container } from "@/components/geral/Container";
import { useTheme } from "@/components/geral/ThemeContext";
import { colors } from '@/styles/colors';
import { ThemedView, ThemedTouchableOpacity } from '@/components/geral/ThemeComponents';

const math = create(all);

// Constantes físicas
const CONSTANTS: Record<string, { value: number; unit: string }> = {
    g: { value: 9.8, unit: 'm/s²' }, // Aceleração da gravidade
    h: { value: 6.62607015e-34, unit: 'J·s' }, // Constante de Planck
    G: { value: 6.67430e-11, unit: 'm³·kg⁻¹·s⁻²' }, // Constante gravitacional
    k: { value: 8.9875517923e9, unit: 'N·m²·C⁻²' }, // Constante de Coulomb
    μ0: { value: 4 * Math.PI * 1e-7, unit: 'N·A⁻²' }, // Permeabilidade magnética do vácuo
    c: { value: 299792458, unit: 'm/s' }, // Velocidade da luz no vácuo
};

const VARIABLE_UNITS: Record<string, string> = {
    s: 'm', // Posição
    s0: 'm', // Posição inicial
    v: 'm/s', // Velocidade
    v0: 'm/s', // Velocidade inicial
    a: 'm/s²', // Aceleração
    t: 's', // Tempo
    d: 'm', // Distância
    h: 'm', // Altura
    m: 'kg', // Massa
    F: 'N', // Força
    Ep: 'J', // Energia Potencial
    Ec: 'J', // Energia Cinética
    // Adicione mais variáveis conforme necessário
};

const CalculatorWithTabs = () => {
    const [selectedArea, setSelectedArea] = useState(0);
    const [selectedSubarea, setSelectedSubarea] = useState(0);
    const [selectedEq, setSelectedEq] = useState<string>('');
    const [unknownVar, setUnknownVar] = useState<string>('');
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [result, setResult] = useState<string>('');
    const [error, setError] = useState<string>('');
    const { isLight } = useTheme();
    const inputRefs = useRef<Record<string, any>>({});
    const isConstant = (variable: string): boolean => {
        return variable.startsWith('CONSTANT_');
    };

    const areaList = useMemo(() => Object.keys(areas), []);
    const subareaList = useMemo(
        () => selectedArea >= 0 && selectedArea < areaList.length
            ? Object.keys(areas[areaList[selectedArea]].subareas)
            : [],
        [selectedArea, areaList]
    );

    const getConstantValue = (variable: string): number => {
        const constantKey = variable.replace('CONSTANT_', '');
        return CONSTANTS[constantKey]?.value || 0;
    };

    const getUnit = (variable: string): string => {
        if (isConstant(variable)) {
            const constantKey = variable.replace('CONSTANT_', '');
            return CONSTANTS[constantKey]?.unit || '';
        }
        return VARIABLE_UNITS[variable] || '';
    };

    const equations = useMemo(() => {
        if (selectedArea >= 0 && selectedArea < areaList.length &&
            selectedSubarea >= 0 && selectedSubarea < subareaList.length) {
            return areas[areaList[selectedArea]].subareas[subareaList[selectedSubarea]].equations;
        }
        return {};
    }, [selectedArea, selectedSubarea, areaList, subareaList]);

    useEffect(() => {
        if (Object.keys(equations).length > 0) {
            const firstEqKey = Object.keys(equations)[0];
            setSelectedEq(firstEqKey);
            setUnknownVar('');
            setInputs({});
            setResult('');
            setError('');
        }
    }, [equations]);

    const solveEquation = (equation: string, knownValues: Record<string, number>, unknown: string): number => {
        try {
            let processedEquation = equation;
            const [leftSide, rightSide] = processedEquation.split('=').map(side => side.trim());
            const expr = `${leftSide} - (${rightSide})`;
            const compiledExpr = math.parse(expr);

            // Substitui os valores conhecidos na equação
            const substituteValues = (node: any) => {
                if (math.isSymbolNode(node) && node.name !== unknown && node.name in knownValues) {
                    return math.parse(String(knownValues[node.name]));
                }
                return node;
            };

            const simplifiedExpr = compiledExpr.transform(substituteValues);

            // Função para avaliar a equação com um valor específico da incógnita
            const evaluate = (value: number): number => {
                const scope = { [unknown]: value };
                return math.evaluate(simplifiedExpr.toString(), scope);
            };

            // Método da bissecção para encontrar a raiz
            const bisection = (a: number, b: number, tolerance: number = 1e-10, maxIterations: number = 100): number => {
                let fa = evaluate(a);
                let fb = evaluate(b);

                if (fa * fb >= 0) {
                    const newA = a - 100;
                    const newB = b + 100;
                    fa = evaluate(newA);
                    fb = evaluate(newB);

                    if (fa * fb >= 0) {
                        throw new Error("Não foi possível encontrar um intervalo contendo a raiz");
                    }
                    return bisection(newA, newB, tolerance, maxIterations);
                }

                let c, fc;
                for (let i = 0; i < maxIterations; i++) {
                    c = (a + b) / 2;
                    fc = evaluate(c);

                    if (Math.abs(fc) < tolerance) {
                        return c;
                    }

                    if (fa * fc < 0) {
                        b = c;
                        fb = fc;
                    } else {
                        a = c;
                        fa = fc;
                    }
                }
                throw new Error("O método não convergiu após o número máximo de iterações");
            };

            // Método de Newton-Raphson para encontrar a raiz
            const newtonRaphson = (initialGuess: number, tolerance: number = 1e-10, maxIterations: number = 50): number => {
                let x = initialGuess;

                for (let i = 0; i < maxIterations; i++) {
                    const fx = evaluate(x);

                    if (Math.abs(fx) < tolerance) {
                        return x;
                    }

                    const h = 1e-6;
                    const fxh = evaluate(x + h);
                    const derivative = (fxh - fx) / h;

                    if (Math.abs(derivative) < 1e-10) {
                        const h2 = 1e-4;
                        const fxh2 = evaluate(x + h2);
                        const derivative2 = (fxh2 - fx) / h2;

                        if (Math.abs(derivative2) < 1e-8) {
                            return bisection(x - 10, x + 10);
                        }

                        const delta = fx / derivative2;
                        x = x - delta;
                    } else {
                        const delta = fx / derivative;
                        x = x - delta;
                    }

                    if (Math.abs(fx / derivative) < tolerance) {
                        return x;
                    }
                }
                return bisection(-100, 100);
            };

            // Tenta usar Newton-Raphson primeiro, e se falhar, usa bissecção
            try {
                return newtonRaphson(1);
            } catch (error) {
                return bisection(-100, 100);
            }
        } catch (err) {
            throw new Error(`Erro ao resolver a equação: ${err instanceof Error ? err.message : String(err)}`);
        }
    };
    const calculate = () => {
        try {
            setError('');
            const equation = equations[selectedEq];
            if (!equation) {
                throw new Error('Equação não selecionada');
            }

            const numericInputs: Record<string, number> = {};

            // Adiciona as constantes ao objeto numericInputs
            equation.variables.forEach(varName => {
                if (isConstant(varName)) {
                    numericInputs[varName] = getConstantValue(varName);
                }
            });

            // Adiciona as variáveis fornecidas pelo usuário
            equation.variables.forEach(varName => {
                if (varName !== unknownVar && !isConstant(varName)) {
                    if (!inputs[varName] || inputs[varName].trim() === '') {
                        throw new Error(`Valor de ${varName.toUpperCase()} não informado`);
                    }
                    const value = parseFloat(inputs[varName]);
                    if (isNaN(value)) {
                        throw new Error(`Valor inválido para ${varName.toUpperCase()}`);
                    }
                    numericInputs[varName] = value;
                }
            });

            const result = solveEquation(equation.formula, numericInputs, unknownVar);
            const roundedResult = Math.abs(result) < 0.0005 ? 0 : result;
            setResult(`${Number(roundedResult).toFixed(3)}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
            setResult('');
        }
    };

    return (
        <Container>
            {/* Abas para Áreas */}
            <Tab
                value={selectedArea}
                onChange={(index) => {
                    setSelectedArea(index);
                    setSelectedSubarea(0);
                }}
                indicatorStyle={{ backgroundColor: 'transparent', height: 0 }}
                scrollable
            >
                {areaList.map((area) => (
                    <Tab.Item
                        key={area}
                        title={area}
                        titleStyle={(active) => ({
                            color: active ? '#fff' : '#818898',
                            fontSize: 14,
                            paddingHorizontal: 5,
                            paddingVertical: 4,
                        })}
                        containerStyle={(active) => ({
                            backgroundColor: active ? '#7141A1' : '#ECEFF3',
                            borderRadius: 50,
                            padding: 0,
                            margin: 2,
                            minHeight: 30,
                            height: 'auto',
                        })} />
                ))}
            </Tab>

            {/* Abas para Subáreas */}
            {subareaList.length > 0 && (
                <Tab
                    value={selectedSubarea}
                    onChange={setSelectedSubarea}
                    indicatorStyle={{ backgroundColor: 'transparent', height: 0 }}
                    scrollable
                >
                    {subareaList.map((subarea) => (
                        <Tab.Item
                            key={subarea}
                            title={subarea}
                            titleStyle={(active) => ({
                                color: active ? '#fff' : '#818898',
                                fontSize: 14,
                                paddingHorizontal: 5,
                                paddingVertical: 4,
                            })}
                            containerStyle={(active) => ({
                                backgroundColor: active ? '#7141A1' : '#ECEFF3',
                                borderRadius: 50,
                                margin: 2,
                                minHeight: 30,
                                height: 'auto',
                            })} />
                    ))}
                </Tab>
            )}

            {/* Seletor de Equação */}
            {Object.keys(equations).length > 0 && selectedEq && (
                <ThemedView
                    className='mt-2 rounded-xl border border-gray-200 border-1 p-3'
                    style={{
                        shadowColor: isLight ? "#000" : "#f9f9f9",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6.68,
                        elevation: 2,
                    }}
                >
                    <Text className='text-base mb-1 font-bold'>Equação:</Text>
                    <Picker
                        selectedValue={selectedEq}
                        onValueChange={value => setSelectedEq(value)}
                    >
                        {Object.entries(equations).map(([key, eq]) => (
                            <Picker.Item key={key} label={eq.name} value={key} />
                        ))}
                    </Picker>
                </ThemedView>
            )}

            {/* Seletor de Incógnita */}
            {selectedEq && equations[selectedEq] && (
                <ThemedView className='mt-2 rounded-xl border border-gray-200 border-1 p-3'
                    style={{
                        shadowColor: isLight ? "#000" : "#f9f9f9",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6.68,
                        elevation: 2,
                    }}>
                    <Text className='text-base mb-1 font-bold'>O que deseja calcular?</Text>
                    <Picker
                        selectedValue={unknownVar}
                        onValueChange={value => setUnknownVar(value)}
                    >
                        {equations[selectedEq]?.variables
                            .filter(varName => !isConstant(varName)) // Filtra constantes
                            .map(varName => (
                                <Picker.Item key={varName} label={varName} value={varName} />
                            ))}
                    </Picker>
                </ThemedView>
            )}

            {/* Campos de Entrada */}
            {selectedEq && equations[selectedEq] && unknownVar && ( // Renderiza apenas se a incógnita estiver definida
    <ThemedView className='mt-2 rounded-xl p-3'
        style={{
            shadowColor: isLight ? "#000" : "#f9f9f9",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 6.68,
            elevation: 2,
        }}
    >
        {equations[selectedEq]?.variables.map((varName, index) =>
            varName !== unknownVar && !isConstant(varName) && ( // Exclui a incógnita e constantes
                <TextInput
                    className='border border-1 border-gray-300 rounded-lg p-3 mb-3 text-base bg-white h-13'
                    key={`${selectedEq}-${varName}`}
                    ref={(ref) => (inputRefs.current[varName] = ref)}
                    placeholder={`${varName.toUpperCase()} (${getUnit(varName)})`}
                    keyboardType="numeric"
                    returnKeyType={index < equations[selectedEq].variables.length - 1 ? 'next' : 'done'}
                    value={inputs[varName] || ''}
                    onChangeText={text => {
                        const cleanedText = text.replace(/[^0-9.-]/g, '');
                        setInputs(prev => ({ ...prev, [varName]: cleanedText }));
                    }}
                    onSubmitEditing={() => {
                        let nextIndex = index + 1;
                        while (nextIndex < equations[selectedEq].variables.length) {
                            const nextVar = equations[selectedEq].variables[nextIndex];
                            if (nextVar !== unknownVar && inputRefs.current[nextVar]) {
                                inputRefs.current[nextVar].focus();
                                break;
                            }
                            nextIndex++;
                        }
                    }}
                />
            )
        )}
    </ThemedView>
)}

            {/* Botão e Resultados */}
            <ThemedTouchableOpacity onPress={calculate} className='p-3 rounded-lg'>
                <Text className='text-center text-lg font-bold text-white'>CALCULAR</Text>
            </ThemedTouchableOpacity>

            <View className='w-full rounded-2xl text-center p-2 h-28 min-h-12 items-center' style={{ backgroundColor: colors.light["--color-roxo-70"] }}>
                <Text className='text-white text-lg font-bold'>Resultado</Text>
                {!!error && <Text style={styles.error}>{error}</Text>}
                {!!result && <Text className='text-3xl font-bold mt-3 text-white'>{result} {getUnit(unknownVar)}</Text>}
            </View>
        </Container>
    );
};



const styles = StyleSheet.create({
    error: {
        fontSize: 16,
        color: '#e74c3c',
        marginTop: 20,
        textAlign: 'center',
    },
});

export default CalculatorWithTabs;