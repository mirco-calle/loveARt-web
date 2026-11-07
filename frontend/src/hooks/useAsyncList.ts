import { useState, useEffect, useCallback } from "react";

interface AsyncListResult<T> {
  data: {
    results: T[];
    count?: number;
  };
}

/**
 * Clean Code reusable hook to fetch and manage asynchronous lists.
 * Eliminates duplicate boilerplate across data-fetching hooks.
 */
export function useAsyncList<T>(
  fetcher: () => Promise<AsyncListResult<T>>,
  errorMessage: string = "Error al cargar los datos."
) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetcher();
      setItems(response.data.results || []);
      setError(null);
    } catch (err) {
      console.error(`[useAsyncList] ${errorMessage}:`, err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, errorMessage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    items,
    isLoading,
    error,
    refresh: fetchData,
  };
}

