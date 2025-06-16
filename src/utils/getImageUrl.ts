import { supabase } from '@/db/supabaseClient';
import { getImageFromCache } from './imageCache';

// Função auxiliar para obter a URL pública completa
const getFullPublicUrl = (path: string): string | null => {
  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(path);
  return data?.publicUrl || null;
};

export const getImageUrl = async (path: string | null): Promise<string | null> => {
  if (!path) return null;
  
  try {
    // Primeiro obtemos a URL pública do Supabase
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(path);

    if (!data?.publicUrl) {
      console.error('Erro ao obter URL da imagem:', path);
      return null;
    }

    const publicUrl = data.publicUrl;
    
    // Verificamos o cache com a URL completa
    const cachedUrl = await getImageFromCache(publicUrl);
    
    // Se existe no cache, retornamos
    if (cachedUrl) return cachedUrl;
    
    // Se não existe, baixamos e armazenamos no cache
    const newCachedUrl = await getImageFromCache(publicUrl);
    return newCachedUrl || publicUrl;
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    return null;
  }
};

export const getRemoteImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  return getFullPublicUrl(path);
};