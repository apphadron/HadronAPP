import { LogBox } from 'react-native';

// Configuração global para React Native
export function configureReactNative() {
  // Suprimir avisos específicos
  LogBox.ignoreLogs([
    // NativeEventEmitter warning
    '`new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method.',
    
    // Outros avisos comuns
    'AsyncStorage has been extracted from react-native core',
    'ViewPropTypes will be removed from React Native',
    'ColorPropType will be removed from React Native',
    'Sending `onAnimatedValueUpdate` with no listeners registered.',
    'Require cycle:',
    'Non-serializable values were found in the navigation state',
  ]);

  // Configurar o console para desenvolvimento
  if (__DEV__) {
    // Suprimir logs específicos em desenvolvimento
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const message = args[0];
      if (typeof message === 'string') {
        // Suprimir avisos específicos
        if (message.includes('NativeEventEmitter') || 
            message.includes('addListener') ||
            message.includes('AsyncStorage has been extracted')) {
          return;
        }
      }
      originalConsoleWarn.apply(console, args);
    };
  }
} 