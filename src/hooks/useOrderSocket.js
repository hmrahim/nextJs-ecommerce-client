// 📁 hooks/useOrderSocket.js
// Socket.IO দিয়ে নতুন order এলে বা order এর status update হলে
// admin dashboard/orders page realtime এ instantly update হওয়ার জন্য hook।

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';

export const useOrderSocket = (onEvent) => {
  const queryClient = useQueryClient();
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    let socket;
    let isUnmounted = false;

    const invalidateAll = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order'] });
    };

    const handleCreate = (evt) => {
      invalidateAll();
      onEventRef.current?.('order_created', evt?.doc || evt);
    };

    const handleUpdate = (evt) => {
      invalidateAll();
      onEventRef.current?.('order_updated', evt?.doc || evt);
    };

    (async () => {
      socket = await getSocket();
      if (isUnmounted || !socket) return;

      // admins room এ join করি (server side socket.io middleware role দেখে
      // auto-join করে, কিন্তু explicit join করাটাও নিরাপদ)
      socket.emit('join', 'admins');

      socket.on('Order:create', handleCreate);
      socket.on('Order:update', handleUpdate);

      // fallback: generic firehose event, resource ফিল্টার করে নিজে চেক করি
      socket.on('resource:change', (evt) => {
        if (evt?.resource !== 'Order') return;
        if (evt.action === 'create') handleCreate(evt);
        else handleUpdate(evt);
      });
    })();

    return () => {
      isUnmounted = true;
      if (socket) {
        socket.off('Order:create', handleCreate);
        socket.off('Order:update', handleUpdate);
        socket.off('resource:change');
      }
    };
  }, [queryClient]);
};
