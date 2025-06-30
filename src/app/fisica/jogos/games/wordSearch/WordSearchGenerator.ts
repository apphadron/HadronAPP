import { WordSearchGrid, WordSearchWord } from '../../types';

export class WordSearchGenerator {
  private grid: string[][];
  private size: number;
  private words: WordSearchWord[];

  constructor(size: number = 15) {
    this.size = size;
    this.grid = Array(size).fill(null).map(() => Array(size).fill(''));
    this.words = [];
  }

  generateGrid(wordList: string[]): WordSearchGrid {
    // Limpar grid
    this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(''));
    this.words = [];

    // Tentar colocar cada palavra
    const shuffledWords = [...wordList].sort(() => 0.5 - Math.random());
    
    for (const word of shuffledWords.slice(0, 12)) { // Máximo 12 palavras
      this.placeWord(word);
    }

    // Preencher espaços vazios com letras aleatórias
    this.fillEmptySpaces();

    return {
      grid: this.grid,
      words: this.words,
      size: this.size
    };
  }

  private placeWord(word: string): boolean {
    const directions = [
      { dx: 1, dy: 0, name: 'horizontal' as const },
      { dx: 0, dy: 1, name: 'vertical' as const },
      { dx: 1, dy: 1, name: 'diagonal' as const },
      { dx: -1, dy: 1, name: 'diagonal' as const }
    ];

    // Embaralhar direções
    const shuffledDirections = directions.sort(() => 0.5 - Math.random());

    for (const direction of shuffledDirections) {
      for (let attempts = 0; attempts < 50; attempts++) {
        const startRow = Math.floor(Math.random() * this.size);
        const startCol = Math.floor(Math.random() * this.size);

        if (this.canPlaceWord(word, startRow, startCol, direction.dx, direction.dy)) {
          this.placeWordInGrid(word, startRow, startCol, direction.dx, direction.dy, direction.name);
          return true;
        }
      }
    }

    return false;
  }

  private canPlaceWord(word: string, startRow: number, startCol: number, dx: number, dy: number): boolean {
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dy;
      const col = startCol + i * dx;

      if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
        return false;
      }

      if (this.grid[row][col] !== '' && this.grid[row][col] !== word[i]) {
        return false;
      }
    }

    return true;
  }

  private placeWordInGrid(word: string, startRow: number, startCol: number, dx: number, dy: number, direction: 'horizontal' | 'vertical' | 'diagonal'): void {
    const endRow = startRow + (word.length - 1) * dy;
    const endCol = startCol + (word.length - 1) * dx;

    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dy;
      const col = startCol + i * dx;
      this.grid[row][col] = word[i];
    }

    this.words.push({
      word,
      definition: '', // Será preenchida depois
      found: false,
      startRow,
      startCol,
      endRow,
      endCol,
      direction
    });
  }

  private fillEmptySpaces(): void {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.grid[row][col] === '') {
          this.grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
  }

  static findWordInGrid(grid: string[][], word: string, startRow: number, startCol: number): boolean {
    const directions = [
      { dx: 1, dy: 0 },   // horizontal
      { dx: 0, dy: 1 },   // vertical
      { dx: 1, dy: 1 },   // diagonal down-right
      { dx: -1, dy: 1 },  // diagonal down-left
      { dx: -1, dy: 0 },  // horizontal reverse
      { dx: 0, dy: -1 },  // vertical reverse
      { dx: -1, dy: -1 }, // diagonal up-left
      { dx: 1, dy: -1 }   // diagonal up-right
    ];

    for (const { dx, dy } of directions) {
      let found = true;
      
      for (let i = 0; i < word.length; i++) {
        const row = startRow + i * dy;
        const col = startCol + i * dx;
        
        if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length || 
            grid[row][col] !== word[i]) {
          found = false;
          break;
        }
      }
      
      if (found) return true;
    }
    
    return false;
  }
}

