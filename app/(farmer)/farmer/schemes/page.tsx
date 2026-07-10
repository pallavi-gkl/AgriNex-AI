"use client";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation("farmer");
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
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-amber-100 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  {t("schemesTitle")}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {t("aiMatchedCentralStateGovernmen")}
                </p>
              </div>
            </div>
            <button
              onClick={handleAiMatch}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-amber-500/30"
            >
              <Zap className={cn("w-4 h-4", loading && "animate-pulse")} />
              {loading ? "Matching..." : "AI Auto-Match"}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-amber-200 shadow-sm">
              <Star className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-slate-700">{t("aiPowered")}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-emerald-200 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-700">Verified Schemes</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-sky-200 shadow-sm">
              <IndianRupee className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-semibold text-slate-700">{t("financialBenefits")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Match Banner */}
      {aiMatchResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card shadow-sm p-6 rounded-3xl border-amber-500/20 bg-gradient-to-r from-amber-50 to-orange-50"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-800">{t("aiSchemeRecommendation")}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-2">{aiMatchResult}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="premium-card shadow-sm p-6 rounded-3xl text-center">
          <p className="text-3xl font-bold text-amber-500">{EXTENDED_SCHEMES.length}</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">Total Schemes</p>
        </div>
        <div className="premium-card shadow-sm p-6 rounded-3xl text-center">
          <p className="text-3xl font-bold text-emerald-500">{EXTENDED_SCHEMES.filter(s => (s as any).status === "eligible" || (s as any).status === "enrolled").length}</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">You Qualify</p>
        </div>
        <div className="premium-card shadow-sm p-6 rounded-3xl text-center">
          <p className="text-3xl font-extrabold text-slate-800">₹3.5L+</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">Potential Benefit</p>
        </div>
        <div className="premium-card shadow-sm p-6 rounded-3xl text-center">
          <p className="text-3xl font-bold text-red-500">1</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">{t("deadlineThisMonth")}</p>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search schemes, ministries, or benefits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-12 pr-4 py-3 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold transition",
                category === cat
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Scheme Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-5"
      >
        {filteredSchemes.map((scheme, idx) => {
          const isExpanded = expandedScheme === idx;
          const s = scheme as any;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "premium-card shadow-sm p-6 rounded-3xl border transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-0.5",
                s.status === "enrolled"
                  ? "border-emerald-500/20 bg-gradient-to-r from-emerald-50/50 to-teal-50/50"
                  : "border-slate-100 hover:border-amber-500/20"
              )}
              onClick={() => setExpandedScheme(isExpanded ? null : idx)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    {s.status === "enrolled" ? (
                      <span className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-200 font-bold">
                        <CheckCircle className="w-3.5 h-3.5" /> {t("enrolled")}
                      </span>
                    ) : (
                      <span className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-3 py-1 rounded-lg border border-amber-200 font-bold">
                        {t("eligible")}
                      </span>
                    )}
                    {s.category && (
                      <span className="text-xs bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 px-3 py-1 rounded-lg border border-blue-200 font-bold">
                        {s.category}
                      </span>
                    )}
                    {s.ai_match_score && (
                      <span className="text-xs text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
                        AI Match: {s.ai_match_score}%
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 leading-tight">{scheme.name}</h3>
                  <p className="text-sm text-slate-500 font-semibold mt-1">{scheme.ministry}</p>
                  {s.description && (
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-2">{s.description}</p>
                  )}
                </div>

                {/* Right */}
                <div className="flex flex-row sm:flex-col gap-6 sm:gap-3 text-right shrink-0">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{t("benefit")}</p>
                    <p className="text-emerald-700 font-bold text-sm mt-1">{scheme.benefit}</p>
                    {s.amount && <p className="text-xs text-emerald-600 font-semibold mt-1">{s.amount}</p>}
                  </div>
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{t("deadline")}</p>
                    <p className="text-slate-800 text-sm font-bold mt-1">{scheme.deadline}</p>
                  </div>
                </div>
              </div>

              {/* Expanded view */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 pt-6 border-t border-slate-100 space-y-5"
                >
                  {s.requirements && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        Required Documents
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {s.requirements.map((req: string, i: number) => (
                          <span key={i} className="text-xs bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 font-semibold">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30">
                      <CheckCircle className="w-4 h-4" />
                      {t("applyNow")}
                    </button>
                    {s.link && (
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Official Portal
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}