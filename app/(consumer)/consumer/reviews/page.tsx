"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview Reviews Page — /consumer/reviews
 * Allows customers to write reviews for delivered orders.
 * Shows existing reviews and allows rating + comment submission.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Star, CheckCircle2, AlertCircle, Loader2, MessageSquare,
  Package, ArrowRight, ThumbsUp, User,
} from "lucide-react";
import { useConsumerOrders, useSubmitReview } from "@/hooks/useConsumerOrders";
import { DEMO_ORDERS, DEMO_REVIEWS } from "@/lib/demoData";

// ─── Star Rating Input ────────────────────────────────────────────────────────
function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const active = i + 1 <= (hovered || value);
        return (
          <button key={i} type="button"
            onClick={() => onChange(i + 1)}
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            className="w-8 h-8 transition-transform hover:scale-125">
            <Star className={`w-8 h-8 transition-colors ${active ? "text-amber-400" : "text-slate-200"}`}
              fill={active ? "#fbbf24" : "none"} />
          </button>
        );
      })}
    </div>
  );
}

// ─── Review Form ──────────────────────────────────────────────────────────────
function ReviewForm({ order, onSuccess }: { order: any; onSuccess: () => void }) {
  const { t } = useTranslation("consumer");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { mutate: submitReview, isPending, error } = useSubmitReview();

  const firstItem = order.order_items?.[0];
  const farmerId = order.farmer_id ?? order.farmer?.id ?? "";

  const handleSubmit = (e: React.FormEvent) => {
  const { t } = useTranslation("consumer");
    e.preventDefault();
    if (rating === 0) return;
    submitReview({ orderId: order.id, revieweeId: farmerId, rating, comment }, {
      onSuccess: () => { setSubmitted(true); setTimeout(onSuccess, 1500); },
    });
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        <p className="text-slate-800 font-bold">Review Submitted!</p>
        <p className="text-slate-500 text-sm">Thank you for your feedback</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product preview */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-emerald-50">
          {firstItem?.product?.image_url && <img src={firstItem.product.image_url} alt="" className="w-full h-full object-cover" />}
        </div>
        <div>
          <p className="text-slate-800 text-sm font-semibold">{firstItem?.product?.title ?? "Product"}</p>
          <p className="text-slate-500 text-xs">from {order.farmer?.full_name ?? "Farmer"}</p>
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="text-slate-600 text-sm block mb-2 font-semibold">Your Rating *</label>
        <StarRatingInput value={rating} onChange={setRating} />
        {rating > 0 && (
          <p className="text-xs mt-1 font-semibold" style={{ color: rating >= 4 ? "#059669" : rating === 3 ? "#d97706" : "#dc2626" }}>
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][rating]}
          </p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label className="text-slate-600 text-sm block mb-2 font-semibold">{t("yourReview")}</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with the product quality, freshness, delivery..."
          rows={4}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-700 bg-rose-50 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {(error as Error).message}
        </div>
      )}

      <button type="submit" id="submit-review-btn" disabled={isPending || rating === 0}
        className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 12px rgba(16,185,129,0.25)" }}>
        {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : <><Star className="w-4 h-4" />Submit Review</>}
      </button>
    </form>
  );
}

// ─── Main Reviews Page ────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const { t } = useTranslation("consumer");
  const searchParams = useSearchParams();
  const prefilledOrderId = searchParams?.get("orderId") ?? null;
  const { data: liveOrders = [], isLoading } = useConsumerOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(prefilledOrderId);

  const orders = liveOrders.length > 0 ? liveOrders : DEMO_ORDERS;
  const reviewableOrders = orders.filter((o: any) => o.status === "delivered");

  const selectedOrder = reviewableOrders.find((o: any) => o.id === selectedOrderId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500" />
            Reviews & Ratings
          </h1>
          <p className="text-slate-500 text-sm mt-1">Share your experience and help other buyers</p>
        </div>
        <Link href="/consumer/marketplace"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 bg-emerald-50 border border-emerald-200 text-emerald-700 no-underline">
          Shop More
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: reviewable orders */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-slate-500 text-sm font-semibold">Select Delivered Order</h3>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse bg-slate-100" />)}</div>
          ) : reviewableOrders.length === 0 ? (
            <div className="premium-card rounded-3xl p-6 text-center shadow-sm">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No delivered orders to review yet</p>
              <Link href="/consumer/marketplace" className="mt-3 text-xs text-emerald-600 hover:underline inline-block font-semibold no-underline">
                Place an order →
              </Link>
            </div>
          ) : (
            reviewableOrders.map((order: any) => {
              const firstItem = order.order_items?.[0];
              const isSelected = selectedOrderId === order.id;
              return (
                <motion.button key={order.id} onClick={() => setSelectedOrderId(order.id)}
                  className="w-full text-left p-4 rounded-2xl transition-all shadow-sm"
                  style={{
                    background: isSelected ? "#f0fdf4" : "#fff",
                    border: `1px solid ${isSelected ? "#86efac" : "#e2e8f0"}`,
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-emerald-50">
                      {firstItem?.product?.image_url && <img src={firstItem.product.image_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-800 text-sm font-semibold truncate">{firstItem?.product?.title ?? "Product"}</p>
                      <p className="text-slate-400 text-xs">#{order.id.substring(0, 6).toUpperCase()} · ₹{(order.total_amount ?? 0).toLocaleString()}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />}
                  </div>
                </motion.button>
              );
            })
          )}
        </div>

        {/* Right: review form / existing reviews */}
        <div className="lg:col-span-3 space-y-6">
          {selectedOrder ? (
            <div className="premium-card rounded-3xl p-5 shadow-sm">
              <h3 className="text-slate-800 font-bold text-sm mb-5 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Write Your Review
              </h3>
              <ReviewForm order={selectedOrder} onSuccess={() => setSelectedOrderId(null)} />
            </div>
          ) : (
            <div className="premium-card rounded-3xl p-8 text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm font-semibold">Select a delivered order on the left to write your review</p>
            </div>
          )}

          {/* Community reviews */}
          <div>
            <h3 className="text-slate-800 font-bold text-sm mb-3 flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-purple-600" />
              {t("communityReviews")}
            </h3>
            <div className="space-y-4">
              {DEMO_REVIEWS.map((r) => (
                <div key={r.id} className="premium-card rounded-3xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
                      {r.reviewer.charAt(0)}
                    </div>
                    <div>
                      <p className="text-slate-800 text-xs font-bold">{r.reviewer}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5" fill={i < r.rating ? "#fbbf24" : "none"} style={{ color: i < r.rating ? "#fbbf24" : "#e2e8f0" }} />
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-slate-400 text-[10px] font-semibold">{r.date}</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{r.comment}</p>
                  <p className="text-slate-400 text-[10px] mt-1.5 font-semibold">Verified purchase: {r.product}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}