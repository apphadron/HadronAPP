// components/SystemSelector.tsx - Seletor de sistema de coordenadas
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CoordinateSystem } from '../types';
import { COORDINATE_SYSTEMS, UI_COLORS } from '../constants';

interface SystemSelectorProps {
  selectedSystem: CoordinateSystem;
  onSystemChange: (system: CoordinateSystem) => void;
  disabledSystem?: CoordinateSystem;
  title: string;
}

export const SystemSelector: React.FC<SystemSelectorProps> = ({
  selectedSystem,
  onSystemChange,
  disabledSystem,
  title
}) => {
  const systems = Object.keys(COORDINATE_SYSTEMS) as CoordinateSystem[];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.buttonContainer}>
        {systems.map((system) => {
          const isSelected = selectedSystem === system;
          const isDisabled = disabledSystem === system;
          
          return (
            <TouchableOpacity
              key={system}
              style={[
                styles.systemButton,
                isSelected && styles.selectedButton,
                isDisabled && styles.disabledButton
              ]}
              onPress={() => !isDisabled && onSystemChange(system)}
              disabled={isDisabled}
              activeOpacity={isDisabled ? 1 : 0.7}
            >
              <Text style={[
                styles.buttonText,
                isSelected && styles.selectedButtonText,
                isDisabled && styles.disabledButtonText
              ]}>
                {COORDINATE_SYSTEMS[system].name}
              </Text>
              <Text style={[
                styles.variablesText,
                isSelected && styles.selectedVariablesText,
                isDisabled && styles.disabledVariablesText
              ]}>
                {COORDINATE_SYSTEMS[system].variables.join(', ')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: UI_COLORS.text,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  systemButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: UI_COLORS.surface,
    borderWidth: 2,
    borderColor: UI_COLORS.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedButton: {
    backgroundColor: UI_COLORS.primary,
    borderColor: UI_COLORS.primaryDark,
    transform: [{ scale: 1.02 }],
  },
  disabledButton: {
    backgroundColor: UI_COLORS.borderLight,
    borderColor: UI_COLORS.border,
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: UI_COLORS.text,
    textAlign: 'center',
  },
  selectedButtonText: {
    color: UI_COLORS.surface,
  },
  disabledButtonText: {
    color: UI_COLORS.textSecondary,
  },
  variablesText: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  selectedVariablesText: {
    color: UI_COLORS.surface,
    opacity: 0.9,
  },
  disabledVariablesText: {
    color: UI_COLORS.textSecondary,
    opacity: 0.7,
  },
});

