/**
 * @fileoverview useOrders — TanStack Query hooks for orders.
 * - useUpdateOrderStatus: mutation for PATCH /api/orders/:id/status (farmer)
 * - useCreateOrder: mutation for POST /api/orders (consumer checkout)
 * - useOrderRoute: query for GET /api/orders/:id/route (Phase 5 — refetches every 5s)
 * - useVerifyDelivery: mutation for POST /api/orders/:id/verify-delivery (Phase 5)
 */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { OrderStatus } from "@/types";
import { createDbNotification } from "./useNotifications";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ─── Shared auth header helper ────────────────────────────────────────────────
async function authHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  // Retrieve raw token and ensure it's not null or undefined
  let rawToken = session?.access_token;
  if (!rawToken || typeof rawToken !== "string") {
    throw new Error("Please login to continue.");
  }

  // Trim whitespace and remove any newline or carriage return characters
  let token = rawToken.trim().replace(/[\r\n]+/g, "");

  // Do not prepend "Bearer " if it already exists
  if (token.startsWith("Bearer ")) {
    token = token.substring(7).trim().replace(/[\r\n]+/g, "");
  }

  if (!token) {
    throw new Error("Please login to continue.");
  }

  headers.Authorization = `Bearer ${token}`;
  return headers;
}

// ─── Update order status (farmer — accept/dispatch; also used in Phase 5) ─────
interface UpdateStatusInput {
  orderId: string;
  status: OrderStatus;
  note?: string;
  driverId?: string;
}

async function patchOrderStatus({
  orderId,
  status,
  note,
  driverId,
}: UpdateStatusInput): Promise<any> {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status, note, driverId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to update order status");
  }
  return res.json();
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["consumerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["orderRoute"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ─── Create order (consumer checkout) ─────────────────────────────────────────
interface CreateOrderInput {
  farmerId: string;
  totalAmount: number;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  items: Array<{
    productId: string;
    quantity: number;
    priceAtPurchase: number;
  }>;
}

async function postOrder(payload: CreateOrderInput): Promise<any> {
  const headers = await authHeaders();
  const res = await fetch(`/api/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to create order");
  }
  return res.json();
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["consumerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["farmerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["farmerOrdersDirect"] });
      queryClient.invalidateQueries({ queryKey: ["farmerAnalytics"] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // qty may change
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      // Generate Placed Order notification
      const orderId = data?.id ? `#ORD-${data.id.substring(0, 4).toUpperCase()}` : "#ORD-1023";
      createDbNotification(
        "🛒 Order Placed",
        `Your order ${orderId} has been placed successfully.`,
        "order_update"
      );

      // Generate Rewards notification
      createDbNotification(
        "🎁 Rewards Earned",
        "Congratulations! You earned +50 Reward Points on your purchase.",
        "rewards"
      );
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 5: useOrderRoute
// GET /api/orders/:id/route — refetches every 5 seconds for live tracking
// ─────────────────────────────────────────────────────────────────────────────
export interface RouteData {
  orderId: string;
  status: string;
  farmerCoords: { lat: number; lng: number };
  consumerCoords: { lat: number; lng: number };
  currentCourierCoords: { lat: number; lng: number };
  estimatedTimeRemainingMin: number;
  distanceRemainingKm: number;
  progress: number;
}

async function fetchOrderRoute(orderId: string): Promise<RouteData> {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/api/orders/${orderId}/route`, {
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to fetch route data");
  }
  return res.json();
}

export function useOrderRoute(orderId: string | undefined) {
  return useQuery<RouteData>({
    queryKey: ["orderRoute", orderId],
    queryFn: () => fetchOrderRoute(orderId!),
    enabled: !!orderId,
    refetchInterval: 5000, // live-poll every 5 seconds
    staleTime: 0,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 5: useVerifyDelivery
// POST /api/orders/:id/verify-delivery — consumer submits OTP
// ─────────────────────────────────────────────────────────────────────────────
interface VerifyDeliveryInput {
  orderId: string;
  otp: string;
}

async function postVerifyDelivery({
  orderId,
  otp,
}: VerifyDeliveryInput): Promise<any> {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/api/orders/${orderId}/verify-delivery`, {
    method: "POST",
    headers,
    body: JSON.stringify({ otp }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to verify delivery");
  }
  return res.json();
}

export function useVerifyDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postVerifyDelivery,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orderRoute", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["consumerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
