'use client';
import { useState, useEffect } from 'react';
import { productService } from '@/services/productService';

export function useProducts(params = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    productService.getAll(params)
      .then(({ data }) => {
        if (!cancelled) {
          setProducts(data.data || data);
          setMeta(data.meta || null);
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [JSON.stringify(params)]);

  return { products, loading, error, meta };
}
