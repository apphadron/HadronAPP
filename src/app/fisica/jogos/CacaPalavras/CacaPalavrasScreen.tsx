// CacaPalavrasScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  PanResponder, 
  Dimensions 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const CELL_SIZE = width / 10;
const GRID_SIZE = 10;

// Dados locais para não depender de importação externa
const palavrasData = {
  "palavras": [
    { "palavra": "PLANETA", "dica": "Corpo celeste que orbita uma estrela" },
    { "palavra": "ESTRELA", "dica": "Corpo celeste que emite luz própria" },
    { "palavra": "GALAXIA", "dica": "Sistema estelar gigante" },
    { "palavra": "COMETA", "dica": "Corpo celeste com cauda luminosa" },
    { "palavra": "ECLIPSE", "dica": "Fenômeno de ocultação de um astro" },
    { "palavra": "NEBULOSA", "dica": "Nuvem interestelar de poeira e gás" },
    { "palavra": "SATELITE", "dica": "Corpo que orbita outro corpo celeste" },
    { "palavra": "ASTEROIDES", "dica": "Pequenos corpos rochosos" },
    { "palavra": "SUPERNOVA", "dica": "Explosão estelar brilhante" },
    { "palavra": "GRAVIDADE", "dica": "Força de atração entre massas" }
  ]
};

// Funções utilitárias inseridas no componente
const gerarTabuleiro = (palavras: Palavra[], tamanho: number = 10): string[][] => {
  // Inicializar tabuleiro vazio
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
        
        if (r < 0 || r >= tamanho || c < 0 || c >= tamanho || 
            (tabuleiro[r][c] !== '' && tabuleiro[r][c] !== palavra.palavra[i])) {
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

const verificarPalavra = (
  letras: string, 
  palavras: Palavra[]
): boolean => {
  return palavras.some(p => p.palavra === letras);
};

export default function CacaPalavrasScreen() {
  const [tabuleiro, setTabuleiro] = useState<string[][]>([]);
  const [palavras, setPalavras] = useState<Palavra[]>([]);
  const [palavrasEncontradas, setPalavrasEncontradas] = useState<string[]>([]);
  const [letrasSelecionadas, setLetrasSelecionadas] = useState<LetraSelecionada[]>([]);
  const [iniciou, setIniciou] = useState<boolean>(false);
  const [dicaAtual, setDicaAtual] = useState<string>("");
  
  // Inicializar o tabuleiro com um array vazio para prevenir erros
  useEffect(() => {
    iniciarJogo();
  }, []);
  
  const iniciarJogo = () => {
    try {
      // Garantir que temos um array de palavras válido
      const palavrasSelecionadas = [...palavrasData.palavras];
      
      // Gerar um tabuleiro 10x10
      const novoTabuleiro = gerarTabuleiro(palavrasSelecionadas, GRID_SIZE);
      
      setTabuleiro(novoTabuleiro);
      setPalavras(palavrasSelecionadas);
      setPalavrasEncontradas([]);
      setLetrasSelecionadas([]);
      setIniciou(false);
      setDicaAtual("");
    } catch (error) {
      console.error("Erro ao iniciar jogo:", error);
      // Inicializar com tabuleiro vazio para evitar erros
      setTabuleiro(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill('A')));
    }
  };
  
  // Coordenadas para a lógica de seleção
  const estaAdjacente = (coord1: Coordenada, coord2: Coordenada): boolean => {
    if (!coord1 || !coord2) return false;
    
    const deltaRow = Math.abs(coord1.row - coord2.row);
    const deltaCol = Math.abs(coord1.col - coord2.col);
    
    // Se for a primeira seleção ou estiver adjacente em linha reta ou diagonal
    if (letrasSelecionadas.length === 0 || 
       (deltaRow <= 1 && deltaCol <= 1 && (deltaRow !== 0 || deltaCol !== 0))) {
      return true;
    }
    
    // Se for uma continuação em linha reta ou diagonal
    if (letrasSelecionadas.length >= 2) {
      const ultimaLetra = letrasSelecionadas[letrasSelecionadas.length - 1];
      const penultimaLetra = letrasSelecionadas[letrasSelecionadas.length - 2];
      
      if (!ultimaLetra || !penultimaLetra) return false;
      
      const dirRow = ultimaLetra.row - penultimaLetra.row;
      const dirCol = ultimaLetra.col - penultimaLetra.col;
      
      const proxRow = ultimaLetra.row + dirRow;
      const proxCol = ultimaLetra.col + dirCol;
      
      return coord2.row === proxRow && coord2.col === proxCol;
    }
    
    return false;
  };
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (!tabuleiro || tabuleiro.length === 0) return;
        
        const { locationX, locationY } = evt.nativeEvent;
        const col = Math.floor(locationX / CELL_SIZE);
        const row = Math.floor(locationY / CELL_SIZE);
        
        // Verificar se as coordenadas são válidas
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
          setLetrasSelecionadas([{ row, col, letra: tabuleiro[row][col] }]);
          setIniciou(true);
        }
      },
      onPanResponderMove: (evt) => {
        if (!tabuleiro || tabuleiro.length === 0 || !iniciou) return;
        
        const { locationX, locationY } = evt.nativeEvent;
        const col = Math.floor(locationX / CELL_SIZE);
        const row = Math.floor(locationY / CELL_SIZE);
        
        // Verificar se está dentro dos limites
        if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
          return;
        }
        
        // Verificar se já foi selecionada
        const jaSelecionada = letrasSelecionadas.some(
          item => item.row === row && item.col === col
        );
        
        if (!jaSelecionada) {
          // Verificar se é adjacente na mesma direção
          const ultima = letrasSelecionadas[letrasSelecionadas.length - 1];
          if (ultima && estaAdjacente(ultima, { row, col })) {
            setLetrasSelecionadas([
              ...letrasSelecionadas,
              { row, col, letra: tabuleiro[row][col] }
            ]);
          }
        }
      },
      onPanResponderRelease: () => {
        if (letrasSelecionadas.length === 0) return;
        
        const palavra = letrasSelecionadas.map(item => item.letra).join('');
        
        if (palavra.length >= 3 && verificarPalavra(palavra, palavras)) {
          // Palavra encontrada
          if (!palavrasEncontradas.includes(palavra)) {
            setPalavrasEncontradas([...palavrasEncontradas, palavra]);
          }
        }
        
        setLetrasSelecionadas([]);
        setIniciou(false);
      }
    })
  ).current;
  
  const mostrarDica = () => {
    // Encontrar palavra aleatória não descoberta
    const palavrasDisponiveis = palavras.filter(
      p => !palavrasEncontradas.includes(p.palavra)
    );
    
    if (palavrasDisponiveis.length > 0) {
      const indiceDica = Math.floor(Math.random() * palavrasDisponiveis.length);
      setDicaAtual(palavrasDisponiveis[indiceDica].dica);
    } else {
      setDicaAtual("Você encontrou todas as palavras!");
    }
  };
  
  const estaSelecionada = (row: number, col: number): boolean => {
    return letrasSelecionadas.some(item => item.row === row && item.col === col);
  };
  
  const estaEncontrada = (row: number, col: number): boolean => {
    // Verificar se esta célula faz parte de alguma palavra encontrada
    for (const palavra of palavrasEncontradas) {
      const letras = palavra.split('');
      
      // Verificar em todas as direções possíveis
      const direcoes = [
        { dr: 0, dc: 1 },  // horizontal
        { dr: 1, dc: 0 },  // vertical
        { dr: 1, dc: 1 },  // diagonal
        { dr: 1, dc: -1 }, // diagonal inversa
        { dr: 0, dc: -1 }, // horizontal inversa
        { dr: -1, dc: 0 }, // vertical inversa
        { dr: -1, dc: -1 }, // diagonal inversa 2
        { dr: -1, dc: 1 }  // diagonal inversa 3
      ];
      
      for (const dir of direcoes) {
        for (let startRow = 0; startRow < GRID_SIZE; startRow++) {
          for (let startCol = 0; startCol < GRID_SIZE; startCol++) {
            let encontrou = true;
            
            for (let i = 0; i < letras.length; i++) {
              const r = startRow + i * dir.dr;
              const c = startCol + i * dir.dc;
              
              if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE || 
                  !tabuleiro[r] || !tabuleiro[r][c] || tabuleiro[r][c] !== letras[i]) {
                encontrou = false;
                break;
              }
            }
            
            if (encontrou) {
              for (let i = 0; i < letras.length; i++) {
                const r = startRow + i * dir.dr;
                const c = startCol + i * dir.dc;
                
                if (r === row && c === col) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    
    return false;
  };

  // Se o tabuleiro estiver vazio, exiba uma tela de carregamento
  if (!tabuleiro || tabuleiro.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Carregando jogo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <Text style={styles.titulo}>Caça-Palavras Astronômico</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.info}>
          Encontradas: {palavrasEncontradas.length}/{6}
        </Text>
        
        {dicaAtual ? (
          <Text style={styles.dicaText}>Dica: {dicaAtual}</Text>
        ) : null}
      </View>
      
      <View 
        {...panResponder.panHandlers}
        style={styles.tabuleiro}
      >
        {tabuleiro.map((linha, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.linha}>
            {linha.map((letra, colIndex) => (
              <View 
                key={`cell-${rowIndex}-${colIndex}`}
                style={[
                  styles.celula,
                  estaSelecionada(rowIndex, colIndex) && styles.celulaSelecionada,
                  estaEncontrada(rowIndex, colIndex) && styles.celulaEncontrada
                ]}
              >
                <Text style={styles.letraTexto}>{letra}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
      
      <View style={styles.botoesContainer}>
        <TouchableOpacity style={styles.botao} onPress={mostrarDica}>
          <Text style={styles.botaoTexto}>Dica</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.botao} onPress={iniciarJogo}>
          <Text style={styles.botaoTexto}>Novo Jogo</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.palavrasEncontradasContainer}>
        <Text style={styles.palavrasEncontradasTitulo}>Palavras Encontradas:</Text>
        <View style={styles.palavrasGrid}>
          {palavrasEncontradas.map((palavra, index) => (
            <Text key={`palavra-${index}`} style={styles.palavraEncontrada}>
              {palavra}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

// Adicione aqui a interface TypeScript
interface Palavra {
  palavra: string;
  dica: string;
}

interface LetraSelecionada {
  row: number;
  col: number;
  letra: string;
}

interface Coordenada {
  row: number;
  col: number;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  dicaText: {
    fontSize: 16,
    color: '#FFD700',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  tabuleiro: {
    width: width - 20,
    height: width - 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linha: {
    flexDirection: 'row',
  },
  celula: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  celulaSelecionada: {
    backgroundColor: '#3D5AFE',
  },
  celulaEncontrada: {
    backgroundColor: '#4CAF50',
  },
  letraTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 15,
  },
  botao: {
    backgroundColor: '#3D5AFE',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 3,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  palavrasEncontradasContainer: {
    width: '100%',
    marginTop: 10,
  },
  palavrasEncontradasTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  palavrasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  palavraEncontrada: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    margin: 5,
    padding: 8,
    borderRadius: 15,
    overflow: 'hidden',
  },
});