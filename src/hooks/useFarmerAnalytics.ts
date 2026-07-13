/**
 * @fileoverview useFarmerAnalytics — TanStack Query hook for farmer analytics data.
 * Auto-refetches every 5 minutes. Used by EarningsAreaChart.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase, getValidAuthToken } from "@/lib/supabase";
import type { FarmerAnalyticsResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function fetchFarmerAnalytics(timeframe: string): Promise<FarmerAnalyticsResponse> {
  const token = await getValidAuthToken();

  const res = await fetch(`${API_URL}/api/farmer/analytics?timeframe=${timeframe}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`Analytics fetch failed: ${res.statusText}`);
  return res.json();
}

export function useFarmerAnalytics(timeframe: "monthly" | "weekly" = "monthly") {
  return useQuery<FarmerAnalyticsResponse>({
    queryKey: ["farmerAnalytics", timeframe],
    queryFn: () => fetchFarmerAnalytics(timeframe),
    staleTime: 5 * 60 * 1000,    // Consider fresh for 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    retry: 2,
  });
}
