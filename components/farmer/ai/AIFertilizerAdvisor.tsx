"use client";
import { useTranslation } from "@/hooks/useTranslation";


import React, { useState } from "react";
import { Compass, AlertTriangle, Sparkles, Plus, Trash2 } from "lucide-react";

interface Props { onComplete?: (data: any, cropName: string) => void; }
export default function AIFertilizerAdvisor({ onComplete }: Props = {}) {
  const { t } = useTranslation("farmer");
  const [cropType, setCropType] = useState("Basmati Rice");
  const [soilN, setSoilN] = useState(45);
  const [soilP, setSoilP] = useState(30);
  const [soilK, setSoilK] = useState(65);
  const [soilPh, setSoilPh] = useState(6.8);
  const [areaAcres, setAreaAcres] = useState(10);
  const [growthStage, setGrowthStage] = useState("Vegetative");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/fertilizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropType, soilN, soilP, soilK, soilPh, areaAcres, growthStage }),
      });
      const data = await res.json();
      setResult(data);
      onComplete?.(data, cropType);
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
          <Compass className="w-5 h-5 text-teal-400" />
          {t("fertilizerAdvisorTitle")}
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          {t("generateCropStageNpkRecommenda")}
        </p>
      </div>

      <form onSubmit={handleRecommend} className="space-y-4">
        {/* Sliders for NPK values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-rose-600">Nitrogen (N): {soilN}%</span>
              <span className="text-slate-500">Target: 60%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={soilN}
              onChange={(e) => setSoilN(Number(e.target.value))}
              className="w-full accent-red-500 bg-slate-100"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-amber-600">Phosphorus (P): {soilP}%</span>
              <span className="text-slate-500">Target: 45%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={soilP}
              onChange={(e) => setSoilP(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-100"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-blue-600">Potassium (K): {soilK}%</span>
              <span className="text-slate-500">Target: 70%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={soilK}
              onChange={(e) => setSoilK(Number(e.target.value))}
              className="w-full accent-blue-500 bg-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">Soil pH ({soilPh})</label>
            <input
              type="number"
              step="0.1"
              min="4"
              max="10"
              value={soilPh}
              onChange={(e) => setSoilPh(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">{t("cropVarietyLabel")}</label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value={t("basmatiRiceTitle")}>{t("basmatiRiceTitle")}</option>
              <option value="Wheat">Wheat</option>
              <option value="Turmeric">Turmeric</option>
              <option value="Tomato">Tomato</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">{t("acreageAreaAcres")}</label>
            <input
              type="number"
              required
              min="1"
              value={areaAcres}
              onChange={(e) => setAreaAcres(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">{t("cropGrowthStage")}</label>
            <select
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="Vegetative">Vegetative Growth</option>
              <option value="Tillering">Tillering Stage</option>
              <option value="Panicle Initiation">Panicle Initiation</option>
              <option value="Flowering">{t("floweringStage")}</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-black text-xs font-mono font-bold transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>{t("computingNutrientBalanceAlgori")}</span>
          ) : (
            <>
              <Compass className="w-4 h-4" />
              {t("generateSoilPrescription")}
            </>
          )}
        </button>
      </form>

      {/* Results disclosure */}
      {result && (
        <div className="mt-6 border-t border-slate-100 pt-6 space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 font-mono">REPLENISH PRESCRIPTION SCHEDULE</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100">
                    <th className="py-2">{t("fertilizerName")}</th>
                    <th className="py-2 text-right">{t("dosageAcre")}</th>
                    <th className="py-2 pl-4">{t("applicationTiming")}</th>
                    <th className="py-2">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.recommendations.map((rec: any, idx: number) => (
                    <tr key={idx} className="text-white hover:bg-white/[0.01]">
                      <td className="py-3 font-sans font-bold">{rec.fertilizer_name}</td>
                      <td className="py-3 text-right text-emerald-600 font-bold">{rec.quantity_kg_per_acre} Kg</td>
                      <td className="py-3 pl-4 font-sans text-slate-600">{rec.timing}</td>
                      <td className="py-3 text-slate-400">{rec.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cautions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                SAFETY WARNINGS & GUIDELINES
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {result.cautions.map((c: string, idx: number) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-amber-500 font-bold shrink-0">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Organic Alternatives */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                ORGANIC BIO-FERTILIZER ALTERNATIVES
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {result.organic_alternatives.map((o: string, idx: number) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">•</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center text-xs font-mono">
            <div>
              <p className="text-slate-800 font-bold">{t("estimatedAggregateProcurementC")}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">{t("estimatedWholesalePricingIndex")}</p>
            </div>
            <span className="text-base font-bold text-emerald-400">
              ₹{result.total_cost_estimate.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}