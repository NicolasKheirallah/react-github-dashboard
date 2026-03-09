import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

const logQueryError = (error, context) => {
  if (import.meta.env.DEV) {
    console.error(`React Query ${context} error:`, error);
  }
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => logQueryError(error, 'query'),
  }),
  mutationCache: new MutationCache({
    onError: (error) => logQueryError(error, 'mutation'),
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
