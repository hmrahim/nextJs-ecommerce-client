// 📁 hooks/useOrderSSE.js
// নতুন order এলে বা order এর status update হলে admin dashboard/orders
// realtime এ instantly update হওয়ার জন্য SSE hook।

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
      // EventSource কাস্টম হেডার পাঠাতে পারে না, তাই token কে query param এ পাঠাতে হবে
      const session = await getSession();
      const token = session?.accessToken || session?.user?.token;
      if (!token) {
        // লগইন করা না থাকলে কানেক্ট করার দরকার নাই
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

      // নতুন order placed হলে
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

      // order এর status/details update হলে (confirm, status change, cancel, assign rider ইত্যাদি)
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
        // 5s পরে reconnect
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
