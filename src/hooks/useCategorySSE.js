// 📁 hooks/useCategorySSE.js

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useCategorySSE = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const es = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/categories/events`,
      { withCredentials: true }
    );

    es.addEventListener('category_updated', () => {
          console.log('SSE event received ✅')
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    });

    es.onerror = () => {
      es.close();
      // 5s পরে reconnect
      setTimeout(() => {}, 5000);
    };

    return () => es.close();
  }, [queryClient]);
};