"use client";

/**
 * @fileoverview ProductListingForm — speech-enabled product creation form.
 * Each field has a mic button for Web Speech API voice input.
 * Price field has an AI price recommendation button.
 * On submit: POST /api/products.
 */
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Sparkles, PackagePlus, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useCreateProduct } from "@/hooks/useProducts";
import type { CropGradeResult } from "@/types";

// ─── Zod schema ───────────────────────────────────────────────────────────────
const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  pricePerUnit: z.coerce.number().positive("Price must be positive"),
  unitType: z.string().min(1, "Please select a unit type"),
  quantityAvailable: z.coerce.number().positive("Quantity must be positive"),
});

type ProductFormData = z.infer<typeof productSchema>;

const CATEGORIES = ["Vegetables", "Fruits", "Grains", "Pulses", "Spices", "Leafy Greens", "Dairy", "Others"];
const UNIT_TYPES = ["kg", "g", "litre", "dozen", "piece", "quintal", "bag", "bunch"];

interface ProductListingFormProps {
  aiGradeResult?: CropGradeResult | null;
  className?: string;
}

// ─── Speech recognition helper ────────────────────────────────────────────────
function startSpeech(onResult: (text: string) => void, onEnd: () => void): (() => void) | null {
  const SR =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return null;

  const recognition = new SR();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (e: any) => {
    const transcript = e.results[0][0].transcript;
    onResult(transcript);
  };
  recognition.onend = onEnd;
  recognition.onerror = onEnd;
  recognition.start();

  return () => recognition.stop();
}

export default function ProductListingForm({ aiGradeResult, className = "" }: ProductListingFormProps) {
  const { mutate: createProduct, isPending, isSuccess, isError, reset: resetMutation } = useCreateProduct();
  const [aiRationale, setAiRationale] = useState<string | null>(null);
  const [activeVoiceField, setActiveVoiceField] = useState<keyof ProductFormData | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const stopSpeechRef = useRef<(() => void) | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      pricePerUnit: aiGradeResult?.recommendedPrice,
    },
  });

  const category = watch("category");
  const priceValue = watch("pricePerUnit");

  // ── Voice input for a specific field ────────────────────────────────────────
  const toggleVoice = (field: keyof ProductFormData) => {
    // Stop any currently active voice session
    if (stopSpeechRef.current) {
      stopSpeechRef.current();
      stopSpeechRef.current = null;
      if (activeVoiceField === field) {
        setActiveVoiceField(null);
        return;
      }
    }

    setActiveVoiceField(field);
    const stop = startSpeech(
      (text) => {
        setValue(field, text as any, { shouldValidate: true });
        setActiveVoiceField(null);
      },
      () => setActiveVoiceField(null)
    );

    if (!stop) {
      alert("Voice input is not supported in this browser.");
      setActiveVoiceField(null);
      return;
    }
    stopSpeechRef.current = stop;
  };

  // ── AI price recommendation ──────────────────────────────────────────────────
  const getAIPrice = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/ai/recommend-price`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cropType: watch("title") || "Unknown Crop",
            grade: aiGradeResult?.grade ?? "A",
            location: "India",
            baseWholesalePrice: 20,
          }),
        }
      );
      const data = await res.json();
      setValue("pricePerUnit", data.recommendedPrice, { shouldValidate: true });
      setAiRationale(data.rationale);
    } catch {
      setAiRationale("Could not fetch AI price. Please try again.");
    }
  };

  // ── Form submission ──────────────────────────────────────────────────────────
  const onSubmit = (formData: ProductFormData) => {
    const token = localStorage.getItem("sb-access-token") ??
      document.cookie.match(/sb-.*-auth-token=([^;]+)/)?.[1] ?? "";

    createProduct(
      {
        ...formData,
        description: formData.description ?? "",
        qualityGrade: aiGradeResult?.grade,
        qualityReport: aiGradeResult
          ? {
              freshness: aiGradeResult.freshness,
              waterContentPercentage: aiGradeResult.waterContentPercentage,
              estimatedShelfLifeDays: aiGradeResult.estimatedShelfLifeDays,
              blemishes: aiGradeResult.blemishes,
            }
          : undefined,
        recommendedPrice: aiGradeResult?.recommendedPrice,
        token,
      },
      {
        onSuccess: () => {
          setSuccessMsg("Product listed successfully!");
          reset();
          setAiRationale(null);
          setTimeout(() => {
            setSuccessMsg(null);
            resetMutation();
          }, 3000);
        },
      }
    );
  };

  // ── Field row helper ─────────────────────────────────────────────────────────
  const VoiceMicButton = ({ field }: { field: keyof ProductFormData }) => (
    <button
      type="button"
      onClick={() => toggleVoice(field)}
      className={`absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
        activeVoiceField === field
          ? "bg-purple-500/30 border border-purple-500/50 text-purple-300 animate-pulse"
          : "bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20"
      }`}
      title={`Voice input for ${field}`}
      aria-label={`Voice input for ${field}`}
    >
      {activeVoiceField === field ? (
        <MicOff className="w-3.5 h-3.5" aria-hidden="true" />
      ) : (
        <Mic className="w-3.5 h-3.5" aria-hidden="true" />
      )}
    </button>
  );

  return (
    <div className={`glass-panel rounded-2xl p-5 flex flex-col gap-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <PackagePlus className="w-4 h-4 text-emerald-400" />
        <h3 className="text-white font-semibold text-sm">Create Product Listing</h3>
        {aiGradeResult && (
          <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
            Grade {aiGradeResult.grade} Applied
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-medium">Crop / Product Name</label>
          <div className="relative">
            <input
              {...register("title")}
              className="glass-input pr-11 text-sm"
              placeholder="e.g. Organically Grown Potatoes"
            />
            <VoiceMicButton field="title" />
          </div>
          {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
        </div>

        {/* Category + Unit Type — 2 col */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-medium">Category</label>
            <div className="relative">
              <select
                {...register("category")}
                className="glass-input pr-11 text-sm appearance-none"
              >
                <option value="" disabled>Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                ))}
              </select>
              <VoiceMicButton field="category" />
            </div>
            {errors.category && <p className="text-red-400 text-xs">{errors.category.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-medium">Unit Type</label>
            <div className="relative">
              <select
                {...register("unitType")}
                className="glass-input pr-11 text-sm appearance-none"
              >
                <option value="" disabled>Select unit</option>
                {UNIT_TYPES.map((u) => (
                  <option key={u} value={u} className="bg-slate-900 text-white">{u}</option>
                ))}
              </select>
              <VoiceMicButton field="unitType" />
            </div>
            {errors.unitType && <p className="text-red-400 text-xs">{errors.unitType.message}</p>}
          </div>
        </div>

        {/* Price + Quantity — 2 col */}
        <div className="grid grid-cols-2 gap-3">
          {/* Price with AI button */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-medium">Price / Unit (₹)</label>
            <div className="relative">
              <input
                {...register("pricePerUnit")}
                type="number"
                step="0.01"
                className="glass-input text-sm"
                style={{ paddingRight: "6.5rem" }}
                placeholder="e.g. 24.00"
              />
              <button
                type="button"
                onClick={getAIPrice}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2 py-1 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                AI Price
              </button>
            </div>
            {aiRationale && (
              <p className="text-xs text-purple-300/70 italic leading-tight">{aiRationale}</p>
            )}
            {errors.pricePerUnit && (
              <p className="text-red-400 text-xs">{errors.pricePerUnit.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-medium">Quantity Available</label>
            <div className="relative">
              <input
                {...register("quantityAvailable")}
                type="number"
                step="0.01"
                className="glass-input pr-11 text-sm"
                placeholder="e.g. 150"
              />
              <VoiceMicButton field="quantityAvailable" />
            </div>
            {errors.quantityAvailable && (
              <p className="text-red-400 text-xs">{errors.quantityAvailable.message}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-medium">Description</label>
          <div className="relative">
            <textarea
              {...register("description")}
              rows={3}
              className="glass-input pr-11 text-sm resize-none"
              placeholder="Describe your produce — origin, farming method, freshness..."
            />
            <button
              type="button"
              onClick={() => toggleVoice("description")}
              className={`absolute right-3 top-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                activeVoiceField === "description"
                  ? "bg-purple-500/30 border border-purple-500/50 text-purple-300 animate-pulse"
                  : "bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
            boxShadow: isPending ? "none" : "0 0 20px rgba(16,185,129,0.3)",
          }}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Publishing Listing...
            </>
          ) : (
            <>
              <PackagePlus className="w-4 h-4" />
              Publish Listing
            </>
          )}
        </button>

        {/* Success / Error feedback */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm"
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              {successMsg}
            </motion.div>
          )}
          {isError && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              Failed to create listing. Please try again.
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
