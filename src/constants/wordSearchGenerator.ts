export function generateWordSearch(gridSize: number, words: string[]): string[][] {
    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
  
    // Verifique se o grid está sendo gerado corretamente
    console.log('Grid inicial gerado:', grid);
  
    const directions = [
      { x: 1, y: 0 },  // Horizontal
      { x: 0, y: 1 },  // Vertical
      { x: 1, y: 1 },  // Diagonal
      { x: -1, y: 1 }, // Diagonal reversa
    ];
  
    const placeWord = (word: string): boolean => {
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const startX = Math.floor(Math.random() * gridSize);
      const startY = Math.floor(Math.random() * gridSize);
  
      for (let i = 0; i < word.length; i++) {
        const x = startX + direction.x * i;
        const y = startY + direction.y * i;
  
        // Verifique se a palavra pode ser colocada no grid
        if (x < 0 || y < 0 || x >= gridSize || y >= gridSize || (grid[y][x] && grid[y][x] !== word[i])) {
          return false;
        }
      }
  
      // Coloque a palavra no grid
      for (let i = 0; i < word.length; i++) {
        const x = startX + direction.x * i;
        const y = startY + direction.y * i;
        grid[y][x] = word[i];
      }
  
      return true;
    };
  
    words.forEach((word) => {
      let placed = false;
      while (!placed) {
        placed = placeWord(word);
      }
    });
  
    // Preencher espaços vazios com letras aleatórias
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (!grid[y][x]) {
          grid[y][x] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
  
    console.log('Grid final gerado:', grid); // Verifique o grid final
  
    return grid;
  }
  