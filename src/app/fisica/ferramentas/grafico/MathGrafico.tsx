import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  PanResponder,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Animated
} from 'react-native';
import Svg, { Line, Path, Text as SvgText, G } from 'react-native-svg';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { create, all } from 'mathjs';

const math = create(all);

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

interface FunctionData {
  id: string;
  expression: string;
  parameters: Record<string, number>;
  color: string;
  visible: boolean;
}

interface Viewport {
  centerX: number;
  centerY: number;
  scale: number;
}

const MathGraphPlotter = () => {
  const [functions, setFunctions] = useState<FunctionData[]>([]);
  const [newExpression, setNewExpression] = useState('');
  const [viewport, setViewport] = useState<Viewport>({ centerX: 0, centerY: 0, scale: 50 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'add'>('graph');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

  // Dimensões do gráfico (sempre em tela cheia)
  const getGraphDimensions = () => {
    const padding = 16;
    const tabBarHeight = 60;
    const statusBarHeight = StatusBar.currentHeight || 0;
    const safeAreaTop = 40;

    return {
      width: screenWidth - padding * 2,
      height: screenHeight - statusBarHeight - safeAreaTop - tabBarHeight - 100
    };
  };

  const { width: graphWidth, height: graphHeight } = getGraphDimensions();

  // Animação do painel
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isPanelOpen ? screenWidth * 0.35 : screenWidth,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isPanelOpen, slideAnim, screenWidth]);

  // Extrair parâmetros da expressão
  const extractParameters = useCallback((expression: string): string[] => {
    const params = new Set<string>();
    const regex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    let match;

    while ((match = regex.exec(expression)) !== null) {
      const param = match[1];
      if (param !== 'x' && param !== 'e' && param !== 'pi' &&
        !['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'abs', 'exp'].includes(param)) {
        params.add(param);
      }
    }

    return Array.from(params);
  }, []);

  // Validar expressão
  const validateExpression = useCallback((expression: string, parameters: Record<string, number>): boolean => {
    try {
      const testParams = { x: 0, ...parameters };
      math.evaluate(expression, testParams);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Avaliar expressão
  const evaluateExpression = useCallback((expression: string, x: number, parameters: Record<string, number>): number => {
    try {
      const context = { x, ...parameters };
      const result = math.evaluate(expression, context);
      return typeof result === 'number' && isFinite(result) ? result : NaN;
    } catch {
      return NaN;
    }
  }, []);

  // Converter coordenadas do mundo para tela
  const worldToScreen = useCallback((worldX: number, worldY: number) => {
    return {
      x: (worldX - viewport.centerX) * viewport.scale + graphWidth / 2,
      y: graphHeight / 2 - (worldY - viewport.centerY) * viewport.scale
    };
  }, [viewport, graphWidth, graphHeight]);

  // Converter coordenadas da tela para mundo
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - graphWidth / 2) / viewport.scale + viewport.centerX,
      y: (graphHeight / 2 - screenY) / viewport.scale + viewport.centerY
    };
  }, [viewport, graphWidth, graphHeight]);

  // Gerar grade
  const generateGrid = useCallback(() => {
    const lines = [];
    const step = viewport.scale < 20 ? 2 : viewport.scale < 50 ? 1 : 0.5;
    const worldBounds = {
      left: screenToWorld(0, 0).x,
      right: screenToWorld(graphWidth, 0).x,
      top: screenToWorld(0, 0).y,
      bottom: screenToWorld(0, graphHeight).y
    };

    // Linhas verticais
    const startX = Math.floor(worldBounds.left / step) * step;
    for (let x = startX; x <= worldBounds.right; x += step) {
      const screenX = worldToScreen(x, 0).x;
      if (screenX >= 0 && screenX <= graphWidth) {
        lines.push(
          <Line
            key={`v${x}`}
            x1={screenX}
            y1={0}
            x2={screenX}
            y2={graphHeight}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        );
      }
    }

    // Linhas horizontais
    const startY = Math.floor(worldBounds.bottom / step) * step;
    for (let y = startY; y <= worldBounds.top; y += step) {
      const screenY = worldToScreen(0, y).y;
      if (screenY >= 0 && screenY <= graphHeight) {
        lines.push(
          <Line
            key={`h${y}`}
            x1={0}
            y1={screenY}
            x2={graphWidth}
            y2={screenY}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        );
      }
    }

    return lines;
  }, [viewport, screenToWorld, worldToScreen, graphWidth, graphHeight]);

  // Gerar eixos
  const generateAxes = useCallback(() => {
    const axes = [];
    const origin = worldToScreen(0, 0);

    // Eixo X
    if (origin.y >= 0 && origin.y <= graphHeight) {
      axes.push(
        <Line
          key="axis-x"
          x1={0}
          y1={origin.y}
          x2={graphWidth}
          y2={origin.y}
          stroke="#374151"
          strokeWidth="2"
        />
      );
    }

    // Eixo Y
    if (origin.x >= 0 && origin.x <= graphWidth) {
      axes.push(
        <Line
          key="axis-y"
          x1={origin.x}
          y1={0}
          x2={origin.x}
          y2={graphHeight}
          stroke="#374151"
          strokeWidth="2"
        />
      );
    }

    return axes;
  }, [viewport, worldToScreen, graphWidth, graphHeight]);

  // Gerar path da função
  const generateFunctionPath = useCallback((func: FunctionData): string => {
    if (!func.visible) return '';

    const worldBounds = {
      left: screenToWorld(0, 0).x,
      right: screenToWorld(graphWidth, 0).x
    };

    const step = 2 / viewport.scale;
    const points = [];

    for (let worldX = worldBounds.left; worldX <= worldBounds.right; worldX += step) {
      const y = evaluateExpression(func.expression, worldX, func.parameters);

      if (!isNaN(y) && isFinite(y)) {
        const screen = worldToScreen(worldX, y);

        if (screen.y >= -50 && screen.y <= graphHeight + 50) {
          points.push({ x: screen.x, y: screen.y });
        }
      }
    }

    if (points.length === 0) return '';

    let pathData = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathData += ` L ${points[i].x} ${points[i].y}`;
    }

    return pathData;
  }, [evaluateExpression, worldToScreen, screenToWorld, viewport, graphWidth, graphHeight]);

  // PanResponder para navegação
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        setViewport(prev => ({
          ...prev,
          centerX: prev.centerX - gestureState.dx / prev.scale / 10,
          centerY: prev.centerY + gestureState.dy / prev.scale / 10
        }));
      },
    })
  ).current;

  // Adicionar função
  const addFunction = () => {
    if (!newExpression.trim()) {
      setError('Digite uma expressão matemática');
      return;
    }

    const params = extractParameters(newExpression);
    const parameters: Record<string, number> = {};
    params.forEach(param => { parameters[param] = 1; });

    if (!validateExpression(newExpression, parameters)) {
      setError('Expressão matemática inválida');
      return;
    }

    const newFunc: FunctionData = {
      id: Date.now().toString(),
      expression: newExpression,
      parameters,
      color: COLORS[functions.length % COLORS.length],
      visible: true
    };

    setFunctions(prev => [...prev, newFunc]);
    setNewExpression('');
    setError(null);
    setActiveTab('graph');
  };

  // Zoom
  const zoom = (factor: number) => {
    setViewport(prev => ({
      ...prev,
      scale: Math.max(10, Math.min(200, prev.scale * factor))
    }));
  };

  // Reset viewport
  const resetViewport = () => {
    setViewport({ centerX: 0, centerY: 0, scale: 50 });
  };

  // Toggle function visibility
  const toggleFunction = (id: string) => {
    setFunctions(prev => prev.map(f =>
      f.id === id ? { ...f, visible: !f.visible } : f
    ));
  };

  // Remove function
  const removeFunction = (id: string) => {
    setFunctions(prev => prev.filter(f => f.id !== id));
  };

  // Update parameter
  const updateParameter = (funcId: string, param: string, value: number) => {
    setFunctions(prev => prev.map(f =>
      f.id === funcId
        ? { ...f, parameters: { ...f.parameters, [param]: value } }
        : f
    ));
  };

  // Renderizar gráfico
  const renderGraph = () => (
    <View style={styles.graphContainer}>
      <View {...panResponder.panHandlers}>
        <Svg width={graphWidth} height={graphHeight} style={styles.svg}>
          <G>
            {generateGrid()}
            {generateAxes()}
            {functions.map(func => (
              <Path
                key={func.id}
                d={generateFunctionPath(func)}
                stroke={func.color}
                strokeWidth="2"
                fill="none"
              />
            ))}
          </G>
        </Svg>
      </View>

      <View style={styles.graphControls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => zoom(1.2)}>
          <Icon name="zoom-in" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={() => zoom(0.8)}>
          <Icon name="zoom-out" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={resetViewport}>
          <Icon name="refresh" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.graphInfo}>
        <Text style={styles.navigationHint}>
          Arraste para mover • Zoom: {viewport.scale.toFixed(0)}x
        </Text>
        <Text style={styles.functionCount}>
          {functions.filter(f => f.visible).length} função(ões) visível(eis)
        </Text>
      </View>

      {functions.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="functions" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>Nenhuma função no gráfico</Text>
          <Text style={styles.emptyStateSubtext}>
            Use o botão "+" abaixo para adicionar funções
          </Text>
        </View>
      )}
    </View>
  );

  // Renderizar conteúdo da aba
  const renderTabContent = () => {
    switch (activeTab) {
      case 'graph':
        return (
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.tabContent}>
              {renderGraph()}
            </View>

            <View style={styles.controlsContainer}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>Controles</Text>
              </View>

              <View style={styles.panelContent}>

                {functions.map((func) => (
                  <View key={func.id} style={styles.functionCard}>
                    <View style={styles.functionHeader}>
                      <View style={[styles.colorDot, { backgroundColor: func.color }]} />
                      <Text style={styles.expressionText} numberOfLines={1}>
                        f(x) = {func.expression}
                      </Text>
                      <View style={styles.functionActions}>
                        <TouchableOpacity onPress={() => toggleFunction(func.id)}>
                          <Icon
                            name={func.visible ? "visibility" : "visibility-off"}
                            size={18}
                            color={func.visible ? "#3B82F6" : "#9CA3AF"}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => removeFunction(func.id)}>
                          <Icon name="delete" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {Object.keys(func.parameters).length > 0 && (
                      <View style={styles.parametersContainer}>
                        {Object.entries(func.parameters).map(([param, value]) => (
                          <View key={param} style={styles.parameterControl}>
                            <Text style={styles.parameterLabel}>
                              {param}: {value.toFixed(1)}
                            </Text>
                            <Slider
                              style={styles.parameterSlider}
                              minimumValue={-5}
                              maximumValue={5}
                              value={value}
                              onValueChange={(newValue) => updateParameter(func.id, param, newValue)}
                              step={0.1}
                              minimumTrackTintColor={func.color}
                              maximumTrackTintColor="#D1D5DB"
                            />
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        );

      case 'add':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.addFunctionContainer}>
              <Text style={styles.sectionTitle}>Adicionar Função</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, error ? styles.inputError : null]}
                  value={newExpression}
                  onChangeText={(text) => {
                    setNewExpression(text);
                    setError(null);
                  }}
                  placeholder="ex: sin(a*x), x^2 + b*x + c"
                  onSubmitEditing={addFunction}
                  multiline
                />
                <TouchableOpacity style={styles.addButton} onPress={addFunction}>
                  <Icon name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.helpContainer}>
                <Text style={styles.helpTitle}>Ajuda:</Text>
                <Text style={styles.helpText}>
                  • Use 'x' como variável independente{'\n'}
                  • Funções disponíveis: sin, cos, tan, log, ln, sqrt, abs, exp{'\n'}
                  • Use letras para parâmetros ajustáveis (a, b, c, etc.){'\n'}
                  • Exemplos: sin(x), x^2, a*x + b, sin(a*x + b)
                </Text>
              </View>

              <View style={styles.examplesContainer}>
                <Text style={styles.helpTitle}>Exemplos:</Text>
                {[
                  'sin(x)',
                  'x^2',
                  'a*x + b',
                  'sin(a*x + b)',
                  'exp(-x^2)',
                  'log(x)',
                  'sqrt(x)'
                ].map((example, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.exampleButton}
                    onPress={() => setNewExpression(example)}
                  >
                    <Text style={styles.exampleText}>{example}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {renderTabContent()}

      {/* Tab Bar Simplificada */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'graph' && styles.activeTab]}
          onPress={() => setActiveTab('graph')}
        >
          <Icon
            name="timeline"
            size={24}
            color={activeTab === 'graph' ? '#3B82F6' : '#6B7280'}
          />
          <Text style={[styles.tabText, activeTab === 'graph' && styles.activeTabText]}>
            Gráfico
          </Text>
          {functions.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{functions.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'add' && styles.activeTab]}
          onPress={() => setActiveTab('add')}
        >
          <Icon
            name="add-circle"
            size={24}
            color={activeTab === 'add' ? '#3B82F6' : '#6B7280'}
          />
          <Text style={[styles.tabText, activeTab === 'add' && styles.activeTabText]}>
            Adicionar
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  tabContent: {
    flex: 1,
    position: 'relative',
  },
  graphContainer: {
    //margin: 16,
    backgroundColor: '#F9FAFB',
    //borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    backgroundColor: '#FFFFFF',
  },
  graphControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 4,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    padding: 8,
  },
  activeControlButton: {
    backgroundColor: '#E3F2FD',
  },
  graphInfo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navigationHint: {
    fontSize: 12,
    color: '#6B7280',
  },
  functionCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  panelContent: {
    flex: 1,
    padding: 10,
  },
  addFunctionContainer: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'monospace',
    minHeight: 50,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 12,
  },
  helpContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  examplesContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  exampleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  exampleText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#374151',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  functionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#1F2937',
  },
  functionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  parametersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
  },
  parameterControl: {
    marginBottom: 8,
  },
  parameterLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  parameterSlider: {
    height: 30,
  },
  emptyState: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    alignItems: 'center',
    width: 200,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  controlsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
});

export default MathGraphPlotter;