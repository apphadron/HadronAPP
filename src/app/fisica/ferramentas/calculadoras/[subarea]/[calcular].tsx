import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { create, all } from 'mathjs';
import { useLocalSearchParams } from 'expo-router';
import { areas } from '@/components/fisica/calculadora/equations';

const math = create(all);

type EquationKey = string;

const PhysicsCalculator = () => {
  const { subarea: areaKey, calcular: subareaKey } = useLocalSearchParams();
  const equations = areas[areaKey as string].subareas[subareaKey as string].equations;

  const [selectedEq, setSelectedEq] = useState<EquationKey>(Object.keys(equations)[0]);
  const [unknownVar, setUnknownVar] = useState<string>(equations[selectedEq].variables[0]);
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setUnknownVar(equations[selectedEq].variables[0]);
    setInputs({});
    setResult('');
  }, [selectedEq]);

  const solveEquation = (equation: string, knownValues: Record<string, number>, unknown: string): number => {
    const [leftSide, rightSide] = equation.split('=').map(side => side.trim());
    const expr = `${leftSide} - (${rightSide})`;
    const node = math.parse(expr);

    const simplified = node.transform((node) => {
      if (math.isSymbolNode(node) && node.name !== unknown && node.name in knownValues) {
        return math.parse(String(knownValues[node.name]));
      }
      return node;
    });

    const func = math.compile(simplified.toString());

    const findRoot = (initialGuess: number = 1): number => {
      let x = initialGuess;
      const maxIterations = 100;
      const tolerance = 1e-10;

      for (let i = 0; i < maxIterations; i++) {
        const scope = { [unknown]: x };
        const fx = func.evaluate(scope);

        const h = 1e-7;
        const scope2 = { [unknown]: x + h };
        const fxh = func.evaluate(scope2);
        const derivative = (fxh - fx) / h;

        const delta = fx / derivative;
        x = x - delta;

        if (Math.abs(delta) < tolerance) {
          return x;
        }
      }

      throw new Error('Não foi possível encontrar uma solução após 100 iterações');
    };

    return findRoot();
  };

  const calculate = () => {
    try {
      setError('');
      const equation = equations[selectedEq];

      equation.variables.forEach(varName => {
        if (varName !== unknownVar && !(varName in inputs)) {
          throw new Error(`Valor de ${varName} não informado`);
        }
      });

      const result = solveEquation(equation.formula, inputs, unknownVar);
      setResult(`${unknownVar} = ${Number(result).toFixed(3)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setResult('');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Calculadora Física</Text>

      {/* Seletor de Equação */}
      <View style={styles.section}>
        <Text style={styles.label}>Equação:</Text>
        <Picker
          selectedValue={selectedEq}
          onValueChange={value => setSelectedEq(value as EquationKey)}
          style={styles.picker}
        >
          {Object.entries(equations).map(([key, eq]) => (
            <Picker.Item key={key} label={eq.name} value={key} />
          ))}
        </Picker>
      </View>

      {/* Seletor de Incógnita */}
      <View style={styles.section}>
        <Text style={styles.label}>Calcular:</Text>
        <Picker
          selectedValue={unknownVar}
          onValueChange={value => setUnknownVar(value)}
          style={styles.picker}
        >
          {equations[selectedEq].variables.map(varName => (
            <Picker.Item key={varName} label={varName} value={varName} />
          ))}
        </Picker>
      </View>

      {/* Campos de Entrada */}
      <View style={styles.section}>
        {equations[selectedEq].variables.map(varName => 
          varName !== unknownVar && (
            <TextInput
              key={varName}
              style={styles.input}
              placeholder={`${varName.toUpperCase()} (${getUnit(varName)})`}
              keyboardType="numeric"
              value={inputs[varName]?.toString() || ''}
              onChangeText={text => {
                const value = parseFloat(text);
                if (!isNaN(value)) {
                  setInputs(prev => ({ ...prev, [varName]: value }));
                }
              }}
            />
          )
        )}
      </View>

      {/* Botão e Resultados */}
      <Text style={styles.button} onPress={calculate}>
        CALCULAR
      </Text>

      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!result && <Text style={styles.result}>{result}</Text>}
    </ScrollView>
  );
};

// Função auxiliar para unidades
const getUnit = (variable: string) => {
  const units: Record<string, string> = {
    v: 'm/s',
    v0: 'm/s',
    a: 'm/s²',
    t: 's',
    d: 'm',
    K: 'J',
    m: 'kg',
    F: 'N'
  };
  return units[variable] || '';
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
  },
  input: {
    height: 50,
    borderColor: '#bdc3c7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: 15,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  result: {
    fontSize: 18,
    color: '#27ae60',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  error: {
    fontSize: 16,
    color: '#e74c3c',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default PhysicsCalculator;