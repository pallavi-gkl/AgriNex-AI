"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Leaf, Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [urlRole, setUrlRole] = useState<"farmer" | "consumer" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("registered") === "true") {
        setSuccess("Account created successfully! Please sign in.");
      }
      const r = searchParams.get("role");
      if (r === "farmer" || r === "consumer") {
        setUrlRole(r);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

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
        if (signInError.message.includes("Email not confirmed")) {
          throw new Error("Please verify your email address before signing in.");
        }
        throw signInError;
      }

      const session = signInData.session;
      const user = signInData.user;

      if (!session || !user) {
        throw new Error("Login succeeded but session creation failed. Please try again.");
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
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8faf8] relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] bg-emerald-500/5 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] bg-emerald-500/5 pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 flex flex-col gap-6 items-center">
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

        {/* Auth Glass Card */}
        <div className="w-full glass-panel rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            {/* Role-specific badge */}
            {urlRole && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                urlRole === "farmer"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {urlRole === "farmer" ? "🌾 Farmer Portal" : "🛒 Consumer Marketplace"}
              </div>
            )}
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {urlRole === "farmer" ? "Farmer Sign In" : urlRole === "consumer" ? "Consumer Sign In" : "Welcome back"}
            </h2>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
              {urlRole === "farmer"
                ? "Sign in to access your Farmer Dashboard."
                : urlRole === "consumer"
                ? "Sign in to access the Consumer Marketplace."
                : "Sign in to your AgriNex account to manage harvests or marketplace orders."}
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5" noValidate>
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
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
                <label className="text-xs font-semibold text-slate-600" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Success Banner */}
            {success && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs text-emerald-600 font-semibold"
                style={{ background: "rgba(16, 163, 74, 0.06)", border: "1px solid rgba(16, 163, 74, 0.12)" }}
              >
                <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs text-red-500 font-semibold"
                style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.12)" }}
              >
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-2 py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.01] shadow-[0_4px_14px_rgba(22,163,74,0.2)] disabled:opacity-50 disabled:pointer-events-none"
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider & Switch Route */}
          <div className="flex items-center gap-3 my-6 text-slate-400 text-xs font-semibold justify-center">
            <span className="h-[1px] bg-slate-200 w-12" />
            <span>New to AgriNex?</span>
            <span className="h-[1px] bg-slate-200 w-12" />
          </div>

          <Link
            href={`/signup${urlRole ? `?role=${urlRole}` : ""}`}
            className="w-full flex items-center justify-center py-3 rounded-xl border border-slate-200 text-slate-700 bg-white/50 text-sm font-bold transition-all hover:bg-slate-50 hover:border-slate-300"
          >
            Create an Account
          </Link>
        </div>

        <p className="text-slate-400 text-[11px] text-center">
          Secure authentication &bull; End-to-end encrypted direct connection
        </p>
      </div>
    </div>
  );
}