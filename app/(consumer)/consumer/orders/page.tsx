"use client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @fileoverview Consumer Orders Page — /consumer/orders
 * Displays all orders for the logged-in consumer with a premium,
 * high-fidelity design inspired by Amazon, Blinkit, and Apple dashboards.
 * Placed orders are strictly database-driven.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package, Truck, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp,
  MapPin, Calendar, ShoppingBag, Star, BarChart2,
  RefreshCw, TrendingUp, ArrowRight, Download, CreditCard,
  User, ShieldCheck, Tag, Info,
} from "lucide-react";
import { useConsumerOrders } from "@/hooks/useConsumerOrders";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import { useCart } from "@/context/CartContext";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType; step: number }> = {
  pending:          { label: "Order Placed",      color: "#f97316", bg: "#fff7ed", border: "#ffedd5", icon: Clock,        step: 1 },
  accepted:         { label: "Packed",            color: "#8b5cf6", bg: "#f5f3ff", border: "#e0e7ff", icon: CheckCircle2, step: 2 },
  quality_verified: { label: "Shipped",           color: "#0ea5e9", bg: "#f0f9ff", border: "#e0f2fe", icon: CheckCircle2, step: 3 },
  dispatched:       { label: "Out For Delivery",  color: "#d97706", bg: "#fffbeb", border: "#fef3c7", icon: Truck,        step: 4 },
  delivered:        { label: "Delivered",         color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0", icon: CheckCircle2, step: 5 },
  cancelled:        { label: "Cancelled",         color: "#ef4444", bg: "#fef2f2", border: "#fee2e2", icon: AlertCircle,  step: 0 },
};

const TIMELINE_STEPS = [
  { key: "pending", label: "Placed", step: 1 },
  { key: "accepted", label: "Packed", step: 2 },
  { key: "quality_verified", label: "Shipped", step: 3 },
  { key: "dispatched", label: "Out For Delivery", step: 4 },
  { key: "delivered", label: "Delivered", step: 5 }
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; bg: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
      style={{
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        borderRadius: "24px",
        border: "1px solid #e2e8f0",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        flex: "1 1 200px",
        minWidth: 0,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: "16px", background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        color, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, textAlign: "left" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{label}</p>
        <p style={{ fontSize: "24px", fontWeight: 900, color: "#1e293b", margin: "2px 0 0", lineHeight: 1 }}>{value}</p>
      </div>
    </motion.div>
  );
}

// ─── Timeline Widget ──────────────────────────────────────────────────────────
function OrderTimeline({ status }: { status: string }) {
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;

  if (status === "cancelled") {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: "6px",
        background: "#fef2f2", border: "1px solid #fee2e2",
        padding: "8px 14px", borderRadius: "12px", width: "fit-content",
      }}>
        <AlertCircle style={{ width: 14, height: 14, color: "#ef4444" }} />
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#b91c1c" }}>This order was cancelled</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%", maxWidth: "480px", margin: "8px 0" }}>
      {TIMELINE_STEPS.map((s, idx) => {
        const done = currentStep >= s.step;
        const active = currentStep === s.step;
        const stepColor = done ? STATUS_CONFIG[s.key]?.color || "#10b981" : "#cbd5e1";

        return (
          <div key={s.key} style={{ flex: idx === TIMELINE_STEPS.length - 1 ? "0 0 auto" : 1, display: "flex", alignItems: "center", position: "relative" }}>
            {/* Step node */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, position: "relative" }}>
              <div style={{
                width: active ? "20px" : "14px",
                height: active ? "20px" : "14px",
                borderRadius: "50%",
                background: done ? stepColor : "#fff",
                border: `3px solid ${stepColor}`,
                boxShadow: active ? `0 0 10px ${stepColor}` : "none",
                transition: "all 0.3s ease",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
              </div>
              <span style={{
                fontSize: "9px", fontWeight: active ? 800 : 600,
                color: active ? "#1e293b" : "#64748b",
                marginTop: "4px", whiteSpace: "nowrap",
                position: "absolute", top: "20px", transform: "translateY(0)",
                textAlign: "center",
              }}>
                {s.label}
              </span>
            </div>

            {/* Connection bar */}
            {idx < TIMELINE_STEPS.length - 1 && (
              <div style={{
                height: "3px",
                flex: 1,
                background: currentStep > s.step ? stepColor : "#e2e8f0",
                margin: "0 -4px",
                zIndex: 1,
                transition: "background 0.3s ease",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: any }) {
  const { t } = useTranslation("consumer");
  const router = useRouter();
  const { addToCart, updateQty } = useCart();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
  const [expanded, setExpanded] = useState(false);
  const [invoiceToast, setInvoiceToast] = useState(false);

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending"];
  const Icon = cfg.icon;
  const firstItem = order.order_items?.[0];
  const itemCount = order.order_items?.length ?? 0;

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to cancel this order?")) {
      updateStatus({
        orderId: order.id,
        status: "cancelled",
        note: "Order cancelled by consumer.",
      });
    }
  };

  const handleReorder = (e: React.MouseEvent) => {
    e.stopPropagation();
    order.order_items?.forEach((item: any) => {
      const prodId = item.product?.id || item.product_id;
      addToCart({
        productId: prodId,
        title: item.product?.title || "Product",
        pricePerUnit: item.price_at_purchase,
        unitType: item.product?.unit_type || "Kg",
        farmerId: order.farmer_id || "",
        farmerName: order.farmer?.full_name || order.farmer?.fullName || "Verified Farmer",
        imageUrl: item.product?.image_url,
        maxQty: 999,
        category: item.product?.category || "Others",
      });
      updateQty(prodId, item.quantity);
    });
    router.push("/consumer/marketplace/checkout");
  };

  const handleDownloadInvoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInvoiceToast(true);
    setTimeout(() => setInvoiceToast(false), 3000);

    // Simple print of invoice details or direct browser print
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`
        <html>
          <head>
            <title>Invoice - #${order.id.substring(0, 8).toUpperCase()}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #333; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eaeaea; padding-bottom: 20px; }
              .details { margin: 20px 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 12px; border-bottom: 1px solid #eaeaea; text-align: left; }
              th { background: #f9f9f9; }
              .total { font-size: 1.2em; font-weight: bold; text-align: right; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h2>AgriNex AI</h2>
                <p>Tax Invoice / Bill of Supply</p>
              </div>
              <div style="text-align: right;">
                <h3>Order ID: #${order.id.toUpperCase()}</h3>
                <p>Date: ${new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div class="details">
              <p><strong>Farmer:</strong> ${order.farmer?.full_name || "Verified Farmer"}</p>
              <p><strong>Deliver To:</strong> ${order.delivery_address || "Provided Address"}</p>
              <p><strong>Payment Mode:</strong> Online UPI (Paid)</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${order.order_items?.map((item: any) => `
                  <tr>
                    <td>${item.product?.title || "Farm Crop"}</td>
                    <td>${item.quantity} ${item.product?.unit_type || "Unit"}</td>
                    <td>₹${item.price_at_purchase}</td>
                    <td>₹${item.price_at_purchase * item.quantity}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            <div class="total">Total Paid: ₹${order.total_amount}</div>
          </body>
        </html>
      `);
      w.document.close();
      w.print();
    }
  };

  // Determine estimated delivery text
  const estimatedDelivery = order.status === "delivered"
    ? "Delivered successfully"
    : order.status === "cancelled"
    ? "Order cancelled"
    : "Estimated delivery: 1–2 days";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{
        background: "#ffffff",
        borderRadius: "24px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        transition: "box-shadow 0.25s, transform 0.25s",
        marginBottom: "20px",
      }}
      className="group"
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 32px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05)";
        (e.currentTarget as HTMLElement).style.transform = "";
      }}
    >
      {/* Toast Alert */}
      <AnimatePresence>
        {invoiceToast && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
              background: "#0284c7", color: "#fff", padding: "12px 20px",
              borderRadius: "14px", display: "flex", alignItems: "center", gap: "8px",
              fontWeight: 700, fontSize: "13px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            }}>
            <Download className="w-4 h-4 animate-bounce" />
            Generating tax invoice...
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding: "20px 24px" }}>
        {/* Row 1: Header / Meta */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "monospace", fontSize: "13px", fontWeight: 800,
              background: "#f1f5f9", color: "#334155", padding: "4px 10px", borderRadius: "8px",
            }}>
              #ORD-{order.id.substring(0, 8).toUpperCase()}
            </span>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>

          <span style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "6px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: 800,
            color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
          }}>
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
          </span>
        </div>

        {/* Row 2: Content (Image + Title + Price + Timeline) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", marginTop: "20px" }} className="md:grid-cols-[auto_1fr_auto]">
          {/* Product Image */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              width: 90, height: 90, borderRadius: "16px",
              overflow: "hidden", background: "#f8fafc",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              flexShrink: 0,
              transition: "transform 0.4s",
            }}
              className="group-hover:scale-105"
            >
              {firstItem?.product?.image_url ? (
                <img src={firstItem.product.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package className="w-8 h-8 text-slate-300" />
                </div>
              )}
            </div>
          </div>

          {/* Details & Delivery details */}
          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "6px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: 0 }}>
              {firstItem?.product?.title ?? "Order Item"}
              {itemCount > 1 && (
                <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700, marginLeft: "8px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "20px" }}>
                  +{itemCount - 1} more items
                </span>
              )}
            </h3>

            {order.farmer && (
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#475569", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                <User className="w-3.5 h-3.5 text-slate-400" />
                Farmer: <span style={{ color: "#10b981" }}>{order.farmer.full_name ?? order.farmer.fullName}</span>
              </p>
            )}

            {order.delivery_address && (
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                Deliver to: {order.delivery_address}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginTop: "4px" }}>
              <span style={{
                fontSize: "11px", fontWeight: 700, color: "#475569",
                background: "#f1f5f9", padding: "2px 10px", borderRadius: "10px",
              }}>
                Qty: {firstItem?.quantity ?? 1} {firstItem?.product?.unit_type ?? "units"}
              </span>
              <span style={{
                fontSize: "11px", fontWeight: 700, color: "#0ea5e9",
                background: "#f0f9ff", border: "1px solid #bae6fd",
                padding: "2px 10px", borderRadius: "10px",
                display: "inline-flex", alignItems: "center", gap: "3px",
              }}>
                <CreditCard className="w-3 h-3" /> Paid via Online UPI
              </span>
            </div>

            {/* Timeline */}
            <div style={{ marginTop: "12px" }}>
              <p style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>
                Delivery Progress
              </p>
              <OrderTimeline status={order.status} />
            </div>
          </div>

          {/* Price & Summary Info */}
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: "160px" }} className="md:border-l md:border-slate-100 md:pl-6">
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", margin: 0 }}>Total Amount</p>
              <p style={{ fontSize: "24px", fontWeight: 900, color: "#10b981", margin: "2px 0 0" }}>₹{(order.total_amount ?? 0).toLocaleString()}</p>
            </div>

            <div style={{ marginTop: "12px" }}>
              <span style={{
                fontSize: "11px", fontWeight: 800,
                color: order.status === "cancelled" ? "#ef4444" : order.status === "delivered" ? "#10b981" : "#d97706",
                background: order.status === "cancelled" ? "#fef2f2" : order.status === "delivered" ? "#f0fdf4" : "#fffbeb",
                padding: "4px 10px", borderRadius: "20px",
              }}>
                {estimatedDelivery}
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Action Drawer Trigger */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: "20px", paddingTop: "14px", borderTop: "1px solid #f1f5f9",
          flexWrap: "wrap", gap: "10px",
        }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "none", border: "none", color: "#6366f1",
              fontSize: "12px", fontWeight: 800, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "4px",
            }}
          >
            {expanded ? (
              <>Hide details <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Show order details & items ({itemCount}) <ChevronDown className="w-4 h-4" /></>
            )}
          </button>

          {/* Action buttons list */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {/* View Details details */}
            <Link
              href={`/consumer/marketplace/${firstItem?.product?.id || ""}`}
              style={{
                height: "36px", padding: "0 16px", borderRadius: "18px",
                border: "1px solid #e2e8f0", background: "#ffffff",
                color: "#475569", fontSize: "12px", fontWeight: 700,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none", cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#ffffff"; }}
            >
              View Details
            </Link>

            {/* Track Order */}
            {["dispatched", "delivered", "quality_verified", "accepted"].includes(order.status) && (
              <Link
                href={`/consumer/orders/${order.id}/track`}
                style={{
                  height: "36px", padding: "0 16px", borderRadius: "18px",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#ffffff", fontSize: "12px", fontWeight: 800,
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px",
                  textDecoration: "none", cursor: "pointer", transition: "transform 0.15s",
                  boxShadow: "0 2px 6px rgba(16,185,129,0.15)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                <Truck className="w-3.5 h-3.5" />
                Track Order
              </Link>
            )}

            {/* Invoice */}
            <button
              onClick={handleDownloadInvoice}
              style={{
                height: "36px", padding: "0 16px", borderRadius: "18px",
                border: "1px solid #bae6fd", background: "#f0f9ff",
                color: "#0284c7", fontSize: "12px", fontWeight: 800,
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#e0f2fe"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f0f9ff"; }}
            >
              <Download className="w-3.5 h-3.5" />
              Invoice
            </button>

            {/* Cancel Order */}
            {["pending", "accepted"].includes(order.status) && (
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                style={{
                  height: "36px", padding: "0 16px", borderRadius: "18px",
                  border: "1px solid #fee2e2", background: "#fef2f2",
                  color: "#ef4444", fontSize: "12px", fontWeight: 800,
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fde2e2"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; }}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {isUpdating ? "Cancelling..." : "Cancel Order"}
              </button>
            )}

            {/* Reorder */}
            {["delivered", "cancelled"].includes(order.status) && (
              <button
                onClick={handleReorder}
                style={{
                  height: "36px", padding: "0 16px", borderRadius: "18px",
                  background: "#064e3b", color: "#ffffff", fontSize: "12px", fontWeight: 850,
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px",
                  border: "none", cursor: "pointer", transition: "transform 0.15s",
                  boxShadow: "0 2px 6px rgba(6,78,59,0.15)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reorder
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded item breakdown details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}
          >
            <div style={{ padding: "20px 24px", textAlign: "left" }}>
              <h4 style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
                Items Roster ({itemCount})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {order.order_items?.map((item: any) => (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "between",
                    background: "#ffffff", border: "1px solid #e2e8f0",
                    padding: "12px 16px", borderRadius: "16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                      <div style={{ width: 44, height: 44, borderRadius: "8px", overflow: "hidden", background: "#f1f5f9", flexShrink: 0 }}>
                        {item.product?.image_url && (
                          <img src={item.product.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", margin: 0 }}>{item.product?.title ?? "Farm Crop"}</p>
                        <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0", fontWeight: 650 }}>
                          Rate: ₹{item.price_at_purchase} · Qty: {item.quantity} {item.product?.unit_type || "units"}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 900, color: "#10b981", flexShrink: 0 }}>
                      ₹{(item.price_at_purchase * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  const { t } = useTranslation("consumer");
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "64px 24px", textAlign: "center",
      background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "#f0fdf4", border: "2px solid #bbf7d0",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20, boxShadow: "0 8px 24px rgba(16,185,129,0.1)",
      }}>
        <ShoppingBag className="w-10 h-10 text-emerald-600" />
      </div>
      <h3 style={{ fontSize: "20px", fontWeight: 850, color: "#1e293b", margin: "0 0 8px" }}>
        {t("noOrdersYet")}
      </h3>
      <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px", fontWeight: 600 }}>
        Start shopping fresh, verified organic farm crops directly from farmers
      </p>
      <Link href="/consumer/marketplace"
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "12px 24px", borderRadius: "14px",
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "#ffffff", fontWeight: 800, fontSize: "13px",
          textDecoration: "none", boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
          transition: "transform 0.15s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
      >
        {t("browseMarketplace")}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ConsumerOrdersPage() {
  const { t } = useTranslation("consumer");
  const { data: orders = [], isLoading, refetch, isRefetching } = useConsumerOrders();
  const [filter, setFilter] = useState("all");

  const filtered = orders.filter((o: any) => {
    if (filter === "all") return true;
    if (filter === "active") return ["pending", "accepted", "quality_verified", "dispatched"].includes(o.status);
    if (filter === "delivered") return o.status === "delivered";
    return o.status === filter;
  });

  // Summary Metrics
  const totalSpent = orders.reduce((s: number, o: any) => s + (o.total_amount ?? 0), 0);
  const activeCount = orders.filter((o: any) => ["pending", "accepted", "quality_verified", "dispatched"].includes(o.status)).length;
  const rewardPoints = Math.round(totalSpent / 10); // Dynamic reward points calculation (1 point per ₹10 spent)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: "28px 0", minHeight: "100vh", background: "#f8fafc" }}
    >
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ textAlign: "left" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#1e293b", margin: 0 }}>
            {t("myOrders")}
          </h1>
          <p style={{ color: "#64748b", fontSize: "13px", fontWeight: 650, marginTop: "6px" }}>
            Track and manage your verified farm-fresh deliveries
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "9px 16px", borderRadius: "12px",
              background: "#ffffff", border: "1px solid #e2e8f0",
              color: "#475569", fontWeight: 700, fontSize: "12px",
              cursor: "pointer", transition: "background 0.15s",
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            {t("refresh")}
          </button>
          <Link href="/consumer/dashboard"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "9px 18px", borderRadius: "12px",
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              color: "#059669", fontWeight: 800, fontSize: "12px",
              textDecoration: "none", cursor: "pointer",
            }}
          >
            <BarChart2 className="w-4 h-4" />
            Dashboard Center
          </Link>
        </div>
      </div>

      {/* ── Summary Stats Cards (Hero Row) ─────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "32px",
      }}>
        <StatCard
          icon={<Package className="w-5 h-5" />}
          label="Total Orders"
          value={orders.length}
          color="#10b981"
          bg="rgba(16,185,129,0.08)"
        />
        <StatCard
          icon={<Truck className="w-5 h-5" />}
          label="Active Deliveries"
          value={activeCount}
          color="#3b82f6"
          bg="rgba(59,130,246,0.08)"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Total Spent"
          value={`₹${totalSpent.toLocaleString()}`}
          color="#f59e0b"
          bg="rgba(245,158,11,0.08)"
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          label="Reward Points"
          value={rewardPoints}
          color="#8b5cf6"
          bg="rgba(139,92,246,0.08)"
        />
      </div>

      {/* ── Filter Section Toolbar ─────────────────────────────────────────── */}
      <div style={{
        background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0",
        padding: "12px 16px", marginBottom: "24px",
        display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      }}>
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", padding: "0 8px" }}>
          Filter By:
        </span>
        {[
          { key: "all", label: "All Orders" },
          { key: "active", label: "Active" },
          { key: "delivered", label: "Delivered" },
          { key: "pending", label: "Pending" },
          { key: "cancelled", label: "Cancelled" },
        ].map((f) => {
          const isSelected = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "8px 16px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 750,
                cursor: "pointer",
                border: "none",
                transition: "all 0.2s ease",
                background: isSelected
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "#ffffff",
                color: isSelected ? "#ffffff" : "#475569",
                boxShadow: isSelected
                  ? "0 4px 12px rgba(16,185,129,0.25)"
                  : "0 1px 2px rgba(0,0,0,0.05)",
                borderWidth: "1px",
                borderColor: isSelected ? "transparent" : "#e2e8f0",
                borderStyle: "solid",
              }}
              onMouseEnter={e => {
                if (!isSelected) e.currentTarget.style.background = "#f8fafc";
              }}
              onMouseLeave={e => {
                if (!isSelected) e.currentTarget.style.background = "#ffffff";
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── Orders Grid / List ─────────────────────────────────────────────── */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{
              background: "#ffffff", border: "1px solid #e2e8f0",
              borderRadius: "24px", height: "140px", width: "100%",
            }} className="animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          <AnimatePresence>
            {filtered.map((order: any) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Extra helper badge */}
      {!isLoading && orders.length > 0 && filtered.length > 0 && (
        <div style={{
          marginTop: "24px", display: "flex", alignItems: "center", gap: "8px",
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          borderRadius: "16px", padding: "12px 18px", width: "fit-content",
        }}>
          <Info className="w-4 h-4 text-emerald-600" />
          <span style={{ fontSize: "12px", color: "#065f46", fontWeight: 700 }}>
            Orders automatically update in real-time. For support or disputes, contact farmer partners directly.
          </span>
        </div>
      )}
    </motion.div>
  );
}