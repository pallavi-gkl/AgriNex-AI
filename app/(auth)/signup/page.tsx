"use client";
import { useTranslation } from "@/hooks/useTranslation";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Leaf, User, Mail, Phone, Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, Star } from "lucide-react";
import { motion } from "framer-motion";
import PageBackground from "@/components/ui/PageBackground";

export default function SignUpPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"farmer" | "consumer">("farmer");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const urlRole = searchParams.get("role");
      if (urlRole === "consumer" || urlRole === "farmer") {
        setRole(urlRole);
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
      // 1. Create user via Server Action signup endpoint
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

      // Redirect to check-email info page
      router.push(`/check-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
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

        {/* Left Side Feature Section */}
        <div className="relative z-10 my-auto flex flex-col gap-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 max-w-fit">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Register With Confidence
          </div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            Start trading directly with verified participants.
          </h2>
          <p className="text-slate-300 text-base leading-relaxed font-medium">
            {t("cutOutMiddlemenListAndBuyCrops")}
          </p>

          {/* Mini Testimonial */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-4 backdrop-blur-md">
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-slate-300 text-xs italic">
              {t("signingUpAsAGrowerTookLessThan1")}
            </p>
            <p className="text-white text-[11px] font-bold mt-2">
              — Devendra P., Crop Cultivator
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-slate-400 text-xs relative z-10">
          &copy; {new Date().getFullYear()} AgriNex AI. All rights reserved. &bull; Secure Authentication.
        </p>
      </div>

      {/* Right side form panel */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center px-6 py-12 sm:px-12 bg-white/70 backdrop-blur-xl relative">
        {/* Background blobs for light page decoration */}
        <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[80px] bg-emerald-500/5 pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[80px] bg-emerald-500/5 pointer-events-none" />

        <div className="w-full max-w-[440px] relative z-10">
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
          <div className="text-center lg:text-left mb-6">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">{t("createAnAccount")}</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed font-medium">
              Join the direct agricultural network and leverage smart tools.
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200/50">
            <button
              type="button"
              onClick={() => setRole("farmer")}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                role === "farmer"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🌾 Farmer Portal
            </button>
            <button
              type="button"
              onClick={() => setRole("consumer")}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                role === "consumer"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🛒 Consumer Shop
            </button>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="flex flex-col gap-4" noValidate>
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("fullName")}</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rajesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`glass-input pl-11 ${fieldErrors.fullName ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]" : ""}`}
                  autoComplete="name"
                  required
                />
              </div>
              {fieldErrors.fullName && <p className="text-red-500 text-[10px] font-semibold mt-0.5">{fieldErrors.fullName}</p>}
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("emailAddress")}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`glass-input pl-11 ${fieldErrors.email ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]" : ""}`}
                  autoComplete="email"
                  required
                />
              </div>
              {fieldErrors.email && <p className="text-red-500 text-[10px] font-semibold mt-0.5">{fieldErrors.email}</p>}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Phone Number <span className="text-slate-400 font-normal lowercase">{t("optional")}</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="glass-input pl-11"
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`glass-input pl-11 pr-11 ${fieldErrors.password ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]" : ""}`}
                  autoComplete="new-password"
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
              {fieldErrors.password && <p className="text-red-500 text-[10px] font-semibold mt-0.5">{fieldErrors.password}</p>}
            </div>

            {/* General Error Message */}
            {error && (
              <div className="alert-error">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>
                  {error}
                  {error.toLowerCase().includes("already exists") && (
                    <Link
                      href="/signin"
                      className="ml-1 text-[#16a34a] hover:underline font-bold"
                    >
                      Sign In →
                    </Link>
                  )}
                </span>
              </div>
            )}

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-3 py-3.5 text-sm flex items-center justify-center gap-2"
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

          {/* Alternative SignIn option */}
          <p className="text-slate-500 text-xs text-center mt-6">
            Already have an account?{" "}
            <Link href="/signin" className="text-[#16a34a] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}