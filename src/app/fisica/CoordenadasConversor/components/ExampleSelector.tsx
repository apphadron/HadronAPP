// components/ExampleSelector.tsx - Seletor de exemplos de expressões
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  ScrollView,
  Animated 
} from 'react-native';
import { CoordinateSystem } from '../types';
import { EXAMPLE_EXPRESSIONS, UI_COLORS } from '../constants';

interface ExampleSelectorProps {
  currentSystem: CoordinateSystem;
  onSelectExample: (expression: string) => void;
}

export const ExampleSelector: React.FC<ExampleSelectorProps> = ({
  currentSystem,
  onSelectExample
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const selectExample = (key: string) => {
    const expression = EXAMPLE_EXPRESSIONS[key][currentSystem];
    onSelectExample(expression);
    closeModal();
  };

  return (
    <>
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={openModal}
        activeOpacity={0.8}
      >
        <Text style={styles.triggerButtonText}>📚 Exemplos</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Exemplos de Expressões</Text>
              <Text style={styles.modalSubtitle}>
                Sistema: {currentSystem}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.examplesList}>
              {Object.entries(EXAMPLE_EXPRESSIONS).map(([key, expressions]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.exampleItem}
                  onPress={() => selectExample(key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.exampleHeader}>
                    <Text style={styles.exampleTitle}>{key}</Text>
                  </View>
                  <View style={styles.exampleContent}>
                    <Text style={styles.exampleExpression}>
                      {expressions[currentSystem]}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerButton: {
    backgroundColor: UI_COLORS.warning,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  triggerButtonText: {
    color: UI_COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: UI_COLORS.surface,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: UI_COLORS.borderLight,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: UI_COLORS.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: UI_COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: UI_COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: UI_COLORS.surface,
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  examplesList: {
    maxHeight: 400,
  },
  exampleItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: UI_COLORS.borderLight,
  },
  exampleHeader: {
    marginBottom: 8,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: UI_COLORS.text,
  },
  exampleContent: {
    backgroundColor: UI_COLORS.background,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: UI_COLORS.primary,
  },
  exampleExpression: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: UI_COLORS.text,
    lineHeight: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: UI_COLORS.borderLight,
  },
  cancelButton: {
    backgroundColor: UI_COLORS.textSecondary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: UI_COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

