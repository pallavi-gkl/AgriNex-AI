"use client";

/**
 * @fileoverview Custom 404 Not Found page for AgriNex AI.
 * Displays a premium glass-morphism 404 with navigation back to home.
 */
import { motion } from "framer-motion";
import Link from "next/link";
import { Home, ArrowLeft, Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 0 30px rgba(16,185,129,0.4)",
            }}
          >
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">
            Agri<span className="gradient-text-green">Nex</span> AI
          </span>
        </div>

        {/* 404 Display */}
        <div className="glass-panel rounded-3xl p-10 mb-8">
          <div
            className="text-8xl font-bold mb-4"
            style={{
              background: "linear-gradient(135deg, #34d399 0%, #0ea5e9 50%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </div>

          <h1 className="text-xl font-bold text-white mb-3">
            Page Not Found
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back to the harvest.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 0 20px rgba(16,185,129,0.3)",
            }}
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-300 transition-all duration-300 hover:text-white glass-panel"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </motion.div>
  );
}
