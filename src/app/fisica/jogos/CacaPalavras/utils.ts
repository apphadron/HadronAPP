import { Palavra } from './types';
  
export const gerarTabuleiro = (palavras: Palavra[], tamanho: number = 10): string[][] => {
  const tabuleiro: string[][] = Array(tamanho).fill(0).map(() => Array(tamanho).fill(''));
  const palavrasUsadas: Palavra[] = [];
  const direcoes = [
    { dr: 0, dc: 1 },  // horizontal
    { dr: 1, dc: 0 },  // vertical
    { dr: 1, dc: 1 },  // diagonal
    { dr: 1, dc: -1 }, // diagonal inversa
  ];

  // Embaralhar palavras
  const palavrasEmbaralhadas = [...palavras].sort(() => Math.random() - 0.5);

  // Selecionar 6 palavras
  const palavrasSelecionadas = palavrasEmbaralhadas.slice(0, 6);

  for (const palavra of palavrasSelecionadas) {
    let colocada = false;
    let tentativas = 0;
    
    while (!colocada && tentativas < 50) {
      tentativas++;
      
      // Selecionar direção aleatória
      const dir = direcoes[Math.floor(Math.random() * direcoes.length)];
      
      // Calcular posição inicial possível
      const maxRow = dir.dr !== 0 ? tamanho - palavra.palavra.length : tamanho - 1;
      const maxCol = dir.dc !== 0 ? tamanho - palavra.palavra.length : tamanho - 1;
      const minRow = dir.dr < 0 ? palavra.palavra.length - 1 : 0;
      const minCol = dir.dc < 0 ? palavra.palavra.length - 1 : 0;
      
      const row = minRow + Math.floor(Math.random() * (maxRow - minRow + 1));
      const col = minCol + Math.floor(Math.random() * (maxCol - minCol + 1));
      
      // Verificar se a palavra cabe
      let podeColocar = true;
      for (let i = 0; i < palavra.palavra.length; i++) {
        const r = row + i * dir.dr;
        const c = col + i * dir.dc;
        
        if (tabuleiro[r][c] !== '' && tabuleiro[r][c] !== palavra.palavra[i]) {
          podeColocar = false;
          break;
        }
      }
      
      // Colocar palavra no tabuleiro
      if (podeColocar) {
        for (let i = 0; i < palavra.palavra.length; i++) {
          const r = row + i * dir.dr;
          const c = col + i * dir.dc;
          tabuleiro[r][c] = palavra.palavra[i];
        }
        palavrasUsadas.push(palavra);
        colocada = true;
      }
    }
  }
  
  // Preencher espaços vazios com letras aleatórias
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < tamanho; i++) {
    for (let j = 0; j < tamanho; j++) {
      if (tabuleiro[i][j] === '') {
        tabuleiro[i][j] = letras[Math.floor(Math.random() * letras.length)];
      }
    }
  }
  
  return tabuleiro;
};

export const verificarPalavra = (
  letras: string, 
  palavras: Palavra[]
): boolean => {
  return palavras.some(p => p.palavra === letras);
};