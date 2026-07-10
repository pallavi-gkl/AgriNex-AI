"use client";
import { useTranslation } from "@/hooks/useTranslation";


import React, { useState } from "react";
import { FileText, Copy, CheckCircle, Sparkles } from "lucide-react";

export default function AIProductWriter() {
  const { t } = useTranslation("farmer");
  const [cropName, setCropName] = useState("Alphonso Mango");
  const [grade, setGrade] = useState("A+");
  const [isOrganic, setIsOrganic] = useState(true);
  const [location, setLocation] = useState("Ratnagiri, Maharashtra");
  const [featuresInput, setFeaturesInput] = useState("GI Tagged, Sun-ripened, Fiberless sweet pulp");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  // Copied states for buttons
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  const handleCopy = (text: string, type: "title" | "desc") => {
  const { t } = useTranslation("farmer");
    navigator.clipboard.writeText(text);
    if (type === "title") {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } else {
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const uniqueFeatures = featuresInput.split(",").map((s) => s.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/ai/product-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropName, grade, isOrganic, location, uniqueFeatures }),
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
          <FileText className="w-5 h-5 text-indigo-400" />
          {t("listingGeneratorTitle")}
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          {t("generatePremiumTitlesDetailedP")}
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">{t("cropProduceName")}</label>
            <input
              type="text"
              required
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">Traceability Origin Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">Quality Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
            >
              <option value="A+">{t("gradeA1")}</option>
              <option value="A">{t("gradeA")}</option>
              <option value="B">{t("gradeB")}</option>
              <option value="C">{t("gradeC")}</option>
            </select>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl">
            <input
              type="checkbox"
              id="is_organic_writer"
              checked={isOrganic}
              onChange={(e) => setIsOrganic(e.target.checked)}
              className="w-4 h-4 rounded border-white/15 bg-slate-50 accent-emerald-500 cursor-pointer"
            />
            <label htmlFor="is_organic_writer" className="text-xs text-slate-600 cursor-pointer">
              {t("grownOrganically")}
            </label>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-mono">{t("cropUspsUniqueFeaturesCommaSep")}</label>
          <input
            type="text"
            required
            value={featuresInput}
            onChange={(e) => setFeaturesInput(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-mono font-bold transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>{t("authoringSalesCopyWriting")}</span>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              {t("generateSalesCopy")}
            </>
          )}
        </button>
      </form>

      {/* Results disclosure */}
      {result && (
        <div className="mt-6 border-t border-slate-100 pt-6 space-y-6">
          {/* Title */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative">
            <p className="text-[10px] text-slate-500 font-mono">OPTIMIZED PRODUCT TITLE</p>
            <p className="text-sm font-bold text-slate-800 mt-1.5 pr-10 leading-snug">{result.title}</p>
            <button
              type="button"
              onClick={() => handleCopy(result.title, "title")}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-white transition"
            >
              {copiedTitle ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Description */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative">
            <p className="text-[10px] text-slate-500 font-mono">{t("fullSalesDescription")}</p>
            <p className="text-xs text-slate-600 mt-2 pr-10 leading-relaxed">{result.description}</p>
            <button
              type="button"
              onClick={() => handleCopy(result.description, "desc")}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-white transition"
            >
              {copiedDesc ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* USPs */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 font-mono">UNIQUE SELLING PROPOSITIONS</h4>
              <div className="flex flex-wrap gap-1.5">
                {result.usps.map((u: string, idx: number) => (
                  <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-mono">
                    {u}
                  </span>
                ))}
              </div>
            </div>

            {/* Price reference */}
            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-xs flex justify-between items-center">
              <div>
                <h5 className="font-bold text-white">Suggested Marketplace Range</h5>
                <p className="text-slate-500 text-[10px] mt-0.5">{t("calculatedUsingRegionalMarkupI")}</p>
              </div>
              <span className="text-sm font-bold text-emerald-400">
                {result.suggested_price_range}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}