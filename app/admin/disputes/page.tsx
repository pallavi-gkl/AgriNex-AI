"use client";
import { useTranslation } from "@/hooks/useTranslation";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, getValidAuthToken } from "@/lib/supabase";
import { Loader2, ShieldX, Check } from "lucide-react";
import DisputeTable, { Dispute } from "@/components/admin/DisputeTable";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function fetchDisputes() {
  const token = await getValidAuthToken();

  const res = await fetch(`${API_URL}/api/admin/disputes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch dispute logs");
  return res.json();
}

async function resolveDispute(payload: {
  disputeId: string;
  action: "refund" | "warn" | "resolve";
  farmerId: string;
  orderId: string;
}) {
  const token = await getValidAuthToken();

  const res = await fetch(`${API_URL}/api/admin/disputes/${payload.disputeId}/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action: payload.action,
      farmerId: payload.farmerId,
      orderId: payload.orderId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to resolve dispute");
  }
  return res.json();
}

export default function AdminDisputesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filterLevel, setFilterLevel] = useState<string>("ALL");

  const { data: disputes = [], isLoading, error } = useQuery<Dispute[]>({
    queryKey: ["adminDisputes"],
    queryFn: fetchDisputes,
  });

  const resolveMutation = useMutation({
    mutationFn: resolveDispute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDisputes"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });

  const handleResolveAction = async (
    disputeId: string,
    action: "refund" | "warn" | "resolve",
    farmerId: string,
    orderId: string
  ) => {
    await resolveMutation.mutateAsync({
      disputeId,
      action,
      farmerId,
      orderId,
    });
  };

  const filteredDisputes = disputes.filter((d) => {
    if (filterLevel === "ALL") return true;
    return d.flagLevel === filterLevel;
  });

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-400 premium-card rounded-3xl shadow-sm">
        <ShieldX className="w-10 h-10 mx-auto mb-2 text-red-500" />
        <p>Error loading disputes: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-semibold uppercase">
          {t("filterFlagLevel")}
        </span>
        <div className="flex premium-card shadow-sm rounded-xl overflow-hidden border-white/5">
          {["ALL", "HIGH", "MEDIUM", "LOW"].map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                filterLevel === level
                  ? "bg-purple-500/20 text-purple-300 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Disputes table */}
      <DisputeTable
        disputes={filteredDisputes}
        onAction={handleResolveAction}
      />
    </div>
  );
}