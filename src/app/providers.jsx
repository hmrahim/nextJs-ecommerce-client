'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { FlashSaleProvider } from '@/context/FlashSaleContext';
import VisitorTracker from '@/components/VisitorTracker';

export default function Providers({ children, session }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime:            60 * 1000,
          gcTime:               5 * 60 * 1000,
          retry:                1,
          refetchOnWindowFocus: false,
          refetchOnReconnect:   false,
        },
      },
    })
  );

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <VisitorTracker />
        <FlashSaleProvider>
          {children}
        </FlashSaleProvider>
        <Toaster position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
