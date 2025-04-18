import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { create, all } from 'mathjs';

// Creating mathjs instance with all functions
const math = create(all);

// Defining types
type CoordinateSystem = 'cartesian' | 'polar' | 'spherical' | 'cylindrical';

// Interface for example expressions
interface ExampleExpression {
  cartesian: string;
  polar: string;
  spherical: string;
  cylindrical: string;
}

// Extend MathJS type to include our custom functions
declare module 'mathjs' {
  interface MathJsInstance {
    expandExpression: (expr: string) => string;
    advancedSubstitutions: (expr: string) => string;
    trigSimplify: (expr: string) => string;
  }
}

// Expanding mathjs capabilities with custom rules
const expandMathCapabilities = () => {
  // Add custom rules for simplification
  math.import({
    // Function to expand expressions before simplifying
    expandExpression: function(expr: string) {
      try {
        // First try to expand the expression
        return math.simplify(expr).toString();
      } catch (e) {
        // If it fails, return the original expression
        return expr.toString();
      }
    },
    
    // Function to apply advanced substitutions
    advancedSubstitutions: function(expr: string) {
      let result = expr.toString();
      
      // Replace known expressions with specific rules
      const substitutions: Array<{
        pattern: RegExp;
        replacement: string | ((match: string, arg1: string, arg2: string) => string);
      }> = [
        // Fundamental trigonometric identity
        { 
          pattern: /sin\(([^)]+)\)\s*\*\*\s*2\s*\+\s*cos\(([^)]+)\)\s*\*\*\s*2/g, 
          replacement: (match: string, arg1: string, arg2: string) => arg1 === arg2 ? '1' : match 
        },
        { 
          pattern: /cos\(([^)]+)\)\s*\*\*\s*2\s*\+\s*sin\(([^)]+)\)\s*\*\*\s*2/g, 
          replacement: (match: string, arg1: string, arg2: string) => arg1 === arg2 ? '1' : match 
        },
          
        // Alternative format of trigonometric identity
        { 
          pattern: /\(sin\(([^)]+)\)\)\^2\s*\+\s*\(cos\(([^)]+)\)\)\^2/g, 
          replacement: (match: string, arg1: string, arg2: string) => arg1 === arg2 ? '1' : match 
        },
        { 
          pattern: /\(cos\(([^)]+)\)\)\^2\s*\+\s*\(sin\(([^)]+)\)\)\^2/g, 
          replacement: (match: string, arg1: string, arg2: string) => arg1 === arg2 ? '1' : match 
        },
          
        // Format with powers
        { 
          pattern: /sin\(([^)]+)\)\^2\s*\+\s*cos\(([^)]+)\)\^2/g, 
          replacement: (match: string, arg1: string, arg2: string) => arg1 === arg2 ? '1' : match 
        },
        { 
          pattern: /cos\(([^)]+)\)\^2\s*\+\s*sin\(([^)]+)\)\^2/g, 
          replacement: (match: string, arg1: string, arg2: string) => arg1 === arg2 ? '1' : match 
        },
        
        // Tangent and cotangent
        { 
          pattern: /sin\(([^)]+)\)\^2\s*\/\s*cos\(([^)]+)\)\^2/g, 
          replacement: (match: string, arg1: string, arg2: string) => arg1 === arg2 ? 'tan(' + arg1 + ')^2' : match 
        },
        { 
          pattern: /cos\(([^)]+)\)\^2\s*\/\s*sin\(([^)]+)\)\^2/g, 
          replacement: (match: string, arg1: string, arg2: string) => arg1 === arg2 ? 'cot(' + arg1 + ')^2' : match 
        },
          
        // Double angle identities
        { 
          pattern: /2\s*\*\s*sin\(([^)]+)\)\s*\*\s*cos\(([^)]+)\)/g,
          replacement: (match: string, arg1: string, arg2: string) => arg1 === arg2 ? 'sin(2*' + arg1 + ')' : match 
        },
        { 
          pattern: /sin\(([^)]+)\)\s*\*\s*2\s*\*\s*cos\(([^)]+)\)/g, 
          replacement: (match: string, arg1: string, arg2: string) => arg1 === arg2 ? 'sin(2*' + arg1 + ')' : match 
        },
          
        // Relations between spherical and cylindrical coordinates
        { pattern: /rho\s*\*\s*sin\(phi\)/g, replacement: 'r' },
        { pattern: /rho\s*\*\s*cos\(phi\)/g, replacement: 'z' },
        
        // Relations between cartesian and polar/cylindrical coordinates
        { pattern: /\(r\s*\*\s*cos\(theta\)\)\^2\s*\+\s*\(r\s*\*\s*sin\(theta\)\)\^2/g, replacement: 'r^2' },
        { pattern: /r\^2\s*\*\s*\(cos\(theta\)\^2\s*\+\s*sin\(theta\)\^2\)/g, replacement: 'r^2' },
        { pattern: /r\^2\s*\*\s*\(\(cos\(theta\)\)\^2\s*\+\s*\(sin\(theta\)\)\^2\)/g, replacement: 'r^2' },
        
        // Simplification of expressions with square roots
        { pattern: /sqrt\(([^)]+)\^2\)/g, replacement: 'abs($1)' },
        { pattern: /sqrt\(x\^2\s*\+\s*y\^2\)/g, replacement: 'r' },
        { pattern: /sqrt\(x\^2\s*\+\s*y\^2\s*\+\s*z\^2\)/g, replacement: 'rho' }
      ];
      
      // Apply all substitutions
      for (const sub of substitutions) {
        if (typeof sub.replacement === 'string') {
          result = result.replace(sub.pattern, sub.replacement);
        } else {
          result = result.replace(sub.pattern, (match: string, p1?: string, p2?: string) => {
            return sub.replacement(match, p1 || '', p2 || '');
          });
        }
      }
      
      return result;
    },
    
    // Function to simplify expressions with trigonometric identities
    trigSimplify: function(expr: string) {
      try {
        // First apply advanced substitutions
        let result = math.advancedSubstitutions(expr);
        
        // Try to expand to find hidden patterns
        result = math.expandExpression(result);
        
        // Simplify the expression using standard simplify
        result = math.simplify(result).toString();
        
        // Apply substitutions again after simplification
        result = math.advancedSubstitutions(result);
        
        // Try to simplify one more time
        result = math.simplify(result).toString();
        
        return result;
      } catch (e) {
        // In case of error, return the original expression
        return expr.toString();
      }
    }
  });
};

// Initialize expanded mathjs capabilities
expandMathCapabilities();

const App = () => {
  // States
  const [inputExpression, setInputExpression] = useState('');
  const [convertedExpression, setConvertedExpression] = useState('');
  const [simplifiedExpression, setSimplifiedExpression] = useState('');
  const [fromSystem, setFromSystem] = useState<CoordinateSystem>('cartesian');
  const [toSystem, setToSystem] = useState<CoordinateSystem>('polar');
  const [error, setError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [simplificationLevel, setSimplificationLevel] = useState<'basic' | 'advanced'>('advanced');

  // Examples of expressions for each system
  const examples: Record<string, ExampleExpression> = {
    'Distância ao quadrado': {
      cartesian: 'x^2 + y^2 + z^2',
      polar: 'r^2 + z^2',
      spherical: 'rho^2',
      cylindrical: 'r^2 + z^2'
    },
    'Plano XY': {
      cartesian: 'z = 0',
      polar: 'z = 0',
      spherical: 'phi = pi/2',
      cylindrical: 'z = 0'
    },
    'Esfera unitária': {
      cartesian: 'x^2 + y^2 + z^2 = 1',
      polar: 'r^2 + z^2 = 1',
      spherical: 'rho = 1',
      cylindrical: 'r^2 + z^2 = 1'
    },
    'Círculo no plano XY': {
      cartesian: 'x^2 + y^2 = 4',
      polar: 'r^2 = 4',
      spherical: 'rho^2 * sin(phi)^2 = 4',
      cylindrical: 'r^2 = 4'
    }
  };

  // Substitution rules for each conversion
  const conversions: Record<CoordinateSystem, Record<CoordinateSystem, Record<string, string>>> = {
    // Cartesian to other systems
    cartesian: {
      polar: {
        x: 'r * cos(theta)',
        y: 'r * sin(theta)',
        z: 'z'
      },
      spherical: {
        x: 'rho * sin(phi) * cos(theta)',
        y: 'rho * sin(phi) * sin(theta)',
        z: 'rho * cos(phi)'
      },
      cylindrical: {
        x: 'r * cos(theta)',
        y: 'r * sin(theta)',
        z: 'z'
      }
    },
    // Polar to other systems
    polar: {
      cartesian: {
        r: 'sqrt(x^2 + y^2)',
        theta: 'atan2(y, x)',
        z: 'z'
      },
      spherical: {
        r: 'rho * sin(phi)',
        theta: 'theta',
        z: 'rho * cos(phi)'
      },
      cylindrical: {
        r: 'r',
        theta: 'theta',
        z: 'z'
      }
    },
    // Spherical to other systems
    spherical: {
      cartesian: {
        rho: 'sqrt(x^2 + y^2 + z^2)',
        phi: 'acos(z/sqrt(x^2 + y^2 + z^2))',
        theta: 'atan2(y, x)'
      },
      polar: {
        rho: 'sqrt(r^2 + z^2)',
        phi: 'atan2(r, z)',
        theta: 'theta'
      },
      cylindrical: {
        rho: 'sqrt(r^2 + z^2)',
        phi: 'atan2(r, z)',
        theta: 'theta'
      }
    },
    // Cylindrical to other systems
    cylindrical: {
      cartesian: {
        r: 'sqrt(x^2 + y^2)',
        theta: 'atan2(y, x)',
        z: 'z'
      },
      polar: {
        r: 'r',
        theta: 'theta',
        z: 'z'
      },
      spherical: {
        r: 'rho * sin(phi)',
        theta: 'theta',
        z: 'rho * cos(phi)'
      }
    }
  };

  // Variables used in each system
  const systemVariables: Record<CoordinateSystem, string[]> = {
    cartesian: ['x', 'y', 'z'],
    polar: ['r', 'theta', 'z'],
    spherical: ['rho', 'phi', 'theta'],
    cylindrical: ['r', 'theta', 'z']
  };

  // Function to convert the expression
  const convertExpression = () => {
    if (!inputExpression.trim()) {
      setError('Por favor, digite uma expressão para converter.');
      return;
    }

    try {
      // Reset error message
      setError(null);

      // If systems are the same, no conversion needed
      if (fromSystem === toSystem) {
        setConvertedExpression(inputExpression);
        setSimplifiedExpression(inputExpression);
        return;
      }

      // Get substitution rules
      const substitutionRules = conversions[fromSystem][toSystem];
      
      // Variables of the source system
      const sourceVars = systemVariables[fromSystem];
      
      // First, parse the expression
      let expr = inputExpression;
      
      // Substitute each variable
      for (const variable of sourceVars) {
        if (expr.includes(variable) && substitutionRules[variable]) {
          // Literal substitution (string)
          const regex = new RegExp(`\\b${variable}\\b`, 'g');
          expr = expr.replace(regex, `(${substitutionRules[variable]})`);
        }
      }
      
      // Set the converted expression (without advanced simplification)
      setConvertedExpression(expr);
      
      // Apply advanced simplification
      try {
        // Initial simplification
        let simplified = math.simplify(expr).toString();
        
        if (simplificationLevel === 'advanced') {
          // Apply advanced trigonometric simplification
          simplified = math.trigSimplify(simplified);
        }
        
        setSimplifiedExpression(simplified);
      } catch (e) {
        // If advanced simplification fails, use basic simplification
        try {
          const simplified = math.simplify(expr).toString();
          setSimplifiedExpression(simplified);
        } catch (e2) {
          // If even basic simplification fails, use unsimplified expression
          setSimplifiedExpression(expr);
        }
      }
    } catch (error) {
      let errorMsg = 'Erro na conversão';
      if (error instanceof Error) {
        errorMsg += ': ' + error.message;
      }
      setError(errorMsg);
      setConvertedExpression('');
      setSimplifiedExpression('');
    }
  };

  // Clear expression and results
  const clearFields = () => {
    setInputExpression('');
    setConvertedExpression('');
    setSimplifiedExpression('');
    setError(null);
  };

  // Select an example
  const selectExample = (exampleKey: string) => {
    setInputExpression(examples[exampleKey][fromSystem]);
    setShowExamples(false);
  };

  // Update input when source system changes
  useEffect(() => {
    // Clear fields when changing systems to avoid confusion
    clearFields();
  }, [fromSystem]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Conversor de Coordenadas</Text>
        
        {/* Source system */}
        <Text style={styles.sectionTitle}>Sistema de Origem:</Text>
        <View style={styles.systemSelector}>
          {(['cartesian', 'polar', 'spherical', 'cylindrical'] as CoordinateSystem[]).map((system) => (
            <TouchableOpacity
              key={system}
              style={[
                styles.systemButton,
                fromSystem === system && styles.selectedSystemButton
              ]}
              onPress={() => setFromSystem(system)}
            >
              <Text style={[
                styles.systemButtonText,
                fromSystem === system && styles.selectedSystemButtonText
              ]}>
                {system === 'cartesian' ? 'Cartesiano' :
                 system === 'polar' ? 'Polar' :
                 system === 'spherical' ? 'Esférico' : 'Cilíndrico'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Destination system */}
        <Text style={styles.sectionTitle}>Sistema de Destino:</Text>
        <View style={styles.systemSelector}>
          {(['cartesian', 'polar', 'spherical', 'cylindrical'] as CoordinateSystem[]).map((system) => (
            <TouchableOpacity
              key={system}
              style={[
                styles.systemButton,
                toSystem === system && styles.selectedSystemButton,
                fromSystem === system && styles.disabledSystemButton
              ]}
              disabled={fromSystem === system}
              onPress={() => setToSystem(system)}
            >
              <Text style={[
                styles.systemButtonText,
                toSystem === system && styles.selectedSystemButtonText,
                fromSystem === system && styles.disabledSystemButtonText
              ]}>
                {system === 'cartesian' ? 'Cartesiano' :
                 system === 'polar' ? 'Polar' :
                 system === 'spherical' ? 'Esférico' : 'Cilíndrico'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Simplification level */}
        <Text style={styles.sectionTitle}>Nível de Simplificação:</Text>
        <View style={styles.simplificationSelector}>
          <TouchableOpacity
            style={[
              styles.simplificationButton,
              simplificationLevel === 'basic' && styles.selectedSimplificationButton
            ]}
            onPress={() => setSimplificationLevel('basic')}
          >
            <Text style={[
              styles.simplificationButtonText,
              simplificationLevel === 'basic' && styles.selectedSimplificationButtonText
            ]}>
              Básica
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.simplificationButton,
              simplificationLevel === 'advanced' && styles.selectedSimplificationButton
            ]}
            onPress={() => setSimplificationLevel('advanced')}
          >
            <Text style={[
              styles.simplificationButtonText,
              simplificationLevel === 'advanced' && styles.selectedSimplificationButtonText
            ]}>
              Avançada (Trig, Log, Exp)
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Input expression */}
        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>Expressão:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={`Ex: ${systemVariables[fromSystem].join(', ')}`}
              value={inputExpression}
              onChangeText={setInputExpression}
              multiline
            />
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearFields}
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          {/* Examples button */}
          <TouchableOpacity 
            style={styles.exampleButton}
            onPress={() => setShowExamples(!showExamples)}
          >
            <Text style={styles.exampleButtonText}>
              {showExamples ? 'Ocultar Exemplos' : 'Mostrar Exemplos'}
            </Text>
          </TouchableOpacity>
          
          {/* Examples list */}
          {showExamples && (
            <View style={styles.examplesContainer}>
              {Object.keys(examples).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.exampleItem}
                  onPress={() => selectExample(key)}
                >
                  <Text style={styles.exampleTitle}>{key}</Text>
                  <Text style={styles.exampleText}>{examples[key][fromSystem]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {/* Convert button */}
        <TouchableOpacity 
          style={styles.convertButton}
          onPress={convertExpression}
        >
          <Text style={styles.convertButtonText}>Converter</Text>
        </TouchableOpacity>
        
        {/* Error message */}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        {/* Results */}
        {convertedExpression && (
          <View style={styles.resultContainer}>
            <Text style={styles.sectionTitle}>Expressão Convertida:</Text>
            <Text style={styles.resultLabel}>Forma direta:</Text>
            <Text style={styles.resultText}>{convertedExpression}</Text>
            
            {simplifiedExpression && simplifiedExpression !== convertedExpression && (
              <>
                <Text style={styles.resultLabel}>Forma simplificada:</Text>
                <Text style={styles.resultText}>{simplifiedExpression}</Text>
              </>
            )}
          </View>
        )}
        
        {/* Help information */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>Variáveis por Sistema:</Text>
          <View style={styles.helpGrid}>
            {Object.entries(systemVariables).map(([system, vars]) => (
              <View key={system} style={styles.helpItem}>
                <Text style={styles.helpSystem}>
                  {system === 'cartesian' ? 'Cartesiano' :
                   system === 'polar' ? 'Polar' :
                   system === 'spherical' ? 'Esférico' : 'Cilíndrico'}:
                </Text>
                <Text style={styles.helpVars}>{vars.join(', ')}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles would be defined here
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 8,
    color: '#444',
  },
  systemSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  systemButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSystemButton: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  disabledSystemButton: {
    opacity: 0.5,
  },
  systemButtonText: {
    color: '#333',
  },
  selectedSystemButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledSystemButtonText: {
    color: '#999',
  },
  simplificationSelector: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  simplificationButton: {
    flex: 1,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#eee',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSimplificationButton: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  simplificationButtonText: {
    color: '#333',
  },
  selectedSimplificationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    minHeight: 80,
    backgroundColor: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  clearButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 20,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  exampleButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f39c12',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  exampleButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  examplesContainer: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exampleItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exampleTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  exampleText: {
    color: '#666',
  },
  convertButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 15,
  },
  convertButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#e74c3c',
    marginVertical: 10,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 15,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultLabel: {
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    color: '#555',
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  helpContainer: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 15,
    marginTop: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  helpTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  helpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  helpItem: {
    width: '50%',
    paddingVertical: 5,
  },
  helpSystem: {
    fontWeight: '600',
    color: '#444',
  },
  helpVars: {
    color: '#666',
  }
});

export default App;