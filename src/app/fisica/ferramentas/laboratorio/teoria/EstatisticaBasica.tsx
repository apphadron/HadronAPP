import React from 'react';
import TeoriaContent, { Section, RelatedTool, ReferenceItem } from '@/components/fisica/laboratorio/teoria/TeoriaContent';

export default function EstatisticaBasicaScreen() {
  const title = "Estatística Básica";
  const subtitle = "Fundamentos estatísticos essenciais para análise de dados experimentais em física.";
  const tags = ["Análise de Dados", "Física Experimental", "Estatística"];
  
  const sections: Section[] = [
    {
      id: 'intro',
      title: 'Importância da estatística na física',
      content: `A estatística é uma ferramenta fundamental na física experimental por várias razões:

• Quantificação de incertezas: Permite estimar e expressar as incertezas associadas às medições experimentais.

• Análise de dados: Fornece métodos para extrair informações significativas de conjuntos de dados experimentais.

• Validação de hipóteses: Permite avaliar a significância estatística dos resultados e testar teorias físicas.

• Modelagem: Ajuda na construção de modelos matemáticos que descrevem fenômenos físicos.

• Tomada de decisões: Orienta decisões sobre a aceitação ou rejeição de hipóteses científicas baseadas em evidências.

Praticamente todos os experimentos físicos envolvem algum grau de aleatoriedade ou flutuação estatística, tornando o conhecimento estatístico essencial para qualquer físico experimental.`
    },
    {
      id: 'medidas',
      title: 'Medidas de tendência central',
      content: `As medidas de tendência central são estatísticas que representam o valor "típico" ou "central" de um conjunto de dados:

1. Média aritmética (x̄):
   • Definição: Soma de todos os valores dividida pelo número de observações
   • Fórmula: x̄ = (1/n) Σ xi
   • Características: Sensível a valores extremos (outliers)
   • Uso na física: Estimativa do valor verdadeiro em medições repetidas

2. Mediana:
   • Definição: Valor central quando os dados são ordenados
   • Características: Menos sensível a outliers que a média
   • Uso na física: Útil quando os dados contêm valores aberrantes

3. Moda:
   • Definição: Valor que ocorre com maior frequência
   • Uso na física: Menos comum, mas útil para identificar valores preferenciais

4. Média ponderada:
   • Definição: Σ(wi·xi) / Σwi, onde wi são os pesos
   • Uso na física: Quando medidas têm diferentes níveis de confiabilidade ou precisão`
    },
    {
      id: 'dispersao',
      title: 'Medidas de dispersão',
      content: `As medidas de dispersão quantificam o grau de variabilidade ou "espalhamento" dos dados:

1. Amplitude:
   • Definição: Diferença entre o maior e o menor valor
   • Uso na física: Estimativa simples do intervalo de variação

2. Variância (σ²):
   • Definição: Média dos quadrados dos desvios em relação à média
   • Fórmula: σ² = (1/(n-1)) Σ(xi - x̄)²
   • Nota: Usamos n-1 (e não n) para obter um estimador não-viesado

3. Desvio padrão (σ):
   • Definição: Raiz quadrada da variância
   • Fórmula: σ = √[(1/(n-1)) Σ(xi - x̄)²]
   • Uso na física: Estima a incerteza típica de uma medição individual

4. Erro padrão da média (σx̄):
   • Definição: Desvio padrão dividido pela raiz quadrada do número de observações
   • Fórmula: σx̄ = σ/√n
   • Uso na física: Estima a incerteza na determinação do valor médio
   • Consequência importante: Aumentar o número de medições reduz o erro padrão da média

5. Desvio absoluto médio:
   • Definição: Média dos valores absolutos dos desvios em relação à média
   • Menos comum em física, mas às vezes utilizado`
    },
    {
      id: 'distribuicoes',
      title: 'Distribuições de probabilidade',
      content: `As distribuições de probabilidade descrevem como os valores de uma variável aleatória se distribuem:

1. Distribuição Normal (Gaussiana):
   • Forma: Curva em sino simétrica
   • Parâmetros: Média (μ) e desvio padrão (σ)
   • Função densidade: f(x) = (1/(σ√(2π))) e^(-(x-μ)²/(2σ²))
   • Importância na física: Modelagem de erros aleatórios devido ao Teorema do Limite Central
   • Propriedades importantes:
     - 68,3% dos dados estão no intervalo μ ± σ
     - 95,4% dos dados estão no intervalo μ ± 2σ
     - 99,7% dos dados estão no intervalo μ ± 3σ

2. Distribuição t de Student:
   • Similar à normal, mas com caudas mais "pesadas"
   • Usada quando o desvio padrão populacional é desconhecido e a amostra é pequena
   • Fundamental para estabelecer intervalos de confiança em pequenas amostras

3. Distribuição de Poisson:
   • Modela eventos discretos e raros
   • Aplicação: Contagem de eventos em física nuclear, astronomia
   • Função de probabilidade: P(X=k) = (λᵏe⁻λ)/k!
   • Característica: Média = Variância = λ

4. Outras distribuições importantes:
   • Qui-quadrado: Usada em testes de qualidade de ajuste
   • Binomial: Para eventos com "sucesso" e "fracasso"
   • Exponencial: Para intervalos entre eventos em processos aleatórios`
    },
    {
      id: 'regressao',
      title: 'Regressão e correlação',
      content: `A regressão e correlação analisam relações entre variáveis:

1. Correlação:
   • Coeficiente de correlação de Pearson (r): Mede a força e direção da associação linear
   • Varia de -1 (correlação negativa perfeita) a +1 (correlação positiva perfeita)
   • r = 0 indica ausência de correlação linear
   • Fórmula: r = Σ[(xi-x̄)(yi-ȳ)] / √[Σ(xi-x̄)² Σ(yi-ȳ)²]

2. Regressão linear:
   • Encontra a melhor reta que descreve a relação entre variáveis
   • Modelo: y = mx + b
   • Método dos mínimos quadrados: Minimiza Σ(yi - (mxi + b))²
   • Parâmetros calculados:
     - Coeficiente angular: m = Σ[(xi-x̄)(yi-ȳ)] / Σ(xi-x̄)²
     - Intercepto: b = ȳ - mx̄

3. Incertezas nos parâmetros:
   • Desvio padrão do coeficiente angular: σm = σy/√[Σ(xi-x̄)²]
   • Desvio padrão do intercepto: σb = σy√[1/n + x̄²/Σ(xi-x̄)²]
   • Onde σy = √[Σ(yi-(mxi+b))²/(n-2)]

4. Coeficiente de determinação (R²):
   • Fração da variância explicada pelo modelo
   • R² = 1 - (Variância residual / Variância total)`
    },
    {
      id: 'hipoteses',
      title: 'Testes de hipóteses',
      content: `Os testes de hipóteses permitem avaliar se os dados experimentais apoiam uma determinada hipótese:

1. Conceitos básicos:
   • Hipótese nula (H₀): Afirmação a ser testada (geralmente "não há efeito")
   • Hipótese alternativa (H₁): Afirmação contrária à hipótese nula
   • Nível de significância (α): Probabilidade máxima aceitável de rejeitar H₀ quando ela é verdadeira
   • Valor-p: Probabilidade de obter os resultados observados (ou mais extremos) se H₀ for verdadeira

2. Principais testes usados em física:
   • Teste t: Compara médias (uma amostra vs valor conhecido, ou duas amostras)
   • Teste do qui-quadrado: Avalia o ajuste entre distribuições observadas e esperadas
   • Teste F: Compara variâncias ou modelos de regressão

3. Interpretação do valor-p:
   • Se p < α: Rejeita-se H₀ (resultado estatisticamente significativo)
   • Se p ≥ α: Não se rejeita H₀ (resultado não significativo)
   • Valor comum de α: 0,05 (5%)

4. Erros em testes estatísticos:
   • Erro Tipo I: Rejeitar H₀ quando ela é verdadeira (falso positivo)
   • Erro Tipo II: Não rejeitar H₀ quando ela é falsa (falso negativo)
   • Potência do teste: Probabilidade de rejeitar H₀ quando ela é falsa (1 - probabilidade de Erro Tipo II)`
    },
  ];

  const relatedTools: RelatedTool[] = [
    {
      id: 'desvio-padrao',
      title: 'Calculadora de Desvio Padrão',
      description: 'Calcule estatísticas descritivas para seus dados',
      route: '/laboratorio/calculadoras/desvio-padrao',
      icon: 'sigma'
    },
    {
      id: 'regressao-linear',
      title: 'Regressão Linear',
      description: 'Ferramenta para ajuste de curvas e análise de correlação',
      route: '/laboratorio/calculadoras/regressao-linear',
      icon: 'chart-line'
    },
    {
        id: 'erros-experimentais',
        title: 'Erros Experimentais',
        description: 'Entenda como lidar com erros nas medições',
        route: '/fisica/ferramentas/laboratorio/teoria/ErrosExperimentais',
        icon: 'alert-circle-outline'
      }
    ];
  
    const references: ReferenceItem[] = [
      {
        title: 'BIPM, "International System of Units (SI)"',
        description: 'Guia oficial do Bureau Internacional de Pesos e Medidas'
      },
      {
        title: 'R. A. Nelson, "Guide for Metric Practice"',
        description: 'Guia prático para uso correto de unidades métricas'
      },
      {
        title: 'J. De Boer, "The Dynamical Character of Thermodynamics"',
        description: 'Discussão sobre grandezas termodinâmicas e sua natureza'
      }
    ];
  
    return (
      <TeoriaContent
        title={title}
        subtitle={subtitle}
        tags={tags}
        sections={sections}
        relatedTools={relatedTools}
        references={references}
        headerBackgroundColor="bg-green-600"
      />
    );
  }