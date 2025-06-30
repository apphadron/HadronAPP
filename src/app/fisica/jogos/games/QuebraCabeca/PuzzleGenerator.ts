import { PuzzleGame, PuzzlePiece } from '../../types';
import { ImageSourcePropType } from 'react-native';

export class PuzzleGenerator {
  static generatePuzzle(imageSource: ImageSourcePropType, difficulty: 'easy' | 'medium' | 'hard'): PuzzleGame {
    const gridSize = this.getGridSize(difficulty);
    const pieces: PuzzlePiece[] = [];
    
    let pieceId = 0;
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        pieces.push({
          id: pieceId++,
          currentPosition: { x: -1, y: -1 }, // Inicialmente fora do grid
          correctPosition: { x: col, y: row },
          isPlaced: false,
          imageSource: imageSource,
          // Adicionamos as coordenadas de recorte para esta peça
          cropArea: {
            x: col * (100 / gridSize), // Porcentagem da largura
            y: row * (100 / gridSize), // Porcentagem da altura
            width: 100 / gridSize,     // Largura da peça em porcentagem
            height: 100 / gridSize     // Altura da peça em porcentagem
          }
        });
      }
    }

    // Embaralhar as peças
    this.shufflePieces(pieces);

    return {
      pieces,
      gridSize,
      imageSource: imageSource,
      difficulty
    };
  }

  private static getGridSize(difficulty: 'easy' | 'medium' | 'hard'): number {
    switch (difficulty) {
      case 'easy': return 3;
      case 'medium': return 4;
      case 'hard': return 5;
      default: return 3;
    }
  }

  private static shufflePieces(pieces: PuzzlePiece[]): void {
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
  }

  static isPieceInCorrectPosition(piece: PuzzlePiece): boolean {
    return piece.currentPosition.x === piece.correctPosition.x &&
           piece.currentPosition.y === piece.correctPosition.y;
  }

  static isPositionOccupied(pieces: PuzzlePiece[], x: number, y: number): boolean {
    return pieces.some(piece => 
      piece.currentPosition.x === x && 
      piece.currentPosition.y === y && 
      piece.isPlaced
    );
  }

  static canPlacePiece(pieces: PuzzlePiece[], piece: PuzzlePiece, x: number, y: number): boolean {
    // Verificar se a posição está dentro do grid
    const gridSize = Math.sqrt(pieces.length);
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
      return false;
    }

    // Verificar se a posição não está ocupada
    return !this.isPositionOccupied(pieces, x, y);
  }

  static placePiece(piece: PuzzlePiece, x: number, y: number): void {
    piece.currentPosition = { x, y };
    piece.isPlaced = true;
  }

  static removePiece(piece: PuzzlePiece): void {
    piece.currentPosition = { x: -1, y: -1 };
    piece.isPlaced = false;
  }

  static isPuzzleComplete(pieces: PuzzlePiece[]): boolean {
    return pieces.every(piece => 
      piece.isPlaced && this.isPieceInCorrectPosition(piece)
    );
  }

  static getCompletionPercentage(pieces: PuzzlePiece[]): number {
    const correctPieces = pieces.filter(piece => 
      piece.isPlaced && this.isPieceInCorrectPosition(piece)
    ).length;
    
    return Math.round((correctPieces / pieces.length) * 100);
  }

  static getHint(pieces: PuzzlePiece[]): PuzzlePiece | null {
    // Retorna uma peça que não está na posição correta
    const incorrectPieces = pieces.filter(piece => 
      !piece.isPlaced || !this.isPieceInCorrectPosition(piece)
    );
    
    if (incorrectPieces.length === 0) return null;
    
    return incorrectPieces[Math.floor(Math.random() * incorrectPieces.length)];
  }
}