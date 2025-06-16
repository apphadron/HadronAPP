import { useEffect, useState } from 'react';
import { fetchFromTable, FetchOptions } from '@/db/database.service';

export function useSupabaseTable<T = any>(
  tableName: string,
  options?: FetchOptions
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchFromTable<T>(tableName, options);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tableName, JSON.stringify(options)]);

  return { data, loading, error };
}
