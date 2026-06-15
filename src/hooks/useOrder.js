'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

import { orderService } from '@/services/orderService';
import toast from 'react-hot-toast';

/* ════════════════════════════════════════════════════════════
   CLIENT-SIDE HOOKS
═══════════════════════════════════════════════════════════ */

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => orderService.create(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success(res?.data?.message || 'Order placed successfully');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Could not place order';
      toast.error(msg);
    },
  });
}

export function useMyOrders(params = {}) {
  return useQuery({
    queryKey: ['my-orders', params],
    queryFn:  async () => (await orderService.getMyOrders(params)).data,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: ['order', id],
    queryFn:  async () => (await orderService.getById(id)).data?.data,
    enabled: !!id,
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => orderService.cancelOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      qc.invalidateQueries({ queryKey: ['order'] });
      toast.success('Order cancelled');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Could not cancel'),
  });
}

/* ════════════════════════════════════════════════════════════
   ADMIN HOOKS
═══════════════════════════════════════════════════════════ */

export function useAdminOrders(params = {}) {
  return useQuery({
    queryKey: ['admin-orders', params],
    queryFn:  async () => (await orderService.adminGetAll(params)).data,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useAdminOrderStats() {
  return useQuery({
    queryKey: ['admin-order-stats'],
    queryFn:  async () => (await orderService.adminStats()).data?.data,
    staleTime: 60_000,
  });
}

export function useAdminOrder(id) {
  return useQuery({
    queryKey: ['admin-order', id],
    queryFn:  async () => (await orderService.adminGetById(id)).data?.data,
    enabled: !!id,
  });
}

export function useRiders(params = {}) {
  return useQuery({
    queryKey: ['admin-riders', params],
    queryFn:  async () => (await orderService.adminListRiders(params)).data?.data || [],
    staleTime: 60_000,
  });
}

export function useConfirmOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, riderId, note }) => orderService.adminConfirmOrder(id, riderId, note),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-order', vars.id] });
      qc.invalidateQueries({ queryKey: ['admin-order-stats'] });
      qc.invalidateQueries({ queryKey: ['admin-riders'] });
      toast.success('Order confirmed & rider assigned');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Could not confirm order'),
  });
}

export function useAssignRider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, riderId, note }) => orderService.adminAssignRider(id, riderId, note),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-order', vars.id] });
      toast.success('Rider reassigned');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Could not assign rider'),
  });
}

export function useAdminUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }) => orderService.adminUpdateStatus(id, status, note),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-order', vars.id] });
      qc.invalidateQueries({ queryKey: ['admin-order-stats'] });
      toast.success('Status updated');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Could not update status'),
  });
}

export function useAdminCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }) => orderService.adminCancelOrder(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-order-stats'] });
      toast.success('Order cancelled');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Could not cancel'),
  });
}

/* ════════════════════════════════════════════════════════════
   RIDER HOOKS
═══════════════════════════════════════════════════════════ */

export function useRiderOrders(params = {}) {
  return useQuery({
    queryKey: ['rider-orders', params],
    queryFn:  async () => (await orderService.riderListOrders(params)).data,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useRiderOrder(id) {
  return useQuery({
    queryKey: ['rider-order', id],
    queryFn:  async () => (await orderService.riderGetOrder(id)).data?.data,
    enabled: !!id,
  });
}

export function useRiderPickup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => orderService.riderMarkPickedUp(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rider-orders'] });
      qc.invalidateQueries({ queryKey: ['rider-order'] });
      toast.success('Picked up — out for delivery');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Could not pick up'),
  });
}

export function useRiderDeliver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => orderService.riderCompleteDelivery(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rider-orders'] });
      qc.invalidateQueries({ queryKey: ['rider-order'] });
      toast.success('Delivery completed 🎉');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Could not complete delivery'),
  });
}



