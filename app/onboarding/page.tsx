"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Sprout, ShoppingCart, CheckCircle, Loader2, User, Phone, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();
  const [loadingSession, setLoadingSession] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  // Form states
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedRole, setSelectedRole] = useState<"farmer" | "consumer">("farmer");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Onboarding animation states
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/signin");
          return;
        }

        setUserId(user.id);
        setEmail(user.email ?? "");

        // Pre-fill fields from metadata
        const meta = user.user_metadata;
        if (meta?.full_name) setFullName(meta.full_name);
        if (meta?.name && !meta?.full_name) setFullName(meta.name);
        if (meta?.phone_number) setPhoneNumber(meta.phone_number);

        // Read query param role or fallback to metadata role
        const searchParams = new URLSearchParams(window.location.search);
        const urlRole = searchParams.get("role");
        if (urlRole === "consumer" || urlRole === "farmer") {
          setSelectedRole(urlRole);
        } else if (meta?.role && (meta.role === "farmer" || meta.role === "consumer")) {
          setSelectedRole(meta.role);
        }

        // Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .maybeSingle() as { data: { role: string; full_name: string } | null };

        if (profile && profile.role) {
          setProfileExists(true);
          const finalRole = (profile.role === "farmer" || profile.role === "consumer") ? profile.role : selectedRole;
          setSelectedRole(finalRole);
          
          // Sync user_metadata if missing or stale
          if (!meta?.role || meta.role !== finalRole) {
            await supabase.auth.updateUser({
              data: { role: finalRole }
            });
          }

          setShowAnimation(true);
          startOnboardingAnimation();
        } else {
          setProfileExists(false);
          setLoadingSession(false);
        }
      } catch (err) {
        console.error("[Onboarding] Initialization error:", err);
        setLoadingSession(false);
      }
    };

    checkProfile();
  }, [router]);

  const startOnboardingAnimation = () => {
    setLoadingSession(false);
    setTimeout(() => setAnimationStep(1), 500);
    setTimeout(() => setAnimationStep(2), 1200);
    setTimeout(() => setAnimationStep(3), 2000);
  };

  useEffect(() => {
    if (animationStep === 3) {
      const timeout = setTimeout(() => {
        if (selectedRole === "farmer") {
          router.push("/farmer/dashboard");
        } else {
          router.push("/consumer/marketplace");
        }
        router.refresh();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [animationStep, selectedRole, router]);

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        id: userId,
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        role: selectedRole,
        is_verified: selectedRole === "consumer", // consumers auto-verified, farmers need KYC
        trust_score: 5.0,
      };

      const { error: upsertError } = await (supabase as any)
        .from("profiles")
        .upsert([payload], { onConflict: "id" });

      if (upsertError) throw upsertError;

      // Sync auth user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim(),
          role: selectedRole,
        }
      });

      setProfileExists(true);
      setShowAnimation(true);
      startOnboardingAnimation();
    } catch (err: any) {
      setError(err.message ?? "Failed to save profile. Please try again.");
      setSubmitting(false);
    }
  };

  const steps = [
    { icon: CheckCircle, label: "Account authenticated successfully", delay: 0 },
    { icon: CheckCircle, label: "Secure profile established in database", delay: 0.4 },
    { icon: CheckCircle, label: selectedRole === "farmer" ? "Farmer dashboard permissions activated" : "Marketplace access granted", delay: 0.8 },
  ];

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf8]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#16a34a]" />
          <p className="text-sm font-semibold font-sans">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#f8faf8] relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] bg-emerald-500/5 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] bg-emerald-500/5 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#16a34a] to-emerald-600 shadow-[0_4px_16px_rgba(22,163,74,0.25)]">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">
            Agri<span className="text-[#16a34a]">Nex</span>
          </span>
        </div>

        <AnimatePresence mode="wait">
          {!showAnimation ? (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="glass-panel rounded-3xl p-8 shadow-xl relative overflow-hidden"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Complete Your Profile</h1>
                <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                  Select your role and enter your details to join AgriNex
                </p>
                {email && (
                  <p className="text-[#16a34a]/80 text-xs mt-1 font-mono font-medium">{email}</p>
                )}
              </div>

              <form onSubmit={handleSubmitProfile} className="space-y-6">
                {/* Role Cards */}
                <div>
                  <label className="text-[11px] text-slate-400 mb-2.5 block font-bold tracking-wider uppercase">
                    CHOOSE YOUR ROLE
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Farmer Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole("farmer")}
                      className={`flex flex-col items-center gap-3.5 p-5 rounded-2xl border text-center transition-all duration-300 relative overflow-hidden group ${
                        selectedRole === "farmer"
                          ? "bg-emerald-500/5 border-[#16a34a] text-[#16a34a] shadow-[0_0_20px_rgba(22,163,74,0.06)]"
                          : "bg-white/40 border-slate-200 text-slate-500 hover:bg-white/70 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                          selectedRole === "farmer" ? "bg-emerald-500/10 text-[#16a34a]" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <Sprout className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">Farmer</p>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                          Sell crops directly, get AI prices &amp; grading
                        </p>
                      </div>
                    </button>

                    {/* Consumer Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole("consumer")}
                      className={`flex flex-col items-center gap-3.5 p-5 rounded-2xl border text-center transition-all duration-300 relative overflow-hidden group ${
                        selectedRole === "consumer"
                          ? "bg-amber-500/5 border-amber-500 text-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.06)]"
                          : "bg-white/40 border-slate-200 text-slate-500 hover:bg-white/70 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                          selectedRole === "consumer" ? "bg-amber-500/10 text-amber-500" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">Consumer</p>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                          Order fresh produce, track deliveries live
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="onboarding-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="glass-input pl-10"
                        placeholder="e.g. Rajesh Kumar"
                        required
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="onboarding-phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="glass-input pl-10"
                        placeholder="e.g. 9876543210"
                        maxLength={15}
                        required
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div
                    className="rounded-xl px-4 py-3 text-xs text-red-500 font-medium"
                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}
                  >
                    {error}
                  </div>
                )}

                <button
                  id="onboarding-submit-btn"
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    background: selectedRole === "farmer"
                      ? "linear-gradient(135deg, #16a34a, #15803d)"
                      : "linear-gradient(135deg, #f59e0b, #d97706)",
                    boxShadow: selectedRole === "farmer"
                      ? "0 4px 14px rgba(22,163,74,0.2)"
                      : "0 4px 14px rgba(245,158,11,0.2)",
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Completing Setup...</>
                  ) : (
                    <>Complete Profile <ArrowRight className="w-4.5 h-4.5" /></>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="onboarding-steps"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              {/* Role icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm"
                style={{
                  background: selectedRole === "farmer"
                    ? "linear-gradient(135deg, rgba(22,163,74,0.1), rgba(22,163,74,0.02))"
                    : "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.02))",
                  border: `1px solid ${selectedRole === "farmer" ? "rgba(22,163,74,0.18)" : "rgba(245,158,11,0.18)"}`,
                }}
              >
                {selectedRole === "farmer" ? (
                  <Sprout className="w-12 h-12 text-[#16a34a]" />
                ) : (
                  <ShoppingCart className="w-12 h-12 text-amber-500" />
                )}
              </motion.div>

              <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
                Welcome to AgriNex! 🎉
              </h1>
              <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                {selectedRole === "farmer"
                  ? "Your farmer credentials are active. Get ready to list crops and use AI grading algorithms."
                  : "Your customer account is set up. Shop fresh produce direct from local coordinate locations."}
              </p>

              {/* Steps Checklist */}
              <div className="glass-panel rounded-2xl p-6 space-y-4 mb-6 text-left">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  const done = animationStep > i;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: done ? 1 : 0.3, x: 0 }}
                      className="flex items-center gap-3.5"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                          done
                            ? selectedRole === "farmer"
                              ? "bg-emerald-500/10 text-[#16a34a] border border-[#16a34a]/20"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-slate-100 text-slate-300"
                        }`}
                      >
                        {done ? (
                          <Icon className="w-4 h-4" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold transition-colors duration-500 ${
                          done ? "text-slate-800" : "text-slate-400"
                        }`}
                      >
                        {s.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Redirect Status */}
              {animationStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2.5 text-xs text-slate-500 font-semibold"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16a34a]" />
                  Routing to dashboard...
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
