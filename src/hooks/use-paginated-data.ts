import { useState, useEffect, useCallback } from 'react';
import { PaginatedResponse, PaginationParams } from '@/types/pagination.types';
import { notify } from '@/lib/notifications';

interface UsePaginatedDataOptions<T> {
  fetchFn: (params: PaginationParams) => Promise<PaginatedResponse<T>>;
  initialParams?: PaginationParams;
}

interface UsePaginatedDataResult<T> {
  data: T[];
  pagination: Omit<PaginatedResponse<T>, 'data'>;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setParams: (params: Partial<PaginationParams>) => void;
}

export function usePaginatedData<T>({
  fetchFn,
  initialParams = {},
}: UsePaginatedDataOptions<T>): UsePaginatedDataResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<T>, 'data'>>({
    current_page: 1,
    first_page_url: '',
    from: 0,
    last_page: 1,
    last_page_url: '',
    links: [],
    next_page_url: null,
    path: '',
    per_page: 15,
    prev_page_url: null,
    to: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParamsState] = useState<PaginationParams>({
    page: 1,
    per_page: 15,
    ...initialParams,
  });

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching with params:', params);
        const response = await fetchFn(params);
        console.log('Response received:', response);

        if (!isCancelled) {
          const { data: responseData, ...paginationData } = response;
          console.log('Response data:', responseData);
          console.log('Pagination data:', paginationData);
          console.log('Is cancelled?', isCancelled);
          setData(responseData || []);
          setPagination(paginationData);
          setLoading(false);
          console.log('Data and pagination set');
        }
      } catch (err) {
        if (isCancelled) {
          return;
        }

        // Ignore aborted requests
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err as Error);
        setLoading(false);
        console.error('Error fetching paginated data:', err);

        // Show error notification for network errors
        if (err instanceof Error && err.message.toLowerCase().includes('network')) {
          notify.networkError();
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
      // Ensure loading state is cleared if the effect is cleaned up before completion (e.g., StrictMode)
      setLoading(false);
    };
  }, [params]);

  const setPage = useCallback((page: number) => {
    setParamsState(prev => ({ ...prev, page }));
  }, []);

  const setPerPage = useCallback((perPage: number) => {
    setParamsState(prev => ({ ...prev, per_page: perPage, page: 1 }));
  }, []);

  const setParams = useCallback((newParams: Partial<PaginationParams>) => {
    setParamsState(prev => ({ ...prev, ...newParams }));
  }, []);

  const refetch = useCallback(() => {
    // Force a refetch by adding a timestamp to ensure params change
    setParamsState(prev => ({ ...prev, _refetch: Date.now() }));
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    refetch,
    setPage,
    setPerPage,
    setParams,
  };
}
