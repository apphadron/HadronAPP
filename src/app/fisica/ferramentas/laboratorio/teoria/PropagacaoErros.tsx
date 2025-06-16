import React from 'react';
import TeoriaContent, { Section, RelatedTool, ReferenceItem } from '@/components/fisica/laboratorio/teoria/TeoriaContent';

export default function PropagacaoErrosScreen() {
  const title = "Propagação de Erros";
  const subtitle = "Entenda como os erros experimentais se propagam através de cálculos e operações matemáticas.";
  const tags = ["Física Experimental", "Estatística", "Análise de Dados"];
  
  const sections: Section[] = [
    {
      id: 'intro',
      title: 'O que é propagação de erros?',
      content: `A propagação de erros é o efeito das incertezas em variáveis individuais sobre a incerteza de uma função baseada nelas. Em experimentos físicos, raramente medimos diretamente a grandeza de interesse; em vez disso, medimos outras grandezas e utilizamos relações matemáticas para calcular o resultado desejado. Quando cada medida tem uma incerteza associada, essas incertezas se propagam através dos cálculos, afetando a incerteza do resultado final.`
    },
    {
      id: 'formulas',
      title: 'Fórmulas de propagação de erros',
      content: `Para uma função f(x, y, z, ...) que depende de variáveis com incertezas, a incerteza propagada σf é dada pela lei de propagação de incertezas:

1. Para soma e subtração (f = x ± y):
   • σf = √(σx² + σy²)

2. Para multiplicação (f = x·y):
   • (σf/f)² = (σx/x)² + (σy/y)²
   • ou: σf = f·√[(σx/x)² + (σy/y)²]

3. Para divisão (f = x/y):
   • (σf/f)² = (σx/x)² + (σy/y)²
   • ou: σf = f·√[(σx/x)² + (σy/y)²]

4. Para potência (f = x^n):
   • σf/f = |n|·(σx/x)
   • ou: σf = |n|·f·(σx/x)

5. Caso geral (derivadas parciais):
   • σf² = (∂f/∂x)²·σx² + (∂f/∂y)²·σy² + (∂f/∂z)²·σz² + ...
   • onde ∂f/∂x é a derivada parcial de f em relação a x`
    },
    {
      id: 'exemplos',
      title: 'Exemplos práticos',
      content: `Vamos ver alguns exemplos práticos de propagação de erros:

1. Cálculo de área (A = l·w):
   • Se l = 5,0 ± 0,2 cm e w = 3,0 ± 0,1 cm
   • A = 15,0
   • σA/A = √[(0,2/5,0)² + (0,1/3,0)²] = √(0,0016 + 0,0011) = 0,054
   • σA = 15,0 × 0,054 = 0,81 cm²
   • Resultado final: A = 15,0 ± 0,8 cm²

2. Cálculo de velocidade (v = d/t):
   • Se d = 100 ± 1 m e t = 25 ± 0,5 s
   • v = 4 m/s
   • σv/v = √[(1/100)² + (0,5/25)²] = √(0,0001 + 0,0004) = 0,022
   • σv = 4 × 0,022 = 0,088 m/s
   • Resultado final: v = 4,00 ± 0,09 m/s

3. Resistência em série (R = R₁ + R₂):
   • Se R₁ = 100 ± 5 Ω e R₂ = 200 ± 10 Ω
   • R = 300 Ω
   • σR = √(5² + 10²) = √(25 + 100) = 11,2 Ω
   • Resultado final: R = 300 ± 11 Ω`
    },
    {
      id: 'correlacao',
      title: 'Correlação entre variáveis',
      content: `As fórmulas padrão de propagação de erros pressupõem que as variáveis são independentes entre si. Quando existe correlação entre as variáveis, devemos incluir termos adicionais na equação:

Para duas variáveis correlacionadas, a fórmula geral se torna:
σf² = (∂f/∂x)²·σx² + (∂f/∂y)²·σy² + 2·(∂f/∂x)·(∂f/∂y)·cov(x,y)

onde cov(x,y) é a covariância entre x e y.

O coeficiente de correlação (ρ) relaciona-se com a covariância:
cov(x,y) = ρ·σx·σy

Ignorar correlações pode levar a:
• Subestimação da incerteza (quando correlação é positiva)
• Superestimação da incerteza (quando correlação é negativa)

Correlações são comuns quando:
• Medidas feitas com o mesmo instrumento
• Variáveis calculadas a partir de medidas comuns
• Medidas sequenciais sob condições variáveis`
    },
    {
      id: 'montecarlo',
      title: 'Método de Monte Carlo',
      content: `Quando as relações matemáticas são complexas ou correlações são difíceis de quantificar, o método de Monte Carlo oferece uma alternativa para a propagação de erros:

1. Procedimento:
   • Gerar amostras aleatórias para cada variável de entrada de acordo com suas distribuições de probabilidade
   • Calcular o resultado para cada conjunto de valores aleatórios
   • Analisar a distribuição dos resultados para determinar a incerteza propagada

2. Vantagens:
   • Funciona com qualquer modelo matemático, não importa quão complexo
   • Lida naturalmente com correlações e não-linearidades
   • Fornece a distribuição completa da grandeza calculada, não apenas sua incerteza
   • Não requer cálculo de derivadas

3. Desvantagens:
   • Computacionalmente mais intensivo
   • Pode ser difícil implementar sem software adequado
   • Resultados dependem do número de simulações realizadas

O método de Monte Carlo é particularmente útil em modelos complexos onde as aproximações lineares da propagação tradicional não são adequadas.`
    },
  ];

  const relatedTools: RelatedTool[] = [
    {
      id: 'propagacao-erro-calc',
      title: 'Calculadora de Propagação de Erros',
      description: 'Calcule automaticamente a propagação de erros em expressões',
      route: '/laboratorio/calculadoras/propagacao-erro',
      icon: 'calculator-variant'
    },
    {
      id: 'erros-experimentais',
      title: 'Erros Experimentais',
      description: 'Entenda os diferentes tipos de erros e suas fontes',
      route: '/fisica/ferramentas/laboratorio/teoria/ErrosExperimentais',
      icon: 'alert-circle-outline'
    },
    {
      id: 'desvio-padrao-calc',
      title: 'Calculadora de Desvio Padrão',
      description: 'Calcule desvios e incertezas para conjuntos de medidas',
      route: '/laboratorio/calculadoras/desvio-padrao',
      icon: 'sigma'
    }
  ];

  const references: ReferenceItem[] = [
    {
      title: 'J. R. Taylor, "An Introduction to Error Analysis"',
      description: 'Capítulos 3 e 4 detalham as técnicas de propagação de erros'
    },
    {
      title: 'BIPM, "Guide to the Expression of Uncertainty in Measurement (GUM)"',
      description: 'Guia internacional sobre propagação de incertezas'
    },
    {
      title: 'P. R. Bevington, "Data Reduction and Error Analysis for the Physical Sciences"',
      description: 'Discussão detalhada sobre erros correlacionados e métodos numéricos'
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
      headerBackgroundColor="bg-purple-600"
    />
  );
}