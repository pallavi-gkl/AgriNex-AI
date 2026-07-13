"use client";
import { useTranslation } from "@/hooks/useTranslation";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Leaf, User, Mail, Phone, Lock, Eye, EyeOff,
  Loader2, AlertCircle, ArrowRight, Sparkles, Shield,
  Zap, Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Password strength helper ─────────────────────────────────────────────────
function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: "", color: "#1e293b" };
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: "Weak",   color: "#ef4444" };
  if (score <= 2) return { score, label: "Fair",   color: "#f97316" };
  if (score <= 3) return { score, label: "Good",   color: "#eab308" };
  if (score <= 4) return { score, label: "Strong", color: "#10b981" };
  return              { score, label: "Very Strong", color: "#34d399" };
}

// ─── Left panel features ──────────────────────────────────────────────────────
const FEATURES = [
  { icon: <Shield size={16} />,   title: "Verified Farmer Network",    desc: "Every seller is KYC-verified" },
  { icon: <Zap size={16} />,      title: "Instant Account Setup",      desc: "Start trading in minutes" },
  { icon: <Globe size={16} />,    title: "Pan-India Reach",            desc: "Connect across all states" },
  { icon: <Sparkles size={16} />, title: "AI Quality Grading",         desc: "Smart produce analytics" },
];

const ORBS = [
  { w: 350, h: 350, top: "-10%", left: "-15%", color: "rgba(16,185,129,0.11)", dur: 16 },
  { w: 260, h: 260, bottom: "-8%", right: "-8%", color: "rgba(20,184,166,0.09)", dur: 20 },
  { w: 160, h: 160, top: "45%", right: "5%", color: "rgba(16,185,129,0.06)", dur: 24 },
];

export default function SignUpPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [fullName,     setFullName]     = useState("");
  const [email,        setEmail]        = useState("");
  const [phone,        setPhone]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role,         setRole]         = useState<"farmer" | "consumer">("farmer");
  const [urlRole,      setUrlRole]      = useState<"farmer" | "consumer" | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [fieldErrors,  setFieldErrors]  = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const pwdStrength = getPasswordStrength(password);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const r = searchParams.get("role");
      if (r === "consumer" || r === "farmer") {
        setRole(r);
        setUrlRole(r);
      }
    }
  }, []);

  // Clear any stale session so a previous user's token is never injected
  // into the signup fetch call, which would trigger "invalid header value".
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) supabase.auth.signOut().catch(() => {});
    });
  }, []);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!fullName.trim())         errs.fullName = "Full name is required";
    if (!email.includes("@"))     errs.email    = "Enter a valid email address";
    if (password.length < 6)      errs.password = "Password must be at least 6 characters";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          full_name:    fullName.trim(),
          phone_number: phone.trim() || "0000000000",
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("An account with this email already exists. Please sign in instead.");
        }
        throw new Error(data.error || "Registration failed. Please check details and try again.");
      }

      // router.push(`/check-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      router.push(`/signin?registered=demo`);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (fieldKey?: string): React.CSSProperties => ({
    width: "100%",
    height: 52,
    borderRadius: 14,
    background: fieldErrors[fieldKey || ""] ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.035)",
    border: `1.5px solid ${
      fieldErrors[fieldKey || ""]
        ? "rgba(239,68,68,0.35)"
        : focusedField === fieldKey
        ? "#10b981"
        : "rgba(255,255,255,0.08)"
    }`,
    color: "#f1f5f9",
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 14.5,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    letterSpacing: "0.01em",
    transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
    outline: "none",
    boxShadow: focusedField === fieldKey
      ? "0 0 0 3px rgba(16,185,129,0.14), 0 4px 20px rgba(16,185,129,0.08)"
      : fieldErrors[fieldKey || ""]
      ? "0 0 0 3px rgba(239,68,68,0.10)"
      : "none",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .su-root {
          min-height: 100vh;
          display: flex;
          background: #030d08;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }
        .su-left {
          width: 38%;
          min-height: 100vh;
          background: linear-gradient(160deg, #071b12 0%, #030d08 50%, #051410 100%);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 44px;
          overflow: hidden;
          border-right: 1px solid rgba(16,185,129,0.08);
        }
        .su-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 20% 40%, rgba(16,185,129,0.09) 0%, transparent 70%);
          pointer-events: none;
        }
        .su-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 32px;
          background: linear-gradient(160deg, #030d08 0%, #050f0a 60%, #030d08 100%);
          position: relative;
          overflow-y: auto;
        }
        .su-card {
          width: 100%;
          max-width: 500px;
          background: rgba(10,22,16,0.60);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 28px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(16,185,129,0.04) inset;
          padding: 44px 44px;
          position: relative;
          z-index: 10;
          margin: 24px 0;
        }
        .su-label {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          margin-bottom: 7px;
          display: block;
        }
        .su-field-err {
          font-size: 11px;
          color: #f87171;
          font-weight: 600;
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .su-btn {
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
        .su-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          border-radius: inherit;
        }
        .su-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(16,185,129,0.50), 0 1px 0 rgba(255,255,255,0.1) inset;
        }
        .su-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 16px rgba(16,185,129,0.30);
        }
        .su-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }
        .su-role-btn {
          flex: 1;
          height: 52px;
          border: none;
          border-radius: 13px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: all 0.28s cubic-bezier(0.4,0,0.2,1);
          letter-spacing: 0.01em;
        }
        .su-alert-err {
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
        .su-feature {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 16px;
          border-radius: 13px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.25s ease;
        }
        .su-feature:hover {
          background: rgba(16,185,129,0.06);
          border-color: rgba(16,185,129,0.15);
          transform: translateX(4px);
        }
        .su-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          pointer-events: none;
        }
        .su-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%  { transform: translate(6px, -8px) scale(1.02); }
          66%  { transform: translate(-4px,  6px) scale(0.98); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pwdBar {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @media (max-width: 960px) {
          .su-left { display: none; }
          .su-right { padding: 20px 16px; }
          .su-card  { padding: 32px 24px; }
        }
        @media (max-width: 480px) {
          .su-card { padding: 24px 16px; border-radius: 20px; }
        }
        @media (min-width: 961px) {
          .su-mobile-logo { display: none !important; }
        }
      `}</style>

      <div className="su-root">
        {/* ══ LEFT PANEL ══ */}
        <div className="su-left">
          {ORBS.map((o, i) => (
            <div key={i} className="su-orb" style={{
              width: o.w, height: o.h,
              top: o.top, bottom: (o as any).bottom,
              left: o.left, right: (o as any).right,
              background: o.color,
              animation: `floatOrb ${o.dur}s ease-in-out infinite`,
            }} />
          ))}
          <div className="su-grid" />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 44, position: "relative", zIndex: 2 }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              background: "linear-gradient(135deg, #10b981, #047857)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
            }}>
              <Leaf size={22} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 26, color: "#fff", letterSpacing: "-0.02em" }}>
              Agri<span style={{ color: "#10b981" }}>Nex</span>
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ position: "relative", zIndex: 2, marginBottom: 36 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 100, padding: "5px 14px", marginBottom: 18,
            }}>
              <Sparkles size={13} color="#10b981" />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#10b981", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Join 50,000+ Farmers
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Outfit',sans-serif",
              fontSize: 36, fontWeight: 900, color: "#fff",
              lineHeight: 1.15, letterSpacing: "-0.03em",
              margin: "0 0 14px 0",
            }}>
              Grow Smarter,<br />
              <span style={{
                background: "linear-gradient(135deg, #10b981, #34d399)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>Earn Better</span>
            </h1>
            <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.65, margin: 0, maxWidth: 300 }}>
              Create your free account and join India's most trusted agricultural marketplace.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            style={{ display: "flex", flexDirection: "column", gap: 9, position: "relative", zIndex: 2 }}
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                className="su-feature"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#10b981",
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3 }}>{f.title}</div>
                  <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2, lineHeight: 1.4 }}>{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            style={{
              marginTop: 36, position: "relative", zIndex: 2,
              background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)",
              borderRadius: 14, padding: "16px 18px",
            }}
          >
            <p style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 10px 0", fontStyle: "italic" }}>
              "AgriNex tripled my income by connecting me directly with buyers. The AI grading is incredible."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff",
              }}>R</div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#e2e8f0" }}>Rajesh Kumar</div>
                <div style={{ fontSize: 10.5, color: "#64748b" }}>Farmer, Maharashtra</div>
              </div>
              <div style={{ marginLeft: "auto", color: "#f59e0b", fontSize: 11 }}>★★★★★</div>
            </div>
          </motion.div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="su-right">
          <div style={{
            position: "absolute", width: 300, height: 300,
            top: "-6%", right: "-6%", borderRadius: "50%",
            background: "rgba(16,185,129,0.06)", filter: "blur(80px)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", width: 220, height: 220,
            bottom: "-5%", left: "-5%", borderRadius: "50%",
            background: "rgba(20,184,166,0.05)", filter: "blur(70px)", pointerEvents: "none",
          }} />

          <motion.div
            className="su-card"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.1 }}
          >
            {/* Mobile logo */}
            <div className="su-mobile-logo" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 11,
                background: "linear-gradient(135deg, #10b981, #047857)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Leaf size={18} color="#fff" />
              </div>
              <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 20, color: "#fff" }}>
                Agri<span style={{ color: "#10b981" }}>Nex</span>
              </span>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{
                fontFamily: "'Outfit',sans-serif",
                fontSize: 26, fontWeight: 800, color: "#f1f5f9",
                margin: "0 0 8px 0", letterSpacing: "-0.02em", lineHeight: 1.2,
              }}>
                {t("createAnAccount")} ✨
              </h2>
              <p style={{ fontSize: 13.5, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                Join the direct agricultural network and leverage smart tools.
              </p>
            </div>

            {/* Role Selector */}
            <div style={{
              display: "flex", gap: 6,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16, padding: 5,
              marginBottom: 24,
            }}>
              {(["farmer", "consumer"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="su-role-btn"
                  style={{
                    color: role === r ? "#fff" : "#64748b",
                    background: role === r
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "transparent",
                    boxShadow: role === r ? "0 4px 14px rgba(16,185,129,0.28)" : "none",
                    border: "none",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{r === "farmer" ? "🌾" : "🛒"}</span>
                  <span>{r === "farmer" ? "Farmer Portal" : "Consumer Shop"}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Full Name */}
              <div>
                <label className="su-label">{t("fullName")}</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Rajesh Kumar"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); if (fieldErrors.fullName) setFieldErrors(p => ({ ...p, fullName: "" })); }}
                    onFocus={() => setFocusedField("fullName")}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle("fullName"), paddingRight: 16 }}
                    autoComplete="name"
                    required
                  />
                  <User size={18} style={{
                    position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)",
                    color: focusedField === "fullName" ? "#10b981" : "#475569",
                    pointerEvents: "none", transition: "color 0.2s",
                  }} />
                </div>
                {fieldErrors.fullName && (
                  <div className="su-field-err">
                    <AlertCircle size={11} /> {fieldErrors.fullName}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="su-label">{t("emailAddress")}</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: "" })); }}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle("email"), paddingRight: 16 }}
                    autoComplete="email"
                    required
                  />
                  <Mail size={18} style={{
                    position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)",
                    color: focusedField === "email" ? "#10b981" : "#475569",
                    pointerEvents: "none", transition: "color 0.2s",
                  }} />
                </div>
                {fieldErrors.email && (
                  <div className="su-field-err">
                    <AlertCircle size={11} /> {fieldErrors.email}
                  </div>
                )}
              </div>

              {/* Phone (optional) */}
              <div>
                <label className="su-label">
                  Phone Number{" "}
                  <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#475569" }}>
                    ({t("optional")})
                  </span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle("phone"), paddingRight: 16 }}
                    autoComplete="tel"
                  />
                  <Phone size={18} style={{
                    position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)",
                    color: focusedField === "phone" ? "#10b981" : "#475569",
                    pointerEvents: "none", transition: "color 0.2s",
                  }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="su-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: "" })); }}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle("password"), paddingRight: 48 }}
                    autoComplete="new-password"
                    required
                  />
                  <Lock size={18} style={{
                    position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)",
                    color: focusedField === "password" ? "#10b981" : "#475569",
                    pointerEvents: "none", transition: "color 0.2s",
                  }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
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
                {fieldErrors.password && (
                  <div className="su-field-err"><AlertCircle size={11} /> {fieldErrors.password}</div>
                )}
                {/* Password strength indicator */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: 10 }}
                  >
                    <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 10,
                          background: i <= pwdStrength.score ? pwdStrength.color : "rgba(255,255,255,0.07)",
                          transition: "background 0.3s ease",
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: pwdStrength.color }}>
                      {pwdStrength.label} password
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Error alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="su-alert-err"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                  >
                    <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>
                      {error}
                      {error.toLowerCase().includes("already exists") && (
                        <Link
                          href={`/signin${urlRole ? `?role=${urlRole}` : ""}`}
                          style={{ marginLeft: 6, color: "#34d399", fontWeight: 700, textDecoration: "underline" }}
                        >
                          Sign In →
                        </Link>
                      )}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="su-btn"
                style={{ marginTop: 4 }}
              >
                {loading ? (
                  <>
                    <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} />
                    {t("creatingAccount")}
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                Already have an account?{" "}
                <Link
                  href={`/signin${urlRole ? `?role=${urlRole}` : ""}`}
                  style={{
                    color: "#10b981", fontWeight: 700, textDecoration: "none",
                    borderBottom: "1px solid rgba(16,185,129,0.3)",
                    paddingBottom: 1, transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#34d399";
                    e.currentTarget.style.borderBottomColor = "#34d399";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#10b981";
                    e.currentTarget.style.borderBottomColor = "rgba(16,185,129,0.3)";
                  }}
                >
                  Sign In
                </Link>
              </p>
              <p style={{ fontSize: 11, color: "#334155", margin: "12px 0 0 0", lineHeight: 1.5 }}>
                By creating an account you agree to our{" "}
                <span style={{ color: "#475569", fontWeight: 600 }}>Terms of Service</span> &{" "}
                <span style={{ color: "#475569", fontWeight: 600 }}>Privacy Policy</span>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}