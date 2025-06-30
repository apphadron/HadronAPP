import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { WordSearchGenerator } from './WordSearchGenerator';
import { WordSearchGrid, WordSearchWord, GameState } from '../../types';
import { physicsAstronomyData, getRandomWords } from '../../utils/data';
import { router } from 'expo-router';

const WordSearchGame: React.FC = () => {
  const [gameGrid, setGameGrid] = useState<WordSearchGrid | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    isCompleted: false,
    startTime: 0,
    currentScore: 0
  });
  const [selectedCells, setSelectedCells] = useState<{row: number, col: number}[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState<{row: number, col: number} | null>(null);
  const [direction, setDirection] = useState<{dx: number, dy: number} | null>(null);

  useEffect(() => {
    generateNewGame();
  }, []);

  const generateNewGame = () => {
    const generator = new WordSearchGenerator(12);
    const words = getRandomWords(10);
    const grid = generator.generateGrid(words);
    
    // Adicionar definições às palavras
    grid.words = grid.words.map(wordObj => ({
      ...wordObj,
      definition: physicsAstronomyData.definitions[wordObj.word] || 'Termo científico'
    }));

    setGameGrid(grid);
    setGameState({
      isPlaying: true,
      isPaused: false,
      isCompleted: false,
      startTime: Date.now(),
      currentScore: 0
    });
    setFoundWords([]);
    setSelectedCells([]);
    setStartCell(null);
    setIsSelecting(false);
    setDirection(null);
  };

  const handlePressIn = (row: number, col: number) => {
    if (!gameState.isPlaying || gameState.isPaused) return;
    setIsSelecting(true);
    setStartCell({row, col});
    setSelectedCells([{row, col}]);
    setDirection(null);
  };

  const handlePressOut = () => {
    if (!isSelecting) return;
    setIsSelecting(false);
    setStartCell(null);
    setDirection(null);
    checkForWord(selectedCells);
  };

  const handleHoverIn = (row: number, col: number) => {
    if (!isSelecting || !startCell) return;

    const lastSelectedCell = selectedCells[selectedCells.length - 1];
    if (lastSelectedCell.row === row && lastSelectedCell.col === col) return;

    if (selectedCells.length === 1) {
      const dx = col - startCell.col;
      const dy = row - startCell.row;
      
      const normalizedDx = dx === 0 ? 0 : dx / Math.abs(dx);
      const normalizedDy = dy === 0 ? 0 : dy / Math.abs(dy);
      
      setDirection({dx: normalizedDx, dy: normalizedDy});
      setSelectedCells([startCell, {row, col}]);
      return;
    }

    if (direction) {
      const expectedRow = startCell.row + direction.dy * (selectedCells.length);
      const expectedCol = startCell.col + direction.dx * (selectedCells.length);
      
      if (row === expectedRow && col === expectedCol) {
        setSelectedCells(prev => [...prev, {row, col}]);
      }
    }
  };

  const checkForWord = (selection: {row: number, col: number}[]) => {
    if (!gameGrid || selection.length < 2) {
      setSelectedCells([]);
      return;
    }

    const word = selection.map(cell => gameGrid.grid[cell.row][cell.col]).join('');
    const reverseWord = word.split('').reverse().join('');

    const foundWord = gameGrid.words.find(w => 
      (w.word === word || w.word === reverseWord) && !foundWords.includes(w.word)
    );

    if (foundWord) {
      setFoundWords(prev => [...prev, foundWord.word]);
      setGameState(prev => ({
        ...prev,
        currentScore: prev.currentScore + foundWord.word.length * 10
      }));
      
      Alert.alert('Palavra encontrada!', `${foundWord.word}: ${foundWord.definition}`);
      
      // Verificar se o jogo terminou
      if (foundWords.length + 1 === gameGrid.words.length) {
        setGameState(prev => ({ ...prev, isCompleted: true, isPlaying: false }));
        Alert.alert('Parabéns!', 'Você encontrou todas as palavras!');
      }
    }

    setSelectedCells([]);
  };

  const isCellSelected = (row: number, col: number): boolean => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const isCellInFoundWord = (row: number, col: number): boolean => {
    if (!gameGrid) return false;
    
    return gameGrid.words.some(word => {
      if (!foundWords.includes(word.word)) return false;
      
      const { startRow, startCol, endRow, endCol } = word;
      const dx = endCol > startCol ? 1 : endCol < startCol ? -1 : 0;
      const dy = endRow > startRow ? 1 : endRow < startRow ? -1 : 0;
      
      for (let i = 0; i < word.word.length; i++) {
        const checkRow = startRow + i * dy;
        const checkCol = startCol + i * dx;
        if (checkRow === row && checkCol === col) return true;
      }
      
      return false;
    });
  };

  const renderGrid = () => {
    if (!gameGrid) return null;

    return (
      <View className="bg-white rounded-lg p-2 mx-4 mb-4">
        {gameGrid.grid.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row">
            {row.map((cell, colIndex) => (
              <Pressable
                key={`${rowIndex}-${colIndex}`}
                onPressIn={() => handlePressIn(rowIndex, colIndex)}
                onPressOut={handlePressOut}
                onHoverIn={() => handleHoverIn(rowIndex, colIndex)}
                className={`
                  w-6 h-6 border border-gray-300 items-center justify-center m-0.5
                  ${isCellSelected(rowIndex, colIndex) ? 'bg-yellow-300' : ''}
                  ${isCellInFoundWord(rowIndex, colIndex) ? 'bg-green-200' : ''}
                `}
              >
                <Text className="text-xs font-bold text-gray-800">
                  {cell}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderWordList = () => {
    if (!gameGrid) return null;

    return (
      <View className="mx-4 mb-4">
        <Text className="text-white text-lg font-bold mb-2">
          Palavras para encontrar:
        </Text>
        <View className="flex-row flex-wrap">
          {gameGrid.words.map((wordObj, index) => (
            <View
              key={index}
              className={`
                m-1 px-3 py-1 rounded-full
                ${foundWords.includes(wordObj.word) 
                  ? 'bg-green-600' 
                  : 'bg-space-600'
                }
              `}
            >
              <Text className={`
                text-sm font-medium
                ${foundWords.includes(wordObj.word) 
                  ? 'text-white line-through' 
                  : 'text-white'
                }
              `}>
                {wordObj.word}
              </Text>
            </View>
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
        title="Caça-palavras"
        onBack={() => router.back()}
        rightComponent={
          <Text className="text-white text-sm">
            Pontos: {gameState.currentScore}
          </Text>
        }
      />

      <ScrollView className="flex-1 pt-4">
        {renderGrid()}
        {renderWordList()}

        <View className="mx-4 mb-4">
          <Text className="text-space-200 text-sm text-center mb-4">
            Toque e arraste para selecionar palavras no grid
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
              🎉 Parabéns! 🎉
            </Text>
            <Text className="text-white text-center">
              Pontuação final: {gameState.currentScore}
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default WordSearchGame;

