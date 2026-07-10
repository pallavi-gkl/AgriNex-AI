"use client";
import { useTranslation } from "@/hooks/useTranslation";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Leaf, Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, CheckCircle, ArrowRight, ShieldCheck, Star, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import PageBackground from "@/components/ui/PageBackground";

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

      // Block sign in if email is not verified
      if (!user.email_confirmed_at) {
        await supabase.auth.signOut();
        setShowResend(true);
        throw new Error("Please verify your email before signing in.");
      }

      // Fetch profile role for routing
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
      // Translate raw network errors into a user-friendly message
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-transparent font-sans relative">
      <PageBackground variant="auth" />
      {/* Left side panel (hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 overflow-hidden text-white">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] rounded-full blur-[100px] bg-emerald-500/20 pointer-events-none" />

        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 group no-underline text-white relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 shadow-lg transition-transform duration-300 group-hover:scale-105">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Agri<span className="text-emerald-400">Nex</span>
            </span>
          </div>
        </Link>

        {/* Feature/Slogan in Left Panel */}
        <div className="relative z-10 my-auto flex flex-col gap-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 max-w-fit">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure Portal Access
          </div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            Welcome back to the direct farm network.
          </h2>
          <p className="text-slate-300 text-base leading-relaxed font-medium">
            Manage your listings, look up real-time mandi prices, check status on direct-to-door deliveries, or grade crops in seconds with our Gemini AI tool.
          </p>

          {/* Mini Testimonial */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-4 backdrop-blur-md">
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-slate-300 text-xs italic">
              {t("directConnectionAllowedMeToGet1")}
            </p>
            <p className="text-white text-[11px] font-bold mt-2">
              — Sridhar S., FreshFoods Co.
            </p>
          </div>
        </div>

        {/* Footer info in Left Panel */}
        <p className="text-slate-400 text-xs relative z-10">
          &copy; {new Date().getFullYear()} AgriNex AI. All rights reserved. &bull; Secure Authentication.
        </p>
      </div>

      {/* Right side form panel */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center px-6 py-12 sm:px-12 bg-white relative">
        {/* Background Blobs (for light page decoration) */}
        <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[80px] bg-emerald-500/5 pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[80px] bg-emerald-500/5 pointer-events-none" />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Logo showing only on mobile/tablet */}
          <div className="flex lg:hidden justify-center mb-8">
            <Link href="/" className="flex items-center gap-2.5 group no-underline">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#16a34a] to-emerald-600 shadow-[0_4px_16px_rgba(22,163,74,0.25)] transition-transform duration-300 group-hover:scale-105">
                <Leaf className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-extrabold text-slate-800 text-2xl tracking-tight">
                Agri<span className="text-[#16a34a]">Nex</span>
              </span>
            </Link>
          </div>

          {/* Heading */}
          <div className="text-center lg:text-left mb-8">
            {urlRole && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 border ${
                urlRole === "farmer"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {urlRole === "farmer" ? "🌾 Farmer Portal" : "🛒 Consumer Marketplace"}
              </div>
            )}
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {urlRole === "farmer" ? "Farmer Sign In" : urlRole === "consumer" ? "Consumer Sign In" : "Welcome back"}
            </h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed font-medium">
              {urlRole === "farmer"
                ? "Sign in to access your crop dashboard & AI grading tools."
                : urlRole === "consumer"
                ? "Sign in to buy fresh agricultural crops at wholesale prices."
                : "Enter credentials to manage listings or browse fresh marketplace produce."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5" noValidate>
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="email">
                {t("emailAddress")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input pl-11"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-11 pr-11"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Notifications panel alerts */}
            {success && (
              <div className="alert-success">
                <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="flex flex-col gap-2">
                <div className="alert-error">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                {showResend && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading || resendCooldown > 0}
                    className="btn-ghost py-2 text-xs flex items-center justify-center gap-2 border border-emerald-500/25 text-[#16a34a] hover:bg-emerald-50 mt-1 cursor-pointer w-full"
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

            {/* Signin Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full mt-2 py-3.5 text-sm flex items-center justify-center gap-2"
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

          {/* Route Change Section */}
          <div className="mt-8 text-center">
            <div className="flex items-center gap-3 text-slate-300 text-xs font-semibold justify-center mb-6">
              <span className="h-[1px] bg-slate-200 w-16" />
              <span className="text-slate-400">New to AgriNex?</span>
              <span className="h-[1px] bg-slate-200 w-16" />
            </div>

            <Link
              href={`/signup${urlRole ? `?role=${urlRole}` : ""}`}
              className="btn-ghost w-full py-3.5 text-sm flex items-center justify-center gap-2 no-underline"
            >
              {t("createAFreeAccount")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}