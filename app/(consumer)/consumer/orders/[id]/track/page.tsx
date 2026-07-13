"use client";
import { useTranslation } from "@/hooks/useTranslation";
/**
 * @fileoverview app/(consumer)/orders/[id]/track/page.tsx
 * Phase 5: Live Order Tracking Page.
 *
 * Features:
 *  - Leaflet map (dark CartoDB tiles) — dynamically imported (SSR: false)
 *  - Simulated courier GPS movement: 2% interpolation toward consumer every 3s
 *  - Logistics summary card: Distance Remaining | ETA | Status
 *  - TraceabilityTimeline (shared from Phase 3/5)
 *  - OTP entry UI: 4 glass-input boxes, auto-focus-next, verify-delivery call
 *  - TanStack Query refetch every 5s for route endpoint
 */


import dynamic from "next/dynamic";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Navigation,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrderRoute, useVerifyDelivery } from "@/hooks/useOrders";
import { TraceabilityTimeline } from "@/components/tracking/TraceabilityTimeline";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/types";

// ─── Dynamic import of Leaflet map (SSR: false to avoid window errors) ─────────
const LeafletMap = dynamic(() => import("@/components/tracking/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading map…</p>
      </div>
    </div>
  ),
});

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; Icon: React.ElementType }
> = {
  pending:          { label: "Pending",          color: "#fbbf24", bg: "rgba(251,191,36,0.12)",   border: "rgba(251,191,36,0.3)",   Icon: Clock },
  accepted:         { label: "Accepted",          color: "#34d399", bg: "rgba(52,211,153,0.12)",   border: "rgba(52,211,153,0.3)",   Icon: CheckCircle2 },
  quality_verified: { label: "Quality Verified",  color: "#c084fc", bg: "rgba(192,132,252,0.12)",  border: "rgba(192,132,252,0.3)",  Icon: CheckCircle2 },
  dispatched:       { label: "In Transit",        color: "#38bdf8", bg: "rgba(56,189,248,0.12)",   border: "rgba(56,189,248,0.3)",   Icon: Truck },
  delivered:        { label: "Delivered ✅",      color: "#4ade80", bg: "rgba(74,222,128,0.12)",   border: "rgba(74,222,128,0.3)",   Icon: CheckCircle2 },
  cancelled:        { label: "Cancelled",         color: "#f87171", bg: "rgba(248,113,113,0.12)",  border: "rgba(248,113,113,0.3)",  Icon: AlertCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["pending"];
  const { Icon } = cfg;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function TrackingSkeletonLoader() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded-xl anim-shimmer" />
      <div className="premium-card rounded-3xl shadow-sm overflow-hidden h-96 anim-shimmer" />
      <div className="premium-card rounded-3xl shadow-sm p-5 grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2 text-center">
            <div className="h-3 w-20 rounded mx-auto anim-shimmer" />
            <div className="h-8 w-24 rounded mx-auto anim-shimmer" />
          </div>
        ))}
      </div>
      <div className="premium-card rounded-3xl shadow-sm p-6 space-y-4 anim-shimmer h-48" />
    </div>
  );
}

// ─── Interpolate position — moves pos 2% closer to target ─────────────────────
function interpolatePosition(
  pos: { lat: number; lng: number },
  target: { lat: number; lng: number },
  step = 0.02
): { lat: number; lng: number } {
  return {
    lat: pos.lat + (target.lat - pos.lat) * step,
    lng: pos.lng + (target.lng - pos.lng) * step,
  };
}

// ─── OTP Entry Component ──────────────────────────────────────────────────────
interface OtpEntryProps {
  orderId: string;
  onSuccess: () => void;
}

function OtpEntry({ orderId, onSuccess }: OtpEntryProps) {
  const { t } = useTranslation("consumer");
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([null, null, null, null]);

  const { mutate: verifyDelivery, isPending } = useVerifyDelivery();

  const handleChange = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, "").slice(-1); // only last digit
      const newDigits = [...digits];
      newDigits[index] = digit;
      setDigits(newDigits);
      setError(null);

      // Auto-focus next input
      if (digit && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
      if (pasted.length === 4) {
        setDigits(pasted.split(""));
        inputRefs.current[3]?.focus();
      }
    },
    []
  );

  const handleVerify = () => {
  const { t } = useTranslation("consumer");
    const otp = digits.join("");
    if (otp.length !== 4) {
      setError("Please enter the complete 4-digit OTP.");
      return;
    }
    verifyDelivery(
      { orderId, otp },
      {
        onSuccess: () => {
          setSuccess(true);
          onSuccess();
        },
        onError: (err: any) => {
          setError(err.message ?? "Invalid OTP. Try again.");
          setDigits(["", "", "", ""]);
          inputRefs.current[0]?.focus();
        },
      }
    );
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="premium-card rounded-3xl shadow-sm p-6 text-center"
        style={{ border: "1px solid rgba(74,222,128,0.3)" }}
      >
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="text-white font-bold text-lg">{t("deliveryConfirmed")}</h3>
        <p className="text-slate-400 text-sm mt-1">
          Thank you for your order. Enjoy your fresh produce!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="premium-card rounded-3xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔐</span>
        <div>
          <h3 className="font-semibold text-white text-sm">{t("deliveryOtpVerification")}</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {t("enterThe4DigitCodeSentToYourNo")}
          </p>
        </div>
      </div>

      {/* OTP input boxes */}
      <div className="flex gap-3 justify-center mb-4" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            id={`otp-digit-${i}`}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-14 h-14 bg-slate-50 border-2 border-slate-200 rounded-xl text-center text-2xl font-mono tracking-widest text-slate-800 focus:outline-none focus:border-emerald-500"
            style={{
              padding: "0",
              borderColor: digit
                ? "rgba(16,185,129,0.5)"
                : "rgba(255,255,255,0.08)",
              boxShadow: digit ? "0 0 12px rgba(16,185,129,0.2)" : "none",
              caretColor: "#10b981",
            }}
            autoComplete="off"
            aria-label={`OTP digit ${i + 1}`}
          />
        ))}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-xs text-center mb-3 flex items-center justify-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Verify button */}
      <button
        id="otp-verify-btn"
        onClick={handleVerify}
        disabled={isPending || digits.join("").length !== 4}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
        style={{
          background:
            digits.join("").length === 4
              ? "linear-gradient(135deg, #10b981, #0ea5e9)"
              : "rgba(255,255,255,0.05)",
          color: digits.join("").length === 4 ? "white" : "#475569",
          border: "1px solid rgba(255,255,255,0.08)",
          cursor: digits.join("").length !== 4 ? "not-allowed" : "pointer",
        }}
      >
        {isPending ? "Verifying…" : "Confirm Delivery"}
      </button>
    </div>
  );
}

// ─── Main Tracking Page ───────────────────────────────────────────────────────
export default function TrackOrderPage() {
  const { t } = useTranslation("consumer");
  const params = useParams<{ id: string }>();
  const orderId = params?.id;

  // Route data (live, refetches every 5s via hook)
  const { data: routeData, isLoading: routeLoading } = useOrderRoute(orderId);

  // Local courier position state (smoothly animated client-side)
  const [courierPos, setCourierPos] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Order full data from Supabase (for tracking_history + status)
  const [order, setOrder] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);

  // Track if delivery is done (to re-fetch order after OTP)
  const [deliveredAt, setDeliveredAt] = useState<string | null>(null);

  // Fetch full order from Supabase
  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, farmer:profiles!orders_farmer_id_fkey(id, full_name, avatar_url), consumer:profiles!orders_consumer_id_fkey(id, full_name, avatar_url)")
        .eq("id", orderId)
        .single();
      if (data) setOrder(data as Order);
      setOrderLoading(false);
    };
    fetchOrder();
  }, [orderId, deliveredAt]);

  // Seed courier position from routeData
  useEffect(() => {
    if (routeData && !courierPos) {
      setCourierPos(routeData.currentCourierCoords);
    }
  }, [routeData, courierPos]);

  // Simulate smooth courier movement every 3 seconds (2% per tick)
  useEffect(() => {
    if (!routeData || order?.status === "delivered") return;

    const interval = setInterval(() => {
      setCourierPos((prev) => {
        if (!prev) return routeData.currentCourierCoords;
        return interpolatePosition(prev, routeData.consumerCoords, 0.02);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [routeData, order?.status]);

  const isLoading = routeLoading || orderLoading;

  if (isLoading || !routeData) {
    return <TrackingSkeletonLoader />;
  }

  const status = order?.status ?? routeData.status ?? "pending";
  const isDispatched = status === "dispatched";
  const isDelivered = status === "delivered";

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Link
          href="/consumer/orders"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white leading-none">
            Live Order Tracking
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-mono">
            Order #{orderId?.slice(0, 8)}…
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* ── Map Container ───────────────────────────────────────────────────── */}
      <div className="premium-card rounded-3xl shadow-sm overflow-hidden h-96 relative">
        {/* Map legend overlay */}
        <div
          className="absolute top-3 left-3 z-10 flex flex-col gap-1 px-3 py-2 rounded-xl text-xs"
          style={{
            background: "rgba(5,8,20,0.75)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="text-slate-400">🌾 Farm Origin</span>
          <span className="text-slate-400">🏠 Your Address</span>
          <span className="text-slate-400">🚚 Courier</span>
        </div>

        {courierPos ? (
          <LeafletMap
            farmerCoords={routeData.farmerCoords}
            consumerCoords={routeData.consumerCoords}
            courierCoords={courierPos}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-slate-500 text-sm">
              Map available once order is dispatched
            </p>
          </div>
        )}
      </div>

      {/* ── Logistics Summary Card ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 premium-card rounded-3xl shadow-sm p-5">
        {/* Distance remaining */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Navigation className="w-3.5 h-3.5 text-slate-500" />
            <p className="text-slate-400 text-xs">{t("distance")}</p>
          </div>
          <p className="text-sky-400 font-bold text-2xl leading-none">
            {isDelivered ? "0" : routeData.distanceRemainingKm}
          </p>
          <p className="text-slate-600 text-[11px] mt-0.5">km remaining</p>
        </div>

        {/* ETA */}
        <div className="text-center border-x border-slate-100">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <p className="text-slate-400 text-xs">{t("eta")}</p>
          </div>
          <p className="text-emerald-400 font-bold text-2xl leading-none">
            {isDelivered ? "—" : `${routeData.estimatedTimeRemainingMin}`}
          </p>
          <p className="text-slate-600 text-[11px] mt-0.5">
            {isDelivered ? "Delivered!" : "minutes"}
          </p>
        </div>

        {/* Status */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Truck className="w-3.5 h-3.5 text-slate-500" />
            <p className="text-slate-400 text-xs">{t("schemeStatus")}</p>
          </div>
          <div className="flex justify-center mt-1">
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {/* ── OTP Entry (only when dispatched, not yet delivered) ──────────── */}
      <AnimatePresence>
        {isDispatched && !isDelivered && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <OtpEntry
              orderId={orderId!}
              onSuccess={() => setDeliveredAt(new Date().toISOString())}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Traceability Timeline ───────────────────────────────────────────── */}
      {order && (
        <TraceabilityTimeline
          trackingHistory={order.tracking_history ?? []}
        />
      )}

      {/* Farmer info */}
      {order?.farmer && (
        <div
          className="premium-card rounded-3xl shadow-sm p-4 flex items-center gap-3"
          style={{ border: "1px solid rgba(16,185,129,0.15)" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            {(order.farmer as any).full_name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium">
              {(order.farmer as any).full_name}
            </p>
            <p className="text-slate-500 text-xs">Your Farmer</p>
          </div>
          <div className="ml-auto">
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      )}
    </div>
  );
}