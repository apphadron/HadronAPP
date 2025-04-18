export interface ImagemDestaque {
  id: string;
  titulo: string;
  descricao: string;
  url: string;
}

export interface CardItem {
  id: string | number;
  icon: any;
  title: string;
  rota: string;
}

export interface TabItem {
  id: string;
  title: string;
  data: CardItem[];
}



// types.ts
export interface ARContent {
  type: 'image' | 'video' | '3d';
  url: string;
  position?: {
    x: number;
    y: number;
    scale: number;
  };
}

// utils/qrDecoder.ts
export const decodeQRContent = (data: string): ARContent | null => {
  try {
    return JSON.parse(data) as ARContent;
  } catch {
    return null;
  }
};