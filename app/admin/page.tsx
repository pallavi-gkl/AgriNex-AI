"use client";
import { useTranslation } from "@/hooks/useTranslation";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Sprout, Users, Package, Recycle, RefreshCw } from "lucide-react";
import SupplyDemandChart from "@/components/charts/SupplyDemandChart";
import GrowthChart from "@/components/charts/GrowthChart";
import EnvironmentalGauge from "@/components/charts/EnvironmentalGauge";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function fetchAdminStats() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";

  const res = await fetch(`${API_URL}/api/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch admin statistics");
  return res.json();
}

export default function AdminOverviewPage() {
  const { t } = useTranslation();
  const { data: stats, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["adminStats"],
    queryFn: fetchAdminStats,
    refetchInterval: 30000, // auto-refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* KPI Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="premium-card shadow-sm h-28 rounded-2xl anim-shimmer" />
          ))}
        </div>
        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="premium-card shadow-sm h-96 rounded-2xl col-span-2 anim-shimmer" />
          <div className="premium-card shadow-sm h-96 rounded-2xl anim-shimmer" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 premium-card rounded-3xl shadow-sm">
        <p>Error loading analytics: {(error as Error).message}</p>
        <button
          onClick={() => refetch()}
          className="mt-3 btn-secondary text-xs"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  const kpis = [
    {
      label: "Active Farmers",
      value: stats.activeFarmers,
      icon: Sprout,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Consumer Signups",
      value: stats.consumerSignups,
      icon: Users,
      color: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
    },
    {
      label: "Orders Completed",
      value: stats.ordersCompleted,
      icon: Package,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Food Waste Reduced",
      value: `${stats.foodWasteTons} tons`,
      icon: Recycle,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Refresh bar */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full premium-card shadow-sm text-xs text-slate-600 hover:text-emerald-700 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Refreshing..." : "Refresh Stats"}
        </button>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`premium-card shadow-sm p-5 rounded-2xl border flex items-center justify-between transition-all hover:-translate-y-0.5 ${kpi.bg}`}
            >
              <div className="min-w-0">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                  {kpi.label}
                </p>
                <p className="text-3xl font-extrabold text-white mt-1 leading-none">
                  {kpi.value}
                </p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${kpi.color} bg-black/10 border border-white/5`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth line chart */}
        <div className="lg:col-span-2">
          <GrowthChart data={stats.growthData} />
        </div>

        {/* Environmental Circular progress gauge */}
        <div>
          <EnvironmentalGauge percentage={stats.directPercentage} />
        </div>

        {/* Supply vs Demand Bar chart */}
        <div className="lg:col-span-3">
          <SupplyDemandChart data={stats.supplyDemandData} />
        </div>
      </div>
    </div>
  );
}