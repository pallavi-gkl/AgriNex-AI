"use client";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  ArrowRight, ShieldCheck, Truck, Leaf, Sprout,
  ShoppingCart, Star, Check, Zap, Globe, Award, BarChart3,
  Users, Package, Brain, MapPin, Bot, Send, ChevronDown,
  Sparkles, Activity, CloudSun, Eye, CircuitBoard, Shield,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 18 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const staggerSlow = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
};

function Counter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1800, steps = 60;
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
      {prefix}{count >= 100000 ? `${(count / 1000).toFixed(0)}K` : count >= 1000 ? count.toLocaleString() : count}{suffix}
    </span>
  );
}

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
    <motion.div variants={fadeUp} style={{
      background: open ? "rgba(16,185,129,0.04)" : "rgba(255,255,255,0.03)",
      border: open ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(255,255,255,0.07)",
      borderRadius: "20px", overflow: "hidden",
      transition: "background 0.25s, border-color 0.25s",
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "22px 28px", textAlign: "left", background: "none", border: "none", cursor: "pointer",
      }}>
        <span style={{ fontWeight: 700, fontSize: "15px", color: open ? "#f1f5f9" : "#cbd5e1", paddingRight: "16px", lineHeight: 1.4 }}>
          {item.q}
        </span>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: open ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
          border: open ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.08)",
          transition: "all 0.25s",
        }}>
          <ChevronDown style={{ width: 16, height: 16, color: open ? "#10b981" : "#64748b", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }} />
        </div>
      </button>
      <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
        <p style={{ padding: "0 28px 24px", paddingTop: "16px", fontSize: "14px", lineHeight: 1.75, color: "#94a3b8", borderTop: "1px solid rgba(255,255,255,0.05)", margin: 0 }}>
          {item.a}
        </p>
      </motion.div>
    </motion.div>
  );
}

function ProductCard({ name, farmer, price, grade, tag, emoji }: {
  name: string; farmer: string; price: string; grade: string; tag: string; emoji: string;
}) {
  const { t } = useTranslation();
  const gc = grade === "A" ? "#10b981" : grade === "B" ? "#f59e0b" : "#94a3b8";
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(16px)", borderRadius: "20px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}>
      <div style={{ height: "120px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "52px", background: "linear-gradient(135deg,rgba(16,185,129,0.1),rgba(6,182,212,0.06))" }}>
        {emoji}
      </div>
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
          <h4 style={{ fontWeight: 800, fontSize: "13px", color: "#f1f5f9", margin: 0, lineHeight: 1.3 }}>{name}</h4>
          <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "20px", flexShrink: 0, background: `${gc}1a`, color: gc, border: `1px solid ${gc}40` }}>
            {t("grade")} {grade}
          </span>
        </div>
        <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>{farmer}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontWeight: 900, fontSize: "16px", color: "#10b981" }}>{price}</span>
          <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "20px", fontWeight: 700, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{tag}</span>
        </div>
      </div>
    </motion.div>
  );
}

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

export default function MarketingLandingPage() {
  const { t } = useTranslation();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scrolled = useScrolled();

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
    { icon: Brain, title: "Gemini AI Brain", desc: "Crop quality grading, yield forecasting, disease detection, and intelligent price recommendations — all powered by Google Gemini.", span: true, gradient: "from-violet-600/20 to-purple-600/20", accent: "#a78bfa", large: true },
    { icon: ShieldCheck, title: "KYC Verified Farmers", desc: "Every farmer undergoes Aadhaar-linked verification with land records, crop history, and peer reviews.", span: false, gradient: "from-emerald-600/20 to-teal-600/20", accent: "#10b981", large: false },
    { icon: Globe, title: "10+ Regional Languages", desc: "Hindi, Telugu, Tamil, Kannada, Marathi and more.", span: false, gradient: "from-cyan-600/20 to-sky-600/20", accent: "#06b6d4", large: false },
    { icon: BarChart3, title: "Real-Time Market Intelligence", desc: "Live mandi prices, demand forecasts, and AI crop advisories — updated every 15 minutes from 2,400+ mandis.", span: false, gradient: "from-blue-600/20 to-indigo-600/20", accent: "#2563eb", large: false },
    { icon: Truck, title: "Cold Chain Logistics", desc: "GPS-tracked, temperature-monitored delivery from field to doorstep within 24 hours.", span: false, gradient: "from-amber-600/20 to-orange-600/20", accent: "#f59e0b", large: false },
    { icon: Activity, title: "Farm Digital Twin", desc: "Simulate your entire farm virtually. Optimise irrigation, fertiliser, and harvest timing using AI predictions.", span: true, gradient: "from-rose-600/20 to-pink-600/20", accent: "#f43f5e", large: true },
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
    <div style={{ background: "#080d14", color: "#f8fafc", fontFamily: "'Inter','Outfit',sans-serif", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── Global CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::selection{background:rgba(16,185,129,0.3)}
        .lp-gt{background:linear-gradient(135deg,#10b981,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .lp-gt-gold{background:linear-gradient(135deg,#f59e0b,#f97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .lp-gt-blue{background:linear-gradient(135deg,#2563eb,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .lp-grid{background-image:linear-gradient(rgba(255,255,255,0.025)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025)1px,transparent 1px);background-size:64px 64px}
        .lp-title{font-family:'Outfit',sans-serif;font-weight:900;letter-spacing:-0.025em;line-height:1.08}
        .lp-tag{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;padding:6px 18px;border-radius:100px;margin-bottom:20px}
        .lp-navlink{font-size:14px;font-weight:500;color:#94a3b8;text-decoration:none;padding:6px 2px;position:relative;transition:color .2s}
        .lp-navlink::after{content:'';position:absolute;bottom:0;left:0;width:0;height:2px;background:linear-gradient(90deg,#10b981,#06b6d4);border-radius:2px;transition:width .25s}
        .lp-navlink:hover{color:#10b981}
        .lp-navlink:hover::after{width:100%}
        .lp-btn-p{display:inline-flex;align-items:center;gap:10px;padding:14px 34px;border-radius:16px;font-weight:800;font-size:15px;color:#fff;background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 8px 32px rgba(16,185,129,.4);text-decoration:none;transition:box-shadow .25s,transform .15s}
        .lp-btn-p:hover{box-shadow:0 12px 44px rgba(16,185,129,.55);transform:translateY(-2px)}
        .lp-btn-s{display:inline-flex;align-items:center;gap:10px;padding:14px 34px;border-radius:16px;font-weight:700;font-size:15px;color:#e2e8f0;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);text-decoration:none;transition:background .25s,border-color .25s,transform .15s;backdrop-filter:blur(12px)}
        .lp-btn-s:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);transform:translateY(-2px)}
        .lp-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:24px;transition:transform .25s,box-shadow .25s,border-color .25s}
        .lp-card:hover{box-shadow:0 20px 60px rgba(0,0,0,.35);border-color:rgba(255,255,255,.13)}
        @keyframes lpPulse{0%,100%{opacity:1}50%{opacity:.5}}
        .lp-pulse{animation:lpPulse 2s ease-in-out infinite}
        @media(max-width:768px){
          .lp-md-hide{display:none!important}
          .lp-sm-stack{flex-direction:column!important}
          .lp-sm-full{width:100%!important;justify-content:center!important}
          .lp-bento-wide{grid-column:span 1!important}
        }
        @media(min-width:769px){.lp-sm-hide{display:none!important}}
        @media(min-width:1024px){
          .lp-lg-two-col{grid-template-columns:1fr 1fr!important}
          .lp-show-lg{display:block!important}
          .lp-flex-lg{display:flex!important}
          .lp-bento-grid{grid-template-columns:repeat(3,1fr)!important}
          .lp-bento-wide{grid-column:span 2!important}
          .lp-footer-grid{grid-template-columns:2fr 1fr 1fr!important}
          .lp-footer-brand{grid-column:auto!important}
        }
        .lp-footer-brand{grid-column:1/-1}
        .lp-bento-card:hover{box-shadow:0 24px 64px rgba(0,0,0,.4)!important;border-color:rgba(255,255,255,.14)!important}
        .lp-workflow-card:hover{box-shadow:0 20px 56px rgba(0,0,0,.35)!important}
        .lp-stat-card:hover{transform:translateY(-6px)}
        .lp-testimonial-card:hover{box-shadow:0 20px 60px rgba(0,0,0,.3)!important;border-color:rgba(255,255,255,.12)!important}
      `}</style>

      {/* ── NAVBAR ── */}
      <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.55, ease: "easeOut" }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? "rgba(5,8,16,0.95)" : "rgba(8,13,20,0.72)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.05)",
          boxShadow: scrolled ? "0 8px 40px rgba(0,0,0,0.5)" : "none",
          transition: "background .3s,box-shadow .3s,border-color .3s",
        }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "11px", textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 16px rgba(16,185,129,.45)" }}>
              <Leaf style={{ width: 20, height: 20, color: "#fff" }} />
            </div>
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: "-0.02em", color: "#f8fafc" }}>
              Agri<span className="lp-gt">Nex</span>
            </span>
            <span className="lp-md-hide" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 100, background: "rgba(16,185,129,.12)", color: "#10b981", border: "1px solid rgba(16,185,129,.25)" }}>
              <span className="lp-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
              {t("aiPlatform")}
            </span>
          </Link>
          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <a href="#features" className="lp-navlink lp-md-hide">{t("features")}</a>
            <a href="#how-it-works" className="lp-navlink lp-md-hide">{t("howItWorks")}</a>
            <a href="#marketplace" className="lp-navlink lp-md-hide">{t("marketplace")}</a>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link href="/signin" style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", textDecoration: "none", padding: "9px 18px", borderRadius: 12, border: "1px solid rgba(255,255,255,.09)", background: "rgba(255,255,255,.04)", transition: "all .2s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#f1f5f9"; el.style.borderColor = "rgba(255,255,255,.18)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#94a3b8"; el.style.borderColor = "rgba(255,255,255,.09)"; }}>
                Sign In
              </Link>
              <Link href="/signup" style={{ fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", padding: "9px 22px", borderRadius: 12, background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 16px rgba(16,185,129,.4)", transition: "box-shadow .2s,transform .15s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 6px 24px rgba(16,185,129,.58)"; el.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 4px 16px rgba(16,185,129,.4)"; el.style.transform = ""; }}>
                {t("getStarted")}
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="lp-grid"
        style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", paddingTop: "5rem" }}>
        {/* Ambient blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "25%", left: "25%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle,rgba(16,185,129,.13)0%,transparent 70%)", filter: "blur(70px)", transform: "translate(-50%,-50%)" }} />
          <div style={{ position: "absolute", top: "65%", right: "25%", width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,.1)0%,transparent 70%)", filter: "blur(70px)", transform: "translate(50%,-50%)" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle,rgba(6,182,212,.04)0%,transparent 70%)", filter: "blur(90px)", transform: "translate(-50%,-50%)" }} />
        </div>
        <motion.div style={{ y: heroY, opacity: heroOpacity, position: "relative", zIndex: 10, maxWidth: "76rem", margin: "0 auto", padding: "0 24px", textAlign: "center", width: "100%" }}>
          <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Badge */}
            <motion.div variants={fadeUp} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 100, marginBottom: 36, fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.22)", color: "#10b981" }}>
              <span className="lp-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", display: "inline-block", flexShrink: 0 }} />
              {t("indiaSFirstAiPoweredFarmToCons")}
              <Zap style={{ width: 13, height: 13, color: "#fbbf24" }} />
            </motion.div>

            {/* H1 */}
            <motion.h1 variants={fadeUp} className="lp-title"
              style={{ fontSize: "clamp(2.8rem,7.5vw,5.75rem)", color: "#fff", marginBottom: 28, maxWidth: 900 }}>
              {t("empoweringFarmers")}<br />
              <span style={{ background: "linear-gradient(135deg,#22C55E 0%,#10B981 50%,#14B8A6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "inline-block" }}>
                {t("connectingConsumers")}
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p variants={fadeUp} style={{ fontSize: "clamp(1rem,2vw,1.2rem)", maxWidth: 580, marginBottom: 44, lineHeight: 1.7, fontWeight: 500, color: "#94a3b8" }}>
              AgriNex AI eliminates middlemen, grades crops with{" "}
              <span style={{ color: "#10b981", fontWeight: 700 }}>{t("geminiVisionAi")}</span>
              {t("predictsPricesInRealTimeAndDel1")}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="lp-sm-stack" style={{ display: "flex", gap: 16, marginBottom: 48, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/signup?role=farmer" className="no-underline group">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 36px", borderRadius: 18, fontWeight: 800, fontSize: 15, background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", boxShadow: "0 8px 36px rgba(16,185,129,.45)" }}>
                  <Sprout style={{ width: 20, height: 20 }} />
                  Join as Farmer
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </motion.div>
              </Link>
              <Link href="/signup?role=consumer" className="no-underline group">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 36px", borderRadius: 18, fontWeight: 700, fontSize: 15, background: "rgba(255,255,255,.06)", color: "#f1f5f9", border: "1px solid rgba(255,255,255,.13)", backdropFilter: "blur(12px)" }}>
                  <ShoppingCart style={{ width: 20, height: 20 }} />
                  Shop Fresh Produce
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "center", fontSize: 13, fontWeight: 500, color: "#64748b" }}>
              {[{ icon: ShieldCheck, text: "KYC Verified Farmers" }, { icon: Award, text: "AI Quality Certified" }, { icon: Truck, text: "GPS Tracked Delivery" }, { icon: Globe, text: "10+ Indian Languages" }]
                .map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <item.icon style={{ width: 15, height: 15, color: "#10b981" }} />
                    {item.text}
                  </div>
                ))}
            </motion.div>
          </motion.div>
        </motion.div>
        {/* Scroll hint */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}
          style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "#334155" }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>Scroll</span>
          <ChevronDown style={{ width: 16, height: 16 }} />
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "rgba(255,255,255,.025)", borderTop: "1px solid rgba(255,255,255,.07)", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 28, textAlign: "center" }}>
            {STATS.map((s, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -6, boxShadow: `0 16px 48px ${s.color}20` }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "32px 20px", borderRadius: 24, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", transition: "transform .25s,box-shadow .25s" }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: `${s.color}14`, border: `1px solid ${s.color}28`, boxShadow: `0 4px 16px ${s.color}20` }}>
                  <s.icon style={{ width: 24, height: 24, color: s.color }} />
                </div>
                <span style={{ fontSize: "clamp(2rem,4vw,2.75rem)", fontWeight: 900, color: s.color, lineHeight: 1, fontFamily: "'Outfit',sans-serif" }}>
                  <Counter end={s.end} suffix={s.suffix} />
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", letterSpacing: ".02em" }}>{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WHY AGRINEX ── */}
      <section id="features" style={{ padding: "120px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger} style={{ textAlign: "center", marginBottom: 72 }}>
            <motion.span variants={fadeUp} className="lp-tag" style={{ background: "rgba(16,185,129,.1)", color: "#10b981", border: "1px solid rgba(16,185,129,.2)" }}>
              Why AgriNex
            </motion.span>
            <motion.h2 variants={fadeUp} className="lp-title" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)", marginBottom: 16 }}>
              {t("intelligenceBuiltFor")} <span className="lp-gt">Modern Agriculture</span>
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, maxWidth: 480, margin: "0 auto", color: "#64748b", lineHeight: 1.65 }}>
              Six core pillars of AI-powered agricultural intelligence working together seamlessly.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={staggerSlow}
            className="lp-bento-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(1,1fr)", gap: 20 }}>
            {BENTO_FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -8, scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={f.span ? "lp-bento-wide" : ""}
                style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 28, padding: 36, overflow: "hidden", position: "relative", boxShadow: "0 4px 20px rgba(0,0,0,.2)", transition: "box-shadow .3s,border-color .3s" }}>
                {/* gradient overlay */}
                <div style={{ position: "absolute", inset: 0, borderRadius: 28, background: `linear-gradient(135deg,${f.accent}12,${f.accent}06)`, pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: -20, right: -20, width: 140, height: 140, borderRadius: "50%", opacity: .2, pointerEvents: "none", background: `radial-gradient(circle,${f.accent},transparent)`, filter: "blur(36px)" }} />
                <div style={{ position: "relative", zIndex: 10 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, background: `${f.accent}18`, border: `1px solid ${f.accent}35`, boxShadow: `0 4px 16px ${f.accent}20` }}>
                    <f.icon style={{ width: 24, height: 24, color: f.accent }} />
                  </div>
                  <h3 style={{ fontWeight: 800, marginBottom: 10, color: "#f1f5f9", fontSize: f.large ? 20 : 16, lineHeight: 1.3 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "#94a3b8" }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "120px 24px", position: "relative", background: "rgba(255,255,255,.015)", borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div className="lp-grid" style={{ position: "absolute", inset: 0, opacity: .35, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger} style={{ textAlign: "center", marginBottom: 80 }}>
            <motion.span variants={fadeUp} className="lp-tag" style={{ background: "rgba(37,99,235,.1)", color: "#60a5fa", border: "1px solid rgba(37,99,235,.2)" }}>
              Workflow
            </motion.span>
            <motion.h2 variants={fadeUp} className="lp-title" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)", marginBottom: 16 }}>
              {t("farmToForkIn")} <span className="lp-gt-blue">{t("str_4IntelligentSteps")}</span>
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, maxWidth: 480, margin: "0 auto", color: "#64748b", lineHeight: 1.65 }}>
              {t("aSeamlessAiOrchestratedSupplyC")}
            </motion.p>
          </motion.div>
          <div style={{ position: "relative" }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={staggerSlow}
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
              {WORKFLOW.map((step, i) => (
                <motion.div key={i} variants={fadeUp} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px 28px", borderRadius: 28, position: "relative", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 4px 20px rgba(0,0,0,.2)", transition: "box-shadow .3s" }}>
                  <div style={{ position: "absolute", top: 18, right: 18, fontSize: 11, fontWeight: 800, letterSpacing: ".1em", color: "rgba(255,255,255,.18)", fontFamily: "'Outfit',sans-serif" }}>{step.step}</div>
                  <div style={{ width: 80, height: 80, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, background: `${step.color}12`, border: `1px solid ${step.color}28`, boxShadow: `0 8px 28px ${step.glow}` }}>
                    <step.icon style={{ width: 36, height: 36, color: step.color }} />
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 12, color: "#f1f5f9", lineHeight: 1.2 }}>{step.title}</h3>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#64748b" }}>{step.desc}</p>
                  {i < WORKFLOW.length - 1 && (
                    <div className="lp-flex-lg" style={{ display: "none", position: "absolute", right: -13, top: 66, zIndex: 10, width: 26, height: 26, borderRadius: "50%", alignItems: "center", justifyContent: "center", background: "#0f172a", border: "1px solid rgba(255,255,255,.1)" }}>
                      <ArrowRight style={{ width: 12, height: 12, color: "#334155" }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── AI ASSISTANT ── */}
      <section style={{ padding: "120px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="lp-lg-two-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 64, alignItems: "center" }}>
            {/* Text */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
              <motion.span variants={fadeUp} className="lp-tag" style={{ background: "rgba(16,185,129,.1)", color: "#10b981", border: "1px solid rgba(16,185,129,.2)" }}>
                {t("aiAssistantFarmer")}
              </motion.span>
              <motion.h2 variants={fadeUp} className="lp-title" style={{ fontSize: "clamp(1.9rem,4vw,3.2rem)", marginBottom: 20 }}>
                Your Personal <span className="lp-gt">{t("aiFarmingAdvisor")}</span>
              </motion.h2>
              <motion.p variants={fadeUp} style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 36, color: "#64748b" }}>
                {t("askAnythingCropPricesWeatherFo1")}
              </motion.p>
              <motion.div variants={stagger} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[{ icon: BarChart3, text: "Live mandi price tracking across 2,400+ markets" }, { icon: CloudSun, text: "Hyperlocal weather & crop advisory for your district" }, { icon: Eye, text: "AI disease detection from a single crop photo" }, { icon: CircuitBoard, text: "Government scheme eligibility checker" }]
                  .map((item, i) => (
                    <motion.div key={i} variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.18)" }}>
                        <item.icon style={{ width: 18, height: 18, color: "#10b981" }} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#cbd5e1" }}>{item.text}</span>
                    </motion.div>
                  ))}
              </motion.div>
            </motion.div>
            {/* Chat */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ borderRadius: 28, overflow: "hidden", background: "#0b1120", border: "1px solid rgba(255,255,255,.09)", boxShadow: "0 32px 80px rgba(0,0,0,.55)" }}>
              {/* Header */}
              <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(135deg,#10b981,#059669)" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.18)" }}>
                  <Bot style={{ width: 22, height: 22, color: "#fff" }} />
                </div>
                <div>
                  <p style={{ color: "#fff", fontWeight: 800, fontSize: 14, marginBottom: 3 }}>{t("agrinexAiAdvisor")}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="lp-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#86efac", display: "inline-block" }} />
                    <span style={{ color: "rgba(255,255,255,.8)", fontSize: 12 }}>Powered by Gemini AI</span>
                  </div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  {["#f87171", "#fbbf24", "#34d399"].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: .7 }} />)}
                </div>
              </div>
              {/* Messages */}
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, minHeight: 320 }}>
                {AI_CHAT.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 + 0.2 }}
                    style={{ display: "flex", gap: 10, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    {msg.role === "ai" && (
                      <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#10b981,#059669)" }}>
                        <Bot style={{ width: 15, height: 15, color: "#fff" }} />
                      </div>
                    )}
                    <div style={{
                      maxWidth: "82%", padding: "12px 16px", fontSize: 13.5, lineHeight: 1.65,
                      ...(msg.role === "user"
                        ? { background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#f0f7ff", borderRadius: "18px 18px 4px 18px", boxShadow: "0 4px 16px rgba(37,99,235,.3)" }
                        : { background: "rgba(255,255,255,.05)", color: "#cbd5e1", borderRadius: "18px 18px 18px 4px", border: "1px solid rgba(255,255,255,.08)" }),
                    }}>
                      <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f8fafc">$1</strong>') }} />
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Input */}
              <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderRadius: 18, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)" }}>
                  <span style={{ fontSize: 13, flex: 1, color: "#475569" }}>Ask about your crops, prices, weather…</span>
                  <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 14px rgba(16,185,129,.35)" }}>
                    <Send style={{ width: 15, height: 15, color: "#fff" }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MARKETPLACE ── */}
      <section id="marketplace" style={{ padding: "120px 24px", background: "rgba(255,255,255,.015)", borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger} style={{ textAlign: "center", marginBottom: 64 }}>
            <motion.span variants={fadeUp} className="lp-tag" style={{ background: "rgba(245,158,11,.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,.2)" }}>
              Live Marketplace
            </motion.span>
            <motion.h2 variants={fadeUp} className="lp-title" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)", marginBottom: 16 }}>
              {t("freshProduce")} <span className="lp-gt-gold">{t("aiQualityGraded")}</span>
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, maxWidth: 480, margin: "0 auto", color: "#64748b", lineHeight: 1.65 }}>
              {t("everyProductIsAiVerifiedFarmCe")}
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={staggerSlow}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 18, marginBottom: 48 }}>
            {PRODUCTS.map((p, i) => <ProductCard key={i} {...p} />)}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ textAlign: "center" }}>
            <Link href="/signup?role=consumer" className="lp-btn-s" style={{ textDecoration: "none" }}>
              {t("exploreFullMarketplace")}
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "120px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger} style={{ textAlign: "center", marginBottom: 72 }}>
            <motion.span variants={fadeUp} className="lp-tag" style={{ background: "rgba(168,85,247,.1)", color: "#c084fc", border: "1px solid rgba(168,85,247,.2)" }}>
              Testimonials
            </motion.span>
            <motion.h2 variants={fadeUp} className="lp-title" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)", marginBottom: 16 }}>
              Trusted by <span className="lp-gt">{t("str_12400Farmers")}</span>
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={staggerSlow}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
            {TESTIMONIALS.map((tm, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{ padding: 36, borderRadius: 28, display: "flex", flexDirection: "column", gap: 20, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 4px 20px rgba(0,0,0,.2)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 20, right: 24, fontSize: 80, lineHeight: 1, color: "rgba(255,255,255,.04)", fontFamily: "Georgia,serif", fontWeight: 900, userSelect: "none" }}>"</div>
                <div style={{ display: "flex", gap: 3 }}>
                  {[...Array(5)].map((_, s) => <Star key={s} style={{ width: 15, height: 15, fill: "#fbbf24", color: "#fbbf24" }} />)}
                </div>
                <p style={{ fontSize: 14.5, lineHeight: 1.75, color: "#94a3b8", flex: 1, fontStyle: "italic", position: "relative", zIndex: 1 }}>"{tm.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.07)" }}>
                  <div style={{ width: 46, height: 46, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff", flexShrink: 0, background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 12px rgba(16,185,129,.35)" }}>
                    {tm.avatar}
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 14, color: "#f1f5f9", marginBottom: 2 }}>{tm.name}</p>
                    <p style={{ fontSize: 12, color: "#475569" }}>{tm.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "120px 24px", background: "rgba(255,255,255,.015)", borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={stagger} style={{ textAlign: "center", marginBottom: 64 }}>
            <motion.span variants={fadeUp} className="lp-tag" style={{ background: "rgba(6,182,212,.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,.2)" }}>
              {t("faq")}
            </motion.span>
            <motion.h2 variants={fadeUp} className="lp-title" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)", marginBottom: 12 }}>
              {t("frequently")} <span className="lp-gt">{t("asked")}</span>
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={staggerSlow}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQ_ITEMS.map((item, i) => <FAQItem key={i} item={item} />)}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "120px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            style={{ position: "relative", borderRadius: 40, overflow: "hidden", padding: "80px 48px", textAlign: "center", background: "linear-gradient(135deg,rgba(16,185,129,.07),rgba(37,99,235,.05))", border: "1px solid rgba(16,185,129,.15)", boxShadow: "0 32px 80px rgba(0,0,0,.3)" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 350, height: 350, pointerEvents: "none", background: "radial-gradient(circle,rgba(16,185,129,.14)0%,transparent 70%)", filter: "blur(50px)" }} />
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 280, height: 280, pointerEvents: "none", background: "radial-gradient(circle,rgba(37,99,235,.1)0%,transparent 70%)", filter: "blur(50px)" }} />
            <div className="lp-grid" style={{ position: "absolute", inset: 0, opacity: .25, pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 10 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", padding: "7px 20px", borderRadius: 100, background: "rgba(16,185,129,.1)", color: "#10b981", border: "1px solid rgba(16,185,129,.22)" }}>
                  <Sparkles style={{ width: 13, height: 13 }} />Join AgriNex AI Today
                </span>
              </div>
              <h2 className="lp-title" style={{ fontSize: "clamp(2rem,5vw,3.5rem)", color: "#f8fafc", marginBottom: 16 }}>
                Ready to Transform<br /><span className="lp-gt">Indian Agriculture?</span>
              </h2>
              <p style={{ fontSize: 16, maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.7, color: "#64748b" }}>
                Join 12,400+ farmers and a fast-growing network of conscious consumers. Fresh food, fair prices, AI-powered efficiency.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, marginBottom: 48 }}>
                {["Free to register", "No middlemen", "AI quality assured", "GPS tracking", "10+ languages"].map((pt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>
                    <Check style={{ width: 15, height: 15, color: "#10b981" }} />{pt}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
                <Link href="/signup" className="no-underline group">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 40px", borderRadius: 18, fontWeight: 800, fontSize: 15, background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", boxShadow: "0 8px 36px rgba(16,185,129,.45)" }}>
                    <Zap style={{ width: 18, height: 18 }} />
                    {t("getStartedFree")}
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </motion.div>
                </Link>
                <Link href="/signin" className="no-underline">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 40px", borderRadius: 18, fontWeight: 700, fontSize: 15, background: "rgba(255,255,255,.06)", color: "#f1f5f9", border: "1px solid rgba(255,255,255,.13)", backdropFilter: "blur(12px)" }}>
                    Sign In to Dashboard
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#04080f", borderTop: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 40px" }}>
          <div className="lp-footer-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "40px 56px", marginBottom: 64 }}>
            {/* Brand */}
            <div className="lp-footer-brand">
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 16px rgba(16,185,129,.35)" }}>
                  <Leaf style={{ width: 20, height: 20, color: "#fff" }} />
                </div>
                <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 20, color: "#f8fafc" }}>
                  Agri<span className="lp-gt">Nex</span>{" "}
                  <span style={{ color: "#334155", fontSize: 11, fontWeight: 500 }}>{t("aiPlatform")}</span>
                </span>
              </Link>
              <p style={{ fontSize: 14, lineHeight: 1.75, maxWidth: 320, color: "#475569", marginBottom: 28 }}>
                {t("empoweringIndiaSFarmersWithArt1")}
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[{ label: "Gemini AI", color: "#4285f4" }, { label: "Next.js", color: "#718096" }, { label: "Supabase", color: "#3ecf8e" }].map((tech, i) => (
                  <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 8, background: "rgba(255,255,255,.05)", color: tech.color, border: `1px solid ${tech.color}30` }}>
                    {tech.label}
                  </span>
                ))}
              </div>
            </div>
            {/* Platform */}
            <div>
              <h4 style={{ fontWeight: 800, fontSize: 12, marginBottom: 24, color: "#94a3b8", letterSpacing: ".1em", textTransform: "uppercase" }}>Platform</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[["Farmer Portal", "/signin?role=farmer"], ["Consumer Marketplace", "/signin?role=consumer"], ["Register as Farmer", "/signup?role=farmer"], ["Register as Consumer", "/signup?role=consumer"]].map(([label, href], i) => (
                  <Link key={i} href={href} style={{ fontSize: 14, color: "#475569", textDecoration: "none", transition: "color .2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#10b981")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            {/* Features */}
            <div>
              <h4 style={{ fontWeight: 800, fontSize: 12, marginBottom: 24, color: "#94a3b8", letterSpacing: ".1em", textTransform: "uppercase" }}>{t("features")}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[["AI Crop Grading", "#"], ["Smart Pricing", "#"], ["GPS Delivery", "#"], ["Market Analytics", "#"], ["Multi-language Support", "#"]].map(([label, href], i) => (
                  <Link key={i} href={href} style={{ fontSize: 14, color: "#475569", textDecoration: "none", transition: "color .2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#10b981")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {/* Bottom */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,.06)" }}>
            <p style={{ fontSize: 13, color: "#334155" }}>© {new Date().getFullYear()} AgriNex AI Platform. All rights reserved.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#334155" }}>
              <Shield style={{ width: 14, height: 14, color: "#10b981" }} />
              {t("builtForIndiaSAgriculturalTran1")}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}