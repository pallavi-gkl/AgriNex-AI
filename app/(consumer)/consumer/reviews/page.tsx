"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview Reviews Page — /consumer/reviews
 * Allows customers to write reviews for delivered orders and browse community ratings.
 * Redesigned with premium cards, summary stats, interactive stars, and helpful votes.
 * Preserves 100% of underlying API submission logic.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Star, CheckCircle2, AlertCircle, Loader2, MessageSquare,
  Package, ArrowRight, ThumbsUp, User, ShoppingBag,
  Award, ShieldCheck, ThumbsDown, Eye, RefreshCw, Flag,
} from "lucide-react";
import { useConsumerOrders, useSubmitReview } from "@/hooks/useConsumerOrders";
import { DEMO_ORDERS, DEMO_REVIEWS, DEMO_CROPS } from "@/lib/demoData";

// ─── Helper: Find Crop Image ──────────────────────────────────────────────────
function getCropImageUrl(productTitle: string): string | null {
  const match = DEMO_CROPS.find(c => c.title.toLowerCase().includes(productTitle.toLowerCase()));
  return match?.image_url ?? null;
}

// ─── Star Rating Input ────────────────────────────────────────────────────────
function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const active = i + 1 <= (hovered || value);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            style={{
              background: "none", border: "none", padding: 0, cursor: "pointer",
              transition: "transform 0.15s ease",
            }}
            className="hover:scale-125"
          >
            <Star
              style={{
                width: "28px", height: "28px", transition: "colors 0.15s",
                color: active ? "#f59e0b" : "#cbd5e1",
              }}
              fill={active ? "#fbbf24" : "none"}
            />
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
    e.preventDefault();
    if (rating === 0) return;
    submitReview({ orderId: order.id, revieweeId: farmerId, rating, comment }, {
      onSuccess: () => { setSubmitted(true); setTimeout(onSuccess, 1500); },
    });
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "12px", padding: "32px 0", textAlign: "center",
        }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4",
          border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <CheckCircle2 style={{ width: 28, height: 28, color: "#10b981" }} />
        </div>
        <p style={{ fontSize: "16px", fontWeight: 800, color: "#1e293b", margin: 0 }}>Review Submitted!</p>
        <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Thank you for sharing your experience</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Product preview banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "12px 16px", borderRadius: "16px",
        background: "#f8fafc", border: "1px solid #e2e8f0",
      }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "10px",
          overflow: "hidden", background: "#f1f5f9", flexShrink: 0,
        }}>
          {firstItem?.product?.image_url && (
            <img src={firstItem.product.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>
        <div style={{ textAlign: "left" }}>
          <p style={{ fontSize: "14px", fontWeight: 800, color: "#1e293b", margin: 0 }}>{firstItem?.product?.title ?? "Product"}</p>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0", fontWeight: 650 }}>
            from {order.farmer?.full_name ?? "Farmer partner"}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div style={{ textAlign: "left" }}>
        <label style={{ fontSize: "13px", fontWeight: 800, color: "#475569", display: "block", marginBottom: "8px" }}>
          Your Rating *
        </label>
        <StarRatingInput value={rating} onChange={setRating} />
        {rating > 0 && (
          <p style={{
            fontSize: "12px", fontWeight: 800, marginTop: "6px",
            color: rating >= 4 ? "#10b981" : rating === 3 ? "#d97706" : "#ef4444",
          }}>
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][rating]}
          </p>
        )}
      </div>

      {/* Comment */}
      <div style={{ textAlign: "left" }}>
        <label style={{ fontSize: "13px", fontWeight: 800, color: "#475569", display: "block", marginBottom: "8px" }}>
          {t("yourReview")}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share details about the crop quality, freshness, farmer delivery time, or packaging..."
          rows={4}
          style={{
            width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: "16px", padding: "12px 16px", fontSize: "13px",
            color: "#334155", outline: "none", resize: "none", fontFamily: "inherit",
          }}
        />
      </div>

      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 14px", borderRadius: "12px",
          background: "#fef2f2", border: "1px solid #fee2e2",
          color: "#ef4444", fontSize: "12px",
        }}>
          <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
          <span>{(error as Error).message}</span>
        </div>
      )}

      <button
        type="submit"
        id="submit-review-btn"
        disabled={isPending || rating === 0}
        style={{
          width: "100%", padding: "14px 0", borderRadius: "16px",
          border: "none", color: "#ffffff", fontWeight: 850, fontSize: "14px",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          transition: "transform 0.15s, opacity 0.15s",
          background: "linear-gradient(135deg, #10b981, #059669)",
          boxShadow: "0 4px 12px rgba(16,185,129,0.25)",
        }}
        onMouseEnter={e => { if (rating > 0) e.currentTarget.style.transform = "scale(1.02)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
      >
        {isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
        ) : (
          <><Star className="w-4 h-4" />Submit Review</>
        )}
      </button>
    </form>
  );
}

// ─── Summary KPI Card ─────────────────────────────────────────────────────────
function SummaryCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; bg: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
      style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(8px)",
        borderRadius: "20px",
        border: "1px solid #e2e8f0",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        flex: "1 1 180px",
        minWidth: 0,
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: "12px", background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        color, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ minWidth: 0, textAlign: "left" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{label}</p>
        <p style={{ fontSize: "20px", fontWeight: 900, color: "#1e293b", margin: "2px 0 0", lineHeight: 1 }}>{value}</p>
      </div>
    </motion.div>
  );
}

// ─── Date Formatter Helper ───────────────────────────────────────────────────
function parseDateStr(dateStr: string) {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return `${day} ${months[monthIdx] || parts[1]} ${year}`;
  }
  return dateStr;
}

// ─── Community Review Card ────────────────────────────────────────────────────
function CommunityReviewCard({ review }: { review: typeof DEMO_REVIEWS[0] }) {
  const [likes, setLikes] = useState<number>((review as any).likes ?? 12);
  const [liked, setLiked] = useState(false);
  const [reported, setReported] = useState(false);
  const [reportToast, setReportToast] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikes(prev => prev - 1);
      setLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setLiked(true);
    }
  };

  const handleReport = () => {
    setReported(true);
    setReportToast(true);
    setTimeout(() => setReportToast(false), 3000);
  };

  const cropImage = getCropImageUrl(review.product);

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 12px 24px rgba(0,0,0,0.06)" }}
      style={{
        background: "#ffffff",
        borderRadius: "24px",
        border: "1px solid #e2e8f0",
        padding: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "all 0.2s ease",
      }}
    >
      {/* Toast Alert */}
      <AnimatePresence>
        {reportToast && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
              background: "#ef4444", color: "#fff", padding: "12px 20px",
              borderRadius: "14px", display: "flex", alignItems: "center", gap: "8px",
              fontWeight: 700, fontSize: "13px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            }}>
            <Flag className="w-4 h-4 animate-pulse" />
            Review reported for moderation.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row 1: Reviewer Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: "linear-gradient(135deg, #10b981, #059669)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "13px", fontWeight: 900, color: "#fff", flexShrink: 0,
        }}>
          {review.reviewer.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b" }}>{review.reviewer}</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "3px",
              fontSize: "9px", fontWeight: 800, color: "#059669",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: "20px",
            }}>
              ✔ Verified Buyer
            </span>
          </div>
          <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600 }}>
            Reviewed on {parseDateStr(review.date)}
          </span>
        </div>
      </div>

      {/* Row 2: Stars */}
      <div style={{ display: "flex", gap: "2px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            style={{
              width: "14px", height: "14px",
              color: i < review.rating ? "#fbbf24" : "#e2e8f0",
            }}
            fill={i < review.rating ? "#fbbf24" : "none"}
          />
        ))}
      </div>

      {/* Row 3: Product Thumbnail */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        background: "#f8fafc", padding: "8px 12px", borderRadius: "14px",
        border: "1px solid #f1f5f9",
      }}>
        <div style={{ width: 44, height: 44, borderRadius: "8px", overflow: "hidden", background: "#f1f5f9", flexShrink: 0 }}>
          {cropImage ? (
            <img src={cropImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Package className="w-5 h-5 text-slate-350 text-slate-300" />
            </div>
          )}
        </div>
        <div>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Verified Purchase</p>
          <p style={{ fontSize: "12px", fontWeight: 800, color: "#334155", margin: "2px 0 0" }}>{review.product}</p>
        </div>
      </div>

      {/* Row 4: Comment text */}
      <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.5, margin: 0, fontWeight: 550 }}>
        "{review.comment}"
      </p>

      {/* Row 5: Action footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: "1px solid #f1f5f9", paddingTop: "10px", marginTop: "4px",
      }}>
        <button
          onClick={handleLike}
          style={{
            background: liked ? "#f0fdf4" : "none",
            border: liked ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
            color: liked ? "#059669" : "#64748b",
            padding: "5px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: 850,
            cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
            transition: "all 0.15s",
          }}
        >
          <ThumbsUp style={{ width: 12, height: 12 }} />
          Helpful ({likes})
        </button>

        <button
          onClick={handleReport}
          disabled={reported}
          style={{
            background: "none", border: "none", color: reported ? "#cbd5e1" : "#ef4444",
            fontSize: "11px", fontWeight: 700, cursor: reported ? "default" : "pointer",
            display: "flex", alignItems: "center", gap: "4px",
          }}
        >
          <Flag style={{ width: 12, height: 12 }} />
          {reported ? "Reported" : "Report"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const { t } = useTranslation("consumer");
  const searchParams = useSearchParams();
  const prefilledOrderId = searchParams?.get("orderId") ?? null;
  const { data: liveOrders = [], isLoading } = useConsumerOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(prefilledOrderId);

  const orders = liveOrders.length > 0 ? liveOrders : DEMO_ORDERS;
  const reviewableOrders = orders.filter((o: any) => o.status === "delivered");
  const selectedOrder = reviewableOrders.find((o: any) => o.id === selectedOrderId);

  // Sync state if param changes
  useEffect(() => {
    if (prefilledOrderId) {
      setSelectedOrderId(prefilledOrderId);
    }
  }, [prefilledOrderId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: "28px 0", minHeight: "100vh", background: "#f8fafc" }}
    >
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ textAlign: "left" }}>
          <h1 style={{
            fontSize: "28px", fontWeight: 950, color: "#1e293b",
            display: "flex", alignItems: "center", gap: "10px", margin: 0,
          }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 44, height: 44, borderRadius: "14px",
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              border: "1px solid #fcd34d",
            }}>
              <Star style={{ width: 22, height: 22, color: "#d97706", fill: "#d97706" }} />
            </span>
            Reviews & Ratings
          </h1>
          <p style={{ color: "#64748b", fontSize: "13px", fontWeight: 650, marginTop: "6px" }}>
            Share your experience and help other buyers make better decisions
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/consumer/orders"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "9px 18px", borderRadius: "12px",
              background: "#ffffff", border: "1px solid #e2e8f0",
              color: "#475569", fontWeight: 700, fontSize: "12px",
              textDecoration: "none", cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#ffffff"; }}
          >
            <Package style={{ width: 14, height: 14 }} />
            My Orders
          </Link>
          <Link href="/consumer/marketplace"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "9px 18px", borderRadius: "12px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#ffffff", fontWeight: 800, fontSize: "12px",
              textDecoration: "none", cursor: "pointer", transition: "transform 0.15s",
              boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
          >
            Continue Shopping
            <ArrowRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>
      </div>

      {/* ── Summary Stats Cards ────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px",
        marginBottom: "32px",
      }}>
        <SummaryCard icon={<Star style={{ width: 18, height: 18 }} />} label="Average Rating" value="4.8 / 5" color="#d97706" bg="rgba(217,119,6,0.08)" />
        <SummaryCard icon={<MessageSquare style={{ width: 18, height: 18 }} />} label="Reviews Written" value="12" color="#10b981" bg="rgba(16,185,129,0.08)" />
        <SummaryCard icon={<ShieldCheck style={{ width: 18, height: 18 }} />} label="Verified Reviews" value="100%" color="#0ea5e9" bg="rgba(14,165,233,0.08)" />
        <SummaryCard icon={<ThumbsUp style={{ width: 18, height: 18 }} />} label="Helpful Votes" value="84" color="#8b5cf6" bg="rgba(139,92,246,0.08)" />
      </div>

      {/* ── Page Grid ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }} className="lg:grid-cols-5">

        {/* Column Left: Order list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }} className="lg:col-span-2">
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px", textAlign: "left" }}>
            Select Delivered Order
          </h3>

          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ height: "72px", borderRadius: "16px", background: "#ffffff" }} className="animate-pulse" />
              ))}
            </div>
          ) : reviewableOrders.length === 0 ? (
            <div style={{
              background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0",
              padding: "40px 24px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%", background: "#fef2f2",
                border: "2px solid #fee2e2", display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 16px",
              }}>
                <Package className="w-8 h-8 text-rose-500" />
              </div>
              <p style={{ fontSize: "15px", fontWeight: 800, color: "#374151", margin: "0 0 4px" }}>No delivered orders yet</p>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 16px", fontWeight: 600 }}>
                Place your first order and return here to write a verified review.
              </p>
              <Link href="/consumer/marketplace"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff", fontWeight: 800, fontSize: "12px", textDecoration: "none",
                }}
              >
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {reviewableOrders.map((order: any) => {
                const firstItem = order.order_items?.[0];
                const isSelected = selectedOrderId === order.id;
                return (
                  <motion.button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    whileHover={{ scale: 1.01 }}
                    style={{
                      width: "100%", textAlign: "left", padding: "16px", borderRadius: "20px",
                      transition: "all 0.2s ease", cursor: "pointer",
                      background: isSelected ? "#f0fdf4" : "#ffffff",
                      border: `1px solid ${isSelected ? "#86efac" : "#e2e8f0"}`,
                      boxShadow: isSelected ? "0 4px 12px rgba(16,185,129,0.06)" : "0 1px 3px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "10px", overflow: "hidden", background: "#f1f5f9", flexShrink: 0 }}>
                        {firstItem?.product?.image_url && (
                          <img src={firstItem.product.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "14px", fontWeight: 800, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {firstItem?.product?.title ?? "Farm Crop"}
                        </p>
                        <p style={{ fontSize: "11px", color: "#94a3b8", margin: "2px 0 0", fontWeight: 650 }}>
                          #ORD-{order.id.substring(0, 8).toUpperCase()} · ₹{(order.total_amount ?? 0).toLocaleString()}
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Column Right: Review Form / Empty Form state / Community reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="lg:col-span-3">

          {/* Form / Empty review state */}
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                style={{
                  background: "#ffffff", borderRadius: "28px", border: "1px solid #e2e8f0",
                  padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                }}
              >
                <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#1e293b", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "6px", textAlign: "left" }}>
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  Write Your Review
                </h3>
                <ReviewForm order={selectedOrder} onSuccess={() => setSelectedOrderId(null)} />
              </motion.div>
            ) : (
              <motion.div
                key="empty-form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                style={{
                  background: "#ffffff", borderRadius: "28px", border: "1px solid #e2e8f0",
                  padding: "48px 24px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}
              >
                <div style={{
                  width: 60, height: 60, borderRadius: "50%", background: "#fffbeb",
                  border: "2px solid #fde68a", display: "flex", alignItems: "center",
                  justifyContent: "center", marginBottom: 16,
                }}>
                  <Star style={{ width: 28, height: 28, color: "#d97706", fill: "#d97706" }} />
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 850, color: "#1e293b", margin: "0 0 8px" }}>
                  Write Your First Review
                </h3>
                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "24px", maxWidth: "340px", fontWeight: 600 }}>
                  Select a delivered order from the panel to share your rating and review comments with the community.
                </p>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                  <button
                    onClick={() => {
                      const el = document.querySelector("h3[style*='Select Delivered Order']");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    style={{
                      padding: "10px 18px", borderRadius: "12px",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff", fontWeight: 800, fontSize: "12px", border: "none",
                      cursor: "pointer", boxShadow: "0 4px 10px rgba(16,185,129,0.2)",
                    }}
                  >
                    📦 View Delivered Orders
                  </button>
                  <Link href="/consumer/marketplace"
                    style={{
                      padding: "9px 18px", borderRadius: "12px",
                      background: "#ffffff", border: "1px solid #e2e8f0",
                      color: "#475569", fontWeight: 700, fontSize: "12px", textDecoration: "none",
                    }}
                  >
                    🛍 Continue Shopping
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Community reviews section */}
          <div>
            <h3 style={{
              fontSize: "14px", fontWeight: 800, color: "#64748b",
              textTransform: "uppercase", letterSpacing: "0.06em",
              margin: "0 0 16px", display: "flex", alignItems: "center", gap: "6px", textAlign: "left",
            }}>
              <ThumbsUp style={{ width: 16, height: 16, color: "#7c3aed" }} />
              {t("communityReviews")}
            </h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}>
              {DEMO_REVIEWS.map((review) => (
                <CommunityReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}