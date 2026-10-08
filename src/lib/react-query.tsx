'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import axios from 'axios';
import { BackendPendingError, isCancelledRequest } from '@/core/api/capabilities';

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof BackendPendingError || isCancelledRequest(error)) return false;

  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  if (status === 404 || status === 401 || status === 403) return false;
  if (status === undefined || status >= 500) return failureCount < 2;
  return false;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime in v5)
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
            retry: shouldRetry,
          },
          mutations: {
            retry: 1,
            onError: (error) => {
              console.error('Mutation error:', error);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
