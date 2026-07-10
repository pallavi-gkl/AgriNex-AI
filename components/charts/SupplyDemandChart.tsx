"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  category: string;
  Listed: number;
  Ordered: number;
}

interface SupplyDemandChartProps {
  data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="premium-card shadow-sm rounded-xl p-3 text-sm border-white/10">
        <p className="text-slate-400 text-xs mb-2 font-mono">{label}</p>
        <p className="text-emerald-400 font-semibold">
          Supply (Listed): {payload[0].value.toLocaleString()} kg
        </p>
        <p className="text-sky-400 font-semibold">
          Demand (Ordered): {payload[1].value.toLocaleString()} kg
        </p>
      </div>
    );
  }
  return null;
};

export default function SupplyDemandChart({ data }: SupplyDemandChartProps) {
  return (
    <div className="premium-card rounded-3xl shadow-sm p-6 h-full">
      <div className="mb-4">
        <h3 className="gradient-text-green text-base font-semibold">
          Supply vs Demand Volume
        </h3>
        <p className="text-slate-500 text-xs mt-0.5">
          Listed crop volumes compared to actual ordered quantities in kg
        </p>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-3.5 h-3.5 bg-emerald-500 rounded-sm inline-block" />
          Listed (Supply)
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-3.5 h-3.5 bg-sky-500 rounded-sm inline-block" />
          Ordered (Demand)
        </span>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="listedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.15} />
              </linearGradient>
              <linearGradient id="orderedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.15} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="rgba(255, 255, 255, 0.04)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="category"
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
              cursor={{ fill: "rgba(255, 255, 255, 0.02)" }}
            />

            <Bar
              dataKey="Listed"
              fill="url(#listedGrad)"
              radius={[4, 4, 0, 0]}
              barSize={16}
            />

            <Bar
              dataKey="Ordered"
              fill="url(#orderedGrad)"
              radius={[4, 4, 0, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}