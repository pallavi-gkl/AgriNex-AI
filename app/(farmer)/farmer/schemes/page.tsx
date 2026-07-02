"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  ExternalLink,
  Search,
  IndianRupee,
  Calendar,
  CheckCircle,
  ChevronRight,
  Zap,
  FileText,
  ShieldCheck,
  Star,
} from "lucide-react";
import { DEMO_SCHEMES } from "@/lib/demoData";
import { cn } from "@/lib/utils";

const EXTENDED_SCHEMES = [
  ...DEMO_SCHEMES,
  {
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    benefit: "Crop Insurance",
    amount: "Upto ₹2 Lakh Coverage",
    deadline: "Jul 31, 2026",
    eligibility: "All Indian farmers growing notified crops",
    description: "Comprehensive crop insurance against natural calamities, pests, and diseases. Premium as low as 2% for Kharif crops.",
    ai_match_score: 96,
    category: "Insurance",
    status: "eligible",
    requirements: ["Aadhaar Card", "Bank Account", "Land Records", "Sowing Certificate"],
    link: "https://pmfby.gov.in",
  },
  {
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    ministry: "Ministry of Agriculture",
    benefit: "Direct Income Support",
    amount: "₹6,000/year",
    deadline: "Rolling Enrollment",
    eligibility: "Small and marginal farmers with cultivable land",
    description: "Direct benefit transfer of ₹6,000 per year in three equal installments to eligible farmer families.",
    ai_match_score: 99,
    category: "Subsidy",
    status: "enrolled",
    requirements: ["Aadhaar Card", "Bank Account", "Land Records"],
    link: "https://pmkisan.gov.in",
  },
  {
    name: "Kisan Credit Card (KCC)",
    ministry: "Ministry of Agriculture & NABARD",
    benefit: "Crop Loan",
    amount: "Upto ₹3 Lakh @ 4% Interest",
    deadline: "No Deadline — Ongoing",
    eligibility: "All cultivator farmers, tenant farmers, sharecroppers",
    description: "Flexible credit facility for farmers to meet agricultural and allied activities needs at reduced interest rate of 4% p.a.",
    ai_match_score: 94,
    category: "Credit",
    status: "eligible",
    requirements: ["Land Records", "Identity Proof", "Bank Account", "6 Months Statement"],
    link: "https://www.nabard.org",
  },
  {
    name: "Soil Health Card Scheme",
    ministry: "Ministry of Agriculture",
    benefit: "Soil Testing",
    amount: "Free Service",
    deadline: "Always Open",
    eligibility: "All farmers in India",
    description: "Free soil health card providing crop-wise recommendations of nutrients and fertilizers for individual farms.",
    ai_match_score: 88,
    category: "Advisory",
    status: "eligible",
    requirements: ["Farmer Registration", "Land Details"],
    link: "https://soilhealth.dac.gov.in",
  },
  {
    name: "National Agriculture Market (e-NAM)",
    ministry: "Ministry of Agriculture",
    benefit: "Market Access",
    amount: "0% Commission",
    deadline: "Open Enrollment",
    eligibility: "All licensed traders and farmers",
    description: "Online pan-India electronic trading portal for agricultural commodities. Better price discovery and transparent trading.",
    ai_match_score: 92,
    category: "Market",
    status: "eligible",
    requirements: ["Aadhaar", "Bank Account", "Mobile Number"],
    link: "https://enam.gov.in",
  },
];

const CATEGORIES = ["All", "Insurance", "Subsidy", "Credit", "Advisory", "Market"];

export default function GovernmentSchemesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [expandedScheme, setExpandedScheme] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiMatchResult, setAiMatchResult] = useState<string | null>(null);

  const filteredSchemes = EXTENDED_SCHEMES.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ministry.toLowerCase().includes(search.toLowerCase()) ||
      s.benefit.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || (s as any).category === category;
    return matchesSearch && matchesCategory;
  });

  const handleAiMatch = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/scheme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropType: "Basmati Rice",
          state: "Haryana",
          farmSize: 24.5,
        }),
      });
      const data = await res.json();
      setAiMatchResult(data.recommendation || "Based on your farm profile (24.5 acres, Basmati Rice, Haryana), you qualify for PM-KISAN, PMFBY crop insurance, and Kisan Credit Card at 4% interest. Apply for PMFBY before July 31, 2026 harvest season deadline.");
    } catch {
      setAiMatchResult("Based on your farm profile (24.5 acres, Basmati Rice, Haryana), you qualify for PM-KISAN, PMFBY crop insurance, and Kisan Credit Card at 4% interest. Apply for PMFBY before July 31, 2026 harvest season deadline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            Government Schemes & Subsidies
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            AI-matched Central & State government schemes, subsidies and credit facilities for Indian farmers.
          </p>
        </div>
        <button
          onClick={handleAiMatch}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 text-xs font-mono rounded-xl transition self-start sm:self-auto shrink-0"
        >
          <Zap className={cn("w-3.5 h-3.5", loading && "animate-pulse")} />
          {loading ? "Matching..." : "AI Auto-Match Schemes"}
        </button>
      </div>

      {/* AI Match Banner */}
      {aiMatchResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5"
        >
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">AI Scheme Recommendation (Gemini)</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">{aiMatchResult}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl text-center">
          <p className="text-2xl font-bold text-amber-400">{EXTENDED_SCHEMES.length}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-1">TOTAL SCHEMES</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl text-center">
          <p className="text-2xl font-bold text-emerald-400">{EXTENDED_SCHEMES.filter(s => (s as any).status === "eligible" || (s as any).status === "enrolled").length}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-1">YOU QUALIFY</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl text-center">
          <p className="text-2xl font-bold text-white">₹3.5L+</p>
          <p className="text-[10px] text-slate-500 font-mono mt-1">POTENTIAL BENEFIT</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl text-center">
          <p className="text-2xl font-bold text-red-400">1</p>
          <p className="text-[10px] text-slate-500 font-mono mt-1">DEADLINE THIS MONTH</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search schemes, ministries, or benefits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition",
                category === cat
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scheme Cards */}
      <div className="space-y-4">
        {filteredSchemes.map((scheme, idx) => {
          const isExpanded = expandedScheme === idx;
          const s = scheme as any;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className={cn(
                "glass-panel p-5 rounded-2xl border transition-all duration-300 cursor-pointer",
                s.status === "enrolled"
                  ? "border-emerald-500/20"
                  : "border-white/5 hover:border-amber-500/20"
              )}
              onClick={() => setExpandedScheme(isExpanded ? null : idx)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    {s.status === "enrolled" ? (
                      <span className="flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono font-bold">
                        <CheckCircle className="w-3 h-3" /> ENROLLED
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-mono font-bold">
                        ELIGIBLE
                      </span>
                    )}
                    {s.category && (
                      <span className="text-[9px] bg-blue-500/10 text-white px-2 py-0.5 rounded border border-blue-500/20 font-mono">
                        {s.category}
                      </span>
                    )}
                    {s.ai_match_score && (
                      <span className="text-[9px] text-purple-400 font-mono">
                        AI Match: {s.ai_match_score}%
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight">{scheme.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">{scheme.ministry}</p>
                  {s.description && (
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{s.description}</p>
                  )}
                </div>

                {/* Right */}
                <div className="flex flex-row sm:flex-col gap-4 sm:gap-2 text-right shrink-0">
                  <div>
                    <p className="text-[10px] text-slate-500 font-mono">BENEFIT</p>
                    <p className="text-emerald-400 font-bold text-xs">{scheme.benefit}</p>
                    {s.amount && <p className="text-[10px] text-slate-400 font-mono">{s.amount}</p>}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-mono">DEADLINE</p>
                    <p className="text-white text-xs font-bold">{scheme.deadline}</p>
                  </div>
                </div>
              </div>

              {/* Expanded view */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-white/5 space-y-4"
                >
                  {s.requirements && (
                    <div>
                      <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        Required Documents
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {s.requirements.map((req: string, i: number) => (
                          <span key={i} className="text-[10px] bg-blue-500/10 text-white px-2 py-0.5 rounded border border-blue-500/20 font-mono">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button className="flex-1 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold rounded-xl hover:bg-amber-500/20 transition flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Apply Now
                    </button>
                    {s.link && (
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-mono rounded-xl transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Official Portal
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
