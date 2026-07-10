"use client";
import { useTranslation } from "@/hooks/useTranslation";


import React, { useState } from "react";
import { TrendingUp, User, DollarSign, List, ShieldAlert } from "lucide-react";

export default function AIMarketAdvisor() {
  const { t } = useTranslation("farmer");
  const [cropType, setCropType] = useState("Basmati Rice");
  const [currentPrice, setCurrentPrice] = useState(85);
  const [quantity, setQuantity] = useState(4200);
  const [location, setLocation] = useState("Karnal, Haryana");
  const [targetMarket, setTargetMarket] = useState("APMC Mandi");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/market-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropType, currentPrice, quantity, location, targetMarket }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          {t("mandiMarketAdvisor")}
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          {t("mandiMarketDesc")}
        </p>
      </div>

      <form onSubmit={handleConsult} className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">{t("cropVarietyLabel")}</label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value={t("basmatiRiceTitle")}>{t("basmatiRiceTitle")}</option>
              <option value={t("alphonsoMangoTitle")}>{t("alphonsoMangoTitle")}</option>
              <option value="Turmeric Finger">Turmeric Finger</option>
              <option value="Organic Spinach">Organic Spinach</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">{t("spotPriceLabel")}</label>
            <input
              type="number"
              required
              value={currentPrice}
              onChange={(e) => setCurrentPrice(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">{t("supplyVolumeLabel")}</label>
            <input
              type="number"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">{t("storageLocLabel")}</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-xs text-slate-400 font-mono">{t("primaryTargetLabel")}</label>
            <select
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value={t("apmcMandi")}>{t("apmcMandiYard")}</option>
              <option value="Export Sourcing">{t("exportHouses")}</option>
              <option value="Retail Contract">Retail Aggregators</option>
              <option value="Direct Consumer">{t("directConsumerMarket")}</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-mono font-bold transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>{t("fetchingMandisOrderBooksAndInd")}</span>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              {t("analyzePricingTrends")}
            </>
          )}
        </button>
      </form>

      {/* Results disclosure */}
      {result && (
        <div className="mt-6 border-t border-slate-100 pt-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                Market Trend: {result.market_trend}
              </span>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{result.demand_forecast}</p>
            </div>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-3 text-center shrink-0 min-w-[150px]">
              <p className="text-[10px] text-slate-500 font-mono">{t("aiRecommendedPrice")}</p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">₹{result.recommended_price} <span className="text-xs font-normal text-slate-400">{t("kg")}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buyer listings */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-400" />
                PREMIUM REVENUE BUYERS DISCOVERED
              </h4>
              <div className="space-y-2.5">
                {result.best_buyers.map((b: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{b.type}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {b.pros.map((p: string, pIdx: number) => (
                          <span key={pIdx} className="bg-slate-900 px-2 py-0.5 rounded text-[9px] text-slate-400 font-mono">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-emerald-400 shrink-0">
                      ₹{b.expected_price}/Kg
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Negotiation Tips */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1.5">
                <List className="w-4 h-4 text-blue-400" />
                {t("aiNegotiationRecommendations")}
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {result.negotiation_tips.map((t: string, idx: number) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-blue-400 font-bold shrink-0">{idx + 1}.</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-800">{t("estimatedCropRevenueImpact")}</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">{t("basedOnRecommendedListingPrice")}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Total Net Impact</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                ₹{result.profit_estimate.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}