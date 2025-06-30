import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, View, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Tab } from '@rneui/themed';
import { create, all } from 'mathjs';
import { areas } from '@/components/fisica/calculadora/equations';
import { Container } from "@/components/geral/Container";
import { useTheme } from "@/components/geral/ThemeContext";
import { colors } from '@/styles/colors';
import { ThemedView, ThemedTouchableOpacity } from '@/components/geral/ThemeComponents';
import { AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';


const math = create(all);

// Constantes físicas
const CONSTANTS: Record<string, { value: number; unit: string }> = {
    g: { value: 9.80665, unit: 'm/s²' }, // Aceleração da gravidade padrão
    h: { value: 6.62607015e-34, unit: 'J·s' }, // Constante de Planck
    G: { value: 6.67430e-11, unit: 'm³·kg⁻¹·s⁻²' }, // Constante gravitacional
    k: { value: 8.9875517923e9, unit: 'N·m²·C⁻²' }, // Constante de Coulomb
    μ0: { value: 4 * Math.PI * 1e-7, unit: 'N·A⁻²' }, // Permeabilidade magnética do vácuo
    c: { value: 299792458, unit: 'm/s' }, // Velocidade da luz no vácuo
    R: { value: 8.314462618, unit: 'J·mol⁻¹·K⁻¹' }, // Constante universal dos gases
    pi: { value: Math.PI, unit: '' }, // Número π
    e: { value: Math.E, unit: '' }, // Número de Euler
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
    const [methodUsed, setMethodUsed] = useState<string>('');
    const exprParsingCache = useRef<Record<string, any>>({});


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


    /**
     * Resolve uma equação usando primeiro métodos simbólicos e, se necessário, 
     * métodos numéricos como fallback.
     * 
     * @param equation String da equação no formato "leftSide = rightSide"
     * @param knownValues Objeto com os valores conhecidos das variáveis
     * @param unknown A variável a ser calculada
     * @returns O valor calculado para a variável desconhecida
     */

    // Adicione esta função para substituir funções trigonométricas
    const preprocessTrigonometricFunctions = (expr: string): string => {
        // Converte graus para radianos nas funções trigonométricas
        const trigFunctions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan'];

        let processedExpr = expr;
        for (const func of trigFunctions) {
            const regex = new RegExp(`${func}\\(([^)]+)\\)`, 'g');
            processedExpr = processedExpr.replace(regex, `${func}(($1) * pi / 180)`);
        }

        return processedExpr;
    };

    const solveEquation = (equation: string, knownValues: Record<string, number>, unknown: string): { result: number, method: string } => {
        try {
            // Pré-processa a equação
            let processedEquation = preprocessTrigonometricFunctions(equation);

            // Tenta resolver simbolicamente
            const symbolicResult = solveSymbolically(processedEquation, knownValues, unknown);
            if (symbolicResult !== null && isFinite(symbolicResult) && !isNaN(symbolicResult)) {
                return { result: symbolicResult, method: "Substituição direta" };
            }

            // Se a resolução simbólica falhar, usa métodos numéricos
            const numericResult = solveNumerically(processedEquation, knownValues, unknown);
            return { result: numericResult, method: "Métodos numéricos" };
        } catch (err) {
            throw new Error(`Erro ao resolver a equação: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    /**
     * Tenta resolver uma equação simbolicamente.
     * 
     * @param equation String da equação no formato "leftSide = rightSide"
     * @param knownValues Objeto com os valores conhecidos das variáveis
     * @param unknown A variável a ser calculada
     * @returns O valor calculado ou null se não for possível resolver simbolicamente
     */
    const solveSymbolically = (equation: string, knownValues: Record<string, number>, unknown: string): number | null => {
        try {
            // Divide a equação em lados esquerdo e direito
            const [leftSide, rightSide] = equation.split('=').map(side => side.trim());

            // Move tudo para um lado da equação (forma padrão: expressão = 0)
            let expr = `(${leftSide}) - (${rightSide})`;

            // Substitui todos os valores conhecidos na expressão
            for (const [variable, value] of Object.entries(knownValues)) {
                expr = substituteVariable(expr, variable, value);
            }

            // Simplifica a expressão
            let simplifiedExpr;
            try {
                simplifiedExpr = math.simplify(expr);
            } catch (e) {
                // Se não conseguir simplificar, use a expressão original
                simplifiedExpr = math.parse(expr);
            }

            // Tenta isolar a variável desconhecida
            return isolateAndSolve(simplifiedExpr.toString(), unknown);
        } catch (e) {
            // Em caso de erro na resolução simbólica, retorna null para usar métodos numéricos
            return null;
        }
    };

    /**
     * Substitui uma variável na expressão pelo seu valor.
     * 
     * @param expr A expressão
     * @param variable O nome da variável
     * @param value O valor a ser substituído
     * @returns A expressão com a variável substituída
     */
    const substituteVariable = (expr: string, variable: string, value: number): string => {
        // Uso de RegExp pré-compilado e otimizado
        const regex = new RegExp(`\\b${variable}\\b`, 'g');
        // Evita conversão desnecessária para string quando possível
        return expr.replace(regex, value.toString());
    };

    /**
     * Tenta isolar e resolver para a variável desconhecida.
     * 
     * @param expr A expressão simplificada
     * @param unknown A variável a ser calculada
     * @returns O valor calculado ou null se não for possível isolar
     */
    const isolateAndSolve = (expr: string, unknown: string): number | null => {
        try {
            // Use cache para expressões já analisadas
            if (!exprParsingCache.current[expr]) {
                exprParsingCache.current[expr] = math.parse(expr);
            }

            // Teste rápido para equações lineares simples (ax + b = 0)
            if (expr.includes(unknown) &&
                !expr.includes(`${unknown}^`) &&
                !expr.includes(`sin(${unknown})`) &&
                !expr.includes(`cos(${unknown})`) &&
                !expr.includes(`ln(${unknown})`) &&
                !expr.includes(`log(${unknown})`) &&
                !expr.includes(`exp(${unknown})`)) {

                // Análise mais simples para equações lineares
                let coefficient = 0;
                let constant = 0;

                // Normaliza a expressão para facilitar a análise
                const normalizedExpr = expr.replace(/\s+/g, '')
                    .replace(/\-/g, '+-')
                    .split('+')
                    .filter(term => term.trim() !== '');

                normalizedExpr.forEach(term => {
                    if (term.includes(unknown)) {
                        // É um termo com a variável
                        if (term === unknown || term === `+${unknown}`) {
                            coefficient += 1;
                        } else if (term === `-${unknown}`) {
                            coefficient -= 1;
                        } else {
                            // Extrai o coeficiente
                            const parts = term.split(`*${unknown}`);
                            if (parts.length > 1) {
                                // Formato: a*x
                                coefficient += parseFloat(parts[0] || '1');
                            } else {
                                // Outros formatos possíveis
                                const altParts = term.split(unknown);
                                if (altParts[0]) {
                                    coefficient += parseFloat(altParts[0]);
                                } else {
                                    coefficient += 1; // Caso seja apenas 'x'
                                }
                            }
                        }
                    } else if (term) {
                        // É uma constante
                        constant += parseFloat(term);
                    }
                });

                if (coefficient !== 0) {
                    return -constant / coefficient;
                }
            }

            // Equações quadráticas (ax² + bx + c = 0)
            const quadPattern = new RegExp(`([+-]?\\s*\\d*(\\.\\d+)?\\s*\\*?\\s*${unknown}\\^2).*?([+-]\\s*\\d*(\\.\\d+)?\\s*\\*?\\s*${unknown}).*?([+-]\\s*\\d+(\\.\\d+)?)`, 'i');
            const quadMatch = quadPattern.exec(expr);

            if (quadMatch) {
                // Parse dos coeficientes a, b, c
                let a = 1;
                const aMatch = /([+-]?\s*\d*(\.\d+)?)/.exec(quadMatch[1]);
                if (aMatch && aMatch[0]) {
                    a = parseFloat(aMatch[0] || '1');
                    if (quadMatch[1].includes('-') && !aMatch[0].includes('-')) a = -a;
                }

                let b = 1;
                const bMatch = /([+-]?\s*\d*(\.\d+)?)/.exec(quadMatch[3]);
                if (bMatch && bMatch[0]) {
                    b = parseFloat(bMatch[0] || '1');
                    if (quadMatch[3].includes('-') && !bMatch[0].includes('-')) b = -b;
                }

                const c = parseFloat(quadMatch[5].replace(/\s+/g, ''));

                // Fórmula de Bhaskara
                const discriminant = b * b - 4 * a * c;

                if (discriminant >= 0) {
                    const sqrtDisc = Math.sqrt(discriminant);
                    const x1 = (-b + sqrtDisc) / (2 * a);
                    const x2 = (-b - sqrtDisc) / (2 * a);

                    // Escolhe a solução mais adequada para física
                    if (x1 >= 0 && x2 < 0) return x1;
                    if (x2 >= 0 && x1 < 0) return x2;

                    // Se ambas tiverem o mesmo sinal, escolhe a de menor magnitude
                    return Math.abs(x1) <= Math.abs(x2) ? x1 : x2;
                }
            }

            // Fallback para resolver usando mathjs
            try {
                const node = exprParsingCache.current[expr];
                const simplified = node.toString();

                // Tenta resolver com solve() do mathjs (quando disponível)
                try {
                    const result = math.evaluate(`solve(${simplified}, ${unknown})`);
                    if (Array.isArray(result) && result.length > 0) {
                        // Filtra resultados válidos
                        const validResults = result
                            .map(r => parseFloat(r))
                            .filter(r => !isNaN(r) && isFinite(r));

                        if (validResults.length > 0) {
                            // Prefere valores positivos quando possível
                            const positiveResults = validResults.filter(r => r >= 0);
                            if (positiveResults.length > 0) {
                                return Math.min(...positiveResults);
                            }

                            // Se não houver positivos, pega o de menor magnitude
                            return validResults.reduce((a, b) =>
                                Math.abs(a) < Math.abs(b) ? a : b
                            );
                        }
                    }
                } catch (e) {
                    // Se o solve() falhar, continuamos com outros métodos
                }
            } catch (e) {
                // Erro na resolução simbólica, retorna null para usar métodos numéricos
            }

            return null;
        } catch (e) {
            return null;
        }
    };

    /**
     * Resolve uma equação usando métodos numéricos.
     * 
     * @param equation String da equação no formato "leftSide = rightSide"
     * @param knownValues Objeto com os valores conhecidos das variáveis
     * @param unknown A variável a ser calculada
     * @returns O valor calculado para a variável desconhecida
     */
    const solveNumerically = (equation: string, knownValues: Record<string, number>, unknown: string): number => {
        try {
            const [leftSide, rightSide] = equation.split('=').map(side => side.trim());
            const expr = `${leftSide} - (${rightSide})`;

            // Pré-compilação da expressão para melhorar performance
            const compiledExpr = math.compile(expr);

            // Função de avaliação otimizada
            const evaluate = (value: number): number => {
                const scope = { ...knownValues, [unknown]: value };
                return compiledExpr.evaluate(scope);
            };

            // Método de Newton-Raphson com melhor convergência
            const newtonRaphson = (initialGuess: number, tolerance: number = 1e-10, maxIterations: number = 50): number => {
                let x = initialGuess;
                let iterations = 0;

                while (iterations < maxIterations) {
                    const fx = evaluate(x);

                    if (Math.abs(fx) < tolerance) {
                        return x;
                    }

                    // Aproximação numérica da derivada com passo adaptativo
                    const h = Math.max(1e-8, Math.abs(x) * 1e-6);
                    const derivative = (evaluate(x + h) - fx) / h;

                    // Proteção contra divisão por zero
                    if (Math.abs(derivative) < 1e-10) {
                        break; // Vai para bissecção
                    }

                    const newX = x - fx / derivative;

                    // Verificação de convergência
                    if (Math.abs(newX - x) < tolerance) {
                        return newX;
                    }

                    x = newX;
                    iterations++;
                }

                // Se não convergiu, tenta bissecção
                throw new Error("Newton não convergiu");
            };

            // Estratégia de resolução em cascata mais eficiente
            try {
                // Primeiro tentamos com valores iniciais mais prováveis em física
                return newtonRaphson(1.0);
            } catch (error) {
                try {
                    return newtonRaphson(0.0);
                } catch (error) {
                    // Implementação mais eficiente de bissecção
                    let a = -100, b = 100;
                    let fa = evaluate(a), fb = evaluate(b);

                    // Amplia intervalo se necessário
                    if (fa * fb > 0) {
                        if (Math.abs(fa) < Math.abs(fb)) {
                            a -= 900;
                            fa = evaluate(a);
                        } else {
                            b += 900;
                            fb = evaluate(b);
                        }

                        // Se ainda não encontrou mudança de sinal
                        if (fa * fb > 0) {
                            // Força uma solução mais próxima de zero
                            return Math.abs(fa) < Math.abs(fb) ? a : b;
                        }
                    }

                    // Bissecção otimizada
                    const maxIter = 30; // Reduzido para maior eficiência
                    for (let i = 0; i < maxIter; i++) {
                        const c = (a + b) / 2;
                        const fc = evaluate(c);

                        if (Math.abs(fc) < 1e-10 || (b - a) < 1e-10) {
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

                    return (a + b) / 2;
                }
            }
        } catch (err) {
            throw new Error(`Erro ao resolver numericamente: ${err instanceof Error ? err.message : String(err)}`);
        }
    };


    const exprCache = useRef<Record<string, any>>({});
    const resultCache = useRef<Record<string, number>>({});

    // Função para gerar chave de cache
    const getCacheKey = (equation: string, values: Record<string, number>, unknown: string): string => {
        return `${equation}_${unknown}_${Object.entries(values).sort().join('_')}`;
    };

    const calculate = () => {
        try {
            setError('');
            setMethodUsed('');

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


            // Função para formatar o resultado com notação científica quando apropriado
            const formatResult = (value: number) => {
                // Usa notação científica para números muito grandes ou muito pequenos
                const absValue = Math.abs(value);
                if (absValue !== 0 && (absValue < 0.001 || absValue >= 10000)) {
                    return value.toExponential(2);
                }
                // Caso contrário usa a formatação normal com até 3 casas decimais
                return Number(value).toFixed(5).replace(/\.?0+$/, '');
            };

            // Verificar cache antes de calcular
            const cacheKey = getCacheKey(equation.formula, numericInputs, unknownVar);
            if (resultCache.current[cacheKey] !== undefined) {
                const cachedResult = resultCache.current[cacheKey];
                setResult(formatResult(cachedResult));
                setMethodUsed("Substituição direta");
                return;
            }

            const { result: calculatedResult, method } = solveEquation(equation.formula, numericInputs, unknownVar);
            // Armazenar no cache
            resultCache.current[cacheKey] = calculatedResult;

            const roundedResult = Math.abs(calculatedResult) < 0.0005 ? 0 : calculatedResult;

            setResult(formatResult(roundedResult));
            setMethodUsed(method);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
            setResult('');
        }
    };

    // Adicione esta função antes do return, junto com seus outros hooks e funções
    // Adicione feedback visual para campos inválidos
    const getInputFields = useMemo(() => {
        if (!selectedEq || !equations[selectedEq] || !unknownVar) return null;

        return equations[selectedEq]?.variables.map((varName, index) => {
            if (varName !== unknownVar && !isConstant(varName)) {
                const isInvalid = inputs[varName] && isNaN(parseFloat(inputs[varName]));

                return (
                    <View key={`${selectedEq}-${varName}`} className="mb-4">
                        <Text className="text-sm font-medium mb-1 ml-1 text-gray-600">
                            {varName.toUpperCase()} ({getUnit(varName)})
                        </Text>
                        <View className="flex-row items-center">
                            <TextInput
                                className={`flex-1 border border-1 rounded-lg p-3 text-base ${isInvalid ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
                                ref={(ref) => (inputRefs.current[varName] = ref)}
                                placeholder={`Valor de ${varName.toUpperCase()}`}
                                keyboardType="numbers-and-punctuation"
                                returnKeyType={index < equations[selectedEq].variables.length - 1 ? 'next' : 'done'}
                                value={inputs[varName] || ''}
                                onChangeText={text => {
                                    const cleanedText = text.replace(/[^0-9.eE+-]/g, '');
                                    setInputs(prev => ({ ...prev, [varName]: cleanedText }));
                                }}
                                style={{ height: 56 }}
                            />
                            {isInvalid && (
                                <Ionicons
                                    name="warning"
                                    size={20}
                                    color="#EF4444"
                                    style={{ marginLeft: -30, zIndex: 10 }}
                                />
                            )}
                        </View>
                        {isInvalid && (
                            <Text className="text-red-500 text-xs mt-1 ml-1">
                                Valor inválido. Use números (ex: 1.5, -2.3e-6)
                            </Text>
                        )}
                    </View>
                );
            }
            return null;
        });
    }, [selectedEq, unknownVar, equations, inputs]);
    return (
        <Container>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 w-full">
                {/* Header com título */}
                <View className="mb-6 mt-2">
                    <Text className="text-2xl font-bold text-center" style={{ color: '#7141A1' }}>
                        Calculadora de Física
                    </Text>
                    <Text className="text-sm text-center text-gray-500">
                        Selecione uma área e resolva equações facilmente
                    </Text>
                </View>

                {/* Abas para Áreas - Design melhorado */}
                <View className="mb-3">
                    <Text className="text-base font-semibold mb-2 ml-1 text-gray-700">Área da Física:</Text>
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
                                    color: active ? '#fff' : '#6B7280',
                                    fontSize: 14,
                                    fontWeight: active ? 'bold' : 'normal',
                                    paddingHorizontal: 0,
                                    paddingVertical: 0,
                                })}
                                containerStyle={(active) => ({
                                    backgroundColor: active ? '#7141A1' : '#F3F4F6',
                                    borderRadius: 50,
                                    padding: 0,
                                    margin: 3,
                                    minHeight: 36,
                                    height: 'auto',
                                    shadowColor: active ? "#000" : "transparent",
                                    shadowOffset: { width: 0, height: active ? 2 : 0 },
                                    shadowOpacity: active ? 0.2 : 0,
                                    shadowRadius: active ? 3 : 0,
                                    elevation: active ? 2 : 0,
                                })} />
                        ))}
                    </Tab>
                </View>

                {/* Abas para Subáreas - Design melhorado */}
                {subareaList.length > 0 && (
                    <View className="mb-4">
                        <Text className="text-base font-semibold mb-2 ml-1 text-gray-700">Subárea:</Text>
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
                                        color: active ? '#fff' : '#6B7280',
                                        fontSize: 14,
                                        fontWeight: active ? 'bold' : 'normal',
                                        paddingHorizontal: 0,
                                        paddingVertical: 0,
                                    })}
                                    containerStyle={(active) => ({
                                        backgroundColor: active ? '#7141A1' : '#F3F4F6',
                                        borderRadius: 50,
                                        margin: 3,
                                        minHeight: 36,
                                        height: 'auto',
                                        shadowColor: active ? "#000" : "transparent",
                                        shadowOffset: { width: 0, height: active ? 2 : 0 },
                                        shadowOpacity: active ? 0.2 : 0,
                                        shadowRadius: active ? 3 : 0,
                                        elevation: active ? 2 : 0,
                                    })} />
                            ))}
                        </Tab>
                    </View>
                )}

                {/* Card para Equação e Incógnita */}
                {Object.keys(equations).length > 0 && selectedEq && (
                    <ThemedView
                        className='mb-4 rounded-2xl border-0 p-5'
                        style={{
                            backgroundColor: isLight ? "#f9f9ff" : "#2D2D3A",
                            shadowColor: isLight ? "#7141A1" : "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 8,
                            elevation: 6,
                        }}
                    >
                        {/* Equação com ícone */}
                        <View className="flex-row items-center mb-3">
                            <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
                                <MaterialCommunityIcons name="function-variant" size={20} color="#7141A1" />
                            </View>
                            <Text className='text-base font-bold flex-1' style={{ color: "#7141A1" }}>Equação</Text>
                        </View>

                        <View className="bg-white rounded-xl p-1 mb-5" style={{
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                        }}>
                            <Picker
                                selectedValue={selectedEq}
                                onValueChange={value => setSelectedEq(value)}
                                style={{ height: 50 }}
                            >
                                {Object.entries(equations).map(([key, eq]) => (
                                    <Picker.Item key={key} label={eq.name} value={key} />
                                ))}
                            </Picker>
                        </View>

                        {/* Incógnita com ícone */}
                        <View className="flex-row items-center mb-3">
                            <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
                                <MaterialCommunityIcons name="help-circle-outline" size={20} color="#7141A1" />
                            </View>
                            <Text className='text-base font-bold flex-1' style={{ color: "#7141A1" }}>O que deseja calcular?</Text>
                        </View>

                        <View className="bg-white rounded-xl p-1" style={{
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                        }}>
                            <Picker
                                selectedValue={unknownVar}
                                onValueChange={value => setUnknownVar(value)}
                                style={{ height: 50 }}
                            >
                                <Picker.Item label="Selecione uma variável" value="" />
                                {equations[selectedEq]?.variables
                                    .filter(varName => !isConstant(varName)) // Filtra constantes
                                    .map(varName => (
                                        <Picker.Item key={varName} label={varName} value={varName} />
                                    ))}
                            </Picker>
                        </View>
                    </ThemedView>
                )}

                {/* Campos de Entrada */}
                {selectedEq && equations[selectedEq] && unknownVar && (
                    <ThemedView
                        className='mb-4 rounded-2xl p-5'
                        style={{
                            backgroundColor: isLight ? "#f9f9ff" : "#2D2D3A",
                            shadowColor: isLight ? "#7141A1" : "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 8,
                            elevation: 6,
                        }}
                    >
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
                                <MaterialCommunityIcons name="calculator-variant" size={20} color="#7141A1" />
                            </View>
                            <Text className='text-base font-bold flex-1' style={{ color: "#7141A1" }}>Valores das variáveis</Text>
                        </View>

                        {getInputFields}
                    </ThemedView>
                )}

                {/* Botão e Resultados - Design melhorado */}
                <View className="mb-8">
                    <ThemedTouchableOpacity
                        onPress={calculate}
                        className='py-4 rounded-xl mb-5'
                        style={{
                            backgroundColor: '#7141A1',
                            shadowColor: "#7141A1",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 5,
                            elevation: 4,
                        }}
                    >
                        <View className="flex-row justify-center items-center">
                            <MaterialCommunityIcons name="calculator" size={24} color="white" className="mr-2" />
                            <Text className='text-center text-lg font-bold text-white ml-2'>CALCULAR</Text>
                        </View>
                    </ThemedTouchableOpacity>

                    <View className='w-full rounded-2xl p-6'
                        style={{
                            backgroundColor: error ? '#FEF2F2' : result ? colors.light["--color-roxo-70"] : '#F3F4F6',
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 6,
                            elevation: 4,
                            borderWidth: error ? 1 : 0,
                            borderColor: error ? '#FCA5A5' : 'transparent',
                            minHeight: 120,
                        }}
                    >
                        {!error && !result && (
                            <View className="items-center justify-center h-24">
                                <MaterialCommunityIcons name="calculator-variant-outline" size={40} color="#9CA3AF" />
                                <Text className="text-gray-500 mt-2 text-center">
                                    Preencha os valores e clique em calcular
                                </Text>
                            </View>
                        )}

                        {!!error && (
                            <View className="items-center">
                                <AntDesign name="exclamationcircle" size={32} color="#DC2626" />
                                <Text style={styles.error}>{error}</Text>
                            </View>
                        )}

                        {!!result && (
                            <View className="items-center gap-1">
                                <Text className='text-white text-lg font-medium'>Resultado para {unknownVar.toUpperCase()}</Text>
                                <Text className='text-4xl text-center font-bold text-white'>{result} {getUnit(unknownVar)}</Text>
                                <Text className="text-white text-sm mt-1">Método: {methodUsed}</Text>

                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </Container>
    );
};



const styles = StyleSheet.create({
    error: {
        fontSize: 16,
        color: '#DC2626',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default CalculatorWithTabs;