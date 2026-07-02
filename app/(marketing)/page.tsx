"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Truck,
  Leaf,
  Sprout,
  ShoppingCart,
  Cpu
} from "lucide-react";

export default function MarketingLandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  const steps = [
    {
      icon: Sprout,
      title: "Farmer Lists Crops",
      desc: "Farmers upload produce with a photo. Our Gemini Vision model grades it instantly.",
      color: "from-emerald-500/20 to-emerald-600/5",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-500/20",
    },
    {
      icon: Cpu,
      title: "AI Suggests Prices",
      desc: "Real-time regional mandi analysis recommends fair rates for both parties.",
      color: "from-purple-500/20 to-purple-600/5",
      textColor: "text-purple-600",
      borderColor: "border-purple-500/20",
    },
    {
      icon: ShoppingCart,
      title: "Consumers Buy Direct",
      desc: "Middlemen are cut out. Consumers order fresher food at wholesale pricing.",
      color: "from-amber-500/20 to-amber-600/5",
      textColor: "text-amber-600",
      borderColor: "border-amber-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf8] overflow-x-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-gradient-to-tr from-emerald-500/8 to-emerald-300/2 pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] bg-gradient-to-bl from-emerald-500/5 to-teal-400/2 pointer-events-none" />

      {/* ── Navbar ── */}
      <header className="w-full py-6 px-6 sm:px-12 flex items-center justify-between relative z-10 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#16a34a] to-emerald-600 shadow-[0_4px_16px_rgba(22,163,74,0.25)] transition-transform duration-300 group-hover:scale-105">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-xl tracking-tight">
              Agri<span className="text-[#16a34a]">Nex</span>
            </span>
            <span className="text-[9px] bg-emerald-100 text-[#16a34a] font-bold px-1.5 py-0.5 rounded-full ml-2 uppercase font-mono">
              AI Platform
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/signin"
            className="text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-xs font-bold text-white px-4.5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_rgba(22,163,74,0.3)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.4)]"
            style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="px-6 pt-16 pb-20 sm:pt-24 sm:pb-32 max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center justify-center"
        >
          {/* Tagline Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-semibold text-emerald-700 bg-emerald-500/10 border border-emerald-500/15"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            DIRECT FARM-TO-CONSUMER MARKETPLACE
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-extrabold text-slate-800 leading-[1.1] max-w-4xl tracking-tight mb-6"
          >
            Farm Direct. Fair Prices.<br />
            <span className="text-[#16a34a] bg-clip-text">AI Powered</span> Agriculture.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-slate-500 text-lg sm:text-xl max-w-2xl mb-12 font-medium leading-relaxed"
          >
            AgriNex connects local growers directly with tables. Powered by Gemini AI for crop quality grading, pricing advice, and end-to-end transparent delivery tracking.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-lg px-6 sm:px-0"
          >
            {/* Farmer CTA */}
            <div className="flex flex-col items-center gap-1.5">
              <Link
                id="hero-farmer-cta"
                href="/signin?role=farmer"
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-[1.03] shadow-[0_8px_30px_rgba(22,163,74,0.3)] w-full"
                style={{
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                }}
              >
                <Sprout className="w-5 h-5 text-emerald-100" />
                Join as Farmer
                <ArrowRight className="w-4 h-4 text-emerald-100" />
              </Link>
              <Link
                href="/signup?role=farmer"
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                New farmer? Create account →
              </Link>
            </div>

            {/* Consumer CTA */}
            <div className="flex flex-col items-center gap-1.5">
              <Link
                id="hero-consumer-cta"
                href="/signin?role=consumer"
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-slate-700 bg-white border border-slate-200 transition-all duration-300 hover:scale-[1.03] hover:bg-slate-50 hover:border-slate-300 shadow-[0_8px_30px_rgba(0,0,0,0.02)] w-full"
              >
                <ShoppingCart className="w-5 h-5 text-slate-500" />
                Shop as Consumer
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Link>
              <Link
                href="/signup?role=consumer"
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                New customer? Create account →
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features Section ── */}
      <section className="px-6 py-20 bg-white/40 border-y border-slate-200/50 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Why Agriculture Trust AgriNex
            </h2>
            <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto">
              Real-time inventory, intelligent price engines, and verified sourcing protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-[#16a34a]/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-emerald-500/10 border border-emerald-500/20 text-[#16a34a] group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-slate-800 font-bold text-lg mb-3">Verified Farmers</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Direct transactions only with verified farmers. Track harvest records, verified soil scores, and buyer reviews seamlessly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-emerald-500/10 border border-emerald-500/20 text-[#16a34a] group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-slate-800 font-bold text-lg mb-3">AI Smart Pricing</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Real-time regional mandi analysis suggested via Gemini. Helps farmers command fair prices and consumers bypass retail markups.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-emerald-500/10 border border-emerald-500/20 text-[#16a34a] group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-slate-800 font-bold text-lg mb-3">Direct Delivery</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Fresh harvest delivered from coordinates to your doorstep. Complete GPS delivery dispatch timeline and fresh crop assurance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section className="px-6 py-24 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#16a34a] bg-emerald-500/15 px-3 py-1 rounded-full">
            WORKFLOW
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-4">
            How AgriNex AI Operates
          </h2>
          <p className="text-slate-500 text-sm mt-3 max-w-sm mx-auto">
            From field harvesting to doorstep delivery in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center relative group">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} border ${step.borderColor} flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-all duration-300`}>
                  <Icon className={`w-9 h-9 ${step.textColor}`} />
                </div>
                <h3 className="text-slate-800 font-extrabold text-lg mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm max-w-xs leading-relaxed">{step.desc}</p>

                {/* Linking Arrow for Desktop */}
                {idx < 2 && (
                  <div className="hidden lg:block absolute top-10 left-[85%] w-16 text-slate-300 pointer-events-none select-none">
                    <svg className="w-full" viewBox="0 0 50 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 6H42M42 6L37 1M42 6L37 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Final CTA Section ── */}
      <section className="px-6 pb-28 pt-8 max-w-6xl mx-auto relative z-10">
        <div className="glass-panel p-10 sm:p-16 rounded-[40px] text-center bg-gradient-to-br from-white/90 to-emerald-500/5 border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-4">
            Ready to Connect Direct?
          </h2>
          <p className="text-slate-500 text-base max-w-lg mb-10 leading-relaxed font-medium">
            Join AgriNex today. Farmers keep 100% of their requested profits; consumers get fresh, quality-assured agricultural food.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-[0_4px_16px_rgba(22,163,74,0.3)]"
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
            >
              Get Started Now
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-slate-200/50 px-6 sm:px-12 bg-white/30 text-center relative z-10">
        <p className="text-slate-400 text-xs">
          &copy; {new Date().getFullYear()} AgriNex AI. All rights reserved. &bull; Direct Farm Connections.
        </p>
      </footer>
    </div>
  );
}
