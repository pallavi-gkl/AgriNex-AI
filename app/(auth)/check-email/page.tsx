"use client";
import { useTranslation } from "@/hooks/useTranslation";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Leaf, Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft, RefreshCw, ShieldCheck, Star } from "lucide-react";
import PageBackground from "@/components/ui/PageBackground";

function CheckEmailContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams ? searchParams.get("email") || "" : "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const siteUrl = window.location.origin;
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      });

      if (resendError) {
        throw resendError;
      }

      setSuccess("Verification email resent successfully! Check your inbox.");
      setCooldown(60); // 60 seconds cooldown
    } catch (err: any) {
      setError(err?.message || "Failed to resend verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] relative z-10 text-center lg:text-left">
      {/* Logo showing only on mobile/tablet */}
      <div className="flex lg:hidden justify-center mb-8">
        <Link href="/" className="flex items-center gap-2.5 group no-underline animate-none">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#16a34a] to-emerald-600 shadow-[0_4px_16px_rgba(22,163,74,0.25)]">
            <Leaf className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-extrabold text-slate-800 text-2xl tracking-tight">
            Agri<span className="text-[#16a34a]">Nex</span>
          </span>
        </Link>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <div className="mx-auto lg:mx-0 w-16 h-16 rounded-2xl bg-emerald-50 text-[#16a34a] flex items-center justify-center mb-6 border border-emerald-100 shadow-sm animate-pulse">
          <Mail className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t("checkYourEmail")}
        </h2>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed font-medium">
          Your account has been created successfully.
        </p>
        <p className="text-slate-600 text-sm mt-2 leading-relaxed font-medium">
          We've sent a verification email to <strong className="text-slate-800 font-semibold">{email || "your registered email"}</strong>{t("pleaseVerifyYourEmailBeforeSig")}
        </p>
      </div>

      {/* Verification instructions */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6 text-xs text-slate-500 text-left space-y-2">
        <p className="font-bold text-slate-700">Next Steps:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Open your email client and find the email from AgriNex AI.</li>
          <li>{t("clickTheVerificationLinkToConf")}</li>
          <li>{t("afterVerificationReturnToSignI")}</li>
        </ul>
      </div>

      {/* Success/Error Feedback Alerts */}
      {success && (
        <div className="alert-success mb-5 text-left flex items-start gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold">
          <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert-error mb-5 text-left flex items-start gap-2 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs font-semibold">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleResend}
          disabled={loading || cooldown > 0 || !email}
          className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : cooldown > 0 ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Resend in {cooldown}s
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Resend Verification Email
            </>
          )}
        </button>

        <Link
          href="/signin"
          className="btn-ghost w-full py-3.5 text-sm flex items-center justify-center gap-2 no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("backToSignIn")}</span>
        </Link>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  const { t } = useTranslation();
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

        {/* Feature info */}
        <div className="relative z-10 my-auto flex flex-col gap-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 max-w-fit">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure Account Setup
          </div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            Verify your email to secure your account.
          </h2>
          <p className="text-slate-300 text-base leading-relaxed font-medium">
            We confirm all user email addresses to prevent unauthorized listings and maintain trust and security across the AgriNex direct trade platform.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-4 backdrop-blur-md">
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-slate-300 text-xs italic">
              {t("verifyingMyGrowerEmailLinkedMy1")}
            </p>
            <p className="text-white text-[11px] font-bold mt-2">
              — Devendra P., Crop Cultivator
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-slate-400 text-xs relative z-10">
          &copy; {new Date().getFullYear()} AgriNex AI. All rights reserved. &bull; Secure Authentication.
        </p>
      </div>

      {/* Right side check email content */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center px-6 py-12 sm:px-12 bg-white relative">
        <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[80px] bg-emerald-500/5 pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[80px] bg-emerald-500/5 pointer-events-none" />
        <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-[#16a34a]" />}>
          <CheckEmailContent />
        </Suspense>
      </div>
    </div>
  );
}