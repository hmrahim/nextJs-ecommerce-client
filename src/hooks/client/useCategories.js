"use client";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/categoryService";

export function useCategories() {
  return useQuery({
    queryKey: ["client-categories"],
    queryFn: async () => {
      const res = await categoryService.getAll({ limit: 100 });
      // Backend returns: { success, data: [...], pagination: {} }
      return res.data?.data ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });
}