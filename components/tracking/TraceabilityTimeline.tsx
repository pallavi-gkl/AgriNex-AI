/**
 * @fileoverview TraceabilityTimeline — Harvest-to-doorstep audit timeline.
 * Phase 3 (spec) / Phase 5 (built). Reused on the tracking page.
 *
 * Shows 4 checkpoints driven by tracking_history JSONB:
 *   pending → quality_verified → dispatched → delivered
 */
"use client";

import { motion } from "framer-motion";
import type { TrackingEvent } from "@/types";

// ─── Checkpoint definitions ───────────────────────────────────────────────────
const CHECKPOINTS = [
  {
    key: "pending",
    icon: "🌾",
    label: "Order Placed",
    subLabel: "Harvested & ready",
    color: "emerald",
    glowColor: "rgba(16,185,129,0.35)",
    bgColor: "rgba(16,185,129,0.12)",
    borderColor: "rgba(16,185,129,0.45)",
  },
  {
    key: "quality_verified",
    icon: "🔬",
    label: "Quality Graded",
    subLabel: "AI verified produce",
    color: "purple",
    glowColor: "rgba(139,92,246,0.35)",
    bgColor: "rgba(139,92,246,0.12)",
    borderColor: "rgba(139,92,246,0.45)",
  },
  {
    key: "dispatched",
    icon: "🚚",
    label: "In Transit",
    subLabel: "Courier en route",
    color: "sky",
    glowColor: "rgba(14,165,233,0.35)",
    bgColor: "rgba(14,165,233,0.12)",
    borderColor: "rgba(14,165,233,0.45)",
  },
  {
    key: "delivered",
    icon: "✅",
    label: "Delivered",
    subLabel: "OTP confirmed",
    color: "green",
    glowColor: "rgba(34,197,94,0.35)",
    bgColor: "rgba(34,197,94,0.12)",
    borderColor: "rgba(34,197,94,0.45)",
  },
] as const;

// ─── Animation variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface TraceabilityTimelineProps {
  trackingHistory: TrackingEvent[];
}

// ─── Component ────────────────────────────────────────────────────────────────
export const TraceabilityTimeline = ({
  trackingHistory,
}: TraceabilityTimelineProps) => {
  const completedStatuses = (trackingHistory ?? []).map((e) => e.status);

  return (
    <div
      className="glass-panel rounded-2xl p-6"
      role="list"
      aria-label="Order traceability timeline"
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="text-lg">🔗</span>
        <h3 className="font-semibold text-white text-base">Traceability Audit</h3>
        <span className="ml-auto text-xs text-slate-500 font-mono">
          {completedStatuses.length}/{CHECKPOINTS.length} checkpoints
        </span>
      </div>

      <motion.div
        className="relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Vertical connector line */}
        <div className="absolute left-[19px] top-5 bottom-5 w-px bg-white/8" />

        {/* Progress line (covers completed checkpoints) */}
        {completedStatuses.length > 1 && (
          <div
            className="absolute left-[19px] top-5 w-px transition-all duration-700"
            style={{
              background:
                "linear-gradient(to bottom, #10b981, #0ea5e9, #8b5cf6)",
              height: `${
                ((completedStatuses.length - 1) / (CHECKPOINTS.length - 1)) * 100
              }%`,
              maxHeight: "calc(100% - 40px)",
            }}
          />
        )}

        {CHECKPOINTS.map((cp) => {
          const event = (trackingHistory ?? []).find(
            (e) => e.status === cp.key
          );
          const isComplete = completedStatuses.includes(cp.key as any);

          return (
            <motion.div
              key={cp.key}
              variants={itemVariants}
              className="flex items-start gap-4 mb-6 last:mb-0 relative"
              role="listitem"
            >
              {/* Icon circle */}
              <div
                className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0 transition-all duration-500"
                style={
                  isComplete
                    ? {
                        background: cp.bgColor,
                        border: `1px solid ${cp.borderColor}`,
                        boxShadow: `0 0 14px ${cp.glowColor}`,
                      }
                    : {
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                }
              >
                <span
                  style={{ filter: isComplete ? "none" : "grayscale(1) opacity(0.35)" }}
                >
                  {cp.icon}
                </span>
              </div>

              {/* Text content */}
              <div className="pt-1 flex-1 min-w-0">
                <p
                  className={`font-semibold text-sm leading-none mb-1 transition-colors ${
                    isComplete ? "text-white" : "text-slate-600"
                  }`}
                >
                  {cp.label}
                </p>
                {event ? (
                  <>
                    <p className="text-slate-400 text-xs leading-relaxed truncate">
                      {event.note}
                    </p>
                    <p className="text-slate-600 text-[10px] font-mono mt-0.5">
                      {new Date(event.timestamp).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-600 text-xs">{cp.subLabel} — pending</p>
                )}
              </div>

              {/* Completed indicator dot */}
              {isComplete && (
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: cp.borderColor }}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default TraceabilityTimeline;
