"use client";

/**
 * @fileoverview AICropGraderWidget — 3-state crop quality grading scanner.
 * States: idle → scanning → graded
 *
 * Uses real Gemini Vision API via POST /api/ai/grade-crop (Phase 4).
 */
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, RotateCcw, Sparkles, AlertCircle } from "lucide-react";
import { modalContentVariants } from "@/lib/animations";
import type { CropGradeResult } from "@/types";

type WidgetState = "idle" | "scanning" | "graded" | "error";

interface AICropGraderWidgetProps {
  onPriceApply?: (price: number, gradeResult: CropGradeResult) => void;
  cropType?: string;
  className?: string;
}

// ─── Real AI grade call via Gemini Vision ────────────────────────────────────
async function gradeCrop(imageFile: File, cropType: string): Promise<CropGradeResult> {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("cropType", cropType || "Unknown Crop");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/ai/grade-crop`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error ?? "Grading failed");
  }
  return res.json();
}

// ─── Grade badge color helper ─────────────────────────────────────────────────
function gradeColor(grade: string): string {
  if (grade === "A+") return "#34d399";
  if (grade === "A")  return "#10b981";
  if (grade === "B")  return "#f59e0b";
  return "#ef4444";
}

export default function AICropGraderWidget({
  onPriceApply,
  cropType = "Tomato",
  className = "",
}: AICropGraderWidgetProps) {
  const [state, setState] = useState<WidgetState>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [gradeResult, setGradeResult] = useState<CropGradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setState("scanning");
    setError(null);

    // Show scan animation for at least 1.5s before showing result
    const [result] = await Promise.all([
      gradeCrop(file, cropType).catch((e) => {
        console.error(e);
        return null;
      }),
      new Promise((r) => setTimeout(r, 1800)),
    ]);

    if (!result) {
      setState("error");
      setError("Grading failed. Please try again.");
      return;
    }

    setGradeResult(result);
    setState("graded");
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    isDragging.current = false;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setState("idle");
    setPreviewUrl(null);
    setGradeResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const applyPrice = () => {
    if (gradeResult && onPriceApply) {
      onPriceApply(gradeResult.recommendedPrice, gradeResult);
    }
  };

  return (
    <div className={`glass-panel rounded-2xl p-5 flex flex-col gap-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI Crop Grader
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">Upload a photo for instant quality analysis</p>
        </div>
        {state !== "idle" && (
          <button
            onClick={reset}
            aria-label="Reset crop grader"
            className="w-7 h-7 rounded-lg glass-panel flex items-center justify-center hover:border-white/20 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── IDLE STATE ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="button"
            tabIndex={0}
            aria-label="Click or drag to upload crop photo for AI grading"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); isDragging.current = true; }}
            onDrop={handleDrop}
            className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-500/40 transition-all group flex flex-col items-center gap-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
              <Camera className="w-7 h-7 text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Upload or capture crop photo</p>
              <p className="text-slate-500 text-xs mt-1">PNG, JPG, WEBP · Drop here or click to browse</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-purple-500/15 border border-purple-500/25 text-purple-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" aria-hidden="true" /> Powered by Gemini Vision
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              aria-label="Upload crop image file"
              className="hidden"
              onChange={handleInputChange}
            />
          </motion.div>
        )}

        {/* ── SCANNING STATE ─────────────────────────────────────────────── */}
        {state === "scanning" && previewUrl && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={previewUrl}
                alt="Crop being analyzed"
                className="w-full h-48 object-cover rounded-xl"
              />
              {/* Scan line — uses globals.css .anim-scan-line class */}
              <div className="anim-scan-line" />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/30 rounded-xl" />
            </div>
            <p className="text-center text-emerald-400 text-sm animate-pulse font-medium">
              ✦ AI Grading Crop Quality...
            </p>
            <div className="flex gap-1 justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── ERROR STATE ────────────────────────────────────────────────── */}
        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6 flex flex-col items-center gap-3"
          >
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-slate-300 text-sm">{error}</p>
            <button onClick={reset} className="text-xs text-purple-400 hover:text-purple-300 underline">
              Try again
            </button>
          </motion.div>
        )}

        {/* ── GRADED STATE ───────────────────────────────────────────────── */}
        {state === "graded" && gradeResult && (
          <motion.div
            key="graded"
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-4"
          >
            {/* Grade badge */}
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full border-4 flex items-center justify-center mx-auto mb-3"
                style={{
                  borderColor: gradeColor(gradeResult.grade),
                  boxShadow: `0 0 30px rgba(16,185,129,0.4)`,
                }}
              >
                <span
                  className="text-3xl font-bold font-sans gradient-text-green"
                >
                  {gradeResult.grade}
                </span>
              </div>
              <p className="text-slate-300 text-sm">
                Shelf Life:{" "}
                <span className="text-emerald-400 font-semibold">
                  ~{gradeResult.estimatedShelfLifeDays} Days
                </span>
              </p>
            </div>

            {/* Preview thumbnail */}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Graded crop"
                className="w-full h-32 object-cover rounded-xl border border-white/8"
              />
            )}

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Freshness</span>
                <span className="text-white font-medium">{gradeResult.freshness}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Water Content</span>
                <span className="text-sky-400 font-medium">{gradeResult.waterContentPercentage}%</span>
              </div>
              {gradeResult.blemishes.length > 0 && (
                <div className="py-1">
                  <span className="text-amber-400 text-xs">
                    ⚠ Blemishes: {gradeResult.blemishes.join(", ")}
                  </span>
                </div>
              )}
            </div>

            {/* Apply price button */}
            <button
              onClick={applyPrice}
              className="mt-1 w-full text-xs py-2.5 px-4 rounded-xl border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" />
              Apply Recommended Price: ₹{gradeResult.recommendedPrice}/unit
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
