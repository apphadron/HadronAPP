import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, PanResponder, Dimensions, Text, TextInput, ScrollView, Animated, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { create, all } from 'mathjs';
import Icon from 'react-native-vector-icons/MaterialIcons';

const math = create(all);

const COLORS = ['#2196F3', '#4CAF50', '#F44336', '#9C27B0', '#FF9800'];
const DEFAULT_SCALE = 50;
const MIN_SCALE = 10;
const MAX_SCALE = 100;

interface FunctionType {
  id: number;
  expression: string;
  parameters: { [key: string]: number };
  color: string;
  visible: boolean;
  editing: boolean;
}

const MathGrafico = () => {
  const [functions, setFunctions] = useState<FunctionType[]>([
    { id: 1, expression: 'sin(a*x)', parameters: { a: 1 }, color: COLORS[0], visible: true, editing: false }
  ]);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [error, setError] = useState<string | null>(null);
  const pan = useRef(new Animated.ValueXY()).current;
  const [newExpression, setNewExpression] = useState('');
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const animatedValues = useRef(new Map()).current;

  const width = Dimensions.get('window').width;
  const height = 300;

  useEffect(() => {
    functions.forEach(func => {
      Object.entries(func.parameters).forEach(([param, value]) => {
        const key = `${func.id}-${param}`;
        if (!animatedValues.has(key)) {
          animatedValues.set(key, new Animated.Value(value));
        }
      });
    });
  }, [functions]);

  const extractParameters = useCallback((expression: string) => {
    const regex = /([a-zA-Z]+)\(([^()]+)\)|([a-zA-Z]+)/g;
    let match;
    const variables = new Set<string>();

    while ((match = regex.exec(expression)) !== null) {
      if (match[1] && match[2]) {
        const innerExpression = match[2];
        const innerVariables = innerExpression.match(/[a-zA-Z]+/g);
        if (innerVariables) {
          innerVariables.forEach((v) => {
            if (v !== "x") variables.add(v);
          });
        }
      } else if (match[3] && match[3] !== "x") {
        variables.add(match[3]);
      }
    }

    return Array.from(variables);
  }, []);

  const validateExpression = useCallback((expression: string, parameters: { [key: string]: number }) => {
    try {
      let testExpression = expression;
      Object.entries(parameters).forEach(([param, value]) => {
        testExpression = testExpression.replace(new RegExp(`\\b${param}\\b`, 'g'), value.toString());
      });
      math.evaluate(testExpression, { x: 0 });
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  const addFunction = useCallback(() => {
    if (!newExpression) {
      setError('Por favor, insira uma expressão');
      return;
    }

    try {
      const params = extractParameters(newExpression);
      const parameters: { [key: string]: number } = {};
      params.forEach(param => {
        parameters[param] = 1;
      });

      if (!validateExpression(newExpression, parameters)) {
        setError('Expressão matemática inválida');
        return;
      }

      const newFunc: FunctionType = {
        id: Date.now(),
        expression: newExpression,
        parameters,
        color: COLORS[functions.length % COLORS.length],
        visible: true,
        editing: false,
      };

      setFunctions(prev => [...prev, newFunc]);
      setNewExpression('');
      setError(null);

      Object.keys(parameters).forEach(param => {
        animatedValues.set(`${newFunc.id}-${param}`, new Animated.Value(1));
      });
    } catch (error) {
      setError('Erro ao adicionar função');
    }
  }, [newExpression, functions, extractParameters, validateExpression]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      setPanOffset(prev => ({
        x: prev.x + gestureState.dx / 2, // Ajuste da sensibilidade do pan
        y: prev.y + gestureState.dy / 2
      }));
    },
    onPanResponderRelease: () => {}
  }), []);

  const toScreenCoords = useCallback((x: number, y: number) => {
    return {
      x: width / 2 + (x * scale) + panOffset.x,
      y: height / 2 - (y * scale) - panOffset.y
    };
  }, [scale, panOffset, width, height]);

  const evaluateExpression = useCallback((expression: string, x: number, parameters: { [key: string]: number }) => {
    try {
      const context = { x, ...parameters };
      return math.evaluate(expression, context);
    } catch (error) {
      console.error('Error evaluating:', error);
      return 0;
    }
  }, []);

  const generatePoints = useCallback((func: FunctionType) => {
    if (!func.visible) return [];

    const points = [];
    const step = 1 / scale;
    const xMin = (-width / 2 - panOffset.x) / scale;
    const xMax = (width / 2 - panOffset.x) / scale;

    for (let x = xMin; x <= xMax; x += step) {
      const y = evaluateExpression(func.expression, x, func.parameters);
      const screenCoords = toScreenCoords(x, y);
      points.push(screenCoords);
    }
    return points;
  }, [scale, panOffset, width, evaluateExpression, toScreenCoords]);

  const updateParameter = useCallback((funcId: number, param: string, value: number) => {
    setFunctions(prev =>
      prev.map(f => f.id === funcId
        ? { ...f, parameters: { ...f.parameters, [param]: value } }
        : f
      )
    );
  }, []);

  const resetGraph = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
    setScale(DEFAULT_SCALE);
  }, []);

  const handleEditExpression = useCallback((funcId: number, newExpression: string) => {
    setFunctions(prev =>
      prev.map(f => {
        if (f.id === funcId) {
          const newParams = extractParameters(newExpression);
          const parameters: { [key: string]: number } = {};
          newParams.forEach(param => {
            parameters[param] = f.parameters[param] || 1; // Mantém o valor antigo ou define como 1
          });

          if (!validateExpression(newExpression, parameters)) {
            setError('Expressão matemática inválida');
            return f; // Não atualiza a função se a expressão for inválida
          }

          return {
            ...f,
            expression: newExpression,
            parameters,
            editing: false,
          };
        }
        return f;
      })
    );
  }, [extractParameters, validateExpression]);

  const renderTickers = useMemo(() => {
    const tickers = [];
    const step = 50;

    for (let x = panOffset.x % step; x < width; x += step) {
      const value = ((x - width / 2 - panOffset.x) / scale).toFixed(1);
      tickers.push(
        <Text key={`x${x}`} style={[styles.ticker, { left: x, top: height / 2 }]}>
          {value}
        </Text>
      );
    }

    for (let y = panOffset.y % step; y < height; y += step) {
      const value = ((height / 2 - y - panOffset.y) / scale).toFixed(1);
      tickers.push(
        <Text key={`y${y}`} style={[styles.ticker, { left: width / 2, top: y }]}>
          {value}
        </Text>
      );
    }

    return tickers;
  }, [panOffset, width, height, scale]);

  const renderGrid = useMemo(() => {
    const gridLines = [];
    const step = 50;

    for (let x = panOffset.x % step; x < width; x += step) {
      gridLines.push(
        <View key={`v${x}`} style={[styles.gridLine, { left: x, height }]} />
      );
    }

    for (let y = panOffset.y % step; y < height; y += step) {
      gridLines.push(
        <View key={`h${y}`} style={[styles.gridLine, { top: y, width }]} />
      );
    }

    return gridLines;
  }, [panOffset, width, height]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error ? styles.inputError : {}]}
          value={newExpression}
          onChangeText={(text) => {
            setNewExpression(text);
            setError(null);
          }}
          placeholder="Digite uma expressão matemática (ex: sin(a*x))"
        />
        <TouchableOpacity style={styles.addButton} onPress={addFunction}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.graphContainer} {...panResponder.panHandlers}>
        {renderGrid}
        {renderTickers}
        <View style={[styles.axis, { left: toScreenCoords(0, 0).x, height }]} />
        <View style={[styles.axis, { top: toScreenCoords(0, 0).y, width }]} />
        {functions.map(func =>
          generatePoints(func).map((point, index) => (
            <View
              key={`${func.id}-${index}`}
              style={[styles.point, {
                left: point.x,
                top: point.y,
                backgroundColor: func.color
              }]}
            />
          ))
        )}
      </View>

      <View style={styles.controls}>
        <Text>Zoom</Text>
        <Slider
          style={styles.slider}
          minimumValue={MIN_SCALE}
          maximumValue={MAX_SCALE}
          value={scale}
          onValueChange={setScale}
        />

        <TouchableOpacity style={styles.resetButton} onPress={resetGraph}>
          <Icon name="refresh" size={24} color="white" />
        </TouchableOpacity>

        {functions.map(func => (
          <View key={func.id} style={styles.functionControl}>
            <View style={styles.functionHeader}>
              <View style={[styles.colorDot, { backgroundColor: func.color }]} />
              {func.editing ? (
                <TextInput
                  style={styles.input}
                  value={func.expression}
                  onChangeText={(text) => 
                    setFunctions(prev =>
                      prev.map(f => f.id === func.id ? { ...f, expression: text } : f)
                    )
                  }
                  onBlur={() => handleEditExpression(func.id, func.expression)}
                />
              ) : (
                <Text style={styles.expressionText}>{func.expression}</Text>
              )}
              <TouchableOpacity onPress={() => 
                setFunctions(prev =>
                  prev.map(f => f.id === func.id ? { ...f, visible: !f.visible } : f)
                )
              }>
                <Text>{func.visible ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => 
                setFunctions(prev =>
                  prev.map(f => f.id === func.id ? { ...f, editing: !f.editing } : f)
                )
              }>
                <Text style={styles.editButton}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => 
                setFunctions(prev => prev.filter(f => f.id !== func.id))
              }>
                <Text style={styles.removeButton}>×</Text>
              </TouchableOpacity>
            </View>

            {Object.entries(func.parameters).map(([param, value]) => (
              <View key={param} style={styles.parameterControl}>
                <Text>{param} = {value.toFixed(2)}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={5}
                  value={value}
                  onValueChange={(newValue) => updateParameter(func.id, param, newValue)}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
  },
  graphContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  point: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#e0e0e0',
    width: 1,
    height: 1,
  },
  axis: {
    position: 'absolute',
    backgroundColor: '#757575',
    width: 2,
    height: 2,
  },
  ticker: {
    position: 'absolute',
    color: '#757575',
    fontSize: 10,
  },
  controls: {
    padding: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  functionControl: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  functionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  expressionText: {
    flex: 1,
    marginRight: 8,
  },
  editButton: {
    marginLeft: 8,
  },
  removeButton: {
    color: '#F44336',
    fontSize: 24,
    marginLeft: 8,
  },
  parameterControl: {
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default MathGrafico;