/**
 * @fileoverview useFarmerOrdersDirect — TanStack Query hook for farmer incoming orders.
 * Queries Supabase directly (no Express backend dependency).
 * Filters by farmer_id = current_user.id to ensure strict role isolation.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { OrderStatus } from "@/types";

// ─── Fetch farmer's incoming orders ───────────────────────────────────────────
async function fetchFarmerOrdersDirect(): Promise<any[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      consumer:profiles!orders_consumer_id_fkey(
        id,
        full_name,
        avatar_url,
        phone_number,
        address
      ),
      order_items(
        id,
        product_id,
        quantity,
        price_at_purchase,
        product:products(
          id,
          title,
          unit_type,
          image_url,
          category,
          quality_grade
        )
      )
    `
    )
    .eq("farmer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[useFarmerOrdersDirect] fetch error:", error);
    return [];
  }

  return data ?? [];
}

export function useFarmerOrdersDirect() {
  return useQuery<any[]>({
    queryKey: ["farmerOrdersDirect"],
    queryFn: fetchFarmerOrdersDirect,
    staleTime: 30_000,
    refetchInterval: 30_000, // poll every 30s for new orders
    retry: 2,
  });
}

// ─── Update order status (farmer action) ─────────────────────────────────────
interface UpdateStatusInput {
  orderId: string;
  status: OrderStatus;
}

async function updateFarmerOrderStatus({
  orderId,
  status,
}: UpdateStatusInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await (supabase
    .from("orders") as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("farmer_id", user.id); // enforce ownership

  if (error) throw new Error(error.message);
}

export function useUpdateFarmerOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFarmerOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmerOrdersDirect"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
