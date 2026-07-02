/**
 * @fileoverview useConsumerOrders — TanStack Query hook for fetching
 * the logged-in consumer's orders directly from Supabase.
 * Bypasses the Express backend for reliability.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// ─── Fetch consumer orders ─────────────────────────────────────────────────────
async function fetchConsumerOrders() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      farmer:profiles!orders_farmer_id_fkey(id, full_name, avatar_url, is_verified, trust_score, phone_number, address),
      order_items(
        id,
        product_id,
        quantity,
        price_at_purchase,
        product:products(id, title, unit_type, image_url, category, quality_grade)
      )
    `
    )
    .eq("consumer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchConsumerOrders error:", error);
    return [];
  }
  return data ?? [];
}

export function useConsumerOrders() {
  return useQuery({
    queryKey: ["consumerOrders"],
    queryFn: fetchConsumerOrders,
    staleTime: 30_000,
    refetchInterval: 30_000, // auto-refresh every 30s for status updates
  });
}

// ─── Fetch single order ───────────────────────────────────────────────────────
async function fetchConsumerOrder(orderId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      farmer:profiles!orders_farmer_id_fkey(id, full_name, avatar_url, is_verified, trust_score, phone_number, address, location_lat, location_lng),
      consumer:profiles!orders_consumer_id_fkey(id, full_name, avatar_url, location_lat, location_lng, address),
      order_items(
        id,
        product_id,
        quantity,
        price_at_purchase,
        product:products(id, title, unit_type, image_url, category, quality_grade, traceability_code)
      )
    `
    )
    .eq("id", orderId)
    .eq("consumer_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("fetchConsumerOrder error:", error);
    return null;
  }
  return data;
}

export function useConsumerOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["consumerOrder", orderId],
    queryFn: () => fetchConsumerOrder(orderId!),
    enabled: !!orderId,
    staleTime: 15_000,
    refetchInterval: 15_000,
  });
}

// ─── Submit a review ──────────────────────────────────────────────────────────
interface SubmitReviewInput {
  orderId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}

async function submitReview({
  orderId,
  revieweeId,
  rating,
  comment,
}: SubmitReviewInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase
    .from("reviews") as any)
    .insert({
      order_id: orderId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating,
      comment,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumerOrders"] });
    },
  });
}
