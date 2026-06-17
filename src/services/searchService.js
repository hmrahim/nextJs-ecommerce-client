// 📁 PATH: services/searchService.js
import api from '@/lib/api'; // your existing axios instance

/**
 * GET /api/products/search
 * @param {Object} params - { q, category, page, limit, sort, minPrice, maxPrice, brand, rating, inStock }
 */
export const searchProducts = async (params) => {
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    const { data } = await api.get('/products/search', { params: cleanParams });
    return data; // { success, query, total, page, pages, limit, results }
};

/**
 * GET /api/categories
 * Search bar In category dropdown for this
 */
export const getCategories = async () => {
    const { data } = await api.get('/categories', { params: { limit: 100 } });
    return data; // { success, data: [...] }
};