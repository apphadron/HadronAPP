import React from 'react';
import TeoriaContent, { Section, RelatedTool, ReferenceItem } from '@/components/fisica/laboratorio/teoria/TeoriaContent';

export default function ErrosExperimentaisScreen() {
  const title = "Erros Experimentais";
  const subtitle = "Compreenda como surgem os erros em medições e como quantificá-los corretamente.";
  const tags = ["Física Experimental", "Metrologia"];
  
  const sections: Section[] = [
    {
      id: 'intro',
      title: 'O que são erros experimentais?',
      content: `Erros experimentais representam a diferença entre um valor medido e o valor "verdadeiro" de uma grandeza física. Em toda medição experimental, existem fatores que afetam o resultado, tornando impossível obter o valor exato. A compreensão e análise dos erros são fundamentais para validar resultados experimentais e determinar a confiabilidade das medições.`
    },
    {
      id: 'tipos',
      title: 'Tipos de erros',
      content: `Existem principalmente dois tipos de erros:

1. Erros sistemáticos: São erros que afetam todas as medições da mesma maneira, causando um desvio constante do valor verdadeiro. Podem ser causados por:
   • Calibração incorreta de instrumentos
   • Método de medição inadequado
   • Condições ambientais não controladas
   • Erros pessoais consistentes

2. Erros aleatórios: São flutuações imprevisíveis nas medições que variam de uma medição para outra, mesmo quando feitas nas mesmas condições. Causas incluem:
   • Limitação na precisão dos instrumentos
   • Variações imperceptíveis nas condições experimentais
   • Flutuações estatísticas naturais

3. Erros grosseiros: São erros causados por falhas evidentes no procedimento experimental, como leitura incorreta, registro equivocado ou uso inadequado do equipamento.`
    },
    {
      id: 'medidas',
      title: 'Medidas de erros',
      content: `Para quantificar erros experimentais, utilizamos:

• Erro absoluto: É a diferença entre o valor medido e o valor verdadeiro (ou aceito)
  Δx = |xmedido - xverdadeiro|

• Erro relativo: É o erro absoluto dividido pelo valor verdadeiro, frequentemente expresso em porcentagem
  εr = (Δx/xverdadeiro) × 100%

• Desvio padrão (σ): Quantifica a dispersão das medidas em relação à média
  σ = √[Σ(xi - x̄)² / (n-1)]

• Erro padrão da média: Estima a incerteza na determinação do valor médio
  σx̄ = σ/√n`
    },
    {
      id: 'minimizacao',
      title: 'Minimização de erros',
      content: `Para minimizar erros experimentais:

• Erros sistemáticos: Podem ser reduzidos por:
  - Calibração adequada dos instrumentos
  - Controle das condições ambientais
  - Técnicas de medição apropriadas
  - Procedimentos de correção

• Erros aleatórios: Podem ser reduzidos por:
  - Aumentar o número de medições
  - Usar instrumentos mais precisos
  - Controlar melhor as condições experimentais
  - Aplicar métodos estatísticos para análise

• Boas práticas gerais:
  - Documentar detalhadamente o procedimento experimental
  - Registrar todas as condições do experimento
  - Verificar os instrumentos antes do uso
  - Realizar medições repetidas`
    },
    {
      id: 'significado',
      title: 'Significado físico dos erros',
      content: `Compreender o significado físico dos erros é essencial para:

• Validação de teorias: Os erros determinam se os resultados experimentais confirmam ou refutam uma teoria física.

• Comparação entre experimentos: Permite avaliar se dois resultados experimentais são estatisticamente compatíveis.

• Qualidade da medição: O tamanho relativo do erro indica a qualidade e confiabilidade da medição.

• Limites de precisão: Ajuda a entender os limites fundamentais de precisão em medições físicas.

• Tomada de decisões: Em aplicações práticas, os erros influenciam decisões baseadas em medições.

Uma medida sem a estimativa do erro associado não tem significado científico completo, pois não permite avaliar sua confiabilidade.`
    },
  ];

  const relatedTools: RelatedTool[] = [
    {
      id: 'propagacao-erro',
      title: 'Calculadora de Propagação de Erros',
      description: 'Calcule como os erros se propagam em operações',
      route: '/laboratorio/calculadoras/propagacao-erro',
      icon: 'calculator-variant'
    },
    {
      id: 'desvio-padrao',
      title: 'Calculadora de Desvio Padrão',
      description: 'Calcule o desvio padrão e erro padrão da média',
      route: '/laboratorio/calculadoras/desvio-padrao',
      icon: 'sigma'
    },
    {
      id: 'propagacao-erros-teoria',
      title: 'Teoria: Propagação de Erros',
      description: 'Entenda como os erros se propagam em cálculos',
      route: '/laboratorio/teoria/propagacao-erros',
      icon: 'book-open-variant'
    }
  ];

  const references: ReferenceItem[] = [
    {
      title: 'J. R. Taylor, "An Introduction to Error Analysis"',
      description: 'Uma referência clássica sobre análise de erros experimentais'
    },
    {
      title: 'BIPM, "Guide to the Expression of Uncertainty in Measurement (GUM)"',
      description: 'Guia internacional para expressão de incertezas'
    },
    {
      title: 'H. H. Ku, "Notes on the Use of Propagation of Error Formulas"',
      description: 'Artigo sobre as fórmulas de propagação de erros'
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
      headerBackgroundColor="bg-blue-500"
    />
  );
}