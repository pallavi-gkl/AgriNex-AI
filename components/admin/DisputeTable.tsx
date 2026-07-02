"use client";

import { useState } from "react";
import { Star, ShieldAlert, Check, Coins, AlertTriangle, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Dispute {
  id: string; // review id
  orderId: string;
  consumerName: string;
  farmerName: string;
  farmerId: string;
  farmerTrustScore: number;
  cropTitle: string;
  consumerComment: string;
  consumerRating: number;
  aiGrade: string;
  flagLevel: "HIGH" | "MEDIUM" | "LOW";
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
}

interface DisputeTableProps {
  disputes: Dispute[];
  onAction: (disputeId: string, action: "refund" | "warn" | "resolve", farmerId: string, orderId: string) => Promise<void>;
}

export default function DisputeTable({ disputes, onAction }: DisputeTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleActionClick = async (
    disputeId: string,
    action: "refund" | "warn" | "resolve",
    farmerId: string,
    orderId: string
  ) => {
    setResolvingId(disputeId);
    try {
      await onAction(disputeId, action, farmerId, orderId);
    } catch (e) {
      console.error(e);
    } finally {
      setResolvingId(null);
      setActiveMenuId(null);
    }
  };

  const getFlagBadge = (level: "HIGH" | "MEDIUM" | "LOW") => {
    switch (level) {
      case "HIGH":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            🚨 HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            ⚠️ MEDIUM
          </span>
        );
      case "LOW":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
            ℹ️ LOW
          </span>
        );
    }
  };

  const getGradeBadge = (grade: string) => {
    let color = "text-slate-400 border-white/10";
    if (grade.startsWith("A")) color = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    else if (grade.startsWith("B")) color = "text-sky-400 border-sky-500/30 bg-sky-500/10";
    else if (grade.startsWith("C")) color = "text-amber-400 border-amber-500/30 bg-amber-500/10";

    return (
      <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${color}`}>
        {grade}
      </span>
    );
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 flex flex-col">
      <div className="p-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            AI Dispute Monitor
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Low-rating transactions flagged against AI crop grades at the time of sale.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
          {disputes.length} Flagged
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-slate-400 uppercase tracking-wider text-[10px] font-semibold bg-white/[0.02]">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Consumer</th>
              <th className="py-3 px-4">Farmer</th>
              <th className="py-3 px-4">Reported Issue</th>
              <th className="py-3 px-4 text-center">AI Grade</th>
              <th className="py-3 px-4 text-center">Rating</th>
              <th className="py-3 px-4 text-center">Flag Level</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {disputes.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No quality disputes found. Platform is running smoothly! 🌟
                </td>
              </tr>
            ) : (
              disputes.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-white/[0.01] transition-colors relative"
                >
                  {/* Order ID */}
                  <td className="py-4 px-4 font-mono text-slate-400 font-medium">
                    #{d.orderId.slice(0, 8)}...
                  </td>

                  {/* Consumer */}
                  <td className="py-4 px-4 font-medium text-white">
                    {d.consumerName}
                  </td>

                  {/* Farmer */}
                  <td className="py-4 px-4">
                    <span className="text-emerald-300 font-medium">{d.farmerName}</span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                      Trust: {d.farmerTrustScore.toFixed(2)}/5.0
                    </span>
                  </td>

                  {/* Comment */}
                  <td className="py-4 px-4 max-w-xs">
                    <span className="text-white block truncate font-medium">
                      {d.cropTitle}
                    </span>
                    <span className="text-slate-400 italic text-[11px] block truncate mt-0.5">
                      "{d.consumerComment}"
                    </span>
                  </td>

                  {/* AI Grade */}
                  <td className="py-4 px-4 text-center">
                    {getGradeBadge(d.aiGrade)}
                  </td>

                  {/* Rating */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 ${
                            idx < d.consumerRating
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                  </td>

                  {/* Flag Level */}
                  <td className="py-4 px-4 text-center">
                    {getFlagBadge(d.flagLevel)}
                  </td>

                  {/* Actions Dropdown */}
                  <td className="py-4 px-4 text-center relative">
                    <button
                      id={`action-menu-toggle-${d.id}`}
                      onClick={() =>
                        setActiveMenuId(activeMenuId === d.id ? null : d.id)
                      }
                      disabled={resolvingId === d.id}
                      className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Action Menu */}
                    <AnimatePresence>
                      {activeMenuId === d.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveMenuId(null)}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-4 mt-2 w-48 rounded-xl z-20 overflow-hidden text-left"
                            style={{
                              background: "rgba(5, 8, 20, 0.95)",
                              backdropFilter: "blur(12px)",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                            }}
                          >
                            {/* Option 1: Refund */}
                            {d.paymentStatus !== "refunded" && (
                              <button
                                id={`dispute-action-refund-${d.id}`}
                                onClick={() =>
                                  handleActionClick(d.id, "refund", d.farmerId, d.orderId)
                                }
                                className="w-full px-4 py-2.5 hover:bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-2 border-b border-white/5 transition-all"
                              >
                                <Coins className="w-3.5 h-3.5" />
                                Initiate Refund (₹{d.totalAmount})
                              </button>
                            )}

                            {/* Option 2: Warn Seller */}
                            <button
                              id={`dispute-action-warn-${d.id}`}
                              onClick={() =>
                                handleActionClick(d.id, "warn", d.farmerId, d.orderId)
                              }
                              className="w-full px-4 py-2.5 hover:bg-amber-500/10 text-amber-400 text-xs font-semibold flex items-center gap-2 border-b border-white/5 transition-all"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Warn Seller (-0.5 Trust)
                            </button>

                            {/* Option 3: Resolve */}
                            <button
                              id={`dispute-action-resolve-${d.id}`}
                              onClick={() =>
                                handleActionClick(d.id, "resolve", d.farmerId, d.orderId)
                              }
                              className="w-full px-4 py-2.5 hover:bg-purple-500/10 text-purple-300 text-xs font-semibold flex items-center gap-2 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Mark Resolved
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
