"use client";
import { useTranslation } from "@/hooks/useTranslation";


import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Sprout, BarChart3, TrendingUp, HelpCircle } from "lucide-react";

export default function AIYieldPredictor() {
  const { t } = useTranslation("farmer");
  const [cropType, setCropType] = useState("Basmati Rice");
  const [areaAcres, setAreaAcres] = useState(10);
  const [soilType, setSoilType] = useState("Clay Loam");
  const [state, setState] = useState("Haryana");
  const [season, setSeason] = useState("Kharif");
  const [irrigationType, setIrrigationType] = useState("Drip");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/yield", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-acres": String(areaAcres) },
        body: JSON.stringify({ cropType, areaAcres, soilType, state, season, irrigationType }),
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
          <Sprout className="w-5 h-5 text-emerald-400" />
          {t("yieldForecasterTitle")}
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          {t("estimateFinalTonnageOutputBase")}
        </p>
      </div>

      <form onSubmit={handlePredict} className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
              <option value={t("babySpinach1")}>{t("babySpinach1")}</option>
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
            <label className="text-xs text-slate-400 font-mono">Soil Structure</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value={t("clayLoam")}>{t("clayLoam")}</option>
              <option value="Sandy Soil">Sandy Soil</option>
              <option value="Silt Clay">Silt Clay</option>
              <option value="Black Soil">{t("blackCottonSoil")}</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">Region State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value={t("haryana")}>{t("haryana")}</option>
              <option value="Punjab">Punjab</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">Irrigation Pipeline</label>
            <select
              value={irrigationType}
              onChange={(e) => setIrrigationType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value={t("drip")}>{t("dripIrrigation")}</option>
              <option value={t("sprinkler")}>Sprinkler System</option>
              <option value={t("flood")}>{t("floodSluice")}</option>
              <option value="Rainfed">Rainfed (Dryland)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">Season</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="Kharif">Kharif (Monsoon)</option>
              <option value="Rabi">Rabi (Winter)</option>
              <option value="Zaid">Zaid (Summer)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-mono font-bold transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Processing climate simulation models...</span>
          ) : (
            <>
              <Sprout className="w-4 h-4" />
              {t("forecastExpectedTonnage")}
            </>
          )}
        </button>
      </form>

      {/* Results disclosure */}
      {result && (
        <div className="mt-6 border-t border-slate-100 pt-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
              <p className="text-[10px] text-slate-500 font-mono">TOTAL ESTIMATED YIELD</p>
              <p className="text-xl font-extrabold text-slate-800 mt-1">
                {result.predicted_yield_kg.toLocaleString()} <span className="text-xs text-slate-400">Kg</span>
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
              <p className="text-[10px] text-slate-500 font-mono">YIELD PER ACRE</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {result.yield_per_acre} <span className="text-xs text-slate-400">Kg</span>
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center col-span-2 sm:col-span-1">
              <p className="text-[10px] text-slate-500 font-mono">MANDI REGIONAL AVERAGE</p>
              <p className="text-xl font-bold text-slate-400 mt-1">
                {result.national_average_yield_per_acre} <span className="text-xs text-slate-400">Kg</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Factors list */}
            <div className="space-y-3 md:col-span-1">
              <h4 className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                SIMULATION INFLUENCE FACTORS
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {result.key_factors.map((f: string, idx: number) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recharts Monthly Yield Bar Chart */}
            <div className="space-y-3 md:col-span-2">
              <h4 className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                MONTHLY MATURITY TIMELINE FORECAST
              </h4>
              <div className="h-48 w-full bg-white/[0.01] border border-slate-100 p-3 rounded-2xl">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.monthly_breakdown}>
                    <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0d1426", borderColor: "rgba(255,255,255,0.08)", borderRadius: "12px" }}
                      itemStyle={{ fontSize: "11px" }}
                    />
                    <Bar dataKey="expected_kg" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}