/**
 * @fileoverview useNotifications — TanStack Query hooks for the notifications table.
 * Phase 5: Supports the NotificationsPanel bell-icon slide-out.
 *
 * - useNotifications(): fetches all notifications for current user, polling every 10s
 * - useMarkAllRead(): mutation to mark all notifications as is_read = true
 */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Notification } from "@/types";

// ─── Fetch all notifications for the logged-in user ───────────────────────────
async function fetchNotifications(): Promise<Notification[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[useNotifications] fetch error:", error);
    return [];
  }
  return data ?? [];
}

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 10_000, // poll every 10 seconds
    staleTime: 5_000,
  });
}

// ─── Mark all notifications as read ──────────────────────────────────────────
async function markAllRead(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await (supabase
    .from("notifications") as any)
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("[useMarkAllRead] update error:", error);
    throw error;
  }
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ─── Clear all read notifications ──────────────────────────────────────────
async function clearRead(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id)
    .eq("is_read", true);

  if (error) {
    console.error("[useClearRead] delete error:", error);
    throw error;
  }
}

export function useClearRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ─── Create a notification in the database ──────────────────────────────────
export async function createDbNotification(
  title: string,
  message: string,
  type: string = "order_update"
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await (supabase.from("notifications") as any).insert({
      user_id: user.id,
      title,
      message,
      type,
      is_read: false,
    });

    if (error) {
      console.error("[createDbNotification] insert error:", error);
    }
  } catch (err) {
    console.error("[createDbNotification] error:", err);
  }
}

