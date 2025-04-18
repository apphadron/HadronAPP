import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedStyle,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";


// Constantes para o Sheet
export const SHEET_HEIGHT = 400;
export const SHEET_OVER_DRAG = 50;

// Tipos
export interface SheetProps {
  /**
   * Função chamada quando o Sheet é fechado
   */
  onClose: () => void;

  /**
   * Conteúdo a ser renderizado dentro do Sheet
   */
  children: ReactNode;

  /**
   * Altura do Sheet em pixels (opcional, padrão: 400)
   */
  height?: number;

  /**
   * Título do Sheet (opcional)
   */
  title?: string;

  /**
   * Estilo adicional para o container do Sheet (opcional)
   */
  containerStyle?: object;
}

/**
 * Componente Sheet - Um bottom sheet deslizável para exibir conteúdo
 */
export function Sheet({
  onClose,
  children,
  height = SHEET_HEIGHT,
  containerStyle = {}
}: SheetProps) {
  // Valor de deslocamento compartilhado para animações
  const offset = useSharedValue(0);

  // Função para fechar o Sheet
  function close() {
    offset.value = 0;
    onClose();
  }

  // Configuração do gesto de deslizar
  const pan = Gesture.Pan()
    .onChange((event) => {
      const offsetDelta = event.changeY + offset.value;
      const clamp = Math.max(-SHEET_OVER_DRAG, offsetDelta);
      offset.value = offsetDelta > 0 ? offsetDelta : withSpring(clamp);
    })
    .onFinalize(() => {
      if (offset.value < height / 3) {
        offset.value = withSpring(0);
      } else {
        offset.value = withTiming(height, {}, () => {
          runOnJS(close)();
        });
      }
    });

  // Estilo animado para movimento vertical
  const translateY = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (

    <Animated.View
      style={[
        styles.container,
        { height },
        translateY,
        containerStyle
      ]}
      entering={SlideInDown.springify().damping(15)}
      exiting={SlideOutDown}
    >
      <GestureDetector gesture={pan}>
        <MaterialCommunityIcons
          name="drag-horizontal"
          color="#999"
          size={24}
          style={styles.dragIcon}
        />

      </GestureDetector>
      {children}
    </Animated.View>
  );
}

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: SHEET_HEIGHT,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 1000,
  },
  dragIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default Sheet;