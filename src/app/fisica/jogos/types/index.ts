// Em seu arquivo de types
import { ImageSourcePropType } from 'react-native';

export interface PuzzlePiece {
  id: number;
  currentPosition: { x: number; y: number };
  correctPosition: { x: number; y: number };
  isPlaced: boolean;
  imageSource: ImageSourcePropType;
  // Nova propriedade para definir a área de recorte da imagem
  cropArea?: {
    x: number;      // Posição X em porcentagem (0-100)
    y: number;      // Posição Y em porcentagem (0-100)
    width: number;  // Largura em porcentagem (0-100)
    height: number; // Altura em porcentagem (0-100)
  };
}

export interface PuzzleGame {
  pieces: PuzzlePiece[];
  gridSize: number;
  imageSource: ImageSourcePropType;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Tipos gerais para os jogos
export interface GameScore {
  score: number;
  time: number;
  level: number;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  startTime: number;
  currentScore: number;
}

// Tipos para Caça-palavras
export interface WordSearchWord {
  word: string;
  definition: string;
  found: boolean;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  direction: 'horizontal' | 'vertical' | 'diagonal';
}

export interface WordSearchGrid {
  grid: string[][];
  words: WordSearchWord[];
  size: number;
}

// Tipos para Jogo da Memória
export interface MemoryCard {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
  imageUri?: string;
}

export interface MemoryGame {
  cards: MemoryCard[];
  flippedCards: number[];
  matchedPairs: number;
  moves: number;
  gridSize: number;
}

// Dados de Física/Astronomia
export interface PhysicsAstronomyData {
  words: string[];
  definitions: { [key: string]: string };
  symbols: string[];
  images: string[];
}

