import { ImageSourcePropType } from 'react-native';

// Importando as imagens
import Card1 from './Card1.png';
import Card2 from './Card2.png';
import Card3 from './Card3.png';

interface ImagemDestaque {
  id: string;
  imagem: ImageSourcePropType;
}

export const imagensDestaques: ImagemDestaque[] = [
  {
    id: '1',
    imagem: Card1,
  },
  {
    id: '2',
    imagem: Card2,
  },
  {
    id: '3',
    imagem: Card3,
  },
];