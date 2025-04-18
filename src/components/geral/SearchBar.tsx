import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ViewStyle, TextStyle, TouchableOpacityProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  containerStyle?: ViewStyle; // Para o container do componente
  inputStyle?: TextStyle;     // Para o TextInput
  iconStyle?: ViewStyle;      // Para o ícone de microfone
  placeholderStyle?: TextStyle; // Para o placeholder do TextInput
  iconColor?: string;         // Nova propriedade para a cor do ícone
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  containerStyle,
  inputStyle,
  iconStyle,
  placeholderStyle,
  iconColor = 'black', // Valor padrão
}) => {
  const [isListening, setIsListening] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  async function handleListening() {
    try {
      if (isListening) {
        await Voice.stop();
        setIsListening(false);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      } else {
        setSearchQuery('');
        await Voice.start('pt-BR');
        setIsListening(true);

        const newTimeoutId = setTimeout(() => {
          Voice.stop();
          setIsListening(false);
        }, 3000);

        setTimeoutId(newTimeoutId);
      }
    } catch (error) {
      console.error('Erro ao iniciar a gravação:', error);
    }
  }

  function onSpeechResults({ value }: SpeechResultsEvent) {
    console.log('Resultados do reconhecimento de voz:', value);

    if (value) {
      const text = value.join(' ').replace(',', ' ');
      setSearchQuery(text);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        Voice.stop();
        setIsListening(false);
      }, 3000);

      setTimeoutId(newTimeoutId);
    }
  }

  useEffect(() => {
    const initVoice = async () => {
      try {
        if (Voice) {
          Voice.onSpeechResults = onSpeechResults;
        }
      } catch (error) {
        console.error('Erro ao configurar o Voice:', error);
      }
    };

    initVoice();

    return () => {
      if (Voice) {
        Voice.removeAllListeners();
      }
    };
  }, []);

  return (
    <View style={[{ width: '90%', flexDirection: 'row', alignItems: 'center', marginBottom: 24 }, containerStyle]}>
      <View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', borderWidth: 1, borderColor: 'white', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }, containerStyle]}>
        <Feather
        name="search"
        size={20} 
        style={[iconStyle, { color: iconColor }]}
        />

        <TextInput
          placeholder={isListening ? 'Gravando...' : 'Pesquisar...'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[{ flex: 1, marginLeft: 8, color: 'white' }, inputStyle]}
          editable={!isListening}
        />
        <TouchableOpacity
          onPress={handleListening}
          style={[{ padding: 8, borderRadius: 999, backgroundColor: isListening ? 'red' : 'gray' }, iconStyle]}
        >
          <Feather
            name={isListening ? 'mic-off' : 'mic'}
            size={20}
            style={[iconStyle, { color: iconColor }]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
