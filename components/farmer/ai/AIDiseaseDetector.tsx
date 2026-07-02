"use client";

import React, { useState } from "react";
import { Brain, HelpCircle, Activity, Sparkles, CheckCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIDiseaseDetector() {
  const [cropType, setCropType] = useState("Rice");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropType, description }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "Low":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "High":
      case "Critical":
      default:
        return "bg-red-500/10 text-red-400 border-red-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
          <Brain className="w-5 h-5 text-purple-400" />
          AI Crop Pathology Analyzer
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Detect bacterial, viral, or pest damage instantly using natural description parameters.
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono">Crop Variety</label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="glass-input"
            >
              <option value="Rice">Basmati Rice</option>
              <option value="Wheat">Wheat</option>
              <option value="Mango">Mango</option>
              <option value="Tomato">Tomato</option>
              <option value="Turmeric">Turmeric</option>
              <option value="Spinach">Spinach</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs text-slate-400 font-mono">Symptoms Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Leaves have yellow spots with brown margins, dry tips..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-mono font-bold transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Running Gemini Pathology models...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              Analyze Health Metrics
            </>
          )}
        </button>
      </form>

      {/* Result Panel */}
      {result && (
        <div className="mt-6 border-t border-white/5 pt-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <span className={cn("text-[9px] uppercase font-mono px-2 py-0.5 rounded border font-bold", getSeverityColor(result.severity))}>
                {result.severity} Severity Level
              </span>
              <h3 className="text-xl font-bold text-white mt-2">{result.disease_name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">AI Diagnostic Confidence: {result.confidence}%</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-center shrink-0 min-w-[120px]">
              <p className="text-[10px] text-slate-500 font-mono">EST. CROP LOSS</p>
              <p className="text-lg font-bold text-red-400 mt-0.5">{result.estimated_crop_loss_percent}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1">
                <Activity className="w-4 h-4 text-purple-400" />
                IDENTIFIED PATHOLOGY SYMPTOMS
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {result.symptoms.map((s: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                RECOMMENDED INTERVENE TREATMENT
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {result.treatment.map((t: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-emerald-400 font-mono">{idx + 1}.</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {result.organic_treatment && (
            <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl flex gap-3 items-start">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-bold text-emerald-300">Organic Cultivation Alternative</h4>
                <p className="text-slate-300 mt-1 leading-relaxed">{result.organic_treatment}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Inline loading/spinner icon
function RefreshCw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
