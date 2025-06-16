import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import axios from 'axios';

// Substitua pela sua chave da API NASA
const NASA_API_KEY = 'hOcGUCow44NRXXUlXuToG3I3S8vAN1jfec0tv6OE';
// URL base da API da NASA APOD
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';
// Chave para API de tradução (exemplo usando API gratuita LibreTranslate)
const TRANSLATE_API_URL = 'https://libretranslate.de/translate';

interface APODData {
  date: string;
  explanation: string;
  title: string;
  url: string;
  media_type: string;
  hdurl?: string;
}

const APODCard = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apodData, setApodData] = useState<APODData | null>(null);
  const [translatedExplanation, setTranslatedExplanation] = useState<string>('');

  // Formatar a data no padrão brasileiro
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Traduzir o texto para português
  const translateText = async (text: string) => {
    try {
      const response = await axios.post(TRANSLATE_API_URL, {
        q: text,
        source: 'en',
        target: 'pt'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data.translatedText;
    } catch (error) {
      console.error('Erro na tradução:', error);
      // Se a tradução falhar, retorna o texto original
      return text;
    }
  };

  // Buscar dados da API APOD
  useEffect(() => {
    const fetchAPOD = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${NASA_API_URL}?api_key=${NASA_API_KEY}`);
        setApodData(response.data);
        
        // Traduzir a explicação
        const translated = await translateText(response.data.explanation);
        setTranslatedExplanation(translated);
        
        setLoading(false);
      } catch (err) {
        setError('Falha ao carregar a imagem astronômica do dia');
        setLoading(false);
        console.error('Erro ao buscar APOD:', err);
      }
    };

    fetchAPOD();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando imagem astronômica do dia...</Text>
      </View>
    );
  }

  if (error || !apodData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text>Verifique sua conexão ou tente novamente mais tarde.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{apodData.title}</Text>
        <Text style={styles.date}>{formatDate(apodData.date)}</Text>
        
        {apodData.media_type === 'image' ? (
          <Image
            source={{ uri: apodData.url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoText}>
              Este conteúdo é um vídeo. Abra no navegador: {apodData.url}
            </Text>
          </View>
        )}
        
        <Text style={styles.explanationTitle}>Descrição:</Text>
        <Text style={styles.explanation}>{translatedExplanation}</Text>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  image: {
    width: '100%',
    height: width * 0.8,
    borderRadius: 8,
    marginBottom: 15,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 15,
  },
  videoText: {
    padding: 20,
    textAlign: 'center',
    color: '#555',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  explanation: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#d9534f',
    marginBottom: 10,
  },
});

export default APODCard;