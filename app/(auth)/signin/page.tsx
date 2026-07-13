"use client";
import { useTranslation } from "@/hooks/useTranslation";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Leaf, Eye, EyeOff, Loader2, Mail, Lock, AlertCircle,
  CheckCircle, ArrowRight, RefreshCw, Sparkles, BarChart2,
  ShoppingBag, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Feature highlights for left panel ───────────────────────────────────────
const FEATURES = [
  { icon: "🌾", title: "Direct Farm to Consumer",  desc: "Zero middlemen, maximum value" },
  { icon: "🤖", title: "AI-Powered Agriculture",    desc: "Smart crop grading & insights" },
  { icon: "📈", title: "Real-Time Market Analytics",desc: "Live pricing & demand trends" },
  { icon: "🌱", title: "Sustainable Farming",        desc: "Eco-friendly supply chain" },
];

// ─── Floating orb config ──────────────────────────────────────────────────────
const ORBS = [
  { w: 380, h: 380, top: "-15%",  left: "-12%", color: "rgba(16,185,129,0.12)", dur: 14 },
  { w: 280, h: 280, bottom: "-8%",right: "-8%", color: "rgba(20,184,166,0.10)", dur: 18 },
  { w: 180, h: 180, top: "35%",   right: "8%",  color: "rgba(16,185,129,0.07)", dur: 22 },
];

export default function SignInPage() {
  const { t } = useTranslation();
  const router  = useRouter();

  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [showPassword,  setShowPassword]  = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [success,       setSuccess]       = useState("");
  const [urlRole,       setUrlRole]       = useState<"farmer" | "consumer" | null>(null);
  const [showResend,    setShowResend]    = useState(false);
  const [resendCooldown,setResendCooldown]= useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [focusedField,  setFocusedField]  = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("registered") === "true") {
        setSuccess("Verification email sent. Please verify your email before signing in.");
      } else if (searchParams.get("registered") === "demo") {
        setSuccess("Account created successfully! You can sign in immediately.");
      }
      const errParam = searchParams.get("error");
      if (errParam) {
        setError(errParam);
        if (errParam.toLowerCase().includes("verify your email")) setShowResend(true);
      }
      const r = searchParams.get("role");
      if (r === "farmer" || r === "consumer") setUrlRole(r);
    }
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || !email) return;
    setResendLoading(true);
    setError("");
    setSuccess("");
    try {
      const siteUrl = window.location.origin;
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: `${siteUrl}/auth/callback` },
      });
      if (resendError) throw resendError;
      setSuccess("Verification email resent successfully! Check your inbox.");
      setResendCooldown(60);
    } catch (err: any) {
      setError(err?.message || "Failed to resend verification email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setShowResend(false);

    const DEMO_MODE = true; // College demo mode

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        if (
          signInError.message.includes("Invalid login credentials") ||
          signInError.message.includes("invalid_credentials")
        ) {
          throw new Error("Incorrect email or password. Please verify and try again.");
        }
        if (!DEMO_MODE && (
          signInError.message.toLowerCase().includes("email not confirmed") ||
          signInError.message.toLowerCase().includes("email not verified")
        )) {
          setShowResend(true);
          throw new Error("Please verify your email before signing in.");
        }
        throw signInError;
      }

      const session = signInData.session;
      const user    = signInData.user;

      if (!session || !user) {
        throw new Error("Login succeeded but session creation failed. Please try again.");
      }

      if (!user.email_confirmed_at && !DEMO_MODE) {
        await supabase.auth.signOut();
        setShowResend(true);
        throw new Error("Please verify your email before signing in.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle() as { data: { role: string } | null; error: any };

      if (profileError) console.error("[signin] Profile error:", profileError.message);

      router.refresh();
      if (!profile)                    router.push("/onboarding");
      else if (profile.role === "farmer")   router.push("/farmer/dashboard");
      else if (profile.role === "consumer") router.push("/consumer/marketplace");
      else if (profile.role === "admin")    router.push("/admin");
      else                                  router.push("/onboarding");
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      const isNetworkError =
        msg.toLowerCase().includes("failed to fetch") ||
        msg.toLowerCase().includes("networkerror") ||
        msg.toLowerCase().includes("load failed") ||
        msg.toLowerCase().includes("network request failed");
      setError(isNetworkError
        ? "Unable to connect. Please check your internet connection and try again."
        : msg || "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .si-root {
          min-height: 100vh;
          display: flex;
          background: #030d08;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .si-left {
          width: 42%;
          min-height: 100vh;
          background: linear-gradient(160deg, #071b12 0%, #030d08 50%, #051410 100%);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 48px;
          overflow: hidden;
          border-right: 1px solid rgba(16,185,129,0.08);
        }
        .si-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 20% 40%, rgba(16,185,129,0.09) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── RIGHT PANEL ── */
        .si-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
          background: linear-gradient(160deg, #030d08 0%, #050f0a 60%, #030d08 100%);
          position: relative;
          overflow: hidden;
        }

        /* ── GLASS CARD ── */
        .si-card {
          width: 100%;
          max-width: 480px;
          background: rgba(10, 22, 16, 0.60);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 28px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(16,185,129,0.04) inset;
          padding: 48px 44px;
          position: relative;
          z-index: 10;
        }

        /* ── INPUTS ── */
        .si-input-wrap {
          position: relative;
          width: 100%;
        }
        .si-input {
          width: 100%;
          height: 52px;
          border-radius: 14px;
          background: rgba(255,255,255,0.035);
          border: 1.5px solid rgba(255,255,255,0.08);
          color: #f1f5f9;
          padding-left: 48px;
          padding-right: 16px;
          font-size: 14.5px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          letter-spacing: 0.01em;
          transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
          outline: none;
        }
        .si-input:hover {
          border-color: rgba(16,185,129,0.22);
          background: rgba(255,255,255,0.05);
        }
        .si-input:focus {
          background: rgba(16,185,129,0.06);
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.14), 0 4px 20px rgba(16,185,129,0.08);
        }
        .si-input::placeholder { color: rgba(148,163,184,0.5); }
        .si-input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #475569;
          pointer-events: none;
          transition: color 0.2s;
          width: 18px;
          height: 18px;
        }
        .si-input:focus ~ .si-input-icon,
        .si-input-wrap:focus-within .si-input-icon { color: #10b981; }

        /* ── PRIMARY BUTTON ── */
        .si-btn {
          width: 100%;
          height: 52px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.02em;
          color: #ffffff;
          background: linear-gradient(135deg, #10b981 0%, #059669 60%, #047857 100%);
          box-shadow: 0 4px 24px rgba(16,185,129,0.35), 0 1px 0 rgba(255,255,255,0.1) inset;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          overflow: hidden;
        }
        .si-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          border-radius: inherit;
        }
        .si-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(16,185,129,0.50), 0 1px 0 rgba(255,255,255,0.1) inset;
          background: linear-gradient(135deg, #0fca8e 0%, #10b981 60%, #059669 100%);
        }
        .si-btn:active:not(:disabled) {
          transform: translateY(0px);
          box-shadow: 0 4px 16px rgba(16,185,129,0.30);
        }
        .si-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }

        /* ── GHOST BUTTON ── */
        .si-btn-ghost {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 13px;
          color: #34d399;
          background: rgba(16,185,129,0.06);
          border: 1px solid rgba(16,185,129,0.18);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: all 0.2s ease;
        }
        .si-btn-ghost:hover:not(:disabled) {
          background: rgba(16,185,129,0.12);
          border-color: rgba(16,185,129,0.32);
        }
        .si-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── ALERTS ── */
        .si-alert-err {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.20);
          color: #fca5a5;
          border-radius: 13px;
          padding: 13px 16px;
          font-size: 13.5px;
          line-height: 1.55;
          font-weight: 500;
        }
        .si-alert-succ {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.22);
          color: #a7f3d0;
          border-radius: 13px;
          padding: 13px 16px;
          font-size: 13.5px;
          line-height: 1.55;
          font-weight: 500;
        }

        /* ── LABEL ── */
        .si-label {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          margin-bottom: 7px;
          display: block;
        }

        /* ── ORB ── */
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(6px, -8px) scale(1.02); }
          66%       { transform: translate(-4px, 6px) scale(0.98); }
        }
        .si-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          pointer-events: none;
          animation: floatOrb var(--dur, 14s) ease-in-out infinite;
        }

        /* ── FEATURE CARD ── */
        .si-feature {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 14px 18px;
          transition: all 0.25s ease;
        }
        .si-feature:hover {
          background: rgba(16,185,129,0.06);
          border-color: rgba(16,185,129,0.15);
          transform: translateX(4px);
        }
        .si-feature-icon {
          font-size: 22px;
          min-width: 28px;
        }
        .si-feature-title {
          font-size: 13px;
          font-weight: 700;
          color: #e2e8f0;
          line-height: 1.3;
        }
        .si-feature-desc {
          font-size: 11.5px;
          color: #64748b;
          margin-top: 1px;
          line-height: 1.4;
        }

        /* ── DIVIDER ── */
        .si-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }
        .si-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
        .si-divider-text { font-size: 11px; color: #475569; font-weight: 500; }

        /* ── CHECKBOX ── */
        .si-check {
          width: 16px;
          height: 16px;
          border-radius: 5px;
          border: 1.5px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          accent-color: #10b981;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .si-left { display: none; }
          .si-right { padding: 24px 16px; }
          .si-card { padding: 36px 28px; }
        }
        @media (max-width: 480px) {
          .si-card { padding: 28px 20px; border-radius: 20px; }
        }

        /* ── GRID BACKGROUND ── */
        .si-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        .si-stat-dot { animation: pulse-slow 2.4s ease-in-out infinite; }
      `}</style>

      <div className="si-root">
        {/* ══════════════════ LEFT BRANDING PANEL ══════════════════ */}
        <div className="si-left">
          {/* Orbs */}
          {ORBS.map((o, i) => (
            <div key={i} className="si-orb" style={{
              width: o.w, height: o.h,
              top: o.top, bottom: (o as any).bottom,
              left: o.left, right: (o as any).right,
              background: o.color,
              "--dur": `${o.dur}s`,
            } as any} />
          ))}

          {/* Grid overlay */}
          <div className="si-grid" />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48, position: "relative", zIndex: 2 }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              background: "linear-gradient(135deg, #10b981, #047857)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
            }}>
              <Leaf size={22} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, color: "#fff", letterSpacing: "-0.02em" }}>
              Agri<span style={{ color: "#10b981" }}>Nex</span>
            </span>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ position: "relative", zIndex: 2, marginBottom: 40 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 100, padding: "5px 14px", marginBottom: 20,
            }}>
              <Sparkles size={13} color="#10b981" />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#10b981", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                AI-Powered Platform
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 38, fontWeight: 900,
              color: "#fff", lineHeight: 1.15,
              letterSpacing: "-0.03em",
              margin: "0 0 14px 0",
            }}>
              Smarter Farming<br />
              <span style={{
                background: "linear-gradient(135deg, #10b981, #34d399)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>Starts Here</span>
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65, margin: 0, maxWidth: 320 }}>
              Connect directly with farmers, leverage AI insights, and transform how agriculture works.
            </p>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative", zIndex: 2 }}
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                className="si-feature"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
              >
                <span className="si-feature-icon">{f.icon}</span>
                <div>
                  <div className="si-feature-title">{f.title}</div>
                  <div className="si-feature-desc">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            style={{
              display: "flex", gap: 28, marginTop: 44,
              position: "relative", zIndex: 2,
              paddingTop: 28,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {[
              { val: "50K+", label: "Farmers" },
              { val: "₹2Cr+", label: "Trades Daily" },
              { val: "98%",  label: "Satisfaction" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981", fontFamily: "'Outfit',sans-serif" }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ══════════════════ RIGHT AUTH PANEL ══════════════════ */}
        <div className="si-right">
          {/* Background orbs for right panel */}
          <div style={{
            position: "absolute", width: 320, height: 320,
            top: "-8%", right: "-8%", borderRadius: "50%",
            background: "rgba(16,185,129,0.06)", filter: "blur(80px)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", width: 240, height: 240,
            bottom: "-6%", left: "-6%", borderRadius: "50%",
            background: "rgba(20,184,166,0.05)", filter: "blur(70px)", pointerEvents: "none",
          }} />

          <motion.div
            className="si-card"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.1 }}
          >
            {/* Card header */}
            <div style={{ marginBottom: 32 }}>
              {/* Mobile logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }} className="si-mobile-logo">
                <div style={{
                  width: 38, height: 38, borderRadius: 11,
                  background: "linear-gradient(135deg, #10b981, #047857)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 6px 18px rgba(16,185,129,0.3)",
                }}>
                  <Leaf size={19} color="#fff" />
                </div>
                <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 22, color: "#fff" }}>
                  Agri<span style={{ color: "#10b981" }}>Nex</span>
                </span>
              </div>

              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 28, fontWeight: 800,
                color: "#f1f5f9", margin: "0 0 8px 0",
                letterSpacing: "-0.02em", lineHeight: 1.2,
              }}>
                {urlRole === "farmer" ? "Farmer Sign In 🌾"
                  : urlRole === "consumer" ? "Consumer Sign In 🛒"
                  : "Welcome Back 👋"}
              </h2>
              <p style={{ fontSize: 13.5, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                {urlRole === "farmer"
                  ? "Access your crop dashboard & AI grading tools."
                  : urlRole === "consumer"
                  ? "Buy fresh agricultural products at wholesale prices."
                  : "Sign in to continue your AgriNex journey."}
              </p>

              {urlRole && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  marginTop: 12, background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.18)",
                  borderRadius: 100, padding: "4px 12px",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {urlRole === "farmer" ? "🌾 Farmer Portal" : "🛒 Consumer Platform"}
                  </span>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Email */}
              <div>
                <label className="si-label" htmlFor="email">{t("emailAddress")}</label>
                <div className="si-input-wrap">
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="si-input"
                    autoComplete="email"
                    required
                    style={{ paddingRight: 16 }}
                  />
                  <Mail
                    size={18}
                    className="si-input-icon"
                    style={{ color: focusedField === "email" ? "#10b981" : "#475569" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="si-label" htmlFor="password">Password</label>
                <div className="si-input-wrap">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="si-input"
                    autoComplete="current-password"
                    required
                    style={{ paddingRight: 48 }}
                  />
                  <Lock
                    size={18}
                    className="si-input-icon"
                    style={{ color: focusedField === "password" ? "#10b981" : "#475569" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "#64748b", padding: 4, display: "flex", alignItems: "center",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" id="remember-me" className="si-check" />
                <label htmlFor="remember-me" style={{ fontSize: 13, color: "#64748b", cursor: "pointer", userSelect: "none" }}>
                  Keep me signed in
                </label>
              </div>

              {/* Success alert */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    className="si-alert-succ"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                  >
                    <CheckCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <div className="si-alert-err">
                      <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{error}</span>
                    </div>
                    {showResend && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendLoading || resendCooldown > 0}
                        className="si-btn-ghost"
                      >
                        {resendLoading ? (
                          <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Resending...</>
                        ) : resendCooldown > 0 ? (
                          <><RefreshCw size={14} /> Resend in {resendCooldown}s</>
                        ) : (
                          <><RefreshCw size={14} /> Resend Verification Email</>
                        )}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="si-btn"
                style={{ marginTop: 4 }}
              >
                {loading ? (
                  <>
                    <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} />
                    {t("authenticating")}
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Footer link */}
            <div style={{ marginTop: 28, textAlign: "center" }}>
              <div className="si-divider" style={{ marginBottom: 18 }}>
                <div className="si-divider-line" />
                <span className="si-divider-text">New to AgriNex?</span>
                <div className="si-divider-line" />
              </div>
              <Link
                href={`/signup${urlRole ? `?role=${urlRole}` : ""}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 14, fontWeight: 700,
                  color: "#10b981",
                  textDecoration: "none",
                  padding: "10px 24px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(16,185,129,0.22)",
                  background: "rgba(16,185,129,0.05)",
                  transition: "all 0.2s ease",
                  width: "100%", justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(16,185,129,0.12)";
                  e.currentTarget.style.borderColor = "rgba(16,185,129,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(16,185,129,0.05)";
                  e.currentTarget.style.borderColor = "rgba(16,185,129,0.22)";
                }}
              >
                {t("createAFreeAccount")}
                <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 901px) { .si-mobile-logo { display: none !important; } }
      `}</style>
    </>
  );
}