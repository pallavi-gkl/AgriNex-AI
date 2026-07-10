"use client";
import { useTranslation } from "@/hooks/useTranslation";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GrowthDataPoint {
  month: string;
  Farmers: number;
  Consumers: number;
  Orders: number;
}

interface GrowthChartProps {
  data: GrowthDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="premium-card shadow-sm rounded-xl p-3 text-sm border-white/10">
        <p className="text-slate-400 text-xs mb-2 font-mono">{label}</p>
        <p className="text-emerald-400 font-semibold">
          Farmers Registered: {payload[0].value}
        </p>
        <p className="text-sky-400 font-semibold">
          Consumers Signup: {payload[1].value}
        </p>
        <p className="text-purple-400 font-semibold">
          Orders Placed: {payload[2].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function GrowthChart({ data }: GrowthChartProps) {
  const { t } = useTranslation();
  return (
    <div className="premium-card rounded-3xl shadow-sm p-6 h-full">
      <div className="mb-4">
        <h3 className="gradient-text-purple text-base font-semibold">
          Platform Registration & Order Growth
        </h3>
        <p className="text-slate-500 text-xs mt-0.5">
          Monthly user registration trends and completed transaction volume
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          {t("farmers")}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" />
          {t("consumers")}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
          {t("ordersTitle")}
        </span>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              stroke="rgba(255, 255, 255, 0.04)"
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
              width={50}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }}
            />

            <Line
              type="monotone"
              dataKey="Farmers"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#34d399", stroke: "rgba(16,185,129,0.4)", strokeWidth: 3 }}
            />

            <Line
              type="monotone"
              dataKey="Consumers"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#38bdf8", stroke: "rgba(14,165,233,0.4)", strokeWidth: 3 }}
            />

            <Line
              type="monotone"
              dataKey="Orders"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#a78bfa", stroke: "rgba(139,92,246,0.4)", strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}