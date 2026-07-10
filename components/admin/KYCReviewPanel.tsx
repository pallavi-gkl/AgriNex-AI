"use client";
import { useTranslation } from "@/hooks/useTranslation";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ShieldAlert, Eye, ZoomIn } from "lucide-react";
import type { KYCApp } from "./KYCApplicationList";

interface KYCReviewPanelProps {
  application: KYCApp;
  onVerify: (profileId: string) => Promise<void>;
  onReject: (profileId: string, reason: string) => Promise<void>;
}

export default function KYCReviewPanel({
  application,
  onVerify,
  onReject,
}: KYCReviewPanelProps) {
  const { t } = useTranslation();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Verification Animation States
  const [isBursting, setIsBursting] = useState(false);
  const [showVerifiedBadge, setShowVerifiedBadge] = useState(false);

  const handleVerifyClick = async () => {
    setSubmitting(true);
    try {
      await onVerify(application.profileId);
      // Trigger animations
      setIsBursting(true);
      setShowVerifiedBadge(true);
      setTimeout(() => {
        setIsBursting(false);
      }, 1000);
      setTimeout(() => {
        setShowVerifiedBadge(false);
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) return;
    setSubmitting(true);
    try {
      await onReject(application.profileId, rejectionReason);
      setShowRejectDialog(false);
      setRejectionReason("");
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const isPdf = application.landCertificateUrl?.toLowerCase().endsWith(".pdf");

  // Generate coordinates for 10 particle bursts radiating outward
  const particles = Array.from({ length: 10 }).map((_, i) => {
    const angle = (i * 2 * Math.PI) / 10;
    const distance = 80 + Math.random() * 50;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  });

  return (
    <div className="p-6 space-y-6 flex flex-col h-full overflow-y-auto relative">
      {/* ── Verified Flash Badge ── */}
      <AnimatePresence>
        {showVerifiedBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="absolute top-6 right-6 z-30 bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Check className="w-5 h-5" />
            Profile Verified
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Farmer Info Header ── */}
      <div className="flex items-center gap-4 bg-white/[0.01] p-4 rounded-2xl border-white/5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-purple-500/30 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
          {application.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-white truncate">
            {application.fullName}
          </h2>
          <p className="text-slate-400 text-xs truncate mt-0.5">
            📍 {application.locationAddress}
          </p>
          <p className="text-slate-500 text-xs font-mono mt-1">
            📞 {application.phoneNumber}
          </p>
        </div>
      </div>

      {/* ── Document Viewer ── */}
      <div className="premium-card rounded-3xl shadow-sm p-4 flex-1 flex flex-col min-h-[300px]">
        <p className="text-slate-400 text-xs mb-3 font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-purple-400" />
          Uploaded Land Certificate
        </p>

        <div className="flex-1 bg-black/20 rounded-xl overflow-hidden border-white/5 relative flex items-center justify-center">
          {isPdf ? (
            <iframe
              src={application.landCertificateUrl}
              className="w-full h-80 rounded-xl"
              title="Land Certificate PDF"
            />
          ) : (
            <div className="relative group cursor-zoom-in" onClick={() => setIsZoomed(true)}>
              <Image
                src={application.landCertificateUrl}
                alt="Land Certificate"
                width={800}
                height={600}
                className="max-h-80 w-auto object-contain rounded-xl"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-xl">
                <ZoomIn className="w-8 h-8 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Action Buttons with Burst Animation container ── */}
      <div className="flex gap-4 relative">
        {/* Verify Circle Particles Container */}
        {isBursting && (
          <div className="absolute left-[25%] top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            {particles.map((p, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: 0,
                  scale: [0, 2.5, 3],
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]"
              />
            ))}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleVerifyClick}
          disabled={submitting}
          className="flex-1 py-3 rounded-xl bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition-all text-sm"
          style={{ boxShadow: "0 0 20px rgba(16,185,129,0.15)" }}
        >
          <Check className="w-4 h-4" />
          Verify & Approve
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowRejectDialog(true)}
          disabled={submitting}
          className="flex-1 py-3 rounded-xl bg-red-500/15 border-red-500/30 text-red-400 font-semibold hover:bg-red-500/25 transition-all text-sm"
        >
          Reject Application
        </motion.button>
      </div>

      {/* ── Zoom Modal ── */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={application.landCertificateUrl}
              alt="Land Certificate Zoomed"
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Rejection Dialog ── */}
      <AnimatePresence>
        {showRejectDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="premium-card shadow-sm max-w-md w-full rounded-2xl p-6 relative border-red-500/20"
            >
              <div className="flex items-center gap-2 text-red-400 mb-4">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-semibold text-white">Reject KYC Application</h3>
              </div>

              <p className="text-slate-400 text-xs mb-4">
                Please provide a rejection note explaining what needs to be fixed. The farmer will be notified.
              </p>

              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 h-24 resize-none focus:outline-none focus:border-emerald-500/50"
                placeholder="e.g. Land certificate scan is blurry. Please re-upload a clear copy."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleRejectSubmit}
                  disabled={submitting || !rejectionReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 border-red-500/40 text-red-300 font-semibold hover:bg-red-500/30 transition-all text-xs"
                >
                  {t("confirmReject")}
                </button>
                <button
                  onClick={() => setShowRejectDialog(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 transition-all text-xs"
                >
                  {t("cancel")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}