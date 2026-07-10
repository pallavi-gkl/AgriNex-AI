"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Search, Sparkles } from "lucide-react";
import { useLocationWeather } from "@/context/LocationWeatherContext";

export default function MarketPricesPage() {
  const { t } = useTranslation("farmer");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { nearbyMandis, requestLocation, loading } = useLocationWeather();

  const filteredPrices = nearbyMandis.filter(
    (m) =>
      m.crop.toLowerCase().includes(search.toLowerCase()) ||
      m.mandi.toLowerCase().includes(search.toLowerCase())
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    requestLocation();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Live Market Mandi Prices</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Realtime wholesale indexing across regional APMC Mandis. Synchronized with national agmarknet ledgers.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-mono rounded-xl transition self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing && "animate-spin"}`} />
          Refresh Tickers
        </button>
      </div>

      {loading && filteredPrices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm font-mono">Loading nearby mandi prices...</p>
        </div>
      ) : (
        /* Grid listing */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mandi List Table (2/3 width) */}
        <div className="md:col-span-2 premium-card shadow-sm p-5 rounded-2xl space-y-4">
          <div className="flex items-center w-full relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search crop varieties or local mandis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 pb-2">
                  <th className="py-2">{t("cropVarietyLabel")}</th>
                  <th className="py-2">{t("apmcMandi")}</th>
                  <th className="py-2 text-right">Price Index</th>
                  <th className="py-2 text-right">{t("str_24hShift")}</th>
                  <th className="py-2 pl-4">{t("expectedDemand")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPrices.map((m, idx) => (
                  <tr key={idx} className="text-slate-700 hover:bg-slate-50 transition">
                    <td className="py-3 font-sans font-bold">{m.crop}</td>
                    <td className="py-3 font-sans">{m.mandi}</td>
                    <td className="py-3 text-right text-emerald-600 font-bold">₹{m.price} / {m.unit}</td>
                    <td className={`py-3 text-right font-bold ${m.change > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {m.change > 0 ? "▲" : "▼"} {Math.abs(m.change)}%
                    </td>
                    <td className="py-3 pl-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${m.demand === "very_high" || m.demand === "high" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
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
        <div className="premium-card shadow-sm p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
              {t("aiSalesTimingAdvisor")}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t("basmatiRiceWholesaleSupplyInde")}
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{t("currentTrend")}</span>
                <span className="text-emerald-600 font-bold">{t("bullishRising")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t("bestWindow")}</span>
                <span className="text-slate-800 font-bold">Next 5 Days</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-1.5 font-mono text-[10px]">
            <h5 className="font-bold text-white uppercase mb-1">Mandi Sourcing recommendation</h5>
            <p className="text-slate-400">{t("str_1SonepatApmcOffersBestBasm")}</p>
            <p className="text-slate-400">{t("str_2MumbaiDirectTransportYiel")}</p>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}