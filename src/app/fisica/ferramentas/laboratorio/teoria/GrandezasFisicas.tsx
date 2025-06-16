import React from 'react';
import TeoriaContent, { Section, RelatedTool, ReferenceItem } from '@/components/fisica/laboratorio/teoria/TeoriaContent';

export default function GrandezasFisicasScreen() {
  const title = "Grandezas Físicas";
  const subtitle = "Compreenda os conceitos fundamentais das grandezas físicas e suas unidades de medida.";
  const tags = ["Metrologia", "Física Básica", "Sistema Internacional"];
  
  const sections: Section[] = [
    {
      id: 'intro',
      title: 'O que são grandezas físicas?',
      content: `Grandezas físicas são propriedades ou características mensuráveis dos fenômenos, corpos ou substâncias que podem ser expressas quantitativamente. Elas formam a base para descrever, analisar e compreender os fenômenos físicos. Uma grandeza física completa é composta por um valor numérico acompanhado de uma unidade de medida apropriada, que dá significado à quantidade medida.`
    },
    {
      id: 'classificacao',
      title: 'Classificação das grandezas',
      content: `As grandezas físicas podem ser classificadas de várias formas:

1. Quanto à dependência:
   • Grandezas fundamentais: São aquelas definidas independentemente de outras grandezas (como comprimento, massa, tempo)
   • Grandezas derivadas: São definidas em função de grandezas fundamentais (como velocidade, aceleração, força)

2. Quanto à natureza:
   • Grandezas escalares: Definidas apenas por um valor numérico (como massa, temperatura, energia)
   • Grandezas vetoriais: Definidas por valor numérico, direção e sentido (como velocidade, força, campo elétrico)

3. Quanto à origem:
   • Grandezas extensivas: Dependem da quantidade de matéria (como massa, volume, energia total)
   • Grandezas intensivas: Independem da quantidade de matéria (como temperatura, pressão, densidade)

4. Quanto ao caráter:
   • Grandezas contínuas: Podem assumir qualquer valor dentro de um intervalo (como tempo, comprimento)
   • Grandezas discretas: Assumem apenas valores específicos (como número de átomos)`
    },
    {
      id: 'unidades',
      title: 'Sistemas de unidades',
      content: `Para expressar as grandezas físicas de forma padronizada, utilizamos sistemas de unidades:

1. Sistema Internacional de Unidades (SI):
   • Sistema mais amplamente adotado mundialmente
   • Baseado em sete unidades fundamentais:
     - Metro (m) - comprimento
     - Quilograma (kg) - massa
     - Segundo (s) - tempo
     - Ampere (A) - corrente elétrica
     - Kelvin (K) - temperatura termodinâmica
     - Mol (mol) - quantidade de substância
     - Candela (cd) - intensidade luminosa

2. Outros sistemas históricos:
   • Sistema CGS (centímetro-grama-segundo)
   • Sistema MKS (metro-quilograma-segundo)
   • Sistema Imperial (polegada, libra, etc.)

Em 2019, o SI foi redefinido para basear todas as unidades em constantes fundamentais da natureza, em vez de artefatos físicos, tornando o sistema mais estável e universal.`
    },
    {
      id: 'dimensoes',
      title: 'Análise dimensional',
      content: `A análise dimensional é uma ferramenta poderosa na física que examina as dimensões físicas das grandezas:

1. Dimensões fundamentais:
   • [L] - comprimento
   • [M] - massa
   • [T] - tempo
   • [I] - corrente elétrica
   • [Θ] - temperatura
   • [N] - quantidade de substância
   • [J] - intensidade luminosa

2. Aplicações da análise dimensional:
   • Verificar a consistência de equações físicas
   • Determinar relações entre grandezas
   • Prever como grandezas se relacionam sem resolver equações completas
   • Conversão entre diferentes sistemas de unidades

3. Princípio da homogeneidade dimensional:
   • Todos os termos em uma equação física válida devem ter as mesmas dimensões
   • Por exemplo, na equação v = d/t:
     - v (velocidade): [L]/[T]
     - d (distância): [L]
     - t (tempo): [T]
     - Verificação: [L]/[T] = [L]/[T] ✓`
    },
    {
      id: 'medicao',
      title: 'Medição de grandezas',
      content: `A medição é o processo de atribuir valores numéricos a grandezas físicas:

1. Processos de medição:
   • Medição direta: Comparação direta com um padrão (ex: medir comprimento com régua)
   • Medição indireta: Cálculo a partir de outras grandezas medidas (ex: densidade calculada por massa/volume)

2. Instrumentos de medição:
   • Analógicos: Mostram valores contínuos (ex: termômetro de mercúrio)
   • Digitais: Mostram valores discretos (ex: multímetro digital)
   • Cada instrumento tem características específicas de precisão, exatidão e resolução

3. Características das medições:
   • Exatidão: Proximidade entre o valor medido e o valor verdadeiro
   • Precisão: Proximidade entre valores medidos repetidamente
   • Resolução: Menor variação detectável pelo instrumento
   • Sensibilidade: Resposta do instrumento a pequenas variações da grandeza

4. Rastreabilidade:
   • Cadeia de comparações que liga uma medição aos padrões nacionais e internacionais
   • Garante que medições feitas em diferentes lugares sejam comparáveis`
    },
    {
      id: 'notacao',
      title: 'Notação científica e prefixos',
      content: `Para expressar valores muito grandes ou muito pequenos, utilizamos notação científica e prefixos:

1. Notação científica:
   • Expressão de números na forma a × 10ⁿ, onde 1 ≤ |a| < 10 e n é um inteiro
   • Exemplos:
     - 299,792,458 m/s = 2.99792458 × 10⁸ m/s
     - 0.000000000000000000160 C = 1.60 × 10⁻¹⁹ C

2. Prefixos SI:
   • yotta (Y): 10²⁴
   • zetta (Z): 10²¹
   • exa (E): 10¹⁸
   • peta (P): 10¹⁵
   • tera (T): 10¹²
   • giga (G): 10⁹
   • mega (M): 10⁶
   • kilo (k): 10³
   • milli (m): 10⁻³
   • micro (μ): 10⁻⁶
   • nano (n): 10⁻⁹
   • pico (p): 10⁻¹²
   • femto (f): 10⁻¹⁵
   • atto (a): 10⁻¹⁸
   • zepto (z): 10⁻²¹
   • yocto (y): 10⁻²⁴

3. Algarismos significativos:
   • Indicam a precisão de um valor medido
   • Regras para operações com algarismos significativos ajudam a expressar corretamente a incerteza nos resultados`
    },
  ];

  const relatedTools: RelatedTool[] = [
    {
      id: 'conversao-unidades',
      title: 'Conversor de Unidades',
      description: 'Converta entre diferentes unidades de medida',
      route: '/laboratorio/calculadoras/conversao-unidades',
      icon: 'swap-horizontal'
    },
    {
      id: 'algarismos-significativos',
      title: 'Calculadora de Algarismos Significativos',
      description: 'Determine os algarismos significativos em operações',
      route: '/laboratorio/calculadoras/algarismos-significativos',
      icon: 'numeric'
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