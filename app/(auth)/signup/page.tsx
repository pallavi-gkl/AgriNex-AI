"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Leaf, User, Mail, Phone, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function SignUpPage() {
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
        // 409 = duplicate email — show sign in prompt
        if (res.status === 409) {
          throw new Error(
            "An account with this email already exists. Please sign in instead."
          );
        }
        throw new Error(
          data.error || "Registration failed. Please check details and try again."
        );
      }

      // 2. Sign in immediately to acquire cookie session
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        // Account created but auto-login failed — redirect to signin
        router.push("/signin?registered=true");
        return;
      }

      // 3. Route user to onboarding
      router.refresh();
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8faf8] relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] bg-emerald-500/5 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] bg-emerald-500/5 pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10 flex flex-col gap-6 items-center">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#16a34a] to-emerald-600 shadow-[0_4px_16px_rgba(22,163,74,0.25)] transition-transform duration-300 group-hover:scale-105">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-2xl tracking-tight">
              Agri<span className="text-[#16a34a]">Nex</span>
            </span>
          </div>
        </Link>

        {/* Signup Glass Card */}
        <div className="w-full glass-panel rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Create an account</h2>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
              Join AgriNex today to buy or sell fresh agricultural crops directly.
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200/50">
            <button
              type="button"
              onClick={() => setRole("farmer")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                role === "farmer"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🌾 Farmer
            </button>
            <button
              type="button"
              onClick={() => setRole("consumer")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                role === "consumer"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🛒 Consumer
            </button>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4" noValidate>
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
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
              <label className="text-xs font-semibold text-slate-600">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
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
              <label className="text-xs font-semibold text-slate-600">
                Phone Number <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
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
              <label className="text-xs font-semibold text-slate-600">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-red-500 text-[10px] font-semibold mt-0.5">{fieldErrors.password}</p>}
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs text-red-500 font-semibold mt-1"
                style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.12)" }}
              >
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

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.01] shadow-[0_4px_14px_rgba(22,163,74,0.2)] disabled:opacity-50 disabled:pointer-events-none"
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-slate-500 text-xs text-center mt-6">
            Already have an account?{" "}
            <Link href="/signin" className="text-[#16a34a] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        <p className="text-slate-400 text-[11px] text-center max-w-xs leading-normal">
          By signing up, you agree to our Terms of Service and Privacy Guidelines.
        </p>
      </div>
    </div>
  );
}