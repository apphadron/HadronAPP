import { supabase } from '@/db/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';

type Filter = {
    column: string;
    operator?: '=' | '>' | '<' | '>=' | '<=' | '!=' | 'like' | 'ilike';
    value: any;
};

export interface FetchOptions {
    useCache?: boolean;
    cacheKey?: string;
    filters?: Record<string, any>;
    orderBy?: {
        column: string;
        ascending?: boolean;
    };
    limit?: number;
    columns?: string;
}

export async function fetchFromTable<T>(
    tableName: string,
    options: FetchOptions = {}
  ): Promise<T[] | null> {
    const {
      columns = '*',
      filters = [],
      orderBy,
      limit,
      useCache = false,
      cacheKey,
    } = options;
  
    const finalCacheKey = cacheKey || `cache_${tableName}`;
  
    try {
      const network = await Network.getNetworkStateAsync();
  
      if (!network.isConnected && useCache) {
        const cached = await AsyncStorage.getItem(finalCacheKey);
        if (cached) return JSON.parse(cached) as T[];
      }
  
      let query = supabase.from(tableName).select(columns);
  
      (filters as Filter[]).forEach(({ column, operator = '=', value }) => {
        query = query.filter(column, operator, value);
      });
  
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }
  
      if (limit) {
        query = query.limit(limit);
      }
  
      const { data, error } = await query;
  
      if (error) throw error;
  
      if (useCache) {
        await AsyncStorage.setItem(finalCacheKey, JSON.stringify(data));
      }
  
      return data as T[];
    } catch (error) {
      console.error(`Erro ao buscar dados da tabela ${tableName}:`, error);
      return null;
    }
  }
  