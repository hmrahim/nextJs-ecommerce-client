'use client';
/**
 * 📁 src/hooks/useVisitors.js
 * React-Query hooks for the admin "Visitor Analytics" dashboard — all real data.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { visitorService } from '@/services/visitorService';

export function useVisitorStats(range) {
  return useQuery({
    queryKey: ['visitors', 'stats', range],
    queryFn: async () => (await visitorService.getStats({ range })).data.data,
    staleTime: 30 * 1000,
  });
}

export function useVisitorChart(range) {
  return useQuery({
    queryKey: ['visitors', 'chart', range],
    queryFn: async () => (await visitorService.getChartData({ range })).data.data,
    staleTime: 60 * 1000,
  });
}

export function useVisitorsByDevice(range) {
  return useQuery({
    queryKey: ['visitors', 'by-device', range],
    queryFn: async () => (await visitorService.getByDevice({ range })).data.data,
    staleTime: 60 * 1000,
  });
}

export function useVisitorsBySource(range) {
  return useQuery({
    queryKey: ['visitors', 'by-source', range],
    queryFn: async () => (await visitorService.getBySource({ range })).data.data,
    staleTime: 60 * 1000,
  });
}

export function useVisitorsByCountry(range) {
  return useQuery({
    queryKey: ['visitors', 'by-country', range],
    queryFn: async () => (await visitorService.getByCountry({ range })).data.data,
    staleTime: 60 * 1000,
  });
}

export function useTopPages(range) {
  return useQuery({
    queryKey: ['visitors', 'top-pages', range],
    queryFn: async () => (await visitorService.getTopPages({ range })).data.data,
    staleTime: 60 * 1000,
  });
}

export function useLiveVisitorCount() {
  return useQuery({
    queryKey: ['visitors', 'live'],
    queryFn: async () => (await visitorService.getLiveCount()).data.data.liveNow,
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  });
}

export function useVisitorsList(params) {
  return useQuery({
    queryKey: ['visitors', 'list', params],
    queryFn: async () => (await visitorService.getAll(params)).data.data,
    staleTime: 20 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useBulkDeleteVisitors() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids) => visitorService.deleteBulk(ids),
    onSuccess: () => {
      toast.success('Visitor records deleted');
      qc.invalidateQueries({ queryKey: ['visitors'] });
    },
    onError: () => toast.error('Could not delete visitor records'),
  });
}

export function useExportVisitorsCsv() {
  return useMutation({
    mutationFn: async (range) => {
      const res = await visitorService.exportCsv({ range });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `visitors-${range}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: () => toast.error('Could not export CSV'),
  });
}
