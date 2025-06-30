import { QRCodeData } from '../types';

export const parseQRCodeData = (data: string): QRCodeData | null => {
  try {
    // Tenta parsear como JSON primeiro
    const parsed = JSON.parse(data);
    
    if (parsed.type && parsed.url) {
      return {
        type: parsed.type,
        url: parsed.url,
        title: parsed.title,
        description: parsed.description,
      };
    }
  } catch (error) {
    // Se não for JSON, tenta detectar o tipo pela URL
    const url = data.trim();
    
    // Verifica se é uma URL válida
    if (!isValidUrl(url)) {
      return null;
    }
    
    // Detecta o tipo baseado na extensão do arquivo
    const extension = getFileExtension(url);
    
    if (isImageExtension(extension)) {
      return {
        type: 'image',
        url: url,
      };
    }
    
    if (isVideoExtension(extension)) {
      return {
        type: 'video',
        url: url,
      };
    }
    
    if (is3DExtension(extension)) {
      return {
        type: '3d',
        url: url,
      };
    }
  }
  
  return null;
};

const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const getFileExtension = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split('.').pop()?.toLowerCase() || '';
  } catch (_) {
    return '';
  }
};

const isImageExtension = (extension: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  return imageExtensions.includes(extension);
};

const isVideoExtension = (extension: string): boolean => {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
  return videoExtensions.includes(extension);
};

const is3DExtension = (extension: string): boolean => {
  const modelExtensions = ['glb', 'gltf', 'obj', 'fbx', '3ds'];
  return modelExtensions.includes(extension);
};

