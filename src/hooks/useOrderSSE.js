// 📁 hooks/useOrderSSE.js
// new order if comes or order Of status update If admin dashboard/orders
// realtime In instantly update to be SSE hook।

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';

export const useOrderSSE = (onEvent) => {
  const queryClient = useQueryClient();
  const reconnectTimer = useRef(null);
  const esRef = useRef(null);

  useEffect(() => {
    let isUnmounted = false;

    const connect = async () => {
      // EventSource Cannot send custom headers, so token Whom query param Must be sent to
      const session = await getSession();
      const token = session?.accessToken || session?.user?.token;
      if (!token) {
        // No need to connect if not logged in
        reconnectTimer.current = setTimeout(connect, 5000);
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/orders/events?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url, { withCredentials: true });
      esRef.current = es;

      const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin-order'] });
      };

      // new order placed If
      es.addEventListener('order_created', (e) => {
        invalidateAll();
        if (onEvent) {
          try {
            onEvent('order_created', JSON.parse(e.data));
          } catch {
            onEvent('order_created', null);
          }
        }
      });

      // order Of status/details update If (confirm, status change, cancel, assign rider etc.)
      es.addEventListener('order_updated', (e) => {
        invalidateAll();
        if (onEvent) {
          try {
            onEvent('order_updated', JSON.parse(e.data));
          } catch {
            onEvent('order_updated', null);
          }
        }
      });

      es.onerror = () => {
        es.close();
        if (isUnmounted) return;
        // 5s Later reconnect
        reconnectTimer.current = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (esRef.current) esRef.current.close();
    };
  }, [queryClient, onEvent]);
};
