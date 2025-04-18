import React, { useState, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';
//import MathView from 'react-native-math-view/src/fallback';
import MathJaxSvg from 'react-native-mathjax-svg';
interface AdvancedMathKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}

interface KeyConfig {
  display: string;
  mathJs: string;
  latex?: string;
  color?: string;
}

export const AdvancedMathKeyboard: React.FC<AdvancedMathKeyboardProps> = ({
  value,
  onChange,
  onSubmit
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'functions' | 'greek' | 'advanced'>('main');
  const [error, setError] = useState<string>('');

  // Mapeamento expandido de teclas especiais
  const keyMapping: Record<string, KeyConfig> = {
    // Constantes
    'π': { display: 'π', mathJs: 'pi', latex: '\\pi', color: '#4CAF50' },
    'e': { display: 'e', mathJs: 'e', latex: 'e', color: '#4CAF50' },
    'ℯ': { display: 'ℯ', mathJs: 'e', latex: '\\mathrm{e}', color: '#4CAF50' },
    'i': { display: 'i', mathJs: 'i', latex: 'i', color: '#4CAF50' },
    '∞': { display: '∞', mathJs: 'Infinity', latex: '\\infty', color: '#4CAF50' },

    // Operadores básicos
    '√': { display: '√', mathJs: 'sqrt(', latex: '\\sqrt{?}', color: '#2196F3' },
    'x²': { display: 'x²', mathJs: '^2', latex: '^2', color: '#2196F3' },
    'xⁿ': { display: 'xⁿ', mathJs: '^', latex: '^?', color: '#2196F3' },
    '∛': { display: '∛', mathJs: 'cbrt(', latex: '\\sqrt[3]{?}', color: '#2196F3' },
    '|x|': { display: '|x|', mathJs: 'abs(', latex: '|?|', color: '#2196F3' },

    // Funções trigonométricas
    'sin': { display: 'sin', mathJs: 'sin(', latex: '\\sin(', color: '#FF9800' },
    'cos': { display: 'cos', mathJs: 'cos(', latex: '\\cos(', color: '#FF9800' },
    'tan': { display: 'tan', mathJs: 'tan(', latex: '\\tan(', color: '#FF9800' },
    'csc': { display: 'csc', mathJs: 'csc(', latex: '\\csc(', color: '#FF9800' },
    'sec': { display: 'sec', mathJs: 'sec(', latex: '\\sec(', color: '#FF9800' },
    'cot': { display: 'cot', mathJs: 'cot(', latex: '\\cot(', color: '#FF9800' },

    // Funções inversas
    'asin': { display: 'sin⁻¹', mathJs: 'asin(', latex: '\\arcsin(', color: '#FF9800' },
    'acos': { display: 'cos⁻¹', mathJs: 'acos(', latex: '\\arccos(', color: '#FF9800' },
    'atan': { display: 'tan⁻¹', mathJs: 'atan(', latex: '\\arctan(', color: '#FF9800' },

    // Funções hiperbólicas
    'sinh': { display: 'sinh', mathJs: 'sinh(', latex: '\\sinh(', color: '#FF9800' },
    'cosh': { display: 'cosh', mathJs: 'cosh(', latex: '\\cosh(', color: '#FF9800' },
    'tanh': { display: 'tanh', mathJs: 'tanh(', latex: '\\tanh(', color: '#FF9800' },

    // Logaritmos
    'log': { display: 'log', mathJs: 'log10(', latex: '\\log_{10}(', color: '#9C27B0' },
    'ln': { display: 'ln', mathJs: 'log(', latex: '\\ln(', color: '#9C27B0' },
    'log₂': { display: 'log₂', mathJs: 'log2(', latex: '\\log_2(', color: '#9C27B0' },

    // Letras gregas minúsculas
    'α': { display: 'α', mathJs: 'alpha', latex: '\\alpha', color: '#795548' },
    'β': { display: 'β', mathJs: 'beta', latex: '\\beta', color: '#795548' },
    'γ': { display: 'γ', mathJs: 'gamma', latex: '\\gamma', color: '#795548' },
    'δ': { display: 'δ', mathJs: 'delta', latex: '\\delta', color: '#795548' },
    'ε': { display: 'ε', mathJs: 'epsilon', latex: '\\epsilon', color: '#795548' },
    'θ': { display: 'θ', mathJs: 'theta', latex: '\\theta', color: '#795548' },
    'λ': { display: 'λ', mathJs: 'lambda', latex: '\\lambda', color: '#795548' },
    'μ': { display: 'μ', mathJs: 'mu', latex: '\\mu', color: '#795548' },
    'σ': { display: 'σ', mathJs: 'sigma', latex: '\\sigma', color: '#795548' },
    'φ': { display: 'φ', mathJs: 'phi', latex: '\\phi', color: '#795548' },
    'ω': { display: 'ω', mathJs: 'omega', latex: '\\omega', color: '#795548' },

    // Letras gregas maiúsculas
    'Δ': { display: 'Δ', mathJs: 'Delta', latex: '\\Delta', color: '#795548' },
    'Σ': { display: 'Σ', mathJs: 'Sigma', latex: '\\Sigma', color: '#795548' },
    'Φ': { display: 'Φ', mathJs: 'Phi', latex: '\\Phi', color: '#795548' },
    'Ω': { display: 'Ω', mathJs: 'Omega', latex: '\\Omega', color: '#795548' },
  };

  // Configuração expandida das teclas por tab
  const keys = {
    main: [
      ['7', '8', '9', '÷', '('],
      ['4', '5', '6', '×', ')'],
      ['1', '2', '3', '-', 'x²'],
      ['0', '.', '=', '+', 'xⁿ'],
    ],
    functions: [
      ['sin', 'cos', 'tan', '√'],
      ['asin', 'acos', 'atan', '∛'],
      ['sinh', 'cosh', 'tanh', '|x|'],
      ['log', 'ln', 'log₂', 'e'],
    ],
    greek: [
      ['α', 'β', 'γ', 'δ'],
      ['ε', 'θ', 'λ', 'μ'],
      ['π', 'σ', 'φ', 'ω'],
      ['Δ', 'Σ', 'Φ', 'Ω'],
    ],
    advanced: [
      ['csc', 'sec', 'cot', '∞'],
      ['i', 'ℯ', '±', '∓'],
      ['∂', '∇', '∫', '∮'],
      ['≤', '≥', '≠', '≈'],
    ],
  };

  const getLatexPreview = useCallback((mathJsExpr: string): string => {
    try {
      if (!mathJsExpr.trim()) return '0';

      let latex = mathJsExpr;

      // Substituições básicas
      latex = latex
        .replace(/\*/g, '\\cdot ')
        .replace(/\//g, '\\frac{?}{?}')
        .replace(/\^(\d+)/g, '^{$1}')
        .replace(/pi/g, '\\pi ')
        .replace(/infinity/gi, '\\infty ');

      // Substituição de funções
      Object.entries(keyMapping).forEach(([key, config]) => {
        if (config.mathJs && config.latex) {
          const regex = new RegExp(config.mathJs.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          latex = latex.replace(regex, config.latex);
        }
      });

      return latex;
    } catch (err) {
      setError('Erro na preview: expressão inválida');
      return value || '0';
    }
  }, [keyMapping]);

  const handleKeyPress = useCallback((key: string) => {
    try {
      setError('');
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
          if (key === '×') newValue += '*';
          else if (key === '÷') newValue += '/';
          else newValue += key;
        }
      }

      onChange(newValue);
    } catch (err) {
      setError('Erro ao processar tecla');
    }
  }, [value, onChange, onSubmit]);

  const renderKey = (key: string) => {
    const keyConfig = keyMapping[key];
    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.key,
          keyConfig && { backgroundColor: keyConfig.color || '#fff' },
        ]}
        onPress={() => handleKeyPress(key)}
      >
        <Text style={[
          styles.keyText,
          keyConfig && keyConfig.color ? { color: '#fff' } : {}
        ]}>
          {keyConfig?.display || key}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        <ScrollView horizontal>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (

            <MathJaxSvg
            style={styles.preview}
                >
                    {getLatexPreview(value)}
                </MathJaxSvg>
          )}
        </ScrollView>
      </View>

      <View style={styles.tabContainer}>
        {[
          { id: 'main', label: 'Basic' },
          { id: 'functions', label: 'Funções' },
          { id: 'greek', label: 'Greco' },
          { id: 'advanced', label: 'Avançado' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.keyboard}>
        {keys[activeTab].map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((key) => renderKey(key))}
          </View>
        ))}
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.key, styles.controlKey]}
          onPress={() => handleKeyPress('AC')}
        >
          <Text style={styles.keyText}>AC</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.key, styles.controlKey]}
          onPress={() => handleKeyPress('DEL')}
        >
          <Text style={styles.keyText}>DEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 16,
    elevation: 4,
  },
  previewContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 60,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  preview: {
    minWidth: '100%',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007bff',
  },
  tabText: {
    color: '#495057',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
  keyboard: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  key: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  controlKey: {
    backgroundColor: '#ff5252',
    flex: 1,
  },
  keyText: {
    fontSize: 20,
    color: '#212529',
    fontWeight: '500',
  },
});