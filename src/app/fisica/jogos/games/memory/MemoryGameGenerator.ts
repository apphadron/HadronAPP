import { MemoryGame, MemoryCard } from '../../types';

// Importando as imagens como require
const cardImages = {
  atom: require('@/assets/jogos/memory_atom.png'),
  dna: require('@/assets/jogos/memory_dna.png'),
  telescope: require('@/assets/jogos/memory_telescope.png'),
  rocket: require('@/assets/jogos/memory_rocket.png'),
  planet: require('@/assets/jogos/memory_planet.png'),
  star: require('@/assets/jogos/memory_star.png')
};

export class MemoryGameGenerator {
  private static cardSymbols = [
    { id: 'atom', imageUri: cardImages.atom, name: 'Átomo' },
    { id: 'dna', imageUri: cardImages.dna, name: 'DNA' },
    { id: 'telescope', imageUri: cardImages.telescope, name: 'Telescópio' },
    { id: 'rocket', imageUri: cardImages.rocket, name: 'Foguete' },
    { id: 'planet', imageUri: cardImages.planet, name: 'Planeta' },
    { id: 'star', imageUri: cardImages.star, name: 'Estrela' }
  ];

  static generateGame(difficulty: 'easy' | 'medium' | 'hard'): MemoryGame {
    const gridSize = this.getGridSize(difficulty);
    const totalCards = gridSize * gridSize;
    const pairsNeeded = totalCards / 2;
    
    // Selecionar símbolos aleatórios
    const selectedSymbols = this.getRandomSymbols(pairsNeeded);
    
    // Criar pares de cartas
    const cards: MemoryCard[] = [];
    let cardId = 0;
    
    selectedSymbols.forEach(symbol => {
      // Primeira carta do par
      cards.push({
        id: cardId++,
        symbol: symbol.id,
        isFlipped: false,
        isMatched: false,
        imageUri: symbol.imageUri
      });
      
      // Segunda carta do par
      cards.push({
        id: cardId++,
        symbol: symbol.id,
        isFlipped: false,
        isMatched: false,
        imageUri: symbol.imageUri
      });
    });
    
    // Embaralhar as cartas
    this.shuffleCards(cards);
    
    return {
      cards,
      flippedCards: [],
      matchedPairs: 0,
      moves: 0,
      gridSize
    };
  }

  private static getGridSize(difficulty: 'easy' | 'medium' | 'hard'): number {
    switch (difficulty) {
      case 'easy': return 4;   // 4x4 = 16 cartas (8 pares)
      case 'medium': return 4; // 4x4 = 16 cartas (8 pares) - mesmo tamanho, mas símbolos mais complexos
      case 'hard': return 6;   // 6x6 = 36 cartas (18 pares) - mas vamos usar apenas parte do grid
      default: return 4;
    }
  }

  private static getRandomSymbols(count: number): Array<{id: string, imageUri: any, name: string}> {
    const shuffled = [...this.cardSymbols].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, this.cardSymbols.length));
  }

  private static shuffleCards(cards: MemoryCard[]): void {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  }

  static flipCard(game: MemoryGame, cardId: number): MemoryGame {
    const updatedCards = game.cards.map(card => {
      if (card.id === cardId && !card.isFlipped && !card.isMatched) {
        return { ...card, isFlipped: true };
      }
      return card;
    });

    const flippedCards = updatedCards
      .filter(card => card.isFlipped && !card.isMatched)
      .map(card => card.id);

    return {
      ...game,
      cards: updatedCards,
      flippedCards
    };
  }

  static checkForMatch(game: MemoryGame): MemoryGame {
    if (game.flippedCards.length !== 2) return game;

    const [firstCardId, secondCardId] = game.flippedCards;
    const firstCard = game.cards.find(card => card.id === firstCardId);
    const secondCard = game.cards.find(card => card.id === secondCardId);

    if (!firstCard || !secondCard) return game;

    const isMatch = firstCard.symbol === secondCard.symbol;
    let updatedCards = [...game.cards];
    let matchedPairs = game.matchedPairs;

    if (isMatch) {
      // Marcar cartas como combinadas
      updatedCards = updatedCards.map(card => {
        if (card.id === firstCardId || card.id === secondCardId) {
          return { ...card, isMatched: true };
        }
        return card;
      });
      matchedPairs++;
    } else {
      // Virar cartas de volta após um delay
      setTimeout(() => {
        updatedCards = updatedCards.map(card => {
          if (card.id === firstCardId || card.id === secondCardId) {
            return { ...card, isFlipped: false };
          }
          return card;
        });
      }, 1000);
    }

    return {
      ...game,
      cards: updatedCards,
      flippedCards: [],
      matchedPairs,
      moves: game.moves + 1
    };
  }

  static isGameComplete(game: MemoryGame): boolean {
    const totalPairs = game.cards.length / 2;
    return game.matchedPairs === totalPairs;
  }

  static getScore(game: MemoryGame, timeElapsed: number): number {
    const baseScore = 1000;
    const timeBonus = Math.max(0, 300 - Math.floor(timeElapsed / 1000));
    const movesPenalty = game.moves * 5;
    const matchBonus = game.matchedPairs * 50;
    
    return Math.max(100, baseScore + timeBonus - movesPenalty + matchBonus);
  }

  static getHint(game: MemoryGame): MemoryCard | null {
    // Retorna uma carta não combinada aleatória
    const unmatched = game.cards.filter(card => !card.isMatched && !card.isFlipped);
    if (unmatched.length === 0) return null;
    
    return unmatched[Math.floor(Math.random() * unmatched.length)];
  }
}

