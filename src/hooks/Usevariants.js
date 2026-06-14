
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
            const res = await variantService.adminGetAll(productId);
            return res.data?.data || [];
        },
        enabled: !!productId,
        staleTime: 1000 * 60 * 2,
    });
}

// ─── 2. Bulk generate variants ───────────────────────────────────────────────
export function useBulkGenerateVariants(productId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) => variantService.adminBulkGenerate(productId, payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: variantKeys.all(productId) }),
    });
}

// ─── 3. Create single variant ─────────────────────────────────────────────────
export function useCreateVariant(productId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => variantService.adminCreate(productId, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: variantKeys.all(productId) }),
    });
}

// ─── 4. Update single variant ────────────────────────────────────────────────
export function useUpdateVariant(productId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ variantId, data }) => variantService.adminUpdate(productId, variantId, data),
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
        mutationFn: (variantId) => variantService.adminDelete(productId, variantId),
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

// ─── 6. Delete all variants ──────────────────────────────────────────────────
export function useDeleteAllVariants(productId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => variantService.adminDeleteAll(productId),
        onSuccess: () => qc.invalidateQueries({ queryKey: variantKeys.all(productId) }),
    });
}

// ─── 7. Toggle variant active status ────────────────────────────────────────
export function useToggleVariant(productId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (variantId) => variantService.adminToggle(productId, variantId),
        onMutate: async (variantId) => {
            await qc.cancelQueries({ queryKey: variantKeys.all(productId) });
            const snapshot = qc.getQueryData(variantKeys.all(productId));
            qc.setQueryData(variantKeys.all(productId), (old = []) =>
                old.map(v => v._id === variantId ? { ...v, isActive: !v.isActive } : v)
            );
            return { snapshot };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.snapshot) qc.setQueryData(variantKeys.all(productId), ctx.snapshot);
        },
        onSettled: () => qc.invalidateQueries({ queryKey: variantKeys.all(productId) }),
    });
}