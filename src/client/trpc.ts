import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/server';

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos de cache
    },
  },
});