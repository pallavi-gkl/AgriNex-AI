"use client";
import { useTranslation } from "@/hooks/useTranslation";

import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  ArrowRight, ShieldCheck, TrendingUp, Truck, Leaf, Sprout,
  ShoppingCart, Cpu, Star, Check, Zap, Globe, Award, BarChart3,
  Users, Package, Brain, MapPin, Bot, Send, ChevronDown,
  Sparkles, Activity, CloudSun, Droplets, Eye, CircuitBoard,
  AreaChart, Layers, Shield,
} from "lucide-react";

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 18 } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const staggerSlow = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
};

// ─── Animated Counter ────────────────────────────────────────────────────────
function Counter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, end]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count >= 1000 ? (count >= 100000 ? `${(count / 1000).toFixed(0)}K` : count.toLocaleString()) : count}{suffix}
    </span>
  );
}

// ─── FAQ Accordion ───────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: "How does AgriNex verify farmers?", a: "Farmers are onboarded via a KYC process — Aadhaar/land record verification, farm registration, and AI-powered crop history analysis before listing on the marketplace." },
  { q: "How does AI crop grading work?", a: "Farmers upload crop photos and our Gemini Vision AI analyzes quality, freshness, size uniformity, and surface defects to assign a Grade A–C quality certificate instantly." },
  { q: "How are prices determined?", a: "Our AI analyses real-time regional mandi data, seasonal demand patterns, weather forecasts, and crop quality scores to recommend fair, transparent pricing for both farmers and consumers." },
  { q: "Is delivery guaranteed?", a: "Yes. Our logistics partners handle direct farm-to-doorstep delivery with GPS tracking. Freshness is guaranteed through temperature-monitored supply chains." },
  { q: "Can I access AgriNex in regional languages?", a: "Yes. The platform is available in Hindi, Telugu, Tamil, Kannada, Marathi, Bengali, Gujarati, and 5 more regional languages — fully translated UI and AI responses." },
];

function FAQItem({ item }: { item: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors duration-200"
        style={{ color: "#f8fafc" }}>
        <span className="font-semibold text-sm sm:text-base pr-4">{item.q}</span>
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          style={{ color: "#10b981" }} />
      </button>
      <motion.div initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
        <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: "#94a3b8", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
          {item.a}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Marketplace Product Card ─────────────────────────────────────────────────
function ProductCard({ name, farmer, price, grade, tag, emoji }: {
  name: string; farmer: string; price: string; grade: string; tag: string; emoji: string;
}) {
  const { t } = useTranslation();
  const gradeColor = grade === "A" ? "#10b981" : grade === "B" ? "#f59e0b" : "#94a3b8";
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -6, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
      <div className="h-32 flex items-center justify-center text-5xl"
        style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))" }}>
        {emoji}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-sm" style={{ color: "#f8fafc" }}>{name}</h4>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0"
            style={{ background: `${gradeColor}20`, color: gradeColor, border: `1px solid ${gradeColor}40` }}>
            {t("grade")} {grade}
          </span>
        </div>
        <p className="text-xs" style={{ color: "#64748b" }}>{farmer}</p>
        <div className="flex items-center justify-between mt-auto pt-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="font-extrabold text-base" style={{ color: "#10b981" }}>{price}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>{tag}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function MarketingLandingPage() {
  const { t } = useTranslation();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const PRODUCTS = [
    { name: "Organic Tomatoes", farmer: "Ramesh Kumar · MP", price: "₹40/kg", grade: "A", tag: "Fresh Harvest", emoji: "🍅" },
    { name: "Basmati Rice", farmer: "Gurpreet Singh · Punjab", price: "₹85/kg", grade: "A", tag: "Premium", emoji: "🌾" },
    { name: "Alphonso Mangoes", farmer: "Suresh Patel · MH", price: "₹320/doz", grade: "A", tag: "Season Peak", emoji: "🥭" },
    { name: "Spinach Bundle", farmer: "Lakshmi Devi · AP", price: "₹25/bunch", grade: "B", tag: "Farm Direct", emoji: "🥬" },
  ];

  const WORKFLOW = [
    { icon: Sprout, step: "01", title: "Farmer Lists", desc: "Upload crop photo. Gemini Vision AI grades quality A–C in seconds.", color: "#10b981", glow: "rgba(16,185,129,0.3)" },
    { icon: Brain, step: "02", title: "AI Analyses", desc: "Real-time mandi data + weather + demand forecast = fair price recommendation.", color: "#2563eb", glow: "rgba(37,99,235,0.3)" },
    { icon: ShoppingCart, step: "03", title: "Consumer Buys", desc: "Verified produce at wholesale price. Zero middlemen. Complete transparency.", color: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
    { icon: Truck, step: "04", title: "GPS Delivery", desc: "Cold-chain logistics from farm to doorstep. Freshness guaranteed.", color: "#06b6d4", glow: "rgba(6,182,212,0.3)" },
  ];

  const BENTO_FEATURES = [
    { icon: Brain, title: "Gemini AI Brain", desc: "Crop quality grading, yield forecasting, disease detection, and intelligent price recommendations — all powered by Google Gemini.", span: "col-span-2", gradient: "from-violet-600/20 to-purple-600/20", accent: "#a78bfa", large: true },
    { icon: ShieldCheck, title: "KYC Verified Farmers", desc: "Every farmer undergoes Aadhaar-linked verification with land records, crop history, and peer reviews.", span: "col-span-1", gradient: "from-emerald-600/20 to-teal-600/20", accent: "#10b981", large: false },
    { icon: Globe, title: "10+ Regional Languages", desc: "Hindi, Telugu, Tamil, Kannada, Marathi and more.", span: "col-span-1", gradient: "from-cyan-600/20 to-sky-600/20", accent: "#06b6d4", large: false },
    { icon: BarChart3, title: "Real-Time Market Intelligence", desc: "Live mandi prices, demand forecasts, and AI crop advisories — updated every 15 minutes from 2,400+ mandis.", span: "col-span-1", gradient: "from-blue-600/20 to-indigo-600/20", accent: "#2563eb", large: false },
    { icon: Truck, title: "Cold Chain Logistics", desc: "GPS-tracked, temperature-monitored delivery from field to doorstep within 24 hours.", span: "col-span-1", gradient: "from-amber-600/20 to-orange-600/20", accent: "#f59e0b", large: false },
    { icon: Activity, title: "Farm Digital Twin", desc: "Simulate your entire farm virtually. Optimise irrigation, fertiliser, and harvest timing using AI predictions.", span: "col-span-2", gradient: "from-rose-600/20 to-pink-600/20", accent: "#f43f5e", large: true },
  ];

  const STATS = [
    { end: 12400, suffix: "+", label: "Verified Farmers", icon: Users, color: "#10b981" },
    { end: 890000, suffix: "+", label: "Orders Delivered", icon: Package, color: "#2563eb" },
    { end: 240, suffix: "+", label: "Districts Covered", icon: MapPin, color: "#06b6d4" },
    { end: 98, suffix: "%", label: "Satisfaction Rate", icon: Star, color: "#f59e0b" },
  ];

  const TESTIMONIALS = [
    { name: "Ramesh Kumar", role: "Farmer · Madhya Pradesh", avatar: "R", text: "AgriNex changed my life. I now sell tomatoes at 30% better prices directly to city families. The AI crop grader saved me from middleman exploitation." },
    { name: "Priya Sharma", role: "Consumer · Bengaluru", avatar: "P", text: "Farm-fresh vegetables delivered next morning. Quality is 10x better than supermarket produce, and I pay less too. Absolutely love it." },
    { name: "Suresh Patel", role: "Farmer · Gujarat", avatar: "S", text: "The AI weather predictions and irrigation advisory saved my cotton crop during an unexpected heat wave. This is genuinely the future of farming." },
  ];

  const AI_CHAT = [
    { role: "user", text: "What is the best price for my Grade A tomatoes right now?" },
    { role: "ai", text: "Based on current mandi data from Pune, Nashik, and Delhi markets, Grade A tomatoes are trading at **₹38–42/kg**. Demand is elevated due to the festival season. I recommend listing at **₹40/kg** for maximum sell-through. Would you like me to generate a price alert?" },
    { role: "user", text: "Yes, set an alert when price crosses ₹45/kg" },
    { role: "ai", text: "✅ Alert set! I'll notify you immediately when tomato prices cross **₹45/kg** in your nearest mandis. I'm also monitoring weather forecasts that could affect supply in the next 10 days." },
  ];

  return (
    <div style={{ background: "#080d14", color: "#f8fafc", fontFamily: "'Inter', 'Outfit', sans-serif" }}
      className="min-h-screen overflow-x-hidden">

      {/* ── Google Fonts ──────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: rgba(16,185,129,0.3); }
        .lp-gradient-text { background: linear-gradient(135deg, #10b981, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lp-gradient-text-gold { background: linear-gradient(135deg, #f59e0b, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lp-gradient-text-blue { background: linear-gradient(135deg, #2563eb, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lp-grid-bg { background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 60px 60px; }
        .lp-glow-green { box-shadow: 0 0 60px rgba(16,185,129,0.2), 0 0 120px rgba(16,185,129,0.08); }
        .lp-glow-blue { box-shadow: 0 0 60px rgba(37,99,235,0.2), 0 0 120px rgba(37,99,235,0.08); }
        .lp-noise { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); }
      `}</style>

      {/* ── Fixed Navbar ──────────────────────────────── */}
      <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: "rgba(8,13,20,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: "#f8fafc" }}>
              Agri<span className="lp-gradient-text">Nex</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{t("aiPlatform")}
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-6">
            <a href="#features" className="hidden md:block text-sm font-medium transition-colors no-underline"
              style={{ color: "#94a3b8" }} onMouseEnter={e => (e.currentTarget.style.color = "#10b981")}
              onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}>{t("features")}</a>
            <a href="#how-it-works" className="hidden md:block text-sm font-medium transition-colors no-underline"
              style={{ color: "#94a3b8" }} onMouseEnter={e => (e.currentTarget.style.color = "#10b981")}
              onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}>{t("howItWorks")}</a>
            <a href="#marketplace" className="hidden md:block text-sm font-medium transition-colors no-underline"
              style={{ color: "#94a3b8" }} onMouseEnter={e => (e.currentTarget.style.color = "#10b981")}
              onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}>{t("marketplace")}</a>
            <Link href="/signin" className="text-sm font-semibold no-underline px-4 py-2 rounded-xl transition-all"
              style={{ color: "#94a3b8" }}>Sign In</Link>
            <Link href="/signup" className="text-sm font-bold no-underline px-5 py-2.5 rounded-xl transition-all"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }}>
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden lp-grid-bg"
        style={{ paddingTop: "5rem" }}>
        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)", filter: "blur(60px)", transform: "translate(-50%, -50%)" }} />
          <div className="absolute top-2/3 right-1/4 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)", filter: "blur(60px)", transform: "translate(50%, -50%)" }} />
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)", filter: "blur(80px)", transform: "translate(-50%, -50%)" }} />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col items-center">

            {/* Live badge */}
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-bold uppercase tracking-wider"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t("indiaSFirstAiPoweredFarmToCons")}
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </motion.div>

            {/* Main headline */}
            <motion.h1 variants={fadeUp}
              className="font-black leading-[1.05] tracking-tight mb-6"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)", fontFamily: "'Outfit', sans-serif", color: "#ffffff" }}>
              {t("empoweringFarmers")}<br />
              <span style={{
                background: "linear-gradient(135deg, #22C55E 0%, #10B981 50%, #14B8A6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "inline-block"
              }}>
                {t("connectingConsumers")}
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p variants={fadeUp}
              className="text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed font-medium"
              style={{ color: "#94a3b8" }}>
              AgriNex AI eliminates middlemen, grades crops with{" "}
              <span style={{ color: "#10b981", fontWeight: 700 }}>{t("geminiVisionAi")}</span>{t("predictsPricesInRealTimeAndDel1")}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/signup?role=farmer" className="no-underline group">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 8px 32px rgba(16,185,129,0.4)" }}>
                  <Sprout className="w-5 h-5" />
                  Join as Farmer
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.div>
              </Link>
              <Link href="/signup?role=consumer" className="no-underline group">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#f8fafc", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}>
                  <ShoppingCart className="w-5 h-5" />
                  Shop Fresh Produce
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-6 justify-center text-sm font-medium" style={{ color: "#64748b" }}>
              {[
                { icon: ShieldCheck, text: "KYC Verified Farmers" },
                { icon: Award, text: "AI Quality Certified" },
                { icon: Truck, text: "GPS Tracked Delivery" },
                { icon: Globe, text: "10+ Indian Languages" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" style={{ color: "#10b981" }} />
                  {item.text}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          style={{ color: "#334155" }}>
          <span className="text-xs font-medium">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </section>

      {/* ── STATS BAR ────────────────────────────────── */}
      <section style={{ background: "rgba(255,255,255,0.03)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
                  style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                  <s.icon className="w-6 h-6" style={{ color: s.color }} />
                </div>
                <span className="text-3xl sm:text-4xl font-black" style={{ color: s.color }}>
                  <Counter end={s.end} suffix={s.suffix} />
                </span>
                <span className="text-sm font-medium" style={{ color: "#64748b" }}>{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BENTO FEATURES ───────────────────────────── */}
      <section id="features" className="py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
            variants={stagger} className="text-center mb-16">
            <motion.span variants={fadeUp}
              className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
              Why AgriNex
            </motion.span>
            <motion.h2 variants={fadeUp}
              className="text-3xl sm:text-5xl font-black tracking-tight mb-4"
              style={{ fontFamily: "'Outfit', sans-serif" }}>
              {t("intelligenceBuiltFor")} <span className="lp-gradient-text">Modern Agriculture</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base max-w-xl mx-auto" style={{ color: "#64748b" }}>
              Six core pillars of AI-powered agricultural intelligence working together seamlessly.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={staggerSlow}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENTO_FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`relative rounded-3xl p-7 overflow-hidden group ${f.span === "col-span-2" ? "lg:col-span-2" : ""}`}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {/* gradient bg overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-100 rounded-3xl`} />
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${f.accent}, transparent)`, filter: "blur(30px)" }} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: `${f.accent}20`, border: `1px solid ${f.accent}30` }}>
                    <f.icon className="w-6 h-6" style={{ color: f.accent }} />
                  </div>
                  <h3 className={`font-bold mb-2 ${f.large ? "text-xl" : "text-base"}`} style={{ color: "#f8fafc" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-4 sm:px-6 relative"
        style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="absolute inset-0 lp-grid-bg opacity-40 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
            variants={stagger} className="text-center mb-20">
            <motion.span variants={fadeUp}
              className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
              style={{ background: "rgba(37,99,235,0.12)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.2)" }}>
              Workflow
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-black tracking-tight mb-4"
              style={{ fontFamily: "'Outfit', sans-serif" }}>
              {t("farmToForkIn")} <span className="lp-gradient-text-blue">{t("str_4IntelligentSteps")}</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base max-w-lg mx-auto" style={{ color: "#64748b" }}>
              {t("aSeamlessAiOrchestratedSupplyC")}
            </motion.p>
          </motion.div>

          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), rgba(255,255,255,0.1), transparent)" }} />

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
              variants={staggerSlow} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {WORKFLOW.map((step, i) => (
                <motion.div key={i} variants={fadeUp}
                  whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  className="flex flex-col items-center text-center p-8 rounded-3xl relative"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {/* Step number */}
                  <span className="absolute top-4 right-4 text-xs font-extrabold"
                    style={{ color: "rgba(255,255,255,0.15)" }}>{step.step}</span>
                  {/* Icon */}
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                    style={{ background: `${step.color}15`, border: `1px solid ${step.color}30`, boxShadow: `0 8px 24px ${step.glow}` }}>
                    <step.icon className="w-9 h-9" style={{ color: step.color }} />
                  </div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: "#f8fafc" }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{step.desc}</p>
                  {/* Arrow connector (desktop only, between cards) */}
                  {i < WORKFLOW.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 top-14 z-10 w-6 h-6 rounded-full items-center justify-center"
                      style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <ArrowRight className="w-3 h-3" style={{ color: "#334155" }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── AI CHAT PREVIEW ───────────────────────────── */}
      <section className="py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text side */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
              <motion.span variants={fadeUp}
                className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                {t("aiAssistantFarmer")}
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-black tracking-tight mb-6"
                style={{ fontFamily: "'Outfit', sans-serif" }}>
                Your Personal <span className="lp-gradient-text">{t("aiFarmingAdvisor")}</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-base leading-relaxed mb-8" style={{ color: "#64748b" }}>
                {t("askAnythingCropPricesWeatherFo1")}
              </motion.p>
              <motion.div variants={stagger} className="space-y-4">
                {[
                  { icon: BarChart3, text: "Live mandi price tracking across 2,400+ markets" },
                  { icon: CloudSun, text: "Hyperlocal weather & crop advisory for your district" },
                  { icon: Eye, text: "AI disease detection from a single crop photo" },
                  { icon: CircuitBoard, text: "Government scheme eligibility checker" },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <item.icon className="w-4 h-4" style={{ color: "#10b981" }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: "#cbd5e1" }}>{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Chat preview */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: "easeOut" }}
              className="rounded-3xl overflow-hidden"
              style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
              {/* Chat header */}
              <div className="px-5 py-4 flex items-center gap-3"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.2)" }}>
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{t("agrinexAiAdvisor")}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span className="text-emerald-100 text-xs">Powered by Gemini AI</span>
                  </div>
                </div>
              </div>
              {/* Messages */}
              <div className="p-5 space-y-4" style={{ minHeight: "320px" }}>
                {AI_CHAT.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.15 + 0.2 }}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "ai" && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1"
                        style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm"
                      style={msg.role === "user"
                        ? { background: "#2563eb", color: "#f8fafc", borderRadius: "1.25rem 1.25rem 0.25rem 1.25rem" }
                        : { background: "#1e293b", color: "#cbd5e1", borderRadius: "1.25rem 1.25rem 1.25rem 0.25rem", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f8fafc">$1</strong>') }} />
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Input */}
              <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="text-sm flex-1" style={{ color: "#475569" }}>Ask about your crops, prices, weather…</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                    <Send className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MARKETPLACE PREVIEW ───────────────────────── */}
      <section id="marketplace" className="py-28 px-4 sm:px-6"
        style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
            variants={stagger} className="text-center mb-16">
            <motion.span variants={fadeUp}
              className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
              style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
              Live Marketplace
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-black tracking-tight mb-4"
              style={{ fontFamily: "'Outfit', sans-serif" }}>
              {t("freshProduce")} <span className="lp-gradient-text-gold">{t("aiQualityGraded")}</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base max-w-xl mx-auto" style={{ color: "#64748b" }}>
              {t("everyProductIsAiVerifiedFarmCe")}
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={staggerSlow} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {PRODUCTS.map((p, i) => <ProductCard key={i} {...p} />)}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center">
            <Link href="/signup?role=consumer" className="no-underline inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm"
              style={{ background: "rgba(255,255,255,0.06)", color: "#f8fafc", border: "1px solid rgba(255,255,255,0.12)" }}>
              {t("exploreFullMarketplace")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section className="py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
            variants={stagger} className="text-center mb-16">
            <motion.span variants={fadeUp}
              className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
              style={{ background: "rgba(168,85,247,0.1)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.2)" }}>
              Testimonials
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-black tracking-tight mb-4"
              style={{ fontFamily: "'Outfit', sans-serif" }}>
              Trusted by <span className="lp-gradient-text">{t("str_12400Farmers")}</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={staggerSlow} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} variants={fadeUp}
                whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="p-8 rounded-3xl flex flex-col gap-4"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm leading-relaxed italic flex-1" style={{ color: "#94a3b8" }}>"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#f8fafc" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "#475569" }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="py-28 px-4 sm:px-6"
        style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
            variants={stagger} className="text-center mb-14">
            <motion.span variants={fadeUp}
              className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full"
              style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.2)" }}>
              {t("faq")}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-black tracking-tight mb-4"
              style={{ fontFamily: "'Outfit', sans-serif" }}>
              {t("frequently")} <span className="lp-gradient-text">{t("asked")}</span>
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={staggerSlow} className="space-y-3">
            {FAQ_ITEMS.map((item, i) => <FAQItem key={i} item={item} />)}
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section className="py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="relative rounded-[2.5rem] overflow-hidden p-12 sm:p-20 text-center"
            style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
            {/* Radial glows */}
            <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)", filter: "blur(40px)" }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)", filter: "blur(40px)" }} />
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
                  style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
                  <Sparkles className="w-3.5 h-3.5" />Join AgriNex AI Today
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4"
                style={{ fontFamily: "'Outfit', sans-serif", color: "#f8fafc" }}>
                Ready to Transform<br /><span className="lp-gradient-text">Indian Agriculture?</span>
              </h2>
              <p className="text-base max-w-lg mx-auto mb-10 leading-relaxed" style={{ color: "#64748b" }}>
                Join 12,400+ farmers and a fast-growing network of conscious consumers. Fresh food, fair prices, AI-powered efficiency.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                {["Free to register", "No middlemen", "AI quality assured", "GPS tracking", "10+ languages"].map((pt, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "#94a3b8" }}>
                    <Check className="w-4 h-4" style={{ color: "#10b981" }} />{pt}
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="no-underline group">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-base"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 8px 32px rgba(16,185,129,0.4)" }}>
                    <Zap className="w-5 h-5" />
                    {t("getStartedFree")}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </motion.div>
                </Link>
                <Link href="/signin" className="no-underline">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-base"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#f8fafc", border: "1px solid rgba(255,255,255,0.12)" }}>
                    Sign In to Dashboard
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer style={{ background: "#050810", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 no-underline mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}>
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-xl tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: "#f8fafc" }}>
                  Agri<span className="lp-gradient-text">Nex</span> <span style={{ color: "#334155", fontSize: "0.7rem", fontWeight: 500 }}>{t("aiPlatform")}</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#475569" }}>
                {t("empoweringIndiaSFarmersWithArt1")}
              </p>
              <div className="flex gap-3 mt-6">
                {[{ label: "Gemini AI", color: "#4285f4" }, { label: "Next.js", color: "#475569" }, { label: "Supabase", color: "#3ecf8e" }].map((tech, i) => (
                  <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.05)", color: tech.color, border: `1px solid ${tech.color}30` }}>
                    {tech.label}
                  </span>
                ))}
              </div>
            </div>
            {/* Platform links */}
            <div>
              <h4 className="font-bold text-sm mb-5" style={{ color: "#94a3b8" }}>Platform</h4>
              <div className="flex flex-col gap-3">
                {[["Farmer Portal", "/signin?role=farmer"], ["Consumer Marketplace", "/signin?role=consumer"], ["Register as Farmer", "/signup?role=farmer"], ["Register as Consumer", "/signup?role=consumer"]].map(([label, href], i) => (
                  <Link key={i} href={href} className="text-sm no-underline transition-colors"
                    style={{ color: "#475569" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#10b981")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            {/* Features */}
            <div>
              <h4 className="font-bold text-sm mb-5" style={{ color: "#94a3b8" }}>{t("features")}</h4>
              <div className="flex flex-col gap-3">
                {[["AI Crop Grading", "#"], ["Smart Pricing", "#"], ["GPS Delivery", "#"], ["Market Analytics", "#"], ["Multi-language Support", "#"]].map(([label, href], i) => (
                  <Link key={i} href={href} className="text-sm no-underline transition-colors"
                    style={{ color: "#475569" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#10b981")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {/* Footer bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-xs" style={{ color: "#334155" }}>
              © {new Date().getFullYear()} AgriNex AI Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs" style={{ color: "#334155" }}>
              <Shield className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
              {t("builtForIndiaSAgriculturalTran1")}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}