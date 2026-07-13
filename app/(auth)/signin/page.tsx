"use client";
import { useTranslation } from "@/hooks/useTranslation";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Leaf, Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, CheckCircle, ArrowRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function SignInPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [urlRole, setUrlRole] = useState<"farmer" | "consumer" | null>(null);

  const [showResend, setShowResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("registered") === "true") {
        setSuccess("Verification email sent. Please verify your email before signing in.");
      }
      const errParam = searchParams.get("error");
      if (errParam) {
        setError(errParam);
        if (errParam.toLowerCase().includes("verify your email")) {
          setShowResend(true);
        }
      }
      const r = searchParams.get("role");
      if (r === "farmer" || r === "consumer") {
        setUrlRole(r);
      }
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
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
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
          throw new Error(
            "Incorrect email or password. Please verify and try again."
          );
        }
        if (
          signInError.message.toLowerCase().includes("email not confirmed") ||
          signInError.message.toLowerCase().includes("email not verified")
        ) {
          setShowResend(true);
          throw new Error("Please verify your email before signing in.");
        }
        throw signInError;
      }

      const session = signInData.session;
      const user = signInData.user;

      if (!session || !user) {
        throw new Error("Login succeeded but session creation failed. Please try again.");
      }

      if (!user.email_confirmed_at) {
        await supabase.auth.signOut();
        setShowResend(true);
        throw new Error("Please verify your email before signing in.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle() as { data: { role: string } | null; error: any };

      if (profileError) {
        console.error("[signin] Profile error:", profileError.message);
      }

      router.refresh();
      if (!profile) {
        router.push("/onboarding");
      } else if (profile.role === "farmer") {
        router.push("/farmer/dashboard");
      } else if (profile.role === "consumer") {
        router.push("/consumer/marketplace");
      } else if (profile.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      const isNetworkError =
        msg.toLowerCase().includes("failed to fetch") ||
        msg.toLowerCase().includes("networkerror") ||
        msg.toLowerCase().includes("load failed") ||
        msg.toLowerCase().includes("network request failed");
      if (isNetworkError) {
        setError("Unable to connect. Please check your internet connection and try again.");
      } else {
        setError(msg || "Authentication failed. Please try again.");
      }
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
        .auth-btn-ghost {
          width: 100%;
          height: 42px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          color: #34d399;
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .auth-btn-ghost:hover:not(:disabled) {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
        }
        .auth-btn-ghost:disabled {
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
        .auth-alert-succ {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #a7f3d0;
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
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            {urlRole === "farmer" ? "Farmer Sign In" : urlRole === "consumer" ? "Consumer Sign In" : "Welcome Back"}
          </h2>
          <p className="text-slate-400 text-xs text-center leading-relaxed max-w-sm mt-0.5">
            {urlRole === "farmer"
              ? "Sign in to access your crop dashboard & AI grading tools."
              : urlRole === "consumer"
              ? "Sign in to buy fresh agricultural crops at wholesale prices."
              : "Enter credentials to manage listings or browse fresh marketplace produce."}
          </p>
          {urlRole && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-2">
              {urlRole === "farmer" ? "🌾 Farmer Portal" : "🛒 Consumer Platform"}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5" noValidate>
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="email">
              {t("emailAddress")}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 pointer-events-none" />
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                autoComplete="current-password"
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
          </div>

          {/* Remember Me & Forgot Password mockup */}
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
              <input type="checkbox" className="rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/30" />
              Remember Me
            </label>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-slate-400 hover:text-emerald-400 transition-colors">
              Forgot Password?
            </a>
          </div>

          {/* Alerts */}
          {success && (
            <div className="auth-alert-succ">
              <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col gap-2">
              <div className="auth-alert-err">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              {showResend && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading || resendCooldown > 0}
                  className="auth-btn-ghost mt-1"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Resending...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Resend in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Resend Verification Email
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="auth-btn-p mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("authenticating")}
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link back */}
        <div className="text-center">
          <p className="text-slate-400 text-xs">
            Don't have an account?{" "}
            <Link
              href={`/signup${urlRole ? `?role=${urlRole}` : ""}`}
              className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors ml-1"
            >
              {t("createAFreeAccount")}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}