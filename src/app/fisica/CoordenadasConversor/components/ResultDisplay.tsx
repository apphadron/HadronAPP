// components/ResultDisplay.tsx - Exibição dos resultados de conversão
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Animated 
} from 'react-native';
import { SimplificationResult } from '../types';
import { UI_COLORS } from '../constants';

interface ResultDisplayProps {
  result: SimplificationResult;
  fromSystem: string;
  toSystem: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  fromSystem,
  toSystem
}) => {
  const [showSteps, setShowSteps] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [result]);

  const toggleSteps = () => {
    setShowSteps(!showSteps);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Resultado da Conversão</Text>
        <Text style={styles.subtitle}>
          {fromSystem} → {toSystem}
        </Text>
      </View>

      <View style={styles.resultSection}>
        <Text style={styles.sectionLabel}>Expressão Original:</Text>
        <View style={styles.expressionContainer}>
          <Text style={styles.expressionText}>{result.original}</Text>
        </View>
      </View>

      <View style={styles.resultSection}>
        <Text style={styles.sectionLabel}>Expressão Convertida:</Text>
        <View style={styles.expressionContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={[styles.expressionText, styles.convertedText]}>
              {result.converted}
            </Text>
          </ScrollView>
        </View>
      </View>

      {result.simplified !== result.converted && (
        <View style={styles.resultSection}>
          <Text style={styles.sectionLabel}>Expressão Simplificada:</Text>
          <View style={[styles.expressionContainer, styles.simplifiedContainer]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={[styles.expressionText, styles.simplifiedText]}>
                {result.simplified}
              </Text>
            </ScrollView>
          </View>
        </View>
      )}

      {result.steps && result.steps.length > 0 && (
        <View style={styles.stepsSection}>
          <TouchableOpacity
            style={styles.stepsToggle}
            onPress={toggleSteps}
            activeOpacity={0.7}
          >
            <Text style={styles.stepsToggleText}>
              {showSteps ? '▼' : '▶'} Passos da Simplificação
            </Text>
          </TouchableOpacity>
          
          {showSteps && (
            <View style={styles.stepsList}>
              {result.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: UI_COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: UI_COLORS.textSecondary,
    fontWeight: '500',
  },
  resultSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: UI_COLORS.text,
    marginBottom: 8,
  },
  expressionContainer: {
    backgroundColor: UI_COLORS.background,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: UI_COLORS.border,
  },
  simplifiedContainer: {
    borderLeftColor: UI_COLORS.secondary,
    backgroundColor: UI_COLORS.secondary + '10',
  },
  expressionText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: UI_COLORS.text,
    lineHeight: 24,
  },
  convertedText: {
    color: UI_COLORS.primary,
  },
  simplifiedText: {
    color: UI_COLORS.secondary,
    fontWeight: '600',
  },
  stepsSection: {
    marginTop: 8,
  },
  stepsToggle: {
    backgroundColor: UI_COLORS.background,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  stepsToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: UI_COLORS.primary,
  },
  stepsList: {
    marginTop: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: UI_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: UI_COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: UI_COLORS.text,
    lineHeight: 20,
  },
});

