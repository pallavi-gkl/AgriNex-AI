"use client";
import { useTranslation } from "@/hooks/useTranslation";


import React, { useState } from "react";
import { Briefcase, DollarSign, Award, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { onComplete?: (data: any, cropName: string) => void; }
export default function AIBusinessAdvisor({ onComplete }: Props = {}) {
  const { t } = useTranslation("farmer");
  const [crops, setCrops] = useState(["Basmati Rice"]);
  const [totalRevenue, setTotalRevenue] = useState(529000);
  const [totalExpenses, setTotalExpenses] = useState(85500);
  const [state, setState] = useState("Haryana");
  const [areaAcres, setAreaAcres] = useState(24.5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"profit" | "loans" | "growth" | "risks">("profit");

  const handleAdvise = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crops, totalRevenue, totalExpenses, state, areaAcres }),
      });
      const data = await res.json();
      setResult(data);
      onComplete?.(data, crops[0] ?? "Farm");
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
          <Briefcase className="w-5 h-5 text-amber-400" />
          {t("businessAdvisorTitle")}
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          {t("assessYourAgriculturalBalanceS")}
        </p>
      </div>

      <form onSubmit={handleAdvise} className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">{t("currentRevenues")}</label>
            <input
              type="number"
              required
              value={totalRevenue}
              onChange={(e) => setTotalRevenue(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">Operational Expenditures (₹)</label>
            <input
              type="number"
              required
              value={totalExpenses}
              onChange={(e) => setTotalExpenses(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">Land Holding (Acres)</label>
            <input
              type="number"
              required
              value={areaAcres}
              onChange={(e) => setAreaAcres(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
            />
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-mono font-bold transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>{t("computingCreditScoresAndRiskIn")}</span>
          ) : (
            <>
              <Briefcase className="w-4 h-4" />
              {t("analyzeFinancialPerformance")}
            </>
          )}
        </button>
      </form>

      {/* Results disclosure with inner tabs */}
      {result && (
        <div className="mt-6 border-t border-slate-100 pt-6 space-y-6">
          {/* Inner tab controls */}
          <div className="flex border-b border-slate-100 gap-4 overflow-x-auto shrink-0 bg-white/[0.01]">
            {(["profit", "loans", "growth", "risks"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveSubTab(tab)}
                className={cn(
                  "py-2 border-b-2 text-[10px] font-mono tracking-wider uppercase transition-colors shrink-0",
                  activeSubTab === tab
                    ? "border-amber-500 text-amber-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-white"
                )}
              >
                {tab === "profit" && "Profit Analysis"}
                {tab === "loans" && "Loan & Credit Limits"}
                {tab === "growth" && "Growth Strategy"}
                {tab === "risks" && "Risk Assessment"}
              </button>
            ))}
          </div>

          {/* Sub Tab: Profit */}
          {activeSubTab === "profit" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-500">NET OPERATIONAL PROFIT</p>
                  <p className="text-base font-bold text-emerald-400 mt-1">
                    ₹{result.profit_analysis.net_profit.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-500">PROFIT MARGIN RATE</p>
                  <p className="text-base font-bold text-slate-800 mt-1">
                    {result.profit_analysis.profit_margin_percent}%
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-500">{t("efficiencyIndexGrade")}</p>
                  <span className="inline-block mt-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                    {t("grade")} {result.profit_analysis.efficiency_grade}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-500">NEXT SEASON EST.</p>
                  <p className="text-base font-bold text-slate-800 mt-1">
                    ₹{result.revenue_prediction.next_season_estimate.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex gap-3 items-start">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-emerald-300">Revenue Growth Potential</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Based on machine learning models, diversifying 15% of your crops into pulses/legumes next season can improve net cash flow by up to {result.revenue_prediction.growth_potential_percent}%.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab: Loans */}
          {activeSubTab === "loans" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center font-mono">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{t("eligibleKisanCreditLoanCap")}</h4>
                  <p className="text-slate-500 text-[10px] mt-0.5">{t("estimatedLimitUsingRegionalSca")}</p>
                </div>
                <span className="text-base font-bold text-emerald-400">
                  ₹{result.loan_eligibility.max_amount_inr.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  RECOMMENDED GOVERNMENT BANK SCHEMES
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 font-sans">
                  {result.loan_eligibility.recommended_programs.map((prog: string, idx: number) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span>{prog}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Sub Tab: Growth */}
          {activeSubTab === "growth" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                {t("expansionCropDiversificationSt")}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600">
                {result.growth_strategies.map((strat: string, idx: number) => (
                  <li key={idx} className="flex gap-2">
                    <span className="font-mono text-emerald-600 font-bold">{idx + 1}.</span>
                    <span>{strat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sub Tab: Risks */}
          {activeSubTab === "risks" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  RISK ASSESSMENT LOGS
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {result.risk_assessment.map((risk: string, idx: number) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-red-400 font-bold shrink-0">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 mt-4">
                <h4 className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  SUGGESTED CROP INSURANCE SCHEMES
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {result.insurance_suggestions.map((ins: string, idx: number) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">•</span>
                      <span>{ins}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}