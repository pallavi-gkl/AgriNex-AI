"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Search, Sparkles } from "lucide-react";
import { DEMO_MARKET_PRICES } from "@/lib/demoData";

export default function MarketPricesPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredPrices = DEMO_MARKET_PRICES.filter(
    (m) =>
      m.crop.toLowerCase().includes(search.toLowerCase()) ||
      m.mandi.toLowerCase().includes(search.toLowerCase())
  );

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Live Market Mandi Prices</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Realtime wholesale indexing across regional APMC Mandis. Synchronized with national agmarknet ledgers.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-mono rounded-xl transition self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading && "animate-spin"}`} />
          Refresh Tickers
        </button>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mandi List Table (2/3 width) */}
        <div className="md:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center w-full relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search crop varieties or local mandis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-white/5 pb-2">
                  <th className="py-2">Crop Variety</th>
                  <th className="py-2">APMC Mandi</th>
                  <th className="py-2 text-right">Price Index</th>
                  <th className="py-2 text-right">24h Shift</th>
                  <th className="py-2 pl-4">Expected Demand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPrices.map((m, idx) => (
                  <tr key={idx} className="text-white hover:bg-white/[0.01] transition">
                    <td className="py-3 font-sans font-bold">{m.crop}</td>
                    <td className="py-3 font-sans">{m.mandi}</td>
                    <td className="py-3 text-right text-emerald-400 font-bold">₹{m.price} / {m.unit}</td>
                    <td className={`py-3 text-right font-bold ${m.change > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {m.change > 0 ? "▲" : "▼"} {Math.abs(m.change)}%
                    </td>
                    <td className="py-3 pl-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${m.demand === "very_high" || m.demand === "high" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-blue-500/10 text-white border-blue-500/20"}`}>
                        {m.demand.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Selling strategy widget */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
              AI Sales timing Advisor
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Basmati Rice wholesale supply indexes are tight in Delhi. It is recommended to sell at least 50% of your crop buffer immediately to capture high mandi margins.
            </p>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Trend:</span>
                <span className="text-emerald-400 font-bold">Bullish (Rising)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Best Window:</span>
                <span className="text-white font-bold">Next 5 Days</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 space-y-1.5 font-mono text-[10px]">
            <h5 className="font-bold text-white uppercase mb-1">Mandi Sourcing recommendation</h5>
            <p className="text-slate-400">1. Sonepat APMC offers best basmati arbitrage.</p>
            <p className="text-slate-400">2. Mumbai direct transport yields best mango margins.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
