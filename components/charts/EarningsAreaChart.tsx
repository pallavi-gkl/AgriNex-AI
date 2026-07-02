"use client";

/**
 * @fileoverview EarningsAreaChart — Recharts dual-line area chart for the farmer dashboard.
 * Shows personal earnings (emerald gradient fill) vs market average (sky-blue dashed).
 * Fetches data via useFarmerAnalytics hook with 5-minute auto-refresh.
 */
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { TrendingUp, RefreshCw } from "lucide-react";
import { useFarmerAnalytics } from "@/hooks/useFarmerAnalytics";
import type { ChartDataPoint } from "@/types";

type Timeframe = "monthly" | "weekly";

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-panel rounded-xl p-3 text-sm border border-white/10">
        <p className="text-slate-400 text-xs mb-2 font-mono">{label}</p>
        <p className="text-emerald-400 font-semibold">
          My Sales: ₹{payload[0]?.value?.toLocaleString("en-IN")}
        </p>
        <p className="text-sky-400 font-semibold">
          Market Avg: ₹{payload[1]?.value?.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

// ─── Skeleton loader ─────────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="h-[280px] w-full rounded-xl anim-shimmer" />
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function EarningsAreaChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>("monthly");
  const { data, isLoading, refetch, isFetching } = useFarmerAnalytics(timeframe);

  const chartData: ChartDataPoint[] = data?.chartData ?? [];

  return (
    <div className="glass-panel rounded-2xl p-6 col-span-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="gradient-text-green text-lg font-semibold">
            Earnings vs Market Average
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Personal earnings compared to local wholesale market
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Timeframe toggle */}
          <div className="flex glass-panel rounded-xl overflow-hidden border border-white/8">
            {(["monthly", "weekly"] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-xs font-medium transition-all capitalize ${
                  timeframe === tf
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            className="w-8 h-8 rounded-lg glass-panel flex items-center justify-center hover:border-emerald-500/30 transition-all"
            title="Refresh data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Chart */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <>
          {/* Legend */}
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-6 h-0.5 bg-emerald-500 inline-block rounded" />
              My Earnings
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-6 border-t-2 border-dashed border-sky-500 inline-block" />
              Market Average
            </span>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="marketGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="rgba(255,255,255,0.04)"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "Outfit, sans-serif" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "Outfit, sans-serif" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                width={45}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />

              {/* Personal Earnings — solid emerald with gradient fill */}
              <Area
                type="monotone"
                dataKey="personalEarnings"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#earningsGrad)"
                dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#34d399", stroke: "rgba(16,185,129,0.4)", strokeWidth: 3 }}
              />

              {/* Market Average — dashed sky-blue, no fill */}
              <Area
                type="monotone"
                dataKey="marketAverage"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="none"
                strokeDasharray="6 4"
                dot={false}
                activeDot={{ r: 5, fill: "#38bdf8" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
