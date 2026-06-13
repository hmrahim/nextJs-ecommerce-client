// 📁 src/hooks/useVariants.js
'use client';
import { variantService } from '@/services/Variantservice';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


// ─── Query Key Factory ────────────────────────────────────────────────────────
export const variantKeys = {
    all: (productId) => ['variants', productId],
    detail: (productId, variantId) => ['variants', productId, variantId],
};

// ─── 1. Fetch all variants of a product ──────────────────────────────────────
export function useProductVariants(productId) {
    return useQuery({
        queryKey: variantKeys.all(productId),
        queryFn: async () => {
            const res = await variantService.getByProduct(productId);
            return res.data?.variants || res.data?.data || [];
        },
        enabled: !!productId,
        staleTime: 1000 * 60 * 2,
    });
}

// ─── 2. Bulk replace (সব variants একসাথে save করো) ──────────────────────────
export function useBulkReplaceVariants(productId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (variants) => variantService.bulkReplace(productId, variants),
        onMutate: async (variants) => {
            await qc.cancelQueries({ queryKey: variantKeys.all(productId) });
            const snapshot = qc.getQueryData(variantKeys.all(productId));
            // optimistically update cache
            qc.setQueryData(variantKeys.all(productId), variants);
            return { snapshot };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.snapshot) qc.setQueryData(variantKeys.all(productId), ctx.snapshot);
        },
        onSettled: () => qc.invalidateQueries({ queryKey: variantKeys.all(productId) }),
    });
}

// ─── 3. Create single variant ─────────────────────────────────────────────────
export function useCreateVariant(productId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => variantService.create(productId, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: variantKeys.all(productId) }),
    });
}

// ─── 4. Update single variant ────────────────────────────────────────────────
export function useUpdateVariant(productId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ variantId, data }) => variantService.update(productId, variantId, data),
        onMutate: async ({ variantId, data }) => {
            await qc.cancelQueries({ queryKey: variantKeys.all(productId) });
            const snapshot = qc.getQueryData(variantKeys.all(productId));
            qc.setQueryData(variantKeys.all(productId), (old = []) =>
                old.map(v => v._id === variantId ? { ...v, ...data } : v)
            );
            return { snapshot };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.snapshot) qc.setQueryData(variantKeys.all(productId), ctx.snapshot);
        },
        onSettled: () => qc.invalidateQueries({ queryKey: variantKeys.all(productId) }),
    });
}

// ─── 5. Delete single variant ────────────────────────────────────────────────
export function useDeleteVariant(productId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (variantId) => variantService.delete(productId, variantId),
        onMutate: async (variantId) => {
            await qc.cancelQueries({ queryKey: variantKeys.all(productId) });
            const snapshot = qc.getQueryData(variantKeys.all(productId));
            qc.setQueryData(variantKeys.all(productId), (old = []) =>
                old.filter(v => v._id !== variantId)
            );
            return { snapshot };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.snapshot) qc.setQueryData(variantKeys.all(productId), ctx.snapshot);
        },
        onSettled: () => qc.invalidateQueries({ queryKey: variantKeys.all(productId) }),
    });
}