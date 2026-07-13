"use client";
import { useTranslation } from "@/hooks/useTranslation";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Leaf, User, Mail, Phone, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SignUpPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"farmer" | "consumer">("farmer");

  const [urlRole, setUrlRole] = useState<"farmer" | "consumer" | null>(null);

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!email.includes("@")) errs.email = "Enter a valid email address";
    if (password.length < 6) errs.password = "Password must be at least 6 characters";
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
          full_name: fullName.trim(),
          phone_number: phone.trim() || "0000000000",
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error(
            "An account with this email already exists. Please sign in instead."
          );
        }
        throw new Error(
          data.error || "Registration failed. Please check details and try again."
        );
      }

      router.push(`/check-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "radial-gradient(circle at 10% 20%, #03140e 0%, #05080e 100%)",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "'Inter', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@700;800;900&display=swap');
        .auth-input {
          width: 100%;
          height: 48px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: #f8fafc;
          padding-left: 44px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s ease-in-out;
          backdrop-filter: blur(8px);
        }
        .auth-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.06);
          border-color: #10b981;
          box-shadow: 0 0 16px rgba(16, 185, 129, 0.25);
        }
        .auth-input::placeholder {
          color: #475569;
        }
        .auth-btn-p {
          width: 100%;
          height: 48px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 14px;
          color: #ffffff;
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.25s ease;
        }
        .auth-btn-p:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(16, 185, 129, 0.48);
        }
        .auth-btn-p:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .auth-alert-err {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.18);
          color: #fca5a5;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 13px;
          line-height: 1.5;
        }
      `}</style>

      {/* Floating blurred blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: "10s" }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: "15s" }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "rgba(13, 25, 20, 0.45)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.65)",
          padding: "44px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          position: "relative",
          zIndex: 10
        }}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#10b981] to-emerald-600 shadow-[0_8px_24px_rgba(16,185,129,0.3)] transition-transform duration-300 hover:scale-105">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Agri<span className="text-emerald-400">Nex</span>
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">{t("createAnAccount")}</h2>
          <p className="text-slate-400 text-xs text-center leading-relaxed max-w-sm mt-0.5">
            Join the direct agricultural network and leverage smart tools.
          </p>
        </div>

        {/* Role Segmented Controller */}
        <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/5 relative">
          <button
            type="button"
            onClick={() => setRole("farmer")}
            className="flex-1 py-3 text-xs font-bold rounded-xl transition-all relative z-10 cursor-pointer text-center flex items-center justify-center gap-2"
            style={{
              color: role === "farmer" ? "#ffffff" : "#94a3b8",
              background: role === "farmer" ? "linear-gradient(135deg, #10b981, #059669)" : "transparent",
              boxShadow: role === "farmer" ? "0 4px 12px rgba(16,185,129,0.2)" : "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            🌾 Farmer Portal
          </button>
          <button
            type="button"
            onClick={() => setRole("consumer")}
            className="flex-1 py-3 text-xs font-bold rounded-xl transition-all relative z-10 cursor-pointer text-center flex items-center justify-center gap-2"
            style={{
              color: role === "consumer" ? "#ffffff" : "#94a3b8",
              background: role === "consumer" ? "linear-gradient(135deg, #10b981, #059669)" : "transparent",
              boxShadow: role === "consumer" ? "0 4px 12px rgba(16,185,129,0.2)" : "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            🛒 Consumer Shop
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="flex flex-col gap-4" noValidate>
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("fullName")}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Rajesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="auth-input"
                style={{
                  borderColor: fieldErrors.fullName ? "rgba(239, 68, 68, 0.4)" : undefined,
                  boxShadow: fieldErrors.fullName ? "0 0 12px rgba(239, 68, 68, 0.15)" : undefined,
                }}
                autoComplete="name"
                required
              />
            </div>
            {fieldErrors.fullName && <p className="text-red-400 text-[10px] font-semibold mt-0.5">{fieldErrors.fullName}</p>}
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("emailAddress")}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 pointer-events-none" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                style={{
                  borderColor: fieldErrors.email ? "rgba(239, 68, 68, 0.4)" : undefined,
                  boxShadow: fieldErrors.email ? "0 0 12px rgba(239, 68, 68, 0.15)" : undefined,
                }}
                autoComplete="email"
                required
              />
            </div>
            {fieldErrors.email && <p className="text-red-400 text-[10px] font-semibold mt-0.5">{fieldErrors.email}</p>}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Phone Number <span className="text-slate-500 font-normal lowercase">{t("optional")}</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 pointer-events-none" />
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="auth-input"
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                style={{
                  borderColor: fieldErrors.password ? "rgba(239, 68, 68, 0.4)" : undefined,
                  boxShadow: fieldErrors.password ? "0 0 12px rgba(239, 68, 68, 0.15)" : undefined,
                }}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-400 text-[10px] font-semibold mt-0.5">{fieldErrors.password}</p>}
          </div>

          {/* Error message */}
          {error && (
            <div className="auth-alert-err">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>
                {error}
                {error.toLowerCase().includes("already exists") && (
                  <Link href={`/signin${urlRole ? `?role=${urlRole}` : ""}`} className="ml-1 text-emerald-400 hover:underline font-bold">
                    Sign In →
                  </Link>
                )}
              </span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="auth-btn-p mt-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("creatingAccount")}
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Switch link */}
        <p className="text-slate-400 text-xs text-center">
          Already have an account?{" "}
          <Link href={`/signin${urlRole ? `?role=${urlRole}` : ""}`} className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors ml-1">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}