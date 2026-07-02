"use client";

/**
 * @fileoverview /orders — Unified Orders List page for both farmers and consumers.
 * - Consumers see orders they placed
 * - Farmers see incoming orders to manage
 * - Status badges, tracking links, order details
 * - Farmers can accept/dispatch/cancel orders inline
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function UnifiedOrdersPage() {
  const router = useRouter();

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/signin");
        return;
      }
      const { data: profile } = (await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()) as any;

      if (profile?.role === "farmer") {
        router.replace("/farmer/orders");
      } else if (profile?.role === "consumer") {
        router.replace("/consumer/orders");
      } else {
        router.replace("/onboarding");
      }
    };
    checkRoleAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030704] text-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-sm font-semibold">Redirecting to your orders...</p>
      </div>
    </div>
  );
}


