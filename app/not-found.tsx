"use client";
import { useTranslation } from "@/hooks/useTranslation";


/**
 * @fileoverview Custom 404 Not Found page for AgriNex AI.
 * Displays a premium light emerald themed 404 page.
 */
import { motion } from "framer-motion";
import PageBackground from "@/components/ui/PageBackground";
import Link from "next/link";
import { Home, ArrowLeft, Leaf } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-transparent px-4 relative"
    >
      <PageBackground variant="marketing" />
      <div className="text-center max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
            }}
          >
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-slate-800">
            Agri<span className="text-emerald-600">Nex</span> {t("ai")}
          </span>
        </div>

        {/* 404 Display */}
        <div className="premium-card shadow-sm rounded-3xl p-10 mb-8">
          <div
            className="text-8xl font-black mb-4 tracking-tight"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #0ea5e9 50%, #6366f1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </div>

          <h1 className="text-xl font-bold text-slate-800 mb-3">
            Page Not Found
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed font-semibold">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back to the harvest.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn-primary no-underline"
          >
            <Home className="w-4 h-4" />
            {t("goHome")}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("goBack")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}