"use client";
import { useTranslation } from "@/hooks/useTranslation";


/**
 * @fileoverview Farmer Orders Page — /farmer/orders
 * Shows incoming orders from consumers, filtered by farmer_id.
 * Uses direct Supabase queries — no demo data contamination.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  Truck,
  Package,
  XCircle,
  Search,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Inbox,
  ShoppingBag,
} from "lucide-react";
import { useFarmerOrdersDirect, useUpdateFarmerOrderStatus } from "@/hooks/useFarmerOrdersDirect";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ElementType; bg: string }
> = {
  pending: {
    label: "Pending Review",
    color: "text-amber-700",
    icon: Clock,
    bg: "bg-amber-50 border-amber-200",
  },
  accepted: {
    label: "Accepted",
    color: "text-blue-700",
    icon: CheckCircle,
    bg: "bg-blue-50 border-blue-200",
  },
  quality_verified: {
    label: "Quality Verified",
    color: "text-purple-700",
    icon: Package,
    bg: "bg-purple-50 border-purple-200",
  },
  dispatched: {
    label: "Dispatched",
    color: "text-sky-700",
    icon: Truck,
    bg: "bg-sky-50 border-sky-200",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-700",
    icon: CheckCircle,
    bg: "bg-emerald-50 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    icon: XCircle,
    bg: "bg-rose-50 border-rose-200",
  },
};

function EmptyState() {
  const { t } = useTranslation("farmer");
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Inbox className="w-16 h-16 text-slate-300 mb-4" />
      <h3 className="text-slate-800 font-bold text-lg mb-2">
        {t("noOrdersYet")}
      </h3>
      <p className="text-slate-500 text-sm mb-1 font-semibold">
        Orders from buyers will appear here once consumers place orders
      </p>
      <p className="text-slate-400 text-xs font-semibold">
        Make sure your crop listings are active in the Inventory section
      </p>
    </div>
  );
}

export default function FarmerOrdersPage() {
  const { t } = useTranslation("farmer");
  const { data: orders = [], isLoading, refetch, isRefetching } =
    useFarmerOrdersDirect();
  const { mutate: updateStatus, isPending: updating } =
    useUpdateFarmerOrderStatus();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    const consumerName =
      o.consumer?.full_name ?? o.consumer?.fullName ?? "";
    const firstProduct = o.order_items?.[0]?.product?.title ?? "";
    const matchesSearch =
      consumerName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      firstProduct.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
  const { t } = useTranslation("farmer");
    updateStatus({ orderId, status: newStatus });
  };

  const summary = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    dispatched: orders.filter((o) => o.status === "dispatched").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue: orders.reduce((acc, o) => acc + (o.total_amount ?? 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-600" />
            {t("incomingOrders")}
          </h1>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Review, accept, dispatch, and track all buyer orders from your crop
            listings.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-1.5 px-4 py-2.5 premium-card hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold font-mono rounded-xl transition self-start sm:self-auto shrink-0 cursor-pointer"
        >
          <RefreshCw
            className={cn("w-3.5 h-3.5", isRefetching && "animate-spin")}
          />
          Sync Orders
        </button>
      </div>

      {/* Summary Cards */}
      {!isLoading && orders.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 font-mono">
          <div className="premium-card shadow-sm p-4 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("totalOrders2")}</p>
            <p className="text-xl font-extrabold text-slate-800 mt-1">{summary.total}</p>
          </div>
          <div className="shadow-sm p-4 rounded-2xl text-center border-amber-200 bg-amber-50/10">
            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">{t("pendingOrders")}</p>
            <p className="text-xl font-extrabold text-amber-700 mt-1">
              {summary.pending}
            </p>
          </div>
          <div className="shadow-sm p-4 rounded-2xl text-center border-sky-200 bg-sky-50/10">
            <p className="text-[10px] text-sky-700 font-bold uppercase tracking-wider">{t("inTransit")}</p>
            <p className="text-xl font-extrabold text-sky-700 mt-1">
              {summary.dispatched}
            </p>
          </div>
          <div className="shadow-sm p-4 rounded-2xl text-center border-emerald-200 bg-emerald-50/10">
            <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">{t("deliveredOrders")}</p>
            <p className="text-xl font-extrabold text-emerald-700 mt-1">
              {summary.delivered}
            </p>
          </div>
          <div className="premium-card shadow-sm p-4 rounded-2xl text-center col-span-2 lg:col-span-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("totalRevenue")}</p>
            <p className="text-lg font-extrabold text-slate-800 mt-1">
              ₹{summary.revenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      {!isLoading && orders.length > 0 && (
        <div className="premium-card shadow-sm p-4 rounded-2xl flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by buyer, crop, or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "accepted", "dispatched", "delivered"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition border cursor-pointer",
                    statusFilter === s
                      ? "bg-emerald-50 text-emerald-700 border-emerald-250 border"
                      : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100"
                  )}
                >
                  {s}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="premium-card rounded-3xl shadow-sm h-20 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && orders.length === 0 && <EmptyState />}

      {/* Orders List */}
      {!isLoading && orders.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredOrders.map((order) => {
              const config =
                STATUS_CONFIG[order.status as OrderStatus] ??
                STATUS_CONFIG.pending;
              const StatusIcon = config.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "premium-card rounded-3xl shadow-sm overflow-hidden border transition-all duration-300 shadow-sm bg-white border-slate-200"
                  )}
                >
                  {/* Order Header Row */}
                  <div
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                    onClick={() =>
                      setExpandedOrder(isExpanded ? null : order.id)
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                          config.bg
                        )}
                      >
                        <StatusIcon
                          className={cn("w-5 h-5", config.color)}
                        />
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 text-sm">
                            {order.consumer?.full_name ?? "Customer"}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] px-2.5 py-0.5 rounded-full border font-mono uppercase font-bold",
                              config.bg,
                              config.color
                            )}
                          >
                            {config.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                          {order.order_items?.[0]?.product?.title ??
                            "Mixed Items"}{" "}
                          ·{" "}
                          {new Date(order.created_at).toLocaleDateString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono shrink-0">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Value
                        </p>
                        <p className="text-base font-bold text-emerald-600">
                          ₹{(order.total_amount ?? 0).toLocaleString()}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 p-4 space-y-4 text-left bg-slate-50/20"
                      >
                        {/* Line Items */}
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 mb-2 font-mono uppercase tracking-wider">
                            Order Items
                          </h4>
                          <div className="space-y-2">
                            {order.order_items?.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-center premium-card p-3 rounded-xl text-xs font-mono"
                              >
                                <span className="text-slate-800 font-bold">
                                  {item.product?.title ?? "Product"}
                                </span>
                                <div className="flex gap-4 text-right">
                                  <span className="text-slate-400 font-semibold">
                                    {item.quantity}{" "}
                                    {item.product?.unit_type ?? "Kg"}
                                  </span>
                                  <span className="text-emerald-600 font-bold">
                                    ₹
                                    {(
                                      item.quantity * item.price_at_purchase
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Buyer Info */}
                        {order.consumer && (
                          <div className="premium-card p-3 rounded-xl text-xs font-mono">
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-1">
                              {t("buyerDetails")}
                            </p>
                            <p className="text-slate-800 font-bold">
                              {order.consumer.full_name}
                            </p>
                            {order.consumer.phone_number && (
                              <p className="text-slate-500 font-semibold mt-0.5">
                                📞 {order.consumer.phone_number}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Delivery Address */}
                        {order.delivery_address && (
                          <div className="premium-card p-3 rounded-xl text-xs font-mono">
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider mb-1">
                              {t("deliveryAddress")}
                            </p>
                            <p className="text-slate-700 font-semibold">
                              {order.delivery_address}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                          {order.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(order.id, "accepted")
                                }
                                disabled={updating}
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-mono font-bold rounded-xl transition disabled:opacity-50 cursor-pointer"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                {t("acceptOrder1")}
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(order.id, "cancelled")
                                }
                                disabled={updating}
                                className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 border-rose-200 text-red-700 hover:bg-rose-100 text-xs font-mono font-bold rounded-xl transition disabled:opacity-50 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                {t("rejectOrder")}
                              </button>
                            </>
                          )}
                          {order.status === "accepted" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(order.id, "dispatched")
                              }
                              disabled={updating}
                              className="flex items-center gap-1.5 px-4 py-2 bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100 text-xs font-mono font-bold rounded-xl transition disabled:opacity-50 cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Mark as Dispatched
                            </button>
                          )}
                          {order.status === "dispatched" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(order.id, "delivered")
                              }
                              disabled={updating}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-mono font-bold rounded-xl transition disabled:opacity-50 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              {t("confirmDelivery")}
                            </button>
                          )}
                          <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-xs font-bold font-mono rounded-xl transition border-0 cursor-pointer">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Message Buyer
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredOrders.length === 0 && (
            <div className="premium-card shadow-sm p-12 rounded-2xl text-center">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-800 font-bold text-sm">
                No orders match your filter
              </p>
              <p className="text-slate-400 text-xs mt-1 font-semibold">
                Try changing the search criteria or status filter
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}