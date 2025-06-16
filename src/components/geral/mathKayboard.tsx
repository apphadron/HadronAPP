import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text, 
  ScrollView, 
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import MathJaxSvg from 'react-native-mathjax-svg';

const { width } = Dimensions.get('window');

interface AdvancedMathKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}

interface KeyConfig {
  display: string;
  mathJs: string;
  latex?: string;
  type?: 'number' | 'operator' | 'function' | 'constant' | 'greek' | 'special';
  size?: 'small' | 'normal' | 'large';
}

export const AdvancedMathKeyboard: React.FC<AdvancedMathKeyboardProps> = ({
  value,
  onChange,
  onSubmit
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'functions' | 'symbols' | 'advanced'>('basic');
  const [error, setError] = useState<string>('');
  const [pressedKey, setPressedKey] = useState<string>('');

  const keyMapping: Record<string, KeyConfig> = {
    // Números
    '0': { display: '0', mathJs: '0', type: 'number' },
    '1': { display: '1', mathJs: '1', type: 'number' },
    '2': { display: '2', mathJs: '2', type: 'number' },
    '3': { display: '3', mathJs: '3', type: 'number' },
    '4': { display: '4', mathJs: '4', type: 'number' },
    '5': { display: '5', mathJs: '5', type: 'number' },
    '6': { display: '6', mathJs: '6', type: 'number' },
    '7': { display: '7', mathJs: '7', type: 'number' },
    '8': { display: '8', mathJs: '8', type: 'number' },
    '9': { display: '9', mathJs: '9', type: 'number' },
    '.': { display: '.', mathJs: '.', type: 'number' },

    // Operadores básicos
    '+': { display: '+', mathJs: '+', latex: '+', type: 'operator' },
    '-': { display: '−', mathJs: '-', latex: '-', type: 'operator' },
    '×': { display: '×', mathJs: '*', latex: '\\times', type: 'operator' },
    '÷': { display: '÷', mathJs: '/', latex: '\\div', type: 'operator' },
    '=': { display: '=', mathJs: '=', latex: '=', type: 'operator' },
    '(': { display: '(', mathJs: '(', latex: '(', type: 'operator' },
    ')': { display: ')', mathJs: ')', latex: ')', type: 'operator' },

    // Potências e raízes
    'x²': { display: 'x²', mathJs: '^2', latex: '^2', type: 'function' },
    'x³': { display: 'x³', mathJs: '^3', latex: '^3', type: 'function' },
    'xⁿ': { display: 'xⁿ', mathJs: '^', latex: '^{?}', type: 'function' },
    '√': { display: '√', mathJs: 'sqrt(', latex: '\\sqrt{?}', type: 'function' },
    '∛': { display: '∛', mathJs: 'cbrt(', latex: '\\sqrt[3]{?}', type: 'function' },
    'ⁿ√': { display: 'ⁿ√', mathJs: 'nthRoot(', latex: '\\sqrt[n]{?}', type: 'function' },

    // Funções trigonométricas
    'sin': { display: 'sin', mathJs: 'sin(', latex: '\\sin(', type: 'function' },
    'cos': { display: 'cos', mathJs: 'cos(', latex: '\\cos(', type: 'function' },
    'tan': { display: 'tan', mathJs: 'tan(', latex: '\\tan(', type: 'function' },
    'asin': { display: 'sin⁻¹', mathJs: 'asin(', latex: '\\arcsin(', type: 'function' },
    'acos': { display: 'cos⁻¹', mathJs: 'acos(', latex: '\\arccos(', type: 'function' },
    'atan': { display: 'tan⁻¹', mathJs: 'atan(', latex: '\\arctan(', type: 'function' },

    // Logaritmos
    'log': { display: 'log', mathJs: 'log10(', latex: '\\log(', type: 'function' },
    'ln': { display: 'ln', mathJs: 'log(', latex: '\\ln(', type: 'function' },
    'log₂': { display: 'log₂', mathJs: 'log2(', latex: '\\log_2(', type: 'function' },

    // Constantes
    'π': { display: 'π', mathJs: 'pi', latex: '\\pi', type: 'constant' },
    'e': { display: 'e', mathJs: 'e', latex: 'e', type: 'constant' },
    '∞': { display: '∞', mathJs: 'Infinity', latex: '\\infty', type: 'constant' },

    // Letras gregas
    'α': { display: 'α', mathJs: 'alpha', latex: '\\alpha', type: 'greek' },
    'β': { display: 'β', mathJs: 'beta', latex: '\\beta', type: 'greek' },
    'γ': { display: 'γ', mathJs: 'gamma', latex: '\\gamma', type: 'greek' },
    'δ': { display: 'δ', mathJs: 'delta', latex: '\\delta', type: 'greek' },
    'θ': { display: 'θ', mathJs: 'theta', latex: '\\theta', type: 'greek' },
    'λ': { display: 'λ', mathJs: 'lambda', latex: '\\lambda', type: 'greek' },
    'μ': { display: 'μ', mathJs: 'mu', latex: '\\mu', type: 'greek' },
    'σ': { display: 'σ', mathJs: 'sigma', latex: '\\sigma', type: 'greek' },
    'φ': { display: 'φ', mathJs: 'phi', latex: '\\phi', type: 'greek' },
    'ω': { display: 'ω', mathJs: 'omega', latex: '\\omega', type: 'greek' },

    // Símbolos especiais
    '|x|': { display: '|x|', mathJs: 'abs(', latex: '|?|', type: 'function' },
    '±': { display: '±', mathJs: '±', latex: '\\pm', type: 'special' },
    '≤': { display: '≤', mathJs: '<=', latex: '\\leq', type: 'special' },
    '≥': { display: '≥', mathJs: '>=', latex: '\\geq', type: 'special' },
    '≠': { display: '≠', mathJs: '!=', latex: '\\neq', type: 'special' },
    '≈': { display: '≈', mathJs: '≈', latex: '\\approx', type: 'special' },
    '∫': { display: '∫', mathJs: 'integral(', latex: '\\int', type: 'special' },
    '∂': { display: '∂', mathJs: 'derivative(', latex: '\\partial', type: 'special' },
  };

  const tabs = [
    { id: 'basic', label: 'Básico', icon: '123' },
    { id: 'functions', label: 'Funções', icon: 'ƒ(x)' },
    { id: 'symbols', label: 'Símbolos', icon: 'αβγ' },
    { id: 'advanced', label: 'Avançado', icon: '∫∂∇' },
  ];

  const keyLayouts = {
    basic: [
      [
        { key: 'AC', span: 1, type: 'control' },
        { key: 'DEL', span: 1, type: 'control' },
        { key: '(', span: 1 },
        { key: ')', span: 1 },
      ],
      [
        { key: '7', span: 1 },
        { key: '8', span: 1 },
        { key: '9', span: 1 },
        { key: '÷', span: 1 },
      ],
      [
        { key: '4', span: 1 },
        { key: '5', span: 1 },
        { key: '6', span: 1 },
        { key: '×', span: 1 },
      ],
      [
        { key: '1', span: 1 },
        { key: '2', span: 1 },
        { key: '3', span: 1 },
        { key: '-', span: 1 },
      ],
      [
        { key: '0', span: 2 },
        { key: '.', span: 1 },
        { key: '+', span: 1 },
      ],
      [
        { key: 'x²', span: 1 },
        { key: '√', span: 1 },
        { key: 'π', span: 1 },
        { key: '=', span: 1, type: 'equals' },
      ],
    ],
    functions: [
      [
        { key: 'sin', span: 1 },
        { key: 'cos', span: 1 },
        { key: 'tan', span: 1 },
        { key: 'π', span: 1 },
      ],
      [
        { key: 'asin', span: 1 },
        { key: 'acos', span: 1 },
        { key: 'atan', span: 1 },
        { key: 'e', span: 1 },
      ],
      [
        { key: 'log', span: 1 },
        { key: 'ln', span: 1 },
        { key: 'log₂', span: 1 },
        { key: '∞', span: 1 },
      ],
      [
        { key: 'x²', span: 1 },
        { key: 'x³', span: 1 },
        { key: 'xⁿ', span: 1 },
        { key: '|x|', span: 1 },
      ],
      [
        { key: '√', span: 1 },
        { key: '∛', span: 1 },
        { key: 'ⁿ√', span: 1 },
        { key: '=', span: 1, type: 'equals' },
      ],
    ],
    symbols: [
      [
        { key: 'α', span: 1 },
        { key: 'β', span: 1 },
        { key: 'γ', span: 1 },
        { key: 'δ', span: 1 },
      ],
      [
        { key: 'θ', span: 1 },
        { key: 'λ', span: 1 },
        { key: 'μ', span: 1 },
        { key: 'σ', span: 1 },
      ],
      [
        { key: 'φ', span: 1 },
        { key: 'ω', span: 1 },
        { key: 'π', span: 1 },
        { key: 'e', span: 1 },
      ],
      [
        { key: '±', span: 1 },
        { key: '≤', span: 1 },
        { key: '≥', span: 1 },
        { key: '≠', span: 1 },
      ],
      [
        { key: '≈', span: 1 },
        { key: '∞', span: 1 },
        { key: '|x|', span: 1 },
        { key: '=', span: 1, type: 'equals' },
      ],
    ],
    advanced: [
      [
        { key: '∫', span: 1 },
        { key: '∂', span: 1 },
        { key: 'sin', span: 1 },
        { key: 'cos', span: 1 },
      ],
      [
        { key: 'log', span: 1 },
        { key: 'ln', span: 1 },
        { key: 'x²', span: 1 },
        { key: '√', span: 1 },
      ],
      [
        { key: 'α', span: 1 },
        { key: 'β', span: 1 },
        { key: 'γ', span: 1 },
        { key: 'π', span: 1 },
      ],
      [
        { key: '±', span: 1 },
        { key: '≤', span: 1 },
        { key: '≥', span: 1 },
        { key: '∞', span: 1 },
      ],
      [
        { key: '(', span: 1 },
        { key: ')', span: 1 },
        { key: '|x|', span: 1 },
        { key: '=', span: 1, type: 'equals' },
      ],
    ],
  };

  const getLatexPreview = useCallback((mathJsExpr: string): string => {
    try {
      if (!mathJsExpr.trim()) return '';

      let latex = mathJsExpr;
      
      // Substituições básicas melhoradas
      latex = latex
        .replace(/\*/g, ' \\cdot ')
        .replace(/\//g, ' \\div ')
        .replace(/\^(\d+)/g, '^{$1}')
        .replace(/pi/g, '\\pi')
        .replace(/infinity/gi, '\\infty')
        .replace(/alpha/g, '\\alpha')
        .replace(/beta/g, '\\beta')
        .replace(/gamma/g, '\\gamma')
        .replace(/delta/g, '\\delta')
        .replace(/theta/g, '\\theta')
        .replace(/lambda/g, '\\lambda')
        .replace(/mu/g, '\\mu')
        .replace(/sigma/g, '\\sigma')
        .replace(/phi/g, '\\phi')
        .replace(/omega/g, '\\omega');

      // Substituição de funções
      Object.entries(keyMapping).forEach(([key, config]) => {
        if (config.mathJs && config.latex && config.mathJs !== key) {
          const regex = new RegExp(config.mathJs.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          latex = latex.replace(regex, config.latex);
        }
      });

      return latex;
    } catch (err) {
      setError('Erro na visualização');
      return value || '';
    }
  }, [value]);

  const handleKeyPress = useCallback((key: string) => {
    try {
      setError('');
      setPressedKey(key);
      setTimeout(() => setPressedKey(''), 150);

      let newValue = value;

      if (key === 'DEL') {
        newValue = value.slice(0, -1);
      } else if (key === 'AC') {
        newValue = '';
      } else if (key === '=') {
        onSubmit?.();
        return;
      } else {
        const mappedKey = keyMapping[key];
        if (mappedKey) {
          newValue += mappedKey.mathJs;
        } else {
          newValue += key;
        }
      }

      onChange(newValue);
    } catch (err) {
      setError('Erro ao processar entrada');
    }
  }, [value, onChange, onSubmit]);

  const getKeyStyle = (key: string, type?: string) => {
    const keyConfig = keyMapping[key];
    const isPressed = pressedKey === key;
    
    let backgroundColor = '#FFFFFF';
    let textColor = '#1A1A1A';
    
    if (type === 'control') {
      backgroundColor = '#FF6B6B';
      textColor = '#FFFFFF';
    } else if (type === 'equals') {
      backgroundColor = '#4ECDC4';
      textColor = '#FFFFFF';
    } else if (keyConfig?.type === 'operator') {
      backgroundColor = '#45B7D1';
      textColor = '#FFFFFF';
    } else if (keyConfig?.type === 'function') {
      backgroundColor = '#96CEB4';
      textColor = '#FFFFFF';
    } else if (keyConfig?.type === 'constant') {
      backgroundColor = '#FFEAA7';
      textColor = '#2D3436';
    } else if (keyConfig?.type === 'greek') {
      backgroundColor = '#DDA0DD';
      textColor = '#FFFFFF';
    } else if (keyConfig?.type === 'special') {
      backgroundColor = '#74B9FF';
      textColor = '#FFFFFF';
    }

    if (isPressed) {
      backgroundColor = '#2D3436';
      textColor = '#FFFFFF';
    }

    return [
      styles.key,
      { backgroundColor },
      isPressed && styles.keyPressed,
    ];
  };

  const getTextStyle = (key: string, type?: string) => {
    const keyConfig = keyMapping[key];
    let textColor = '#1A1A1A';
    
    if (type === 'control' || type === 'equals' || 
        ['operator', 'function', 'greek', 'special'].includes(keyConfig?.type || '')) {
      textColor = '#FFFFFF';
    } else if (keyConfig?.type === 'constant') {
      textColor = '#2D3436';
    }

    if (pressedKey === key) {
      textColor = '#FFFFFF';
    }

    return [
      styles.keyText,
      { color: textColor },
      (key.length > 3 || ['sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'log₂'].includes(key)) && styles.smallText,
    ];
  };

  const renderKey = ({ key, span = 1, type }: { key: string; span?: number; type?: string }) => {
    const keyConfig = keyMapping[key];
    
    return (
      <TouchableOpacity
        key={key}
        style={[
          getKeyStyle(key, type),
          { flex: span },
          span > 1 && styles.wideKey,
        ]}
        onPress={() => handleKeyPress(key)}
        activeOpacity={0.7}
      >
        <Text style={getTextStyle(key, type)}>
          {keyConfig?.display || key}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Display Area */}
      <View style={styles.displayContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.displayContent}
        >
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : (
            <View style={styles.mathContainer}>
              {value ? (
                <MathJaxSvg
                  style={styles.mathPreview}
                  fontSize={24}
                  color="#1A1A1A"
                >
                  {getLatexPreview(value)}
                </MathJaxSvg>
              ) : (
                <Text style={styles.placeholderText}>Digite uma expressão matemática</Text>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.id as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Keyboard */}
      <View style={styles.keyboard}>
        {keyLayouts[activeTab].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map((keyInfo) => renderKey(keyInfo))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 16,
    margin: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  // Display Area
  displayContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  displayContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '100%',
  },
  mathContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  mathPreview: {
    minHeight: 40,
  },
  placeholderText: {
    color: '#ADB5BD',
    fontSize: 16,
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: '500',
  },

  // Tab Navigation
  tabContainer: {
    marginBottom: 16,
  },
  tabScrollContent: {
    paddingHorizontal: 4,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  activeTab: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
    transform: [{ scale: 1.05 }],
  },
  tabIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C5CE7',
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
  },
  activeTabText: {
    color: '#FFFFFF',
  },

  // Keyboard
  keyboard: {
    gap: 8,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  key: {
    flex: 1,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  wideKey: {
    borderRadius: 16,
  },
  keyPressed: {
    transform: [{ scale: 0.95 }],
    ...Platform.select({
      ios: {
        shadowOpacity: 0.2,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  keyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  smallText: {
    fontSize: 16,
  },
});