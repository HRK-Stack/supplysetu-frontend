// src/hooks/useDashboard.ts

"use client";

import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";

import type { ApiResponse } from "@/types/common";

export interface DashboardData {
  total_dealers: number;
  total_products: number;
  total_quotes: number;
  total_orders: number;
  pending_exports: number;
  revenue: number;
}

export function useDashboard() {
  return useQuery<
    ApiResponse<DashboardData>
  >({
    queryKey: ["dashboard"],

    queryFn: async () => {
      const response =
        await api.get<
          ApiResponse<DashboardData>
        >("/dashboard");

      return response.data;
    },
  });
}