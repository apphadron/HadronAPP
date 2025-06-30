// components/ExpressionInput.tsx - Campo de entrada de expressão com validação
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Animated 
} from 'react-native';
import { validateExpression } from '../utils/mathUtils';
import { UI_COLORS } from '../constants';

interface ExpressionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  label: string;
}

export const ExpressionInput: React.FC<ExpressionInputProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Digite uma expressão matemática...',
  label
}) => {
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const borderColorAnim = new Animated.Value(0);

  useEffect(() => {
    if (value.trim()) {
      const validation = validateExpression(value);
      setIsValid(validation.isValid);
      setValidationError(validation.error || null);
    } else {
      setIsValid(true);
      setValidationError(null);
    }
  }, [value]);

  useEffect(() => {
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isValid ? UI_COLORS.border : UI_COLORS.danger,
      isValid ? UI_COLORS.primary : UI_COLORS.danger
    ],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Animated.View style={[styles.inputWrapper, { borderColor }]}>
          <TextInput
            style={[styles.input, !isValid && styles.invalidInput]}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            placeholderTextColor={UI_COLORS.textSecondary}
            multiline
            textAlignVertical="top"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {value.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={onClear}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
      
      {!isValid && validationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {validationError}</Text>
        </View>
      )}
      
      {isValid && value.length > 0 && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>✓ Expressão válida</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: UI_COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  inputWrapper: {
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: UI_COLORS.surface,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    fontSize: 16,
    color: UI_COLORS.text,
    padding: 16,
    minHeight: 100,
    maxHeight: 200,
    fontFamily: 'monospace',
  },
  invalidInput: {
    color: UI_COLORS.danger,
  },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: UI_COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  clearButtonText: {
    color: UI_COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  errorContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: UI_COLORS.danger + '15',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: UI_COLORS.danger,
  },
  errorText: {
    color: UI_COLORS.danger,
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: UI_COLORS.secondary + '15',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: UI_COLORS.secondary,
  },
  successText: {
    color: UI_COLORS.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
});

