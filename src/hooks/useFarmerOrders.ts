/**
 * @fileoverview useFarmerOrders — TanStack Query hook for farmer incoming orders.
 * Used by IncomingOrdersTable component.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function fetchFarmerOrders(): Promise<any[]> {
  const { data: { session } } = await supabase.auth.getSession();
  let rawToken = session?.access_token;
  if (!rawToken || typeof rawToken !== "string") {
    throw new Error("Please login to continue.");
  }

  let token = rawToken.trim().replace(/[\r\n]+/g, "");
  if (token.startsWith("Bearer ")) {
    token = token.substring(7).trim().replace(/[\r\n]+/g, "");
  }

  if (!token) {
    throw new Error("Please login to continue.");
  }

  const res = await fetch(`${API_URL}/api/farmer/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`Orders fetch failed: ${res.statusText}`);
  return res.json();
}

export function useFarmerOrders() {
  return useQuery<any[]>({
    queryKey: ["farmerOrders"],
    queryFn: fetchFarmerOrders,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Poll every 30 seconds for new orders
    retry: 2,
  });
}
