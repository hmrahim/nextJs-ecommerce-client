// 📁 hooks/useRealtimeSync.js
// Connects to the socket once and invalidates ALL matching react-query
// queries whenever the backend emits a "resource:change" event.
//
// Backend emits:  { resource: "Product", action: "create"|"update"|"delete", id }
// We map resource → query-key fragment (case-insensitive substring) and
// invalidate every query whose key includes it.
'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, disconnectSocket } from '@/lib/socket';

// Map Mongoose model name → query-key fragments to invalidate.
// Anything not listed falls back to the lowercased model name.
const RESOURCE_MAP = {
  Product:        ['product', 'admin-products', 'products'],
  ProductVariant: ['variant', 'product', 'admin-products'],
  Category:       ['categor', 'admin-categories'],
  Brand:          ['brand', 'admin-brands'],
  Attribute:      ['attribute', 'admin-attributes'],
  Banner:         ['banner', 'admin-banners'],
  Blog:           ['blog', 'admin-blogs'],
  Order:          ['order', 'admin-orders', 'admin-order-stats'],
  Payment:        ['payment', 'transaction', 'admin-payments'],
  Shipment:       ['shipment', 'tracking', 'courier'],
  Review:         ['review', 'admin-reviews'],
  Coupon:         ['coupon', 'admin-coupons'],
  Cart:           ['cart', 'abandoned-cart'],
  Wishlist:       ['wishlist'],
  User:           ['user', 'customer', 'admin-customers', 'profile'],
  Notification:   ['notification'],
  Warehouse:      ['warehouse', 'inventory'],
  Inventory:      ['inventory', 'stock'],
  AuditLog:       ['audit'],
  SearchLog:      ['search'],
};

function keyMatchesAny(key, fragments) {
  // key can be an array like ['admin-products', { page: 2 }]
  if (!Array.isArray(key)) return false;
  return key.some((part) => {
    if (typeof part !== 'string') return false;
    const lower = part.toLowerCase();
    return fragments.some((f) => lower.includes(f.toLowerCase()));
  });
}

export function useRealtimeSync({ enabled = true } = {}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    let socket;
    let cancelled = false;

    (async () => {
      socket = await getSocket();
      if (cancelled) return;

      const onChange = (evt) => {
        const fragments = RESOURCE_MAP[evt?.resource] || [
          (evt?.resource || '').toLowerCase(),
        ];

        // Invalidate every query whose key matches.
        queryClient.invalidateQueries({
          predicate: (q) => keyMatchesAny(q.queryKey, fragments),
        });

        // Lightweight log so admins can see realtime in devtools.
        // eslint-disable-next-line no-console
        console.log(`🔄 realtime → ${evt.resource}:${evt.action}`, evt.id || '');
      };

      socket.on('resource:change', onChange);
      socket._rtHandler = onChange;
    })();

    return () => {
      cancelled = true;
      if (socket && socket._rtHandler) {
        socket.off('resource:change', socket._rtHandler);
        socket._rtHandler = null;
      }
    };
  }, [enabled, queryClient]);
}

export { disconnectSocket };
