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
  { gradient: string; iconBg: string; hoverClass: string; iconColor: string }
> = {
  green: {
    gradient: "gradient-text-green",
    iconBg: "bg-emerald-500/15",
    hoverClass: "glass-panel-hover",
    iconColor: "text-emerald-400",
  },
  blue: {
    gradient: "text-white",
    iconBg: "bg-sky-500/15",
    hoverClass: "glass-panel-hover-blue",
    iconColor: "text-sky-400",
  },
  purple: {
    gradient: "gradient-text-purple",
    iconBg: "bg-purple-500/15",
    hoverClass: "glass-panel-hover-purple",
    iconColor: "text-purple-400",
  },
  amber: {
    gradient: "gradient-text-amber",
    iconBg: "bg-amber-500/15",
    hoverClass: "glass-panel-hover-amber",
    iconColor: "text-amber-400",
  },
};

export default function StatsCard({ label, value, icon: Icon, color, sublabel }: StatsCardProps) {
  const cfg = colorConfig[color];

  return (
    <motion.div
      variants={listItemVariants}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`glass-panel ${cfg.hoverClass} rounded-2xl p-5 flex flex-col gap-3 cursor-default`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${cfg.iconColor}`} strokeWidth={1.8} />
      </div>

      {/* Value */}
      <div>
        <p className={`text-2xl font-bold font-sans ${cfg.gradient}`}>{value}</p>
        {sublabel && (
          <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>
        )}
      </div>

      {/* Label */}
      <p className="text-sm text-slate-400 font-medium leading-tight">{label}</p>
    </motion.div>
  );
}
