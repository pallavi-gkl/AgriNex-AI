"use client";
/**
 * @fileoverview StatsCard — individual metric widget for the farmer dashboard.
 * Supports 4 color variants: green, blue, purple, amber.
 * Uses Framer Motion listItemVariants for stagger entrance.
 */
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { listItemVariants } from "@/lib/animations";

type CardColor = "green" | "blue" | "purple" | "amber";

interface StatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: CardColor;
  sublabel?: string;
}

const colorConfig: Record<
  CardColor,
  { valueClass: string; iconGradient: string; iconColor: string }
> = {
  green: {
    valueClass: "gradient-text-emerald",
    iconGradient: "from-emerald-400 to-emerald-600",
    iconColor: "text-white",
  },
  blue: {
    valueClass: "gradient-text-blue",
    iconGradient: "from-sky-400 to-blue-600",
    iconColor: "text-white",
  },
  purple: {
    valueClass: "gradient-text-purple",
    iconGradient: "from-purple-400 to-violet-600",
    iconColor: "text-white",
  },
  amber: {
    valueClass: "gradient-text-golden",
    iconGradient: "from-amber-400 to-orange-500",
    iconColor: "text-white",
  },
};

export default function StatsCard({ label, value, icon: Icon, color, sublabel }: StatsCardProps) {
  const cfg = colorConfig[color];

  return (
    <motion.div
      variants={listItemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="stat-card flex flex-col gap-3 cursor-default"
    >
      {/* Icon */}
      <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${cfg.iconGradient} flex items-center justify-center shadow-md`}>
        <Icon className={`w-5 h-5 ${cfg.iconColor}`} strokeWidth={1.8} />
      </div>

      {/* Value */}
      <div>
        <p className={`text-2xl font-extrabold font-sans ${cfg.valueClass}`}>{value}</p>
        {sublabel && (
          <p className="text-xs text-slate-500 mt-0.5 font-semibold">{sublabel}</p>
        )}
      </div>

      {/* Label */}
      <p className="text-sm text-slate-600 font-semibold leading-tight">{label}</p>
    </motion.div>
  );
}