"use client";

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
    color: "text-amber-400",
    icon: Clock,
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  accepted: {
    label: "Accepted",
    color: "text-white",
    icon: CheckCircle,
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  quality_verified: {
    label: "Quality Verified",
    color: "text-purple-400",
    icon: Package,
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  dispatched: {
    label: "Dispatched",
    color: "text-white",
    icon: Truck,
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-400",
    icon: CheckCircle,
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    icon: XCircle,
    bg: "bg-red-500/10 border-red-500/20",
  },
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Inbox className="w-16 h-16 text-slate-700 mb-4" />
      <h3 className="text-white font-semibold text-lg mb-2">
        No orders yet
      </h3>
      <p className="text-slate-400 text-sm mb-1">
        Orders from buyers will appear here once consumers place orders
      </p>
      <p className="text-slate-500 text-xs">
        Make sure your crop listings are active in the Inventory section
      </p>
    </div>
  );
}

export default function FarmerOrdersPage() {
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
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-amber-400" />
            Incoming Orders
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Review, accept, dispatch, and track all buyer orders from your crop
            listings.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-mono rounded-xl transition self-start sm:self-auto shrink-0"
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
          <div className="glass-panel p-4 rounded-2xl text-center">
            <p className="text-[10px] text-slate-500">TOTAL ORDERS</p>
            <p className="text-xl font-bold text-white mt-1">{summary.total}</p>
          </div>
          <div className="glass-panel p-4 rounded-2xl text-center">
            <p className="text-[10px] text-amber-400">PENDING</p>
            <p className="text-xl font-bold text-amber-400 mt-1">
              {summary.pending}
            </p>
          </div>
          <div className="glass-panel p-4 rounded-2xl text-center">
            <p className="text-[10px] text-cyan-400">IN TRANSIT</p>
            <p className="text-xl font-bold text-cyan-400 mt-1">
              {summary.dispatched}
            </p>
          </div>
          <div className="glass-panel p-4 rounded-2xl text-center">
            <p className="text-[10px] text-emerald-400">DELIVERED</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              {summary.delivered}
            </p>
          </div>
          <div className="glass-panel p-4 rounded-2xl text-center col-span-2 lg:col-span-1">
            <p className="text-[10px] text-slate-500">TOTAL REVENUE</p>
            <p className="text-lg font-bold text-white mt-1">
              ₹{summary.revenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      {!isLoading && orders.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by buyer, crop, or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "accepted", "dispatched", "delivered"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition",
                    statusFilter === s
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
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
              className="glass-panel rounded-2xl h-20 animate-pulse"
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
                    "glass-panel rounded-2xl overflow-hidden border transition-all duration-300",
                    config.bg
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
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">
                            {order.consumer?.full_name ?? "Customer"}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] px-2 py-0.5 rounded-full border font-mono uppercase font-bold",
                              config.bg,
                              config.color
                            )}
                          >
                            {config.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
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
                      <div className="text-right font-mono">
                        <p className="text-[10px] text-slate-500">
                          ORDER VALUE
                        </p>
                        <p className="text-base font-bold text-emerald-400">
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
                        className="border-t border-white/10 p-4 space-y-4"
                      >
                        {/* Line Items */}
                        <div>
                          <h4 className="text-xs font-bold text-white mb-2 font-mono">
                            ORDER ITEMS
                          </h4>
                          <div className="space-y-2">
                            {order.order_items?.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-center bg-white/5 p-3 rounded-xl text-xs font-mono"
                              >
                                <span className="text-white font-bold">
                                  {item.product?.title ?? "Product"}
                                </span>
                                <div className="flex gap-4 text-right">
                                  <span className="text-slate-400">
                                    {item.quantity}{" "}
                                    {item.product?.unit_type ?? "Kg"}
                                  </span>
                                  <span className="text-emerald-400 font-bold">
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
                          <div className="bg-white/5 p-3 rounded-xl text-xs font-mono">
                            <p className="text-slate-500 text-[10px] mb-1">
                              BUYER DETAILS
                            </p>
                            <p className="text-white">
                              {order.consumer.full_name}
                            </p>
                            {order.consumer.phone_number && (
                              <p className="text-slate-400 mt-0.5">
                                📞 {order.consumer.phone_number}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Delivery Address */}
                        {order.delivery_address && (
                          <div className="bg-white/5 p-3 rounded-xl text-xs font-mono">
                            <p className="text-slate-500 text-[10px] mb-1">
                              DELIVERY ADDRESS
                            </p>
                            <p className="text-white">
                              {order.delivery_address}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {order.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(order.id, "accepted")
                                }
                                disabled={updating}
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 text-xs font-mono rounded-xl transition font-bold disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Accept Order
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(order.id, "cancelled")
                                }
                                disabled={updating}
                                className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-mono rounded-xl transition disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}
                          {order.status === "accepted" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(order.id, "dispatched")
                              }
                              disabled={updating}
                              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 text-xs font-mono rounded-xl transition font-bold disabled:opacity-50"
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
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 text-xs font-mono rounded-xl transition font-bold disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Confirm Delivery
                            </button>
                          )}
                          <button className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 text-xs font-mono rounded-xl transition">
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
            <div className="glass-panel p-12 rounded-2xl text-center">
              <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                No orders match your filter
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Try changing the search criteria or status filter
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
