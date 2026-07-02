"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, ShieldX, Loader2 } from "lucide-react";
import KYCApplicationList, { KYCApp } from "@/components/admin/KYCApplicationList";
import KYCReviewPanel from "@/components/admin/KYCReviewPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function fetchKYCApplications() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";

  const res = await fetch(`${API_URL}/api/admin/kyc`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch pending KYC applications");
  return res.json();
}

async function verifyFarmerKYC(payload: {
  profileId: string;
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";

  const res = await fetch(`${API_URL}/api/admin/verify-farmer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to update farmer KYC");
  }
  return res.json();
}

export default function AdminKYCPage() {
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<KYCApp | undefined>(undefined);

  const { data: applications = [], isLoading, error } = useQuery<KYCApp[]>({
    queryKey: ["adminKYC"],
    queryFn: fetchKYCApplications,
    // When applications reload, make sure selectedApp is updated if it was resolved
    onSuccess: (data: KYCApp[]) => {
      if (selectedApp && !data.some((app: KYCApp) => app.profileId === selectedApp.profileId)) {
        setSelectedApp(undefined);
      }
    },
  } as any);

  const verifyMutation = useMutation({
    mutationFn: verifyFarmerKYC,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminKYC"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      // Deselect resolved app
      setSelectedApp(undefined);
    },
  });

  const handleVerify = async (profileId: string) => {
    await verifyMutation.mutateAsync({
      profileId,
      status: "APPROVED",
    });
  };

  const handleReject = async (profileId: string, reason: string) => {
    await verifyMutation.mutateAsync({
      profileId,
      status: "REJECTED",
      rejectionReason: reason,
    });
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-400 glass-panel rounded-2xl">
        <ShieldX className="w-10 h-10 mx-auto mb-2 text-red-500" />
        <p>Error loading KYC: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div
      className="grid h-[500px] glass-panel rounded-2xl overflow-hidden border border-white/5"
      style={{ gridTemplateColumns: "320px 1fr" }}
    >
      {/* Left List Pane */}
      <KYCApplicationList
        applications={applications}
        selectedId={selectedApp?.profileId}
        onSelect={setSelectedApp}
      />

      {/* Right Preview/Review Pane */}
      <div className="h-full bg-white/[0.005]">
        {selectedApp ? (
          <KYCReviewPanel
            key={selectedApp.profileId}
            application={selectedApp}
            onVerify={handleVerify}
            onReject={handleReject}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 p-6">
            <CheckCircle2 className="w-10 h-10 text-slate-700" />
            <p className="text-sm font-semibold text-slate-400">Review Queue Clear</p>
            <p className="text-xs text-slate-600">Select an application to preview documents.</p>
          </div>
        )}
      </div>
    </div>
  );
}
