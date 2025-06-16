import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const IMAGE_CACHE_KEY = 'IMAGE_CACHE_MAP';
const CACHE_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000;
const CACHE_DIR = FileSystem.cacheDirectory + 'image_cache/';

interface CacheEntry {
  localPath: string;
  timestamp: number;
}

interface CacheMap {
  [url: string]: CacheEntry;
}

const ensureCacheDirectory = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('Error ensuring cache directory:', error);
  }
};

const getCacheMap = async (): Promise<CacheMap> => {
  try {
    const cacheMapJson = await AsyncStorage.getItem(IMAGE_CACHE_KEY);
    return cacheMapJson ? JSON.parse(cacheMapJson) : {};
  } catch (error) {
    console.error('Error getting cache map:', error);
    return {};
  }
};

const saveCacheMap = async (cacheMap: CacheMap): Promise<void> => {
  try {
    await AsyncStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cacheMap));
  } catch (error) {
    console.error('Error saving cache map:', error);
  }
};

const cleanExpiredCache = async (): Promise<void> => {
  try {
    const cacheMap = await getCacheMap();
    const now = Date.now();
    let hasChanges = false;

    for (const url in cacheMap) {
      if (now - cacheMap[url].timestamp > CACHE_EXPIRY_TIME) {
        try {
          await FileSystem.deleteAsync(cacheMap[url].localPath, { idempotent: true });
        } catch (error) {
          console.log(`Failed to delete expired file: ${error}`);
        }
        delete cacheMap[url];
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await saveCacheMap(cacheMap);
    }
  } catch (error) {
    console.error('Error cleaning expired cache:', error);
  }
};

export const getImageFromCache = async (url: string | null): Promise<string | null> => {
  if (!url) return null;
  
  try {
    await ensureCacheDirectory();
    await cleanExpiredCache();
    
    const cacheMap = await getCacheMap();

    // Verifica se a URL está no cache e não expirou
    if (cacheMap[url]) {
      const { localPath } = cacheMap[url];
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      
      if (fileInfo.exists) {
        return localPath.startsWith('file://') ? localPath : `file://${localPath}`;
      } else {
        delete cacheMap[url];
        await saveCacheMap(cacheMap);
      }
    }

    // Verifica se a URL é válida
    if (!url.startsWith('http')) {
      console.error('Invalid URL for image download:', url);
      return null;
    }

    // Gera um nome de arquivo único para a imagem
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
    const localPath = CACHE_DIR + filename;

    // Baixa a imagem e salva localmente
    const downloadResult = await FileSystem.downloadAsync(url, localPath);
    
    if (downloadResult.status === 200) {
      // Atualiza o mapa de cache
      cacheMap[url] = {
        localPath,
        timestamp: Date.now()
      };
      await saveCacheMap(cacheMap);
      return `file://${localPath}`;
    }
    
    return null;
  } catch (error) {
    console.error('Error caching image:', error);
    return null;
  }
};

export const preloadImagesToCache = async (urls: string[]): Promise<void> => {
  try {
    await ensureCacheDirectory();
    await Promise.all(urls.map(url => getImageFromCache(url).catch(console.error)));
  } catch (error) {
    console.error('Error preloading images:', error);
  }
};

export const clearImageCache = async (): Promise<void> => {
  try {
    const cacheMap = await getCacheMap();
    
    // Delete all cached files
    await Promise.all(Object.values(cacheMap).map(entry => 
      FileSystem.deleteAsync(entry.localPath, { idempotent: true }).catch(console.error)
    ));
    
    // Reset the cache map
    await AsyncStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify({}));
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
};

export const initImageCache = async (): Promise<void> => {
  await ensureCacheDirectory();
  await cleanExpiredCache();
};

export const getImageCacheStats = async (): Promise<{count: number, size: number}> => {
  try {
    const cacheMap = await getCacheMap();
    const count = Object.keys(cacheMap).length;
    
    const sizes = await Promise.all(
      Object.values(cacheMap).map(async (entry) => {
        try {
          const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
          return fileInfo.exists && fileInfo.size ? fileInfo.size : 0;
        } catch (error) {
          console.log(`Error getting file info: ${error}`);
          return 0;
        }
      })
    );
    
    const size = sizes.reduce((sum, current) => sum + current, 0);
    
    return { count, size };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { count: 0, size: 0 };
  }
};

export const logImageCacheContents = async (): Promise<void> => {
  try {
    const cacheMap = await getCacheMap();
    console.log('Conteúdo do cache de imagens:');
    
    // Log do mapa de cache
    console.log('Cache Map:', cacheMap);
    
    // Detalhes de cada imagem em cache
    for (const [url, entry] of Object.entries(cacheMap)) {
      const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
      console.log(`URL: ${url}`);
      console.log(`Local: ${entry.localPath}`);
      console.log(`Tamanho: ${fileInfo.exists ? fileInfo.size : 'Arquivo não encontrado'} bytes`);
      console.log('---');
    }
    
    // Estatísticas totais
    const stats = await getImageCacheStats();
    console.log(`Total de imagens em cache: ${stats.count}`);
    console.log(`Tamanho total do cache: ${stats.size} bytes`);
  } catch (error) {
    console.error('Erro ao logar conteúdo do cache:', error);
  }
};