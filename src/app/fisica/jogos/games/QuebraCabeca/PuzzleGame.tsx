import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { PuzzleGenerator } from './PuzzleGenerator';
import { PuzzleGame, PuzzlePiece, GameState } from '../../types';
import { router } from 'expo-router';

import puzzle1 from '@/assets/jogos/puzzle1.png';
import puzzle2 from '@/assets/jogos/puzzle2.png';
import puzzle3 from '@/assets/jogos/puzzle3.png';

const { width: screenWidth } = Dimensions.get('window');
const GRID_SIZE = screenWidth * 0.8;

const PuzzleGameComponent: React.FC = () => {
  const [puzzleGame, setPuzzleGame] = useState<PuzzleGame | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    isCompleted: false,
    startTime: 0,
    currentScore: 0
  });
  const [selectedPiece, setSelectedPiece] = useState<PuzzlePiece | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [showFullImage, setShowFullImage] = useState(false);

  const puzzleImages = [
    puzzle1,
    puzzle2,
    puzzle3
  ];

  useEffect(() => {
    generateNewPuzzle();
  }, [difficulty]);

  const generateNewPuzzle = () => {
    const randomImage = puzzleImages[Math.floor(Math.random() * puzzleImages.length)];
    const puzzle = PuzzleGenerator.generatePuzzle(randomImage, difficulty);
    
    setPuzzleGame(puzzle);
    setGameState({
      isPlaying: true,
      isPaused: false,
      isCompleted: false,
      startTime: Date.now(),
      currentScore: 0
    });
    setSelectedPiece(null);
    setShowFullImage(true);
    setTimeout(() => {
      setShowFullImage(false);
    }, 3000);
  };

  const handlePiecePress = (piece: PuzzlePiece) => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    if (selectedPiece?.id === piece.id) {
      setSelectedPiece(null);
    } else {
      setSelectedPiece(piece);
    }
  };

  // Nova função para remover peça do grid
  const handlePlacedPiecePress = (piece: PuzzlePiece) => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    // Remover peça do grid
    PuzzleGenerator.removePiece(piece);
    
    // Atualizar estado
    const updatedPieces = puzzleGame!.pieces.map(p => 
      p.id === piece.id ? { ...p, isPlaced: false, currentPosition: { x: -1, y: -1 } } : p
    );
    
    setPuzzleGame({ ...puzzleGame!, pieces: updatedPieces });
    setSelectedPiece(null);
  };

  const handleGridCellPress = (x: number, y: number) => {
    if (!puzzleGame || !selectedPiece || !gameState.isPlaying) return;

    // Verificar se há uma peça na posição clicada
    const pieceAtPosition = puzzleGame.pieces.find(p => 
      p.isPlaced && p.currentPosition.x === x && p.currentPosition.y === y
    );

    // Se há uma peça na posição e não é a peça selecionada, remover ela primeiro
    if (pieceAtPosition && pieceAtPosition.id !== selectedPiece.id) {
      handlePlacedPiecePress(pieceAtPosition);
      return;
    }

    if (PuzzleGenerator.canPlacePiece(puzzleGame.pieces, selectedPiece, x, y)) {
      // Remover peça da posição atual se estiver colocada
      if (selectedPiece.isPlaced) {
        PuzzleGenerator.removePiece(selectedPiece);
      }

      // Colocar peça na nova posição
      PuzzleGenerator.placePiece(selectedPiece, x, y);
      
      // Atualizar estado
      const updatedPieces = puzzleGame.pieces.map(p => 
        p.id === selectedPiece.id ? selectedPiece : p
      );
      
      setPuzzleGame({ ...puzzleGame, pieces: updatedPieces });
      setSelectedPiece(null);

      // Verificar se o quebra-cabeça foi completado
      if (PuzzleGenerator.isPuzzleComplete(updatedPieces)) {
        const completionTime = Date.now() - gameState.startTime;
        const score = Math.max(1000 - Math.floor(completionTime / 1000), 100);
        
        setGameState(prev => ({
          ...prev,
          isCompleted: true,
          isPlaying: false,
          currentScore: score
        }));
        
        Alert.alert('Parabéns!', `Quebra-cabeça completado!\nPontuação: ${score}`);
      }
    }
  };

  const getPieceSize = (): number => {
    if (!puzzleGame) return 50;
    return GRID_SIZE / puzzleGame.gridSize;
  };

  // Componente para renderizar uma peça recortada
  const PuzzlePieceImage: React.FC<{ piece: PuzzlePiece; size: number }> = ({ piece, size }) => {
    if (!piece.cropArea) {
      return (
        <Image
          source={piece.imageSource}
          style={{ width: size - 2, height: size - 2 }}
          resizeMode="cover"
        />
      );
    }

    const imageSize = size - 2;
    const cropSize = imageSize * puzzleGame!.gridSize; // Tamanho da imagem completa para cálculo
    
    return (
      <View style={{ width: imageSize, height: imageSize, overflow: 'hidden' }}>
        <Image
          source={piece.imageSource}
          style={{
            width: cropSize,
            height: cropSize,
            position: 'absolute',
            left: -(piece.cropArea.x / 100) * cropSize,
            top: -(piece.cropArea.y / 100) * cropSize,
          }}
          resizeMode="cover"
        />
      </View>
    );
  };

  const renderGrid = () => {
    if (!puzzleGame) return null;
    const pieceSize = getPieceSize();
    if (showFullImage) {
      return (
        <View className="bg-white rounded-lg p-2 mx-4 mb-4 items-center justify-center" style={{ width: GRID_SIZE + 16, height: GRID_SIZE + 16, alignSelf: 'center' }}>
          <Image
            source={puzzleGame.imageSource}
            style={{ width: GRID_SIZE, height: GRID_SIZE, borderRadius: 12 }}
            resizeMode="cover"
          />
          <Text className="text-space-700 text-xs mt-2">Memorize a imagem! O jogo começará em instantes...</Text>
        </View>
      );
    }
    const grid = Array(puzzleGame.gridSize).fill(null).map(() => 
      Array(puzzleGame.gridSize).fill(null)
    );

    // Preencher grid com peças colocadas
    puzzleGame.pieces.forEach(piece => {
      if (piece.isPlaced && piece.currentPosition.x >= 0 && piece.currentPosition.y >= 0) {
        grid[piece.currentPosition.y][piece.currentPosition.x] = piece;
      }
    });

    return (
      <View className="bg-white rounded-lg p-2 mx-4 mb-4" style={{ width: GRID_SIZE + 16, alignSelf: 'center' }}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row">
            {row.map((piece, colIndex) => (
              <TouchableOpacity
                key={`${rowIndex}-${colIndex}`}
                onPress={() => handleGridCellPress(colIndex, rowIndex)}
                className={`
                  border border-gray-300 items-center justify-center
                  ${piece && PuzzleGenerator.isPieceInCorrectPosition(piece) ? 'border-green-500 border-2' : ''}
                  ${piece && !PuzzleGenerator.isPieceInCorrectPosition(piece) ? 'border-orange-400 border-2' : ''}
                `}
                style={{ width: pieceSize, height: pieceSize }}
              >
                {piece ? (
                  <TouchableOpacity
                    onPress={() => handlePlacedPiecePress(piece)}
                    style={{ 
                      opacity: PuzzleGenerator.isPieceInCorrectPosition(piece) ? 1 : 0.8,
                      width: '100%',
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <PuzzlePieceImage piece={piece} size={pieceSize} />
                  </TouchableOpacity>
                ) : (
                  <View className="w-full h-full bg-gray-100" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderPiecesArea = () => {
    if (!puzzleGame) return null;

    const unplacedPieces = puzzleGame.pieces.filter(piece => !piece.isPlaced);
    const pieceSize = Math.min(60, (screenWidth - 48) / 4); // Ajusta o tamanho baseado na largura da tela

    return (
      <View className="mx-4 mb-4">
        <Text className="text-white text-lg font-bold mb-2">
          Peças disponíveis: ({unplacedPieces.length})
        </Text>
        <View className="flex-row flex-wrap justify-start">
          {unplacedPieces.map(piece => (
            <TouchableOpacity
              key={piece.id}
              onPress={() => handlePiecePress(piece)}
              className={`
                m-1 border-2 rounded
                ${selectedPiece?.id === piece.id ? 'border-yellow-400' : 'border-gray-300'}
              `}
              style={{ width: pieceSize, height: pieceSize }}
            >
              <PuzzlePieceImage piece={piece} size={pieceSize} />
            </TouchableOpacity>
          ))}
        </View>
        {unplacedPieces.length === 0 && (
          <Text className="text-gray-400 text-center mt-2">
            Todas as peças foram colocadas no grid
          </Text>
        )}
      </View>
    );
  };

  const renderDifficultySelector = () => {
    const difficulties: Array<{ key: 'easy' | 'medium' | 'hard', label: string, grid: string }> = [
      { key: 'easy', label: 'Fácil', grid: '3x3' },
      { key: 'medium', label: 'Médio', grid: '4x4' },
      { key: 'hard', label: 'Difícil', grid: '5x5' }
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
                {diff.grid}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const getCompletionPercentage = (): number => {
    if (!puzzleGame) return 0;
    return PuzzleGenerator.getCompletionPercentage(puzzleGame.pieces);
  };

  return (
    <LinearGradient
      colors={['#0c1445', '#1e1b4b', '#312e81']}
      className="flex-1"
    >
      <Header
        title="Quebra-cabeça"
        onBack={() => router.back()}
        rightComponent={
          <Text className="text-white text-sm">
            {getCompletionPercentage()}%
          </Text>
        }
      />

      <ScrollView className="flex-1 pt-4">
        {renderDifficultySelector()}
        {renderGrid()}
        {renderPiecesArea()}

        <View className="mx-4 mb-4">
          <Text className="text-space-200 text-sm text-center mb-2">
            💡 Dicas:
          </Text>
          <Text className="text-space-200 text-xs text-center mb-1">
            • Selecione uma peça e toque no grid para posicioná-la
          </Text>
          <Text className="text-space-200 text-xs text-center mb-1">
            • Toque em uma peça no grid para removê-la
          </Text>
          <Text className="text-space-200 text-xs text-center mb-4">
            • Peças corretas ficam com borda verde, incorretas com borda laranja
          </Text>
          
          <Button
            title="Novo Quebra-cabeça"
            onPress={generateNewPuzzle}
            variant="secondary"
          />
        </View>

        {gameState.isCompleted && (
          <View className="mx-4 mb-4 p-4 bg-green-600 rounded-lg">
            <Text className="text-white text-center text-lg font-bold">
              🎉 Quebra-cabeça Completado! 🎉
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

export default PuzzleGameComponent;