// WordSearchGame.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LogBox, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';

LogBox.ignoreLogs(['Aviso de arrastar']);

const GRID_SIZE = 15; // Aumentado de 10 para 15
const NUM_WORDS_TO_SHOW = 8; // Aumentado de 6 para 8

type GameMode = 'menu' | 'easy' | 'advanced' | 'settings';
type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

const WORDS_DATA = {
  palavras: [
    { palavra: 'PLANETA', dica: 'Corpo celeste que orbita uma estrela' },
    { palavra: 'ESTRELA', dica: 'Corpo celeste que emite luz própria' },
    { palavra: 'COMETA', dica: 'Corpo celeste com cauda brilhante' },
    { palavra: 'GALAXIA', dica: 'Sistema de milhões de estrelas' },
    { palavra: 'ORBITA', dica: 'Caminho que um corpo percorre ao redor de outro' },
    { palavra: 'NEBULOSA', dica: 'Nuvem interestelar de poeira e gases' },
    { palavra: 'SATELITE', dica: 'Corpo que orbita um planeta' },
    { palavra: 'METEORO', dica: 'Rocha espacial que entra na atmosfera' },
    { palavra: 'ECLIPSE', dica: 'Ocultação temporária de um astro' },
    { palavra: 'BURACO', dica: 'Região do espaço com gravidade extrema' },
    { palavra: 'COSMOS', dica: 'O universo visto como um todo ordenado' },
    { palavra: 'LUNAR', dica: 'Relativo à Lua' },
    { palavra: 'SOLAR', dica: 'Relativo ao Sol' },
    { palavra: 'ASTEROIDE', dica: 'Rocha espacial menor que um planeta' },
    { palavra: 'QUASAR', dica: 'Objeto astronômico muito brilhante e distante' },
  ]
};

const DIRECTIONS = [
  [0, 1], [1, 0], [1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1]
];

interface Word {
  palavra: string;
  dica: string;
  encontrada?: boolean;
  posicoes?: number[][];
}

export default function WordSearchGame() {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [selectedCells, setSelectedCells] = useState<number[][]>([]);
  const [startCell, setStartCell] = useState<number[] | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [foundPositions, setFoundPositions] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (gameMode !== 'menu') {
      initializeGame();
    }
  }, [gameMode]);

  const initializeGame = () => {
    const shuffled = [...WORDS_DATA.palavras].sort(() => 0.5 - Math.random());
    const selectedWords = shuffled.slice(0, NUM_WORDS_TO_SHOW).map(word => ({ ...word, encontrada: false }));
    const newGrid = createGrid(selectedWords);
    setWords(selectedWords);
    setGrid(newGrid);
    setCompletedCount(0);
    setSelectedCells([]);
    setStartCell(null);
    setFoundPositions(new Set());
  };

  const createGrid = (selectedWords: Word[]) => {
    let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    let wordsPlaced = 0;

    // Tentar colocar cada palavra
    selectedWords.forEach(wordObj => {
      if (placeWordInGrid(grid, wordObj)) {
        wordsPlaced++;
      }
    });

    console.log(`Palavras colocadas: ${wordsPlaced}/${selectedWords.length}`);

    // Preencher células vazias com letras aleatórias
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === '') {
          grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    return grid;
  };

  const placeWordInGrid = (grid: string[][], wordObj: Word): boolean => {
    const word = wordObj.palavra;
    let attempts = 0;
    const maxAttempts = 300; // Aumentado para grid maior

    while (attempts < maxAttempts) {
      attempts++;
      const dirIndex = Math.floor(Math.random() * DIRECTIONS.length);
      const [dy, dx] = DIRECTIONS[dirIndex];
      const startRow = Math.floor(Math.random() * GRID_SIZE);
      const startCol = Math.floor(Math.random() * GRID_SIZE);

      if (wordFits(grid, word, startRow, startCol, dy, dx)) {
        const positions: number[][] = [];
        for (let i = 0; i < word.length; i++) {
          const row = startRow + i * dy;
          const col = startCol + i * dx;
          grid[row][col] = word[i];
          positions.push([row, col]);
        }
        wordObj.posicoes = positions;
        console.log(`Palavra "${word}" colocada nas posições:`, positions);
        return true;
      }
    }

    console.log(`Falha ao colocar palavra: ${word}`);
    return false;
  };

  const wordFits = (grid: string[][], word: string, row: number, col: number, dy: number, dx: number): boolean => {
    for (let i = 0; i < word.length; i++) {
      const r = row + i * dy;
      const c = col + i * dx;
      
      // Verificar limites do grid
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
        return false;
      }
      
      // Verificar se a célula está vazia ou já tem a letra correta
      if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
        return false;
      }
    }
    return true;
  };

  const handleCellPress = (row: number, col: number) => {
    if (!startCell) {
      // Primeira célula selecionada
      setStartCell([row, col]);
      setSelectedCells([[row, col]]);
    } else {
      // Segunda célula - definir seleção
      const [startRow, startCol] = startCell;
      const selection = getSelectionPath(startRow, startCol, row, col);
      
      if (selection.length > 1) {
        setSelectedCells(selection);
        // Verificar se é uma palavra válida após um pequeno delay para mostrar a seleção
        setTimeout(() => {
          checkSelectedWord(selection);
        }, 200);
      } else {
        // Se não é uma seleção válida, começar nova seleção
        setStartCell([row, col]);
        setSelectedCells([[row, col]]);
      }
    }
  };

  const getSelectionPath = (startRow: number, startCol: number, endRow: number, endCol: number): number[][] => {
    const dRow = endRow - startRow;
    const dCol = endCol - startCol;
    
    // Verificar se é uma linha válida (horizontal, vertical ou diagonal)
    if (dRow !== 0 && dCol !== 0 && Math.abs(dRow) !== Math.abs(dCol)) {
      return [[startRow, startCol]]; // Seleção inválida
    }
    
    const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
    if (steps === 0) return [[startRow, startCol]];
    
    const stepRow = Math.sign(dRow);
    const stepCol = Math.sign(dCol);
    
    const path: number[][] = [];
    for (let i = 0; i <= steps; i++) {
      const r = startRow + i * stepRow;
      const c = startCol + i * stepCol;
      path.push([r, c]);
    }
    
    return path;
  };

  const checkSelectedWord = (selection: number[][]) => {
    if (selection.length < 2) {
      setSelectedCells([]);
      setStartCell(null);
      return;
    }

    const selectedWord = selection.map(([r, c]) => grid[r][c]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');
    
    console.log('Palavra selecionada:', selectedWord);
    console.log('Palavra reversa:', reversedWord);

    // Procurar por uma palavra que corresponda
    let wordIndex = -1;
    
    if (gameMode === 'easy') {
      // No modo fácil, aceitar apenas palavras na direção normal
      wordIndex = words.findIndex(w => !w.encontrada && w.palavra === selectedWord);
    } else {
      // No modo avançado, aceitar palavras nas duas direções (normal e reversa)
      wordIndex = words.findIndex(w => 
        !w.encontrada && (w.palavra === selectedWord || w.palavra === reversedWord)
      );
    }

    if (wordIndex !== -1) {
      // Palavra encontrada!
      const updatedWords = [...words];
      updatedWords[wordIndex].encontrada = true;
      setWords(updatedWords);
      setCompletedCount(prev => prev + 1);
      
      // Adicionar posições às posições encontradas
      const newFoundPositions = new Set(foundPositions);
      selection.forEach(([r, c]) => {
        newFoundPositions.add(`${r},${c}`);
      });
      setFoundPositions(newFoundPositions);
      
      // Animação de sucesso
      scale.value = withTiming(1.2, { duration: 200 }, () => {
        scale.value = withTiming(1, { duration: 200 });
      });
      
      console.log(`Palavra encontrada: ${words[wordIndex].palavra}`);
    } else {
      console.log('Palavra não encontrada na lista');
    }
    
    // Limpar seleção
    setTimeout(() => {
      setSelectedCells([]);
      setStartCell(null);
    }, wordIndex !== -1 ? 800 : 500);
  };

  const isSelected = (r: number, c: number): boolean => {
    return selectedCells.some(([y, x]) => y === r && x === c);
  };

  const isFound = (r: number, c: number): boolean => {
    return foundPositions.has(`${r},${c}`);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));

  const resetGame = () => {
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(initializeGame)();
      opacity.value = withTiming(1, { duration: 300 });
    });
  };

  const backToMenu = () => {
    setGameMode('menu');
  };

  const startGame = (mode: 'easy' | 'advanced') => {
    setGameMode(mode);
  };

  const openSettings = () => {
    setGameMode('settings');
  };

  const getFontSizeValue = (size: FontSize): number => {
    switch (size) {
      case 'small': return 9;
      case 'medium': return 11;
      case 'large': return 13;
      case 'extra-large': return 15;
      default: return 11;
    }
  };

  const getFontSizeLabel = (size: FontSize): string => {
    switch (size) {
      case 'small': return 'Pequena';
      case 'medium': return 'Média';
      case 'large': return 'Grande';
      case 'extra-large': return 'Extra Grande';
      default: return 'Média';
    }
  };

  // Tela do Menu Principal
  if (gameMode === 'menu') {
    return (
      <GestureHandlerRootView style={styles.container}>
        <LinearGradient colors={['#1a2a6c', '#3c3a67', '#642b73']} style={styles.background} />
        
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>🌟 Caça-Palavras Astronômico 🌟</Text>
            <TouchableOpacity 
              style={styles.settingsButton} 
              onPress={openSettings}
            >
              <Text style={styles.settingsButtonText}>⚙️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.menuSubtitle}>Explore o universo das palavras!</Text>
          
          <View style={styles.modeContainer}>
            <TouchableOpacity 
              style={[styles.modeButton, styles.easyButton]} 
              onPress={() => startGame('easy')}
            >
              <Text style={styles.modeButtonTitle}>🟢 MODO FÁCIL</Text>
              <Text style={styles.modeButtonDesc}>
                As palavras são mostradas{'\n'}
                Apenas direção normal{'\n'}
                Grid {GRID_SIZE}x{GRID_SIZE} • {NUM_WORDS_TO_SHOW} palavras
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modeButton, styles.advancedButton]} 
              onPress={() => startGame('advanced')}
            >
              <Text style={styles.modeButtonTitle}>🔴 MODO AVANÇADO</Text>
              <Text style={styles.modeButtonDesc}>
                Apenas dicas são mostradas{'\n'}
                Palavras em todas as direções{'\n'}
                Grid {GRID_SIZE}x{GRID_SIZE} • {NUM_WORDS_TO_SHOW} palavras
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              ✨ Encontre palavras em todas as direções:{'\n'}
              horizontal, vertical e diagonal{'\n'}
              {'\n'}
              🟢 Modo Fácil: Palavras apenas na direção normal{'\n'}
              🔴 Modo Avançado: Palavras também ao contrário
            </Text>
          </View>
        </View>
      </GestureHandlerRootView>
    );
  }

  // Tela de Configurações
  if (gameMode === 'settings') {
    return (
      <GestureHandlerRootView style={styles.container}>
        <LinearGradient colors={['#1a2a6c', '#3c3a67', '#642b73']} style={styles.background} />
        
        <View style={styles.settingsContainer}>
          <View style={styles.settingsHeader}>
            <TouchableOpacity style={styles.backButton} onPress={backToMenu}>
              <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.settingsTitle}>⚙️ Configurações</Text>
          </View>

          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>🔤 Tamanho da Fonte do Grid</Text>
            <Text style={styles.settingDescription}>
              Ajuste o tamanho das letras no grid para melhor visualização
            </Text>
            
            <View style={styles.fontSizeContainer}>
              {(['small', 'medium', 'large', 'extra-large'] as FontSize[]).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.fontSizeButton,
                    fontSize === size && styles.fontSizeButtonActive
                  ]}
                  onPress={() => setFontSize(size)}
                >
                  <Text style={[
                    styles.fontSizeButtonText,
                    fontSize === size && styles.fontSizeButtonTextActive
                  ]}>
                    {getFontSizeLabel(size)}
                  </Text>
                  <Text style={[
                    styles.fontSizePreview,
                    { fontSize: getFontSizeValue(size) },
                    fontSize === size && styles.fontSizePreviewActive
                  ]}>
                    Aa
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>📋 Pré-visualização:</Text>
            <View style={styles.previewGrid}>
              {Array(3).fill(null).map((_, rowIndex) => (
                <View key={rowIndex} style={styles.previewRow}>
                  {Array(3).fill(null).map((_, colIndex) => (
                    <View key={`${rowIndex}-${colIndex}`} style={styles.previewCell}>
                      <Text style={[
                        styles.previewCellText,
                        { fontSize: getFontSizeValue(fontSize) }
                      ]}>
                        {String.fromCharCode(65 + (rowIndex * 3 + colIndex))}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
            <Text style={styles.previewNote}>
              Tamanho atual: {getFontSizeLabel(fontSize)} ({getFontSizeValue(fontSize)}px)
            </Text>
          </View>

          <View style={styles.accessibilityInfo}>
            <Text style={styles.accessibilityTitle}>♿ Acessibilidade</Text>
            <Text style={styles.accessibilityText}>
              • Use fontes maiores se tiver dificuldade para ler{'\n'}
              • O grid se ajusta automaticamente ao tamanho escolhido{'\n'}
              • Suas configurações são mantidas durante o jogo
            </Text>
          </View>
        </View>
      </GestureHandlerRootView>
    );
  }

  // Tela do Jogo
  return (
    <GestureHandlerRootView style={styles.container}>
      <LinearGradient colors={['#1a2a6c', '#3c3a67', '#642b73']} style={styles.background} />

      <ScrollView contentContainerStyle={styles.gameContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={backToMenu}>
              <Text style={styles.backButtonText}>← Menu</Text>
            </TouchableOpacity>
            <View style={styles.modeIndicator}>
              <Text style={styles.modeText}>
                {gameMode === 'easy' ? '🟢 FÁCIL' : '🔴 AVANÇADO'}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>Caça-Palavras Astronômico</Text>
          <Text style={styles.subtitle}>Encontradas: {completedCount}/{NUM_WORDS_TO_SHOW}</Text>
        </View>

        <Animated.View style={[styles.gridContainer, animatedStyle]}>
          <View style={styles.grid}>
            {grid.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((letter, colIndex) => (
                  <TouchableOpacity
                    key={`${rowIndex}-${colIndex}`}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                    style={[
                      styles.cell,
                      isSelected(rowIndex, colIndex) && styles.selectedCell,
                      isFound(rowIndex, colIndex) && styles.foundCell
                    ]}>
                    <Text style={[
                      styles.cellText,
                      isSelected(rowIndex, colIndex) && styles.selectedCellText,
                      isFound(rowIndex, colIndex) && styles.foundCellText
                    ]}>
                      {letter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.wordList}>
          <Text style={styles.wordListTitle}>
            {gameMode === 'easy' ? 'Palavras para encontrar:' : 'Dicas das palavras:'}
          </Text>
          <View style={styles.wordsContainer}>
            {words.map((word, idx) => (
              <View key={idx} style={[
                styles.wordItem,
                word.encontrada && styles.foundWordItem
              ]}>
                <Text style={[
                  styles.wordText, 
                  word.encontrada && styles.foundWordText
                ]}>
                  {gameMode === 'easy' 
                    ? (word.encontrada ? `✓ ${word.palavra}` : word.palavra)
                    : (word.encontrada ? `✓ ${word.palavra}` : word.dica)
                  }
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={resetGame}>
          <Text style={styles.buttonText}>🔄 Novo Jogo</Text>
        </TouchableOpacity>
        
        {completedCount === NUM_WORDS_TO_SHOW && (
          <View style={styles.winMessage}>
            <Text style={styles.winText}>🎉 Parabéns! 🎉</Text>
            <Text style={styles.winSubText}>
              Você encontrou todas as palavras no modo {gameMode === 'easy' ? 'Fácil' : 'Avançado'}!
            </Text>
            <TouchableOpacity style={styles.winButton} onPress={backToMenu}>
              <Text style={styles.winButtonText}>Voltar ao Menu</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1
  },
  background: { 
    position: 'absolute', 
    top: 0, 
    bottom: 0, 
    left: 0, 
    right: 0 
  },
  
  // Estilos do Menu
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  menuTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10
  },
  menuSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9
  },
  modeContainer: {
    width: '100%',
    gap: 20,
    marginBottom: 30
  },
  modeButton: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  easyButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50'
  },
  advancedButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderColor: '#f44336'
  },
  modeButtonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  modeButtonDesc: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9
  },
  infoContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    width: '100%'
  },
  infoText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20
  },
  
  // Estilos do Jogo
  gameContainer: {
    alignItems: 'center',
    padding: 10,
    paddingBottom: 30
  },
  header: { 
    alignItems: 'center', 
    marginTop: 10, 
    marginBottom: 15,
    width: '100%'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  modeIndicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20
  },
  modeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#fff',
    textAlign: 'center'
  },
  subtitle: { 
    fontSize: 16, 
    color: '#fff',
    marginTop: 5
  },
  gridContainer: { 
    width: '95%', 
    aspectRatio: 1, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 12, 
    padding: 3
  },
  grid: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  row: { 
    flexDirection: 'row' 
  },
  cell: { 
    flex: 1, 
    aspectRatio: 1, 
    margin: 0.5, 
    borderRadius: 3, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.2)' 
  },
  selectedCell: { 
    backgroundColor: '#ffcc00',
    borderWidth: 1,
    borderColor: '#ff9900'
  },
  foundCell: { 
    backgroundColor: '#4CAF50' 
  },
  cellText: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  selectedCellText: { 
    color: '#000' 
  },
  foundCellText: { 
    color: '#fff' 
  },
  wordList: { 
    width: '100%', 
    marginTop: 20,
    paddingHorizontal: 10
  },
  wordListTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff', 
    textAlign: 'center', 
    marginBottom: 12 
  },
  wordsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center',
    gap: 8
  },
  wordItem: { 
    paddingVertical: 10, 
    paddingHorizontal: 14, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    minWidth: 120,
    alignItems: 'center'
  },
  foundWordItem: {
    backgroundColor: 'rgba(76,175,80,0.3)',
    borderColor: '#4CAF50'
  },
  wordText: { 
    color: '#fff', 
    fontWeight: '500',
    fontSize: 13,
    textAlign: 'center'
  },
  foundWordText: { 
    color: '#4CAF50', 
    fontWeight: 'bold'
  },
  button: { 
    backgroundColor: '#ff4d94', 
    paddingHorizontal: 30, 
    paddingVertical: 15, 
    borderRadius: 25, 
    marginTop: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  winMessage: {
    position: 'absolute',
    top: '40%',
    left: '5%',
    right: '5%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  winText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10
  },
  winSubText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20
  },
  winButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20
  },
  winButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  
  // Estilos do Menu Header
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20
  },
  settingsButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 20
  },
  settingsButtonText: {
    fontSize: 20,
    color: '#fff'
  },
  
  // Estilos das Configurações
  settingsContainer: {
    flex: 1,
    padding: 20
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1
  },
  settingGroup: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  settingDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 15,
    lineHeight: 20
  },
  fontSizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  fontSizeButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  fontSizeButtonActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: '#4CAF50'
  },
  fontSizeButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
    marginBottom: 5
  },
  fontSizeButtonTextActive: {
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  fontSizePreview: {
    color: '#fff',
    fontWeight: 'bold'
  },
  fontSizePreviewActive: {
    color: '#4CAF50'
  },
  previewContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15
  },
  previewGrid: {
    alignSelf: 'center',
    marginBottom: 15
  },
  previewRow: {
    flexDirection: 'row'
  },
  previewCell: {
    width: 40,
    height: 40,
    margin: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  previewCellText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  previewNote: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center'
  },
  accessibilityInfo: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 15
  },
  accessibilityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10
  },
  accessibilityText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    lineHeight: 20
  }
});