import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { MemoryGameGenerator } from './MemoryGameGenerator';
import { MemoryGame, MemoryCard, GameState } from '../../types';
import { router } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');
const GRID_SIZE = screenWidth * 0.9;

const MemoryGameComponent: React.FC = () => {
  const [memoryGame, setMemoryGame] = useState<MemoryGame | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    isCompleted: false,
    startTime: 0,
    currentScore: 0
  });
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    generateNewGame();
  }, [difficulty]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.isPlaying && !gameState.isPaused) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.isPlaying, gameState.isPaused]);

  const generateNewGame = () => {
    const game = MemoryGameGenerator.generateGame(difficulty);
    setMemoryGame(game);
    setGameState({
      isPlaying: true,
      isPaused: false,
      isCompleted: false,
      startTime: Date.now(),
      currentScore: 0
    });
    setTimer(0);
  };

  const handleCardPress = (card: MemoryCard) => {
    if (!memoryGame || !gameState.isPlaying || gameState.isPaused) return;
    if (card.isFlipped || card.isMatched) return;
    if (memoryGame.flippedCards.length >= 2) return;

    // Virar a carta
    let updatedGame = MemoryGameGenerator.flipCard(memoryGame, card.id);
    setMemoryGame(updatedGame);

    // Se duas cartas foram viradas, verificar se combinam
    if (updatedGame.flippedCards.length === 2) {
      setTimeout(() => {
        updatedGame = MemoryGameGenerator.checkForMatch(updatedGame);
        setMemoryGame(updatedGame);

        // Verificar se o jogo foi completado
        if (MemoryGameGenerator.isGameComplete(updatedGame)) {
          const finalScore = MemoryGameGenerator.getScore(updatedGame, timer * 1000);
          setGameState(prev => ({
            ...prev,
            isCompleted: true,
            isPlaying: false,
            currentScore: finalScore
          }));
          
          Alert.alert(
            'Parabéns!', 
            `Jogo completado!\nMovimentos: ${updatedGame.moves}\nTempo: ${formatTime(timer)}\nPontuação: ${finalScore}`
          );
        }
      }, 1500);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCardSize = (): number => {
    if (!memoryGame) return 60;
    return (GRID_SIZE - 40) / memoryGame.gridSize;
  };

  const renderGrid = () => {
    if (!memoryGame) return null;

    const cardSize = getCardSize();
    const cardsPerRow = memoryGame.gridSize;
    const totalCards = memoryGame.cards.length;
    const rows = Math.ceil(totalCards / cardsPerRow);

    return (
      <View className="bg-white rounded-lg p-2 mx-4 mb-4" style={{ alignSelf: 'center' }}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <View key={rowIndex} className="flex-row justify-center">
            {memoryGame.cards
              .slice(rowIndex * cardsPerRow, (rowIndex + 1) * cardsPerRow)
              .map((card) => (
                <TouchableOpacity
                  key={card.id}
                  onPress={() => handleCardPress(card)}
                  className={`
                    m-1 rounded-lg border-2 items-center justify-center
                    ${card.isMatched ? 'border-green-500 bg-green-100' : 
                      card.isFlipped ? 'border-blue-500 bg-blue-100' : 
                      'border-gray-300 bg-gray-100'}
                  `}
                  style={{ width: cardSize, height: cardSize }}
                >
                  {card.isFlipped || card.isMatched ? (
                    <Image
                      source={card.imageUri as any}
                      style={{ 
                        width: cardSize * 0.7, 
                        height: cardSize * 0.7 
                      }}
                      resizeMode="contain"
                    />
                  ) : (
                    <View className="w-full h-full bg-space-600 rounded-lg items-center justify-center">
                      <Text className="text-white text-2xl">?</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
          </View>
        ))}
      </View>
    );
  };

  const renderStats = () => {
    if (!memoryGame) return null;

    return (
      <View className="mx-4 mb-4 flex-row justify-around">
        <View className="items-center">
          <Text className="text-white text-lg font-bold">{formatTime(timer)}</Text>
          <Text className="text-space-200 text-sm">Tempo</Text>
        </View>
        <View className="items-center">
          <Text className="text-white text-lg font-bold">{memoryGame.moves}</Text>
          <Text className="text-space-200 text-sm">Movimentos</Text>
        </View>
        <View className="items-center">
          <Text className="text-white text-lg font-bold">
            {memoryGame.matchedPairs}/{memoryGame.cards.length / 2}
          </Text>
          <Text className="text-space-200 text-sm">Pares</Text>
        </View>
      </View>
    );
  };

  const renderDifficultySelector = () => {
    const difficulties: Array<{ key: 'easy' | 'medium' | 'hard', label: string, description: string }> = [
      { key: 'easy', label: 'Fácil', description: '8 pares' },
      { key: 'medium', label: 'Médio', description: '8 pares' },
      { key: 'hard', label: 'Difícil', description: '12 pares' }
    ];

    return (
      <View className="mx-4 mb-4">
        <Text className="text-white text-lg font-bold mb-2">Dificuldade:</Text>
        <View className="flex-row justify-around">
          {difficulties.map(diff => (
            <TouchableOpacity
              key={diff.key}
              onPress={() => setDifficulty(diff.key)}
              className={`
                px-4 py-2 rounded-lg
                ${difficulty === diff.key ? 'bg-cosmic-600' : 'bg-space-600'}
              `}
            >
              <Text className="text-white text-center font-medium">
                {diff.label}
              </Text>
              <Text className="text-white text-center text-xs">
                {diff.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#0c1445', '#1e1b4b', '#312e81']}
      className="flex-1"
    >
      <Header
        title="Jogo da Memória"
        onBack={() => router.back()}
        rightComponent={
          <Text className="text-white text-sm">
            {memoryGame ? `${memoryGame.matchedPairs}/${memoryGame.cards.length / 2}` : '0/0'}
          </Text>
        }
      />

      <ScrollView className="flex-1 pt-4">
        {renderDifficultySelector()}
        {renderStats()}
        {renderGrid()}

        <View className="mx-4 mb-4">
          <Text className="text-space-200 text-sm text-center mb-4">
            Toque nas cartas para virá-las e encontre os pares
          </Text>
          
          <Button
            title="Novo Jogo"
            onPress={generateNewGame}
            variant="secondary"
          />
        </View>

        {gameState.isCompleted && (
          <View className="mx-4 mb-4 p-4 bg-green-600 rounded-lg">
            <Text className="text-white text-center text-lg font-bold">
              🎉 Jogo Completado! 🎉
            </Text>
            <Text className="text-white text-center">
              Tempo: {formatTime(timer)}
            </Text>
            <Text className="text-white text-center">
              Movimentos: {memoryGame?.moves}
            </Text>
            <Text className="text-white text-center">
              Pontuação: {gameState.currentScore}
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default MemoryGameComponent;