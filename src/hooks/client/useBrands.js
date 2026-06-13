"use client";
import { useQuery } from "@tanstack/react-query";
import { brandService } from "@/services/brandService";

export function useBrands() {
  return useQuery({
    queryKey: ["client-brands"],
    queryFn: async () => {
      const res = await brandService.getAll();
      // Backend: { success, data: [...] } or { results: [...] }
      return res.data?.data ?? res.data?.results ?? res.data ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });
}