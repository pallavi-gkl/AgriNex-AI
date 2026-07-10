"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Truck, ShieldCheck, ShoppingBag, CheckCircle,
  AlertCircle, Loader2, User, Phone, Mail, MapPin, CreditCard,
  Wallet, Landmark, Plus, Minus, Landmark as UpiIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCreateOrder } from "@/hooks/useOrders";
import { useMarketplaceProducts } from "@/hooks/useProducts";
import { DEMO_CROPS } from "@/lib/demoData";
import { useTranslation } from "@/hooks/useTranslation";

// ─── Sub-Component to Wrap the Checkout Page Content ────────────────────────
function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId") || "";
  const initialQty = parseInt(searchParams.get("quantity") || "1", 10);
  const { t } = useTranslation("consumer");

  const [quantity, setQuantity] = useState<number>(initialQty);
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [formError, setFormError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  const { data: liveProducts = [], isLoading: productsLoading } = useMarketplaceProducts({});
  const { mutate: createOrder, isPending: isPlacingOrder } = useCreateOrder();

  // Demo data fallback
  const demoAsProducts = DEMO_CROPS.filter((c) => c.is_active && c.quantity_available > 0).map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    pricePerUnit: c.price_per_unit,
    unitType: c.unit_type,
    quantityAvailable: c.quantity_available,
    imageUrl: c.image_url,
    qualityGrade: c.quality_grade,
    isOrganic: c.is_organic,
    farmer: { id: `farmer-${c.id}`, fullName: getDemoFarmerName(c.id), isVerified: true },
  }));

  function getDemoFarmerName(cropId: string): string {
    const names: Record<string, string> = {
      "crop-001": "Rajesh Kumar", "crop-002": "Suresh Patil", "crop-003": "Muthu Raman",
      "crop-004": "Pradeep Joshi", "crop-005": "Abdul Rashid",
    };
    return names[cropId] || "Verified Farmer";
  }

  const products = liveProducts.length > 0 ? liveProducts : demoAsProducts;
  const product = products.find((p: any) => p.id === productId);

  // Auto-fill user profile & set default dates
  useEffect(() => {
    // Generate order delivery estimate
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setEstimatedDelivery(d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      
      const { data: profileRaw } = await (supabase
        .from("profiles") as any)
        .select("full_name, phone_number, address")
        .eq("id", user.id)
        .maybeSingle();
      const profile = profileRaw as { full_name?: string; phone_number?: string; address?: string } | null;
      if (profile) {
        if (profile.full_name && profile.full_name !== "Unknown") setCustomerName(profile.full_name);
        if (profile.phone_number && profile.phone_number !== "0000000000") setMobile(profile.phone_number);
        if (profile.address) {
          const parts = profile.address.split(",");
          if (parts.length >= 3) {
            setAddress(parts[0].trim());
            setCity(parts[1].trim());
            const statePin = parts[2].trim().split("-");
            if (statePin.length >= 2) {
              setStateVal(statePin[0].trim());
              setPinCode(statePin[1].replace(/\D/g, "").trim());
            } else {
              setStateVal(parts[2].trim());
            }
          } else {
            setAddress(profile.address);
          }
        }
      }
    }
    loadProfile();
  }, []);

  if (productsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading checkout details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 rounded-3xl border border-white/10 shadow-lg"
        style={{ background: "rgba(255,255,255,0.04)" }}>
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Product Not Found</h3>
        <p className="text-slate-400 text-sm mb-6">The product you are trying to purchase does not exist or is currently unavailable.</p>
        <Link href="/consumer/marketplace"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold no-underline text-white"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
          <ArrowLeft className="w-4 h-4" /> {t("backToMarketplace")}
        </Link>
      </div>
    );
  }

  const price = product.pricePerUnit ?? product.price_per_unit ?? 0;
  const stock = product.quantityAvailable ?? product.quantity_available ?? 999;
  const unit = product.unitType ?? product.unit_type ?? "Kg";
  const farmerName = product.farmer?.fullName ?? product.farmerName ?? "Verified Farmer";
  
  // Calculate Totals
  const subtotal = price * quantity;
  const deliveryCharge = subtotal >= 500 ? 0 : 50;
  const platformFee = 5;
  const discount = 0;
  const totalAmount = subtotal + deliveryCharge + platformFee - discount;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) { setFormError("Full Name is required."); return; }
    if (!mobile.trim() || mobile.trim().length < 10) { setFormError("Valid 10-digit Mobile Number is required."); return; }
    if (!email.trim()) { setFormError("Email Address is required."); return; }
    if (!address.trim()) { setFormError("Delivery Address is required."); return; }
    if (!city.trim()) { setFormError("City is required."); return; }
    if (!stateVal.trim()) { setFormError("State is required."); return; }
    if (!pinCode.trim() || pinCode.trim().length < 6) { setFormError("Valid 6-digit PIN Code is required."); return; }
    if (quantity <= 0) { setFormError("Quantity must be at least 1."); return; }
    if (quantity > stock) { setFormError(`Only ${stock} ${unit} available in stock.`); return; }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setFormError("Please log in to place this order."); return; }

      // Update user profile metadata
      await (supabase.from("profiles") as any)
        .update({ full_name: customerName, phone_number: mobile })
        .eq("id", user.id);

      // Validate farmer UUID format
      let farmerId: string = product.farmer?.id ?? product.farmerId ?? "";
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!farmerId || !uuidRegex.test(farmerId)) {
        const { data: farmers } = await (supabase.from("profiles") as any)
          .select("id")
          .eq("role", "farmer")
          .limit(1);
        farmerId = farmers?.[0]?.id ?? "33007d38-d5e8-4dc4-af1a-fd4d0658a96b";
      }

      // Format full address block
      const fullAddress = `${address.trim()}, ${city.trim()}, ${stateVal.trim()} - ${pinCode.trim()}. Contact: ${customerName.trim()} (${mobile.trim()}). Payment: ${paymentMethod.toUpperCase()}.`;

      createOrder(
        {
          farmerId,
          totalAmount,
          deliveryAddress: fullAddress,
          items: [{ productId: product.id, quantity, priceAtPurchase: price }],
        },
        {
          onSuccess: (data: any) => {
            setGeneratedOrderId(data?.id || `AGN-${Math.floor(100000 + Math.random() * 900000)}`);
            setOrderSuccess(true);
          },
          onError: (err: any) => setFormError(err.message || "Failed to place order. Please try again."),
        }
      );
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred during checkout.");
    }
  };

  // ── Shared card style for dark theme ──────────────────────────────────────
  const cardStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  };
  const inputClass = "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
      
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.push("/consumer/marketplace")}
          className="p-2.5 rounded-full transition-colors border-0 cursor-pointer"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          title={t("backToMarketplace")}>
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t("checkoutTitle")}</h1>
          <p className="text-xs text-slate-500">Secure Direct Farm-to-Consumer Purchase</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {orderSuccess ? (
          // ── SUCCESS CONTAINER ───────────────────────
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto py-12 px-8 rounded-3xl text-center"
            style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.20)" }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <CheckCircle className="w-10 h-10 text-emerald-400 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t("orderConfirmed")}</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Your direct farm order has been placed successfully with <strong className="text-white">{farmerName}</strong>. The farmer is preparing your harvest for dispatch.
            </p>

            {/* Order details snapshot */}
            <div className="rounded-2xl p-5 mb-8 text-left space-y-3 text-sm"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono font-bold text-emerald-400">{generatedOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Produce Ordered:</span>
                <span className="font-semibold text-white">{product.title} (x{quantity} {unit})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t("estimatedDelivery1")}</span>
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-sky-400" />
                  {estimatedDelivery}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 font-bold">
                <span className="text-slate-400">Total Paid:</span>
                <span className="text-emerald-400">₹{totalAmount.toFixed(0)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => router.push("/consumer/marketplace")}
                className="flex-1 py-3 rounded-xl text-sm font-bold cursor-pointer border-0 transition-colors text-slate-300 hover:text-white"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {t("continueShopping")}
              </button>
              <button onClick={() => router.push("/consumer/orders")}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all border-0 cursor-pointer hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}>
                View My Orders
              </button>
            </div>
          </motion.div>
        ) : (
          // ── CHECKOUT FORM ──────────────────────────
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Forms (8 Cols) */}
            <form onSubmit={handlePlaceOrder} className="lg:col-span-8 space-y-6">
              
              {/* Customer Information Card */}
              <div className="rounded-3xl p-6 space-y-4" style={cardStyle}>
                <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <User className="w-4 h-4 text-emerald-400" />
                  {t("customerInformation")}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t("fullName")}</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        className={inputClass}
                        style={inputStyle}
                        required />
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)}
                        placeholder="10-digit number"
                        className={inputClass}
                        style={inputStyle}
                        required />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t("emailAddress")}</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="john.doe@example.com"
                        className={inputClass}
                        style={inputStyle}
                        required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="rounded-3xl p-6 space-y-4" style={cardStyle}>
                <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  {t("deliveryAddress")}
                </h3>
                
                <div className="space-y-4">
                  {/* Address */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t("streetAddress")}</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                        placeholder="House no., Apartment, Street, Area"
                        className={inputClass}
                        style={inputStyle}
                        required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* City */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t("city")}</label>
                      <input type="text" value={city} onChange={e => setCity(e.target.value)}
                        placeholder={t("city")}
                        className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                        style={inputStyle}
                        required />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t("state")}</label>
                      <input type="text" value={stateVal} onChange={e => setStateVal(e.target.value)}
                        placeholder={t("state")}
                        className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                        style={inputStyle}
                        required />
                    </div>

                    {/* PIN */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">PIN Code</label>
                      <input type="text" value={pinCode} maxLength={6}
                        onChange={e => setPinCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="6-digit code"
                        className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
                        style={inputStyle}
                        required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section Card */}
              <div className="rounded-3xl p-6 space-y-4" style={cardStyle}>
                <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Select Payment Option
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: "cod", label: "Cash on Delivery", icon: Truck, desc: "Pay with cash at doorstep" },
                    { id: "upi", label: "UPI Instant Pay", icon: UpiIcon, desc: "Google Pay, PhonePe, BHIM" },
                    { id: "card", label: "Card Payment", icon: CreditCard, desc: "Credit / Debit Cards supported" },
                    { id: "netbanking", label: "Net Banking", icon: Landmark, desc: "Direct NetBanking payment" },
                    { id: "wallet", label: "Wallets", icon: Wallet, desc: "Paytm, Mobikwik, AmazonPay" },
                  ].map((pay) => (
                    <div
                      key={pay.id}
                      onClick={() => setPaymentMethod(pay.id)}
                      className="p-4 rounded-2xl transition-all cursor-pointer flex flex-col gap-2"
                      style={{
                        background: paymentMethod === pay.id
                          ? "rgba(16,185,129,0.12)"
                          : "rgba(255,255,255,0.03)",
                        border: paymentMethod === pay.id
                          ? "1px solid rgba(16,185,129,0.40)"
                          : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <pay.icon className={`w-5 h-5 ${paymentMethod === pay.id ? "text-emerald-400" : "text-slate-500"}`} />
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          paymentMethod === pay.id ? "border-emerald-500 bg-emerald-500" : "border-slate-600"
                        }`}>
                          {paymentMethod === pay.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <div>
                        <p className={`font-bold text-xs ${paymentMethod === pay.id ? "text-emerald-300" : "text-slate-300"}`}>{pay.label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{pay.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </form>

            {/* Right: Summary Column (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Product Summary Card */}
              <div className="rounded-3xl p-5 space-y-4" style={cardStyle}>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 flex items-center justify-between"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <span>Product Summary</span>
                  {product.isOrganic && (
                    <span className="text-[9px] rounded px-1.5 py-0.5 font-extrabold font-mono uppercase tracking-wider"
                      style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.30)", color: "#34d399" }}>
                      {t("organic")}
                    </span>
                  )}
                </h3>

                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center text-3xl"
                    style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))" }}>
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover rounded-2xl" /> : "🌱"}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm leading-tight">{product.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">Category: {product.category}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Farmer: {farmerName}</p>
                  </div>
                </div>

                <div className="rounded-2xl p-4 text-xs space-y-2"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unit Price</span>
                    <span className="font-bold text-white">₹{price} / {unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("availability")}</span>
                    <span className="font-semibold text-emerald-400">{stock > 0 ? `In Stock (${stock} ${unit})` : "Out of Stock"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("estDelivery")}</span>
                    <span className="font-semibold text-white">{estimatedDelivery}</span>
                  </div>
                </div>

                {/* Qty Selector */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-slate-400">{t("quantity")}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-white">{quantity}</span>
                    <button
                      type="button"
                      disabled={quantity >= stock}
                      onClick={() => setQuantity(prev => Math.min(stock, prev + 1))}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="rounded-3xl p-5 space-y-4" style={cardStyle}>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {t("billDetails")}
                </h3>

                <div className="text-xs space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal ({quantity} {unit})</span>
                    <span className="font-medium text-white">₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("deliveryCharge")}</span>
                    <span className="font-medium text-white">
                      {deliveryCharge === 0 ? <span className="text-emerald-400 font-bold">{t("free")}</span> : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Platform Handling Fee</span>
                    <span className="font-medium text-white">₹{platformFee}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>{t("discount")}</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 text-sm font-black"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <span className="text-slate-300">{t("finalTotal")}</span>
                    <span className="text-emerald-400 text-lg">₹{totalAmount.toFixed(0)}</span>
                  </div>
                </div>

                {/* Error */}
                {formError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl text-xs font-medium"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)", color: "#f87171" }}>
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {formError}
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed border-0 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      boxShadow: "0 4px 20px rgba(16,185,129,0.30)",
                    }}
                  >
                    {isPlacingOrder ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>
                    ) : (
                      `Place Order · ₹${totalAmount.toFixed(0)}`
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/consumer/marketplace")}
                    className="w-full py-3 rounded-2xl font-bold transition-colors text-xs border-0 bg-transparent cursor-pointer text-slate-500 hover:text-slate-300"
                  >
                    {t("cancelOrder")}
                  </button>
                </div>
              </div>

              {/* Secure payment shield indicator */}
              <div className="flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified direct payout to local farmers.
              </div>

            </div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function CheckoutPage() {
  const { t } = useTranslation("consumer");
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-slate-400 text-sm">{t("loading")}</p>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}