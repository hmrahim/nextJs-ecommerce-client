// 📁 hooks/useCategorySSE.js

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';

export const useCategorySSE = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let es;
    let reconnectTimer;
    let isUnmounted = false;

    const connect = async () => {
      // EventSource Cannot send custom headers, so token Whom query param Must be sent to
      const session = await getSession();
      const token = session?.accessToken || session?.user?.token;
      if (!token) {
        reconnectTimer = setTimeout(connect, 5000);
        return;
      }

      es = new EventSource(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/categories/events?token=${encodeURIComponent(token)}`,
        { withCredentials: true }
      );

      es.addEventListener('category_updated', () => {
        console.log('SSE event received ✅');
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      });

      es.onerror = () => {
        es.close();
        if (isUnmounted) return;
        reconnectTimer = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (es) es.close();
    };
  }, [queryClient]);
};
