"use client";

/**
 * @fileoverview IncomingOrdersTable — farmer's incoming order management table.
 * Columns: Order ID, Consumer, Crop(s), Qty, Total, Status badge, Actions.
 * Supports Accept and Mark Dispatched actions via PATCH /api/orders/:id/status.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Truck, Eye, Package, RefreshCw, Loader2, ClipboardList } from "lucide-react";
import { useFarmerOrders } from "@/hooks/useFarmerOrders";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import type { OrderStatus } from "@/types";
import { staggerContainerVariants, listItemVariants } from "@/lib/animations";

// ─── Status badge config ──────────────────────────────────────────────────────
const statusConfig: Record<
  OrderStatus,
  { label: string; classes: string }
> = {
  pending:         { label: "Pending",          classes: "bg-amber-500/15 border-amber-500/30 text-amber-300"   },
  accepted:        { label: "Accepted",          classes: "bg-sky-500/15 border-sky-500/30 text-sky-300"         },
  quality_verified:{ label: "Quality Verified",  classes: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" },
  dispatched:      { label: "Dispatched",        classes: "bg-purple-500/15 border-purple-500/30 text-purple-300" },
  delivered:       { label: "Delivered",         classes: "bg-slate-500/15 border-slate-500/30 text-slate-300"   },
  cancelled:       { label: "Cancelled",         classes: "bg-red-500/15 border-red-500/30 text-red-300"         },
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function OrderDetailDrawer({ order, onClose }: { order: any; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
      >
        <h3 className="text-white font-semibold mb-1">Order Details</h3>
        <p className="text-slate-400 text-xs font-mono mb-4">#{order.id.slice(0, 8)}</p>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Consumer</span>
            <span className="text-white">{order.consumer?.full_name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total</span>
            <span className="gradient-text-green font-semibold">₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Delivery Address</span>
            <span className="text-white text-right max-w-[200px]">{order.delivery_address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Payment</span>
            <span className={order.payment_status === "completed" ? "text-emerald-400" : "text-amber-400"}>
              {order.payment_status}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="mt-4">
          <p className="text-xs text-slate-400 font-medium mb-2">Items</p>
          {(order.order_items ?? []).map((item: any) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
              <span className="text-white">{item.product?.title ?? "Product"}</span>
              <span className="text-slate-400">{item.quantity} {item.product?.unit_type}</span>
              <span className="text-emerald-400">₹{item.price_at_purchase}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-xl border border-white/10 text-slate-400 text-sm hover:border-white/20 transition-all"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Table Component ─────────────────────────────────────────────────────
export default function IncomingOrdersTable({ className = "" }: { className?: string }) {
  const { data: orders = [], isLoading, refetch, isFetching } = useFarmerOrders();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const handleAction = (orderId: string, status: OrderStatus) => {
    updateStatus({ orderId, status });
  };

  return (
    <div className={`glass-panel rounded-2xl p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-emerald-400" />
          <h3 className="text-white font-semibold text-sm">Incoming Orders</h3>
          {orders.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
              {orders.length}
            </span>
          )}
        </div>
        <button
          onClick={() => refetch()}
          className="w-7 h-7 rounded-lg glass-panel flex items-center justify-center hover:border-emerald-500/30 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl anim-shimmer" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center gap-3">
          <Package className="w-10 h-10 text-slate-600" />
          <p className="text-slate-400 text-sm">No incoming orders yet</p>
          <p className="text-slate-600 text-xs">Orders from consumers will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-white/5">
                {["Order ID", "Consumer", "Crop(s)", "Qty", "Total", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left py-2 px-2 text-xs text-slate-500 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <motion.tbody
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {orders.map((order: any) => {
                const items = order.order_items ?? [];
                const cropNames = items.map((i: any) => i.product?.title ?? "?").join(", ");
                const totalQty = items.reduce((s: number, i: any) => s + Number(i.quantity), 0);
                const cfg = statusConfig[order.status as OrderStatus] ?? statusConfig.pending;

                return (
                  <motion.tr
                    key={order.id}
                    variants={listItemVariants}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Order ID */}
                    <td className="py-3 px-2">
                      <span className="text-slate-400 font-mono text-xs">
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>

                    {/* Consumer */}
                    <td className="py-3 px-2">
                      <span className="text-white">{order.consumer?.full_name ?? "—"}</span>
                    </td>

                    {/* Crops */}
                    <td className="py-3 px-2">
                      <span className="text-slate-300 truncate max-w-[120px] block" title={cropNames}>
                        {cropNames}
                      </span>
                    </td>

                    {/* Qty */}
                    <td className="py-3 px-2">
                      <span className="text-slate-400">{totalQty}</span>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-2">
                      <span className="gradient-text-green font-semibold">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs border ${cfg.classes} whitespace-nowrap`}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1.5">
                        {/* View details */}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="w-7 h-7 rounded-lg glass-panel flex items-center justify-center hover:border-white/20 transition-all"
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        {/* Accept — only show for pending */}
                        {order.status === "pending" && (
                          <button
                            onClick={() => handleAction(order.id, "accepted")}
                            disabled={isUpdating}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 disabled:opacity-50"
                            style={{
                              background: "rgba(16,185,129,0.15)",
                              border: "1px solid rgba(16,185,129,0.35)",
                              color: "#34d399",
                              boxShadow: "0 0 10px rgba(16,185,129,0.1)",
                            }}
                          >
                            {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Accept
                          </button>
                        )}

                        {/* Dispatch — only show for accepted */}
                        {order.status === "accepted" && (
                          <button
                            onClick={() => handleAction(order.id, "dispatched")}
                            disabled={isUpdating}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 disabled:opacity-50"
                            style={{
                              background: "rgba(139,92,246,0.15)",
                              border: "1px solid rgba(139,92,246,0.35)",
                              color: "#c084fc",
                            }}
                          >
                            {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
                            Dispatch
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
