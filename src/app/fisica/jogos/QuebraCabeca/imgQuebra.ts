export interface Imagem {
    id: string;
    source: any;
    nome: string;
  }
  
  export interface Nivel {
    id: string;
    nome: string;
    dificuldade: 'facil' | 'medio' | 'dificil';
    imagens: Imagem[];
  }

  import Img from '@/assets/img/rover.jpg'
  
  export const niveis: Nivel[] = [
    {
      id: 'facil',
      nome: 'Fácil',
      dificuldade: 'facil',
      imagens: [
        {
          id: 'facil-1',
          source: Img,
          nome: 'Paisagem 1'
        },
        {
          id: 'facil-2',
          source: Img,
          nome: 'Paisagem 2'
        },
        {
          id: 'facil-3',
          source: Img,
          nome: 'Paisagem 3'
        }
      ]
    },
    {
      id: 'medio',
      nome: 'Médio',
      dificuldade: 'medio',
      imagens: [
        {
          id: 'medio-1',
          source: Img,
          nome: 'Cidade 1'
        },
        {
          id: 'medio-2',
          source: Img,
          nome: 'Cidade 2'
        },
        {
          id: 'medio-3',
          source: Img,
          nome: 'Cidade 3'
        }
      ]
    },
    {
      id: 'dificil',
      nome: 'Difícil',
      dificuldade: 'dificil',
      imagens: [
        {
          id: 'dificil-1',
          source: Img,
          nome: 'Abstrato 1'
        },
        {
          id: 'dificil-2',
          source: Img,
          nome: 'Abstrato 2'
        },
        {
          id: 'dificil-3',
          source: Img,
          nome: 'Abstrato 3'
        }
      ]
    }
  ];