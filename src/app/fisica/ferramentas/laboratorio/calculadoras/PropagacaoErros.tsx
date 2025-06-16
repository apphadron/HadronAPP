import React, { useState, useCallback, useRef } from "react";
import { StyleSheet, View, TextInput, Button, Text, Switch, Alert } from "react-native";
import { compile, derivative, evaluate } from "mathjs";
import MathJaxSvg from 'react-native-mathjax-svg';
import { Container } from "@/components/geral/Container";
import { AdvancedMathKeyboard } from "@/components/geral/mathKayboard";

export default function App() {
    const [areValuesKnown, setAreValuesKnown] = useState<boolean>(false);
    const [variables, setVariables] = useState<{ [key: string]: { value: string; error: string } }>({});
    const [result, setResult] = useState<string>("");
    const [errorFormula, setErrorFormula] = useState<string>("");
    const expressionInputRef = useRef<TextInput>(null);
    const [cursorPosition, setCursorPosition] = useState<number>(0);
    const [expression, setExpression] = useState<string>("");

    const handleExpressionChange = (newExpression: string) => {
        setExpression(newExpression);
        identifyVariables(newExpression);
    };

    // Função melhorada para identificar variáveis
    const identifyVariables = useCallback((expr: string) => {
        try {
            if (!expr.trim()) {
                setVariables({});
                setErrorFormula("");
                return;
            }

            // Procura por variáveis usando regex - letras que não fazem parte de funções matemáticas comuns
            const mathFunctions = ["sin", "cos", "tan", "log", "ln", "sqrt", "exp"];
            let vars: string[] = expr.match(/[a-zA-Z]+/g) || [];

            // Filtra funções matemáticas da lista de variáveis
            vars = vars.filter(v => !mathFunctions.includes(v.toLowerCase()));

            const newVariables: { [key: string]: { value: string; error: string } } = {};
            vars.forEach((v: string) => {
                // Mantém os valores existentes se a variável já existir
                if (variables[v]) {
                    newVariables[v] = variables[v];
                } else {
                    newVariables[v] = { value: "", error: "" };
                }
            });

            setVariables(newVariables);
        } catch (error) {
            console.error("Erro ao identificar variáveis:", error);
        }
    }, [variables]);

    // Validação da expressão
    const validateExpression = (expr: string): boolean => {
        try {
            // Tenta compilar a expressão com valores dummy
            const compiledExpr = compile(expr);
            const dummyValues = Object.keys(variables).reduce((acc, key) => {
                acc[key] = 1;
                return acc;
            }, {} as Record<string, number>);

            compiledExpr.evaluate(dummyValues);
            return true;
        } catch (error) {
            return false;
        }
    };

    // Função para calcular a propagação de erros
    const calculateErrorPropagation = useCallback(() => {
        try {
            if (!expression.trim()) {
                Alert.alert("Erro", "Por favor, insira uma função válida.");
                return;
            }

            if (!validateExpression(expression)) {
                Alert.alert("Erro", "Expressão matemática inválida. Verifique a sintaxe.");
                return;
            }

            const vars = Object.keys(variables);
            let formula = "";

            // Calcula a fórmula da propagação de erro
            for (const key of vars) {
                try {
                    const partialDerivative = derivative(expression, key).toString();
                    formula += `(${partialDerivative} \\cdot \\Delta ${key})^2 + `;
                } catch (error) {
                    Alert.alert("Erro", `Não foi possível calcular a derivada em relação a ${key}`);
                    return;
                }
            }

            formula = formula.slice(0, -3);
            setErrorFormula(`\\Delta f = \\sqrt{${formula}}`);

            if (areValuesKnown) {
                // Validação dos valores
                for (const key of vars) {
                    const value = variables[key].value;
                    const error = variables[key].error;

                    if (!value || !error) {
                        Alert.alert("Erro", `Por favor, insira o valor e a incerteza para ${key}.`);
                        return;
                    }

                    if (isNaN(Number(value)) || isNaN(Number(error))) {
                        Alert.alert("Erro", `Valores inválidos para ${key}. Use apenas números.`);
                        return;
                    }
                }

                const values: { [key: string]: number } = {};
                const errors: { [key: string]: number } = {};

                for (const key of vars) {
                    values[key] = parseFloat(variables[key].value);
                    errors[key] = parseFloat(variables[key].error);
                }

                const functionValue = evaluate(expression, values);

                let propagatedError = 0;
                for (const key of vars) {
                    const partialDerivative = derivative(expression, key).toString();
                    const partialDerivativeValue = evaluate(partialDerivative, values);
                    propagatedError += Math.pow(partialDerivativeValue * errors[key], 2);
                }
                propagatedError = Math.sqrt(propagatedError);

                setResult(`${functionValue.toFixed(4)} \\pm ${propagatedError.toFixed(4)}`);
            }
        } catch (error) {
            console.error("Erro no cálculo:", error);
            Alert.alert("Erro", "Ocorreu um erro ao calcular. Verifique a expressão e os valores inseridos.");
        }
    }, [expression, variables, areValuesKnown]);

    return (
        <Container style={styles.container}>
            <Text style={styles.title}>Calculadora de Propagação de Erros</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Função:</Text>
                <TextInput
                    ref={expressionInputRef}
                    style={styles.input}
                    placeholder="Digite a função (ex: r^2 * h)"
                    value={expression}
                    onChangeText={(text) => {
                        setExpression(text);
                        identifyVariables(text);
                    }}
                    selection={{ start: cursorPosition, end: cursorPosition }}
                    onSelectionChange={(event) => {
                        setCursorPosition(event.nativeEvent.selection.start);
                    }}
                />
            </View>


            <View style={styles.toggleContainer}>
                <Text>Valores conhecidos?</Text>
                <Switch value={areValuesKnown} onValueChange={setAreValuesKnown} />
            </View>

            {areValuesKnown && Object.keys(variables).map((key) => (
                <View key={key} style={styles.variableContainer}>
                    <Text style={styles.label}>{key.toUpperCase()}:</Text>
                    <View style={styles.variableInputContainer}>
                        <TextInput
                            style={[styles.input, styles.valueInput]}
                            placeholder={`Valor`}
                            keyboardType="numeric"
                            value={variables[key].value}
                            onChangeText={(text) => setVariables(prev => ({
                                ...prev,
                                [key]: { ...prev[key], value: text }
                            }))}
                        />
                        <TextInput
                            style={[styles.input, styles.valueInput]}
                            placeholder={`Incerteza`}
                            keyboardType="numeric"
                            value={variables[key].error}
                            onChangeText={(text) => setVariables(prev => ({
                                ...prev,
                                [key]: { ...prev[key], error: text }
                            }))}
                        />
                    </View>
                </View>
            ))}

            <Button
                title="Calcular"
                onPress={calculateErrorPropagation}
                disabled={!expression.trim()}
            />

            {errorFormula !== "" && (
                <View style={styles.formulaContainer}>
                    <Text style={styles.formulaTitle}>Fórmula da Propagação de Erro:</Text>
                    
                    <MathJaxSvg
                    fontSize={16}
                    color="#565555"
                >
                    {errorFormula}
                </MathJaxSvg>
                </View>
            )}

            {areValuesKnown && result !== "" && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Resultado:</Text>
                    
                    <MathJaxSvg
                    fontSize={16}
                    color="#565555"
                >
                    {result}
                </MathJaxSvg>
                </View>
            )}

            {/* Teclado Matemático */}
            <AdvancedMathKeyboard
                value={expression}
                onChange={handleExpressionChange}
                onSubmit={calculateErrorPropagation}
            />

        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: "#fff",
    },
    toggleContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    variableContainer: {
        marginBottom: 15,
    },
    variableInputContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    valueInput: {
        flex: 0.48,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    formulaContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 5,
    },
    formulaTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    resultContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 5,
        marginBottom: 20,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
});