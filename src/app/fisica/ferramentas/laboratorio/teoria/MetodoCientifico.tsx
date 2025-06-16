import React from 'react';
import TeoriaContent, { Section, RelatedTool, ReferenceItem } from '@/components/fisica/laboratorio/teoria/TeoriaContent';

export default function MetodoCientificoScreen() {
  const title = "Método Científico";
  const subtitle = "Entenda as etapas do método científico e sua aplicação na física experimental.";
  const tags = ["Metodologia", "Física Experimental"];
  
  const sections: Section[] = [
    {
      id: 'intro',
      title: 'O que é o método científico?',
      content: `O método científico é um processo estruturado usado para investigar fenômenos, adquirir novos conhecimentos ou corrigir e integrar conhecimentos anteriores. Consiste em um conjunto de técnicas para investigar fenômenos, adquirir novo conhecimento, ou corrigir e integrar conhecimentos prévios. É baseado em evidências empíricas observáveis, mensuráveis e testáveis, e sujeito à razão lógica.`
    },
    {
      id: 'etapas',
      title: 'Etapas do método científico',
      content: `O método científico geralmente segue estas etapas principais:

1. Observação: Observar um fenômeno ou identificar um problema a ser estudado.

2. Questionamento: Formular perguntas sobre o fenômeno observado.

3. Hipótese: Propor uma explicação possível (hipótese) para o fenômeno, que possa ser testada.

4. Previsão: Usar a hipótese para fazer previsões sobre fenômenos ainda não observados.

5. Experimentação: Projetar e realizar experimentos controlados para testar a hipótese.

6. Análise de dados: Analisar os resultados do experimento para determinar se confirmam ou refutam a hipótese.

7. Conclusão: Tirar conclusões sobre a validade da hipótese com base nos resultados experimentais.

8. Comunicação: Compartilhar resultados e conclusões com a comunidade científica para validação e revisão.`
    },
    {
      id: 'importancia',
      title: 'Importância na física',
      content: `Na física, o método científico é fundamental por várias razões:

• Objetividade: Proporciona uma abordagem objetiva para investigar os fenômenos naturais, minimizando vieses pessoais.

• Reprodutibilidade: Permite que outros cientistas reproduzam experimentos e verifiquem resultados.

• Sistematização: Oferece uma estrutura sistemática para a investigação e a construção do conhecimento.

• Evolução do conhecimento: Possibilita a constante revisão e refinamento das teorias físicas.

• Previsibilidade: Permite fazer previsões testáveis sobre fenômenos naturais, essencial para o avanço da física.

• Aplicações práticas: Fornece conhecimentos que podem ser aplicados no desenvolvimento tecnológico.`
    },
    {
      id: 'fisica-experimental',
      title: 'Aplicação em física experimental',
      content: `Na física experimental, o método científico é aplicado de forma específica:

• Controle de variáveis: Identificação e controle cuidadoso das variáveis que podem influenciar o experimento.

• Instrumentação: Desenvolvimento e uso de instrumentos precisos para medições quantitativas.

• Tratamento estatístico: Análise estatística rigorosa dos dados para determinar a significância dos resultados.

• Estimativa de erros: Avaliação cuidadosa das incertezas experimentais e como elas afetam as conclusões.

• Modelagem matemática: Uso de modelos matemáticos para descrever os fenômenos observados e fazer previsões.

• Validação cruzada: Comparação dos resultados com outros métodos experimentais ou abordagens teóricas.`
    },
    {
      id: 'limitacoes',
      title: 'Limitações e considerações',
      content: `O método científico, embora poderoso, possui limitações importantes:

• Incertezas inerentes: Toda medição física tem incertezas associadas que limitam a precisão das conclusões.

• Validade limitada: Teorias científicas são sempre provisórias e sujeitas a revisão à luz de novas evidências.

• Fenômenos complexos: Alguns sistemas físicos são tão complexos que desafiam a análise experimental direta.

• Influência do observador: Em alguns casos, especialmente na física quântica, o ato de observação pode afetar o fenômeno observado.

• Limitações tecnológicas: A capacidade de testar algumas hipóteses pode ser limitada pela tecnologia disponível.

• Questões éticas: Alguns experimentos podem não ser realizáveis devido a considerações éticas ou práticas.

É importante reconhecer estas limitações ao aplicar o método científico e interpretar resultados experimentais.`
    },
  ];

  const relatedTools: RelatedTool[] = [
    {
      id: 'erros-experimentais',
      title: 'Erros Experimentais',
      description: 'Entenda os tipos de erros e como lidar com eles',
      route: '/fisica/ferramentas/laboratorio/teoria/ErrosExperimentais',
      icon: 'alert-circle-outline'
    },
    {
      id: 'estatistica-basica',
      title: 'Estatística Básica',
      description: 'Conceitos de estatística para análise de dados',
      route: '/laboratorio/teoria/estatistica-basica',
      icon: 'chart-bell-curve'
    },
    {
      id: 'regressao-linear',
      title: 'Regressão Linear',
      description: 'Ferramentas para ajuste de curvas experimentais',
      route: '/laboratorio/calculadoras/regressao-linear',
      icon: 'chart-line'
    }
  ];

  const references: ReferenceItem[] = [
    {
      title: 'K. Popper, "A Lógica da Pesquisa Científica"',
      description: 'Obra fundamental sobre filosofia da ciência e método científico'
    },
    {
      title: 'T. Kuhn, "A Estrutura das Revoluções Científicas"',
      description: 'Análise histórica da evolução do conhecimento científico'
    },
    {
      title: 'R. Feynman, "O Caráter da Lei Física"',
      description: 'Reflexões de um físico teórico sobre o método científico'
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
      headerBackgroundColor="bg-indigo-600"
    />
  );
}