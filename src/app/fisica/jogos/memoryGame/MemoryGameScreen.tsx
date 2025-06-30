import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StartScreen from '@/app/fisica/jogos/memoryGame/StartScreen';
import MemoryGame from '@/app/fisica/jogos/memoryGame/MemoryGame';

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface GameSettings {
  difficulty: Difficulty;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  showTimer: boolean;
  showMoves: boolean;
  autoFlip: boolean;
  flipDelay: number;
  theme: 'classic' | 'neon' | 'nature' | 'space';
}

type GameState = 'start' | 'playing';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [bestTimes, setBestTimes] = useState<{ [key: string]: number }>({});

  // Carregar dados salvos ao iniciar o app
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedBestTimes = await AsyncStorage.getItem('bestTimes');
      if (savedBestTimes) {
        setBestTimes(JSON.parse(savedBestTimes));
      }
    } catch (error) {
      console.log('Erro ao carregar dados salvos:', error);
    }
  };

  const saveBestTime = async (difficulty: string, time: number) => {
    try {
      const currentBest = bestTimes[difficulty];
      if (!currentBest || time < currentBest) {
        const newBestTimes = { ...bestTimes, [difficulty]: time };
        setBestTimes(newBestTimes);
        await AsyncStorage.setItem('bestTimes', JSON.stringify(newBestTimes));
      }
    } catch (error) {
      console.log('Erro ao salvar melhor tempo:', error);
    }
  };

  const handleStartGame = (settings: GameSettings) => {
    setGameSettings(settings);
    setGameState('playing');
  };

  const handleBackToStart = () => {
    setGameState('start');
    setGameSettings(null);
  };

  if (gameState === 'start') {
    return (
      <StartScreen 
        onStartGame={handleStartGame}
        bestTimes={bestTimes}
      />
    );
  }

  if (gameState === 'playing' && gameSettings) {
    return (
      <MemoryGame 
        settings={gameSettings}
        onBackToStart={handleBackToStart}
        onGameComplete={(time: number) => {
          saveBestTime(gameSettings.difficulty, time);
        }}
      />
    );
  }

  return <View style={{ flex: 1, backgroundColor: '#1e293b' }} />;
}