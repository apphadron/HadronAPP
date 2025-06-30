// screens/ConverterScreen.tsx - Tela principal do conversor
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SystemSelector } from '../components/SystemSelector';
import { ExpressionInput } from '../components/ExpressionInput';
import { ResultDisplay } from '../components/ResultDisplay';
import { ExampleSelector } from '../components/ExampleSelector';
import { useCoordinateConverter } from '../hooks/useCoordinateConverter';
import { COORDINATE_SYSTEMS, SIMPLIFICATION_LEVELS, UI_COLORS } from '../constants';

const ConverterScreen: React.FC = () => {
  const {
    inputExpression,
    fromSystem,
    toSystem,
    simplificationLevel,
    result,
    isLoading,
    error,
    setInputExpression,
    setFromSystem,
    setToSystem,
    setSimplificationLevel,
    convertExpression,
    clearAll
  } = useCoordinateConverter();

  const handleConvert = async () => {
    if (fromSystem === toSystem) {
      Alert.alert(
        'Sistemas Iguais',
        'Por favor, selecione sistemas de coordenadas diferentes para conversão.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    await convertExpression();
  };

  const handleExampleSelect = (expression: string) => {
    setInputExpression(expression);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Conversor de Coordenadas</Text>
          <Text style={styles.subtitle}>
            Converta expressões matemáticas entre diferentes sistemas de coordenadas
          </Text>
        </View>

        {/* Sistema de Origem */}
        <SystemSelector
          title="Sistema de Origem"
          selectedSystem={fromSystem}
          onSystemChange={setFromSystem}
          disabledSystem={toSystem}
        />

        {/* Sistema de Destino */}
        <SystemSelector
          title="Sistema de Destino"
          selectedSystem={toSystem}
          onSystemChange={setToSystem}
          disabledSystem={fromSystem}
        />

        {/* Nível de Simplificação */}
        <View style={styles.simplificationSection}>
          <Text style={styles.sectionTitle}>Nível de Simplificação</Text>
          <View style={styles.simplificationButtons}>
            {Object.entries(SIMPLIFICATION_LEVELS).map(([key, config]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.simplificationButton,
                  simplificationLevel === key && styles.selectedSimplificationButton
                ]}
                onPress={() => setSimplificationLevel(key as 'basic' | 'advanced')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.simplificationButtonText,
                  simplificationLevel === key && styles.selectedSimplificationButtonText
                ]}>
                  {config.name}
                </Text>
                <Text style={[
                  styles.simplificationDescription,
                  simplificationLevel === key && styles.selectedSimplificationDescription
                ]}>
                  {config.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Campo de Entrada */}
        <ExpressionInput
          label="Expressão Matemática"
          value={inputExpression}
          onChangeText={setInputExpression}
          onClear={clearAll}
          placeholder={`Ex: ${COORDINATE_SYSTEMS[fromSystem].variables.join(' + ')}`}
        />

        {/* Seletor de Exemplos */}
        <View style={styles.examplesSection}>
          <ExampleSelector
            currentSystem={fromSystem}
            onSelectExample={handleExampleSelect}
          />
        </View>

        {/* Botão de Conversão */}
        <TouchableOpacity
          style={[
            styles.convertButton,
            (isLoading || !inputExpression.trim()) && styles.disabledButton
          ]}
          onPress={handleConvert}
          disabled={isLoading || !inputExpression.trim()}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={UI_COLORS.surface} size="small" />
              <Text style={styles.convertButtonText}>Convertendo...</Text>
            </View>
          ) : (
            <Text style={styles.convertButtonText}>🔄 Converter</Text>
          )}
        </TouchableOpacity>

        {/* Mensagem de Erro */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Resultados */}
        {result && (
          <ResultDisplay
            result={result}
            fromSystem={COORDINATE_SYSTEMS[fromSystem].name}
            toSystem={COORDINATE_SYSTEMS[toSystem].name}
          />
        )}

        {/* Informações de Ajuda */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>💡 Dicas de Uso</Text>
          <View style={styles.helpContent}>
            <Text style={styles.helpText}>
              • Use operadores matemáticos padrão: +, -, *, /, ^
            </Text>
            <Text style={styles.helpText}>
              • Funções suportadas: sin, cos, tan, sqrt, abs, atan2
            </Text>
            <Text style={styles.helpText}>
              • A simplificação avançada inclui identidades trigonométricas
            </Text>
            <Text style={styles.helpText}>
              • Exemplo: (r*cos(theta))^2 + (r*sin(theta))^2 = r^2
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI_COLORS.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: UI_COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: UI_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: UI_COLORS.text,
    marginBottom: 12,
  },
  simplificationSection: {
    marginVertical: 12,
  },
  simplificationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  simplificationButton: {
    flex: 1,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 2,
    borderColor: UI_COLORS.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  selectedSimplificationButton: {
    backgroundColor: UI_COLORS.primary,
    borderColor: UI_COLORS.primaryDark,
  },
  simplificationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: UI_COLORS.text,
    marginBottom: 4,
  },
  selectedSimplificationButtonText: {
    color: UI_COLORS.surface,
  },
  simplificationDescription: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedSimplificationDescription: {
    color: UI_COLORS.surface,
    opacity: 0.9,
  },
  examplesSection: {
    marginVertical: 12,
  },
  convertButton: {
    backgroundColor: UI_COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: UI_COLORS.textSecondary,
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  convertButtonText: {
    color: UI_COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.danger + '15',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: UI_COLORS.danger,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  errorText: {
    flex: 1,
    color: UI_COLORS.danger,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  helpSection: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: UI_COLORS.text,
    marginBottom: 12,
  },
  helpContent: {
    gap: 8,
  },
  helpText: {
    fontSize: 14,
    color: UI_COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default ConverterScreen;

