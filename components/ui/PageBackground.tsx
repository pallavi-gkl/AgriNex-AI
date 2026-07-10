"use client";

import React from "react";
import { cn } from "@/lib/utils";

type PageBackgroundVariant = "dashboard" | "marketing" | "auth" | "admin" | "consumer";

interface PageBackgroundProps {
  variant?: PageBackgroundVariant;
  className?: string;
}

export default function PageBackground({
  variant = "dashboard",
  className,
}: PageBackgroundProps) {
  const blobs = {
    dashboard: (
      <>
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-emerald-400/20 blur-[100px] anim-float" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] rounded-full bg-sky-400/15 blur-[90px]" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-0 right-1/4 w-[360px] h-[360px] rounded-full bg-blue-500/10 blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#16a34a_1px,transparent_1px)] [background-size:24px_24px]" />
      </>
    ),
    consumer: (
      <>
        <div className="absolute -top-24 right-0 w-[480px] h-[480px] rounded-full bg-emerald-300/25 blur-[100px] anim-float" />
        <div className="absolute bottom-20 -left-32 w-[420px] h-[420px] rounded-full bg-sky-300/20 blur-[90px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-amber-200/15 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:20px_20px]" />
      </>
    ),
    marketing: (
      <>
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-400/25 blur-[120px] anim-float" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-amber-300/15 blur-[90px]" />
        <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#16a34a_1.5px,transparent_1.5px)] [background-size:28px_28px]" />
      </>
    ),
    auth: (
      <>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-400/20 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-400/15 blur-[90px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#14532d_1px,transparent_1px)] [background-size:18px_18px]" />
      </>
    ),
    admin: (
      <>
        <div className="absolute -top-32 left-1/3 w-[480px] h-[480px] rounded-full bg-violet-400/20 blur-[100px] anim-float" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-emerald-400/15 blur-[90px]" />
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:22px_22px]" />
      </>
    ),
  };

  return (
    <div
      className={cn("fixed inset-0 pointer-events-none overflow-hidden -z-10", className)}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, #ECFDF5 0%, #F0FDF4 30%, #E0F2FE 100%)",
        }}
      />
      {blobs[variant]}
    </div>
  );
}