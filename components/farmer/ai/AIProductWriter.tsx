"use client";

import React, { useState } from "react";
import { FileText, Copy, CheckCircle, Sparkles } from "lucide-react";

export default function AIProductWriter() {
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
        <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
          <FileText className="w-5 h-5 text-indigo-400" />
          AI Marketplace listing Copywriter
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Generate premium titles, detailed product descriptions, and keywords to rank higher in searches.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">Crop/Produce Name</label>
            <input
              type="text"
              required
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">Traceability Origin Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="glass-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">Quality Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="glass-input font-mono"
            >
              <option value="A+">Grade A+</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
            <input
              type="checkbox"
              id="is_organic_writer"
              checked={isOrganic}
              onChange={(e) => setIsOrganic(e.target.checked)}
              className="w-4 h-4 rounded border-white/15 bg-white/5 accent-emerald-500 cursor-pointer"
            />
            <label htmlFor="is_organic_writer" className="text-xs text-slate-300 cursor-pointer">
              Grown Organically
            </label>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-mono">Crop USPs & Unique features (Comma separated)</label>
          <input
            type="text"
            required
            value={featuresInput}
            onChange={(e) => setFeaturesInput(e.target.value)}
            className="glass-input"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-mono font-bold transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Authoring sales copy writing...</span>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Generate Sales Copy
            </>
          )}
        </button>
      </form>

      {/* Results disclosure */}
      {result && (
        <div className="mt-6 border-t border-white/5 pt-6 space-y-6">
          {/* Title */}
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl relative">
            <p className="text-[10px] text-slate-500 font-mono">OPTIMIZED PRODUCT TITLE</p>
            <p className="text-sm font-bold text-white mt-1.5 pr-10 leading-snug">{result.title}</p>
            <button
              type="button"
              onClick={() => handleCopy(result.title, "title")}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition"
            >
              {copiedTitle ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Description */}
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl relative">
            <p className="text-[10px] text-slate-500 font-mono">FULL SALES DESCRIPTION</p>
            <p className="text-xs text-slate-300 mt-2 pr-10 leading-relaxed">{result.description}</p>
            <button
              type="button"
              onClick={() => handleCopy(result.description, "desc")}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition"
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
                  <span key={idx} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono">
                    {u}
                  </span>
                ))}
              </div>
            </div>

            {/* Price reference */}
            <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5 font-mono text-xs flex justify-between items-center">
              <div>
                <h5 className="font-bold text-white">Suggested Marketplace Range</h5>
                <p className="text-slate-500 text-[10px] mt-0.5">Calculated using regional markup indexes.</p>
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
