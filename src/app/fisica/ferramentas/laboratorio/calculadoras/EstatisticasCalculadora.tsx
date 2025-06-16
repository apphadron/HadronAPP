import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Share,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '@/components/geral/ThemeContext';
import { colors } from '@/styles/colors';

interface Statistics {
  mean: number;
  median: number;
  mode: number[];
  variance: number;
  standardDeviation: number;
  range: number;
  min: number;
  max: number;
  count: number;
  sum: number;
  standardError: number;
  coefficientOfVariation: number;
}

const PhysicsStatsApp: React.FC = () => {
  const [inputData, setInputData] = useState<string>('');
  const [dataSet, setDataSet] = useState<number[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  const theme = useTheme();


  // Função para calcular todas as estatísticas
  const calculateStatistics = (data: number[]): Statistics => {
    if (data.length === 0) {
      throw new Error('Dataset vazio');
    }

    const sorted = [...data].sort((a, b) => a - b);
    const n = data.length;
    const sum = data.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;

    // Mediana
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

    // Moda
    const frequency: { [key: number]: number } = {};
    data.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(frequency));
    const mode = Object.keys(frequency)
      .filter(key => frequency[Number(key)] === maxFreq)
      .map(Number);

    // Variância e desvio padrão
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    const standardDeviation = Math.sqrt(variance);

    // Outras estatísticas
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const standardError = standardDeviation / Math.sqrt(n);
    const coefficientOfVariation = (standardDeviation / mean) * 100;

    return {
      mean,
      median,
      mode,
      variance,
      standardDeviation,
      range,
      min,
      max,
      count: n,
      sum,
      standardError,
      coefficientOfVariation,
    };
  };

  // Função para processar dados inseridos manualmente
  const processManualInput = () => {
    try {
      const numbers = inputData
        .split(/[,;\s\n\r]+/)
        .filter(item => item.trim() !== '')
        .map(item => {
          const num = parseFloat(item.trim().replace(',', '.'));
          if (isNaN(num)) {
            throw new Error(`Valor inválido: ${item}`);
          }
          return num;
        });

      if (numbers.length === 0) {
        Alert.alert('Erro', 'Por favor, insira pelo menos um número válido.');
        return;
      }

      setDataSet(numbers);
      const stats = calculateStatistics(numbers);
      setStatistics(stats);
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao processar dados');
    }
  };

  // Função principal para salvar em pasta pública
  const saveToPublicFolder = async (content: string, fileName: string, mimeType: string) => {
    try {
      // Android: Usa o Storage Access Framework para escolher a pasta
      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const uri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            mimeType
          );
          await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.UTF8 });
          Alert.alert('Sucesso!', `Arquivo salvo em: ${uri}`);
        } else {
          Alert.alert('Permissão negada', 'Não foi possível acessar a pasta.');
        }
      }
      // iOS: Salva na pasta "Documents" (acessível via iTunes/Files)
      else if (Platform.OS === 'ios') {
        const documentsUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(documentsUri, content, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        Alert.alert('Sucesso!', `Arquivo salvo em: ${documentsUri}`);
      }
      // Web: Faz download automático
      else {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar o arquivo.');
      console.error(error);
    }
  };

  // Exportar dataset como CSV (completo)
  const exportDatasetCSV = async () => {
    if (dataSet.length === 0) {
      Alert.alert('Erro', 'Nenhum dado para exportar.');
      return;
    }
    const csvContent = 'Valor\n' + dataSet.map(val => val.toString()).join('\n');
    await saveToPublicFolder(csvContent, `dados_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  // Exportar estatísticas como CSV (completo)
  const exportStatisticsCSV = async () => {
    if (!statistics) {
      Alert.alert('Erro', 'Nenhuma estatística para exportar.');
      return;
    }

    const csvContent = `Estatística,Valor
Média,${statistics.mean}
Mediana,${statistics.median}
Moda,"${statistics.mode.join(', ')}"
Desvio Padrão,${statistics.standardDeviation}
Variância,${statistics.variance}
Erro Padrão,${statistics.standardError}
Coeficiente de Variação (%),${statistics.coefficientOfVariation}
Valor Mínimo,${statistics.min}
Valor Máximo,${statistics.max}
Amplitude,${statistics.range}
Soma Total,${statistics.sum}
Contagem,${statistics.count}`;

    await saveToPublicFolder(csvContent, `estatisticas_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  // Exportar relatório como TXT (completo)
  const exportFullReportTXT = async () => {
    if (!statistics || dataSet.length === 0) {
      Alert.alert('Erro', 'Dados insuficientes para gerar relatório.');
      return;
    }

    const txtContent = `RELATÓRIO DE ANÁLISE ESTATÍSTICA
Data: ${new Date().toLocaleDateString('pt-BR')}
Hora: ${new Date().toLocaleTimeString('pt-BR')}

==========================================
DATASET (${dataSet.length} valores)
==========================================
${dataSet.map((val, i) => `${i + 1}: ${val}`).join('\n')}

==========================================
ESTATÍSTICAS DESCRITIVAS
==========================================
Média (μ): ${statistics.mean.toFixed(4)}
Mediana: ${statistics.median.toFixed(4)}
Moda: ${statistics.mode.map(m => m.toFixed(4)).join(', ')}

Desvio Padrão (σ): ${statistics.standardDeviation.toFixed(4)}
Variância (σ²): ${statistics.variance.toFixed(4)}
Erro Padrão: ${statistics.standardError.toFixed(4)}
Coeficiente de Variação: ${statistics.coefficientOfVariation.toFixed(2)}%

Valor Mínimo: ${statistics.min.toFixed(4)}
Valor Máximo: ${statistics.max.toFixed(4)}
Amplitude: ${statistics.range.toFixed(4)}

Soma Total: ${statistics.sum.toFixed(4)}
Contagem: ${statistics.count}

==========================================
INTERPRETAÇÃO FÍSICA
==========================================
• Desvio Padrão: Indica a dispersão dos dados em relação à média.
  Valores menores indicam maior precisão das medições.

• Erro Padrão: Estima a incerteza da média.
  Usado para calcular intervalos de confiança.

• Coeficiente de Variação: Medida relativa de dispersão.
  Útil para comparar variabilidade entre diferentes experimentos.

==========================================
Gerado por: App Estatísticas para Física
==========================================`;

    await saveToPublicFolder(txtContent, `relatorio_completo_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
  };
  // Função para limpar dados
  const clearData = () => {
    setInputData('');
    setDataSet([]);
    setStatistics(null);
  };

  // Componente para exibir uma estatística com ícone
  const StatItem: React.FC<{
    iconName: string;
    label: string;
    value: string | number;
    unit?: string
  }> = ({
    iconName,
    label,
    value,
    unit = ''
  }) => (
      <View style={styles.statItem}>
        <View style={styles.statLabelContainer}>
          <MaterialCommunityIcons
            name={iconName as any}
            size={20}
            color="#3498db"
            style={{marginRight: 8, color: colors.light["--color-roxo-80"]}}
          />
          <Text style={styles.statLabel}>{label}:</Text>
        </View>
        <Text style={styles.statValue}>
          {typeof value === 'number' ? value.toFixed(4) : value} {unit}
        </Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Entrada de dados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Numéricos</Text>
          <Text style={styles.inputHint}>
            💡 Separe os valores por vírgulas, espaços ou novas linhas
          </Text>
          <TextInput
            style={styles.input}
            value={inputData}
            onChangeText={setInputData}
            placeholder="Ex: 1.2, 3.4, 5.6&#10;7.8&#10;9.1"
            multiline={true}
            numberOfLines={4}
            keyboardType="number-pad"
            placeholderTextColor="#95a5a6"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.calculateButton} onPress={processManualInput}>
              <Text style={styles.calculateButtonText}>Calcular</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={clearData}>
              <Text style={styles.clearButtonText}>Limpar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exibição do dataset */}
        {dataSet.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dataset ({dataSet.length} valores)</Text>
              <TouchableOpacity style={styles.exportButton} onPress={exportDatasetCSV}>
                <MaterialCommunityIcons name="download" size={16} color="#fff" />
                <Text style={styles.exportButtonText}>CSV</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.datasetText}>
                {dataSet.map((num, index) => `${num.toFixed(3)}`).join(', ')}
              </Text>
            </ScrollView>
          </View>
        )}

        {/* Resultados das estatísticas */}
        {statistics && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Estatísticas</Text>
              <View style={styles.exportButtonsContainer}>
                <TouchableOpacity style={styles.exportButton} onPress={exportStatisticsCSV}>
                  <MaterialCommunityIcons name="file-export" size={16} color="#fff" />
                  <Text style={styles.exportButtonText}>CSV</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.exportButtonSecondary} onPress={exportFullReportTXT}>
                  <MaterialCommunityIcons name="file-document-outline" size={16} color="#fff" />
                  <Text style={styles.exportButtonText}>TXT</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <StatItem iconName="chart-line" label="Média (μ)" value={statistics.mean} />
              <StatItem iconName="chart-box" label="Mediana" value={statistics.median} />
              <StatItem iconName="sigma" label="Desvio Padrão (σ)" value={statistics.standardDeviation} />
              <StatItem iconName="chart-scatter-plot" label="Variância (σ²)" value={statistics.variance} />
              <StatItem iconName="scale-balance" label="Erro Padrão" value={statistics.standardError} />
              <StatItem iconName="percent" label="Coef. Variação" value={statistics.coefficientOfVariation} unit="%" />
              <StatItem iconName="arrow-down-bold" label="Valor Mínimo" value={statistics.min} />
              <StatItem iconName="arrow-up-bold" label="Valor Máximo" value={statistics.max} />
              <StatItem iconName="arrow-expand-horizontal" label="Amplitude" value={statistics.range} />
              <StatItem iconName="plus-circle" label="Soma Total" value={statistics.sum} />
              <StatItem iconName="counter" label="Contagem" value={statistics.count} />
              <StatItem
                iconName="target"
                label="Moda"
                value={statistics.mode.length === 1 ? statistics.mode[0].toFixed(4) : 'Múltiplas'}
              />
            </View>

            {/* Interpretação física */}
            <View style={styles.interpretation}>
              <Text style={styles.interpretationTitle}>💡 Interpretação Física</Text>
              <Text style={styles.interpretationText}>
                • <Text style={styles.bold}>Desvio Padrão:</Text> Indica a dispersão dos dados em relação à média.
                Valores menores indicam maior precisão das medições.
              </Text>
              <Text style={styles.interpretationText}>
                • <Text style={styles.bold}>Erro Padrão:</Text> Estima a incerteza da média.
                Usado para calcular intervalos de confiança.
              </Text>
              <Text style={styles.interpretationText}>
                • <Text style={styles.bold}>Coef. Variação:</Text> Medida relativa de dispersão.
                Útil para comparar variabilidade entre diferentes experimentos.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exportButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  exportButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  methodSelector: {
    flexDirection: 'row',
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    padding: 4,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  methodButtonActive: {
    backgroundColor: '#3498db',
  },
  methodText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  methodTextActive: {
    color: '#fff',
  },
  inputHint: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    color: '#2c3e50',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  calculateButton: {
    flex: 1,
    backgroundColor: colors.light["--color-roxo-90"],
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datasetText: {
    fontSize: 14,
    color: '#34495e',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    fontFamily: 'monospace',
    
  },
  statsGrid: {
    gap: 5,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#e6e4e1'
  },
  statLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    marginRight: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  interpretation: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  interpretationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 8,
  },
  interpretationText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 6,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default PhysicsStatsApp;