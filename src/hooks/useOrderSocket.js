// 📁 hooks/useOrderSocket.js
// Socket.IO with new order if comes or order Of status update If
// admin dashboard/orders page realtime In instantly update to be hook।

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

      // admins room In join Do (server side socket.io middleware role after seeing
      // auto-join done, but explicit join It's also safe)
      socket.emit('join', 'admins');

      socket.on('Order:create', handleCreate);
      socket.on('Order:update', handleUpdate);

      // fallback: generic firehose event, resource Filter and check myself
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
