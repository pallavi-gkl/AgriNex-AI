"use client";
import { useTranslation } from "@/hooks/useTranslation";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Truck, ShoppingBag, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCreateOrder } from "@/hooks/useOrders";

interface OrderDialogProps {
  product: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderDialog({ product, onClose, onSuccess }: OrderDialogProps) {
  const { t } = useTranslation("consumer");
  const [preferredDate, setPreferredDate] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("Loading...");
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setEstimatedDelivery(d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
    setMinDate(new Date().toISOString().split("T")[0]);
  }, []);

  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const price = product.pricePerUnit ?? product.price_per_unit ?? 0;
  const stock = product.quantityAvailable ?? product.quantity_available ?? 999;
  const unit = product.unitType ?? product.unit_type ?? "Kg";
  const farmerName = product.farmer?.fullName ?? product.farmerName ?? "Verified Farmer";

  const { mutate: createOrder, isPending } = useCreateOrder();

  // Auto-fill user profile
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profileRaw } = await (supabase
        .from("profiles") as any)
        .select("full_name, phone_number, address")
        .eq("id", user.id)
        .maybeSingle();
      const profile = profileRaw as { full_name?: string; phone_number?: string; address?: string } | null;
      if (profile) {
        if (profile.full_name && profile.full_name !== "Unknown") setCustomerName(profile.full_name);
        if (profile.phone_number && profile.phone_number !== "0000000000") setMobile(profile.phone_number);
        if (profile.address) setAddress(profile.address);
      }
    }
    loadProfile();
  }, []);

  const totalPrice = price * quantity;

  const getEstimatedDelivery = () => {
  const { t } = useTranslation("consumer");
    return estimatedDelivery;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) { setFormError("Customer Name is required."); return; }
    if (!mobile.trim() || mobile.trim().length < 10) { setFormError("Valid Mobile Number is required."); return; }
    if (!address.trim()) { setFormError("Delivery Address is required."); return; }
    if (!city.trim()) { setFormError("City is required."); return; }
    if (!stateVal.trim()) { setFormError("State is required."); return; }
    if (!pinCode.trim() || pinCode.trim().length < 6) { setFormError("Valid 6-digit PIN Code is required."); return; }
    if (quantity <= 0) { setFormError("Quantity must be greater than 0."); return; }
    if (quantity > stock) { setFormError(`Only ${stock} ${unit} available in stock.`); return; }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setFormError("You must be logged in to place an order."); return; }

      // Update profile with latest name & phone
      await (supabase.from("profiles") as any).update({ full_name: customerName, phone_number: mobile }).eq("id", user.id);

      // Resolve valid farmer UUID
      let farmerId: string = product.farmer?.id ?? product.farmerId ?? "";
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!farmerId || !uuidRegex.test(farmerId)) {
        const { data: farmersRaw } = await (supabase
          .from("profiles") as any).select("id").eq("role", "farmer").limit(1);
        const farmers = farmersRaw as Array<{ id: string }> | null;
        farmerId = farmers?.[0]?.id ?? "33007d38-d5e8-4dc4-af1a-fd4d0658a96b";
      }

      // Construct full delivery address string
      const fullAddress = `${address.trim()}, ${city.trim()}, ${stateVal.trim()} - ${pinCode.trim()}. Contact: ${customerName.trim()} (${mobile.trim()})${preferredDate ? `. Preferred: ${preferredDate}` : ""}${specialInstructions ? `. Notes: ${specialInstructions.trim()}` : ""}.`;

      createOrder(
        {
          farmerId,
          totalAmount: totalPrice,
          deliveryAddress: fullAddress,
          items: [{ productId: product.id, quantity, priceAtPurchase: price }],
        },
        {
          onSuccess: () => {
            setSuccess(true);
            setTimeout(() => { onSuccess(); onClose(); }, 2200);
          },
          onError: (err: any) => setFormError(err.message || "Failed to place order."),
        }
      );
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Order form">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.22 }}
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl"
        style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100/80 bg-white/80 backdrop-blur-xl rounded-t-3xl">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-800">Order Now</h2>
          </div>
          <button onClick={onClose} aria-label="Close dialog"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-5">
          {success ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ background: "rgba(16,185,129,0.1)" }}>
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{t("orderPlaced")}</h3>
              <p className="text-slate-500 text-sm">Your order has been saved. Track it in <strong>{t("myOrders")}</strong>.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product summary card */}
              <div className="rounded-2xl p-4 space-y-2.5 text-xs"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t("product")}</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[60%] truncate">{product.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t("farmer")}</span>
                  <span className="font-semibold text-slate-800">{farmerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Price</span>
                  <span className="font-bold text-emerald-700">₹{price} / {unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t("availableStock")}</span>
                  <span className="font-semibold text-slate-800">{stock} {unit}</span>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Quantity ({unit}) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min="1" max={stock} value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-full border border-slate-200/80 px-4 py-2.5 text-sm text-slate-800 bg-white/90 backdrop-blur-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    required />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {t("customerName")} <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                    placeholder={t("fullName")}
                    className="w-full rounded-full border border-slate-200/80 px-4 py-2.5 text-sm text-slate-800 bg-white/90 backdrop-blur-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    required />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full rounded-full border border-slate-200/80 px-4 py-2.5 text-sm text-slate-800 bg-white/90 backdrop-blur-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    required />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={pinCode} maxLength={6}
                    onChange={e => setPinCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit code"
                    className="w-full rounded-full border border-slate-200/80 px-4 py-2.5 text-sm text-slate-800 bg-white/90 backdrop-blur-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t("deliveryAddress")} <span className="text-red-500">*</span>
                </label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="House no., Street, Area"
                  className="w-full rounded-full border border-slate-200/80 px-4 py-2.5 text-sm text-slate-800 bg-white/90 backdrop-blur-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {t("city")} <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)}
                    placeholder={t("city")}
                    className="w-full rounded-full border border-slate-200/80 px-4 py-2.5 text-sm text-slate-800 bg-white/90 backdrop-blur-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {t("state")} <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={stateVal} onChange={e => setStateVal(e.target.value)}
                    placeholder={t("state")}
                    className="w-full rounded-full border border-slate-200/80 px-4 py-2.5 text-sm text-slate-800 bg-white/90 backdrop-blur-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Preferred Delivery Date <span className="text-slate-400 font-normal">{t("optional")}</span>
                  </label>
                  <input type="date" value={preferredDate}
                    min={minDate || undefined}
                    onChange={e => setPreferredDate(e.target.value)}
                    className="w-full rounded-full border border-slate-200/80 px-4 py-2.5 text-sm text-slate-800 bg-white/90 backdrop-blur-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Special Instructions <span className="text-slate-400 font-normal">{t("optional")}</span>
                  </label>
                  <textarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Leave with neighbor"
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 resize-none" />
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-xs text-red-700 bg-red-50 border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Price summary */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <p className="text-slate-500 text-xs">{t("estimatedDelivery")}</p>
                  <p className="text-slate-800 text-xs font-semibold flex items-center gap-1 mt-0.5">
                    <Truck className="w-3.5 h-3.5 text-sky-500" />
                    {getEstimatedDelivery()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-xs">Total Amount</p>
                  <p className="text-emerald-700 text-2xl font-bold leading-none mt-1">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={isPending}
                id={`confirm-order-${product.id}`}
                className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
                }}>
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>
                ) : (
                  "Confirm Order"
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}