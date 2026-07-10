"use client";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type IconVariant =
  | "green"
  | "blue"
  | "orange"
  | "cyan"
  | "purple"
  | "yellow"
  | "emerald"
  | "red";

const VARIANT_STYLES: Record<IconVariant, { bg: string; shadow: string; icon: string }> = {
  green: {
    bg: "bg-gradient-to-br from-[#16a34a] to-emerald-600",
    shadow: "shadow-[0_4px_14px_rgba(22,163,74,0.35)]",
    icon: "text-white",
  },
  emerald: {
    bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    shadow: "shadow-[0_4px_14px_rgba(16,185,129,0.35)]",
    icon: "text-white",
  },
  blue: {
    bg: "bg-gradient-to-br from-[#2563eb] to-blue-600",
    shadow: "shadow-[0_4px_14px_rgba(37,99,235,0.35)]",
    icon: "text-white",
  },
  orange: {
    bg: "bg-gradient-to-br from-[#f97316] to-orange-600",
    shadow: "shadow-[0_4px_14px_rgba(249,115,22,0.35)]",
    icon: "text-white",
  },
  cyan: {
    bg: "bg-gradient-to-br from-[#38bdf8] to-cyan-500",
    shadow: "shadow-[0_4px_14px_rgba(56,189,248,0.35)]",
    icon: "text-white",
  },
  purple: {
    bg: "bg-gradient-to-br from-violet-500 to-purple-600",
    shadow: "shadow-[0_4px_14px_rgba(139,92,246,0.35)]",
    icon: "text-white",
  },
  yellow: {
    bg: "bg-gradient-to-br from-[#fbbf24] to-amber-500",
    shadow: "shadow-[0_4px_14px_rgba(251,191,36,0.35)]",
    icon: "text-white",
  },
  red: {
    bg: "bg-gradient-to-br from-red-500 to-rose-600",
    shadow: "shadow-[0_4px_14px_rgba(239,68,68,0.35)]",
    icon: "text-white",
  },
};

interface GradientIconProps {
  icon: LucideIcon;
  variant?: IconVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
  iconClassName?: string;
}

/**
 * Circular gradient icon badge with hover animation.
 */
export default function GradientIcon({
  icon: Icon,
  variant = "green",
  size = "md",
  className,
  iconClassName,
}: GradientIconProps) {
  const styles = VARIANT_STYLES[variant];
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };
  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4.5 h-4.5",
    lg: "w-5 h-5",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-110 hover:shadow-lg",
        sizeClasses[size],
        styles.bg,
        styles.shadow,
        className
      )}
    >
      <Icon className={cn(iconSizes[size], styles.icon, iconClassName)} />
    </div>
  );
}