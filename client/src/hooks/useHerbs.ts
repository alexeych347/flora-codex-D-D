import { useState, useEffect, useCallback } from 'react';
import { herbsApi } from '../api/herbs';
import { HerbOrStub } from '../types';

export function useHerbs() {
  const [herbs, setHerbs] = useState<HerbOrStub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHerbs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await herbsApi.getAll();
      setHerbs(data);
      setError(null);
    } catch {
      setError('Не удалось загрузить травы. Проверьте соединение с сервером.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHerbs();
  }, [fetchHerbs]);

  return { herbs, loading, error, refetch: fetchHerbs };
}
