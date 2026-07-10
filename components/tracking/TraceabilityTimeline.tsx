"use client";
/**
 * @fileoverview TraceabilityTimeline — interactive vertical progress checkpoints.
 * Decoupled from direct database states, showing sequential delivery statuses.
 */
import { motion } from "framer-motion";

interface TrackingEvent {
  status: string;
  note?: string;
  timestamp: string;
}

const CHECKPOINTS = [
  {
    key: "harvested",
    label: "Harvested & AI Graded",
    subLabel: "Maturity grading verified by Gemini Vision",
    icon: "🌾",
    bgColor: "rgba(16,185,129,0.08)",
    borderColor: "#10b981",
    glowColor: "rgba(16,185,129,0.15)",
  },
  {
    key: "dispatched",
    label: "Dispatched from Farm",
    subLabel: "Transit initiated from regional Coordinate hub",
    icon: "🚛",
    bgColor: "rgba(14,165,233,0.08)",
    borderColor: "#0ea5e9",
    glowColor: "rgba(14,165,233,0.15)",
  },
  {
    key: "in_transit",
    label: "Arrived at Processing Center",
    subLabel: "APMC sorting and cold-chain warehousing log",
    icon: "🏭",
    bgColor: "rgba(139,92,246,0.08)",
    borderColor: "#8b5cf6",
    glowColor: "rgba(139,92,246,0.15)",
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    subLabel: "Assigned to logistics courier partner",
    icon: "🛵",
    bgColor: "rgba(245,158,11,0.08)",
    borderColor: "#f59e0b",
    glowColor: "rgba(245,158,11,0.15)",
  },
  {
    key: "delivered",
    label: "Delivered",
    subLabel: "Handed over safely to verified customer",
    icon: "🎁",
    bgColor: "rgba(16,185,129,0.08)",
    borderColor: "#10b981",
    glowColor: "rgba(16,185,129,0.15)",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

interface TraceabilityTimelineProps {
  trackingHistory: TrackingEvent[];
}

export const TraceabilityTimeline = ({
  trackingHistory,
}: TraceabilityTimelineProps) => {
  const completedStatuses = (trackingHistory ?? []).map((e) => e.status);

  return (
    <div
      className="premium-card rounded-3xl shadow-sm p-6"
      role="list"
      aria-label="Order traceability timeline"
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="text-lg">🔗</span>
        <h3 className="font-bold text-slate-800 text-base">Traceability Audit</h3>
        <span className="ml-auto text-xs text-slate-500 font-mono font-bold">
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
        <div className="absolute left-[19px] top-5 bottom-5 w-px bg-slate-200" />

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
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
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
                  className={`font-bold text-sm leading-none mb-1.5 transition-colors ${
                    isComplete ? "text-slate-800" : "text-slate-450 text-slate-400"
                  }`}
                >
                  {cp.label}
                </p>
                {event ? (
                  <>
                    <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                      {event.note ?? ""}
                    </p>
                    <p className="text-slate-400 text-[10px] font-bold font-mono mt-0.5">
                      {new Date(event.timestamp).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400 text-xs font-semibold">{cp.subLabel} — pending</p>
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