"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Truck, ShieldCheck, ShoppingBag, CheckCircle,
  AlertCircle, Loader2, User, Phone, Mail, MapPin, CreditCard,
  Wallet, Landmark, Plus, Minus, Landmark as UpiIcon, HelpCircle,
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
  const { t } = useTranslation();

  const [quantity, setQuantity] = useState<number>(initialQty);
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod, upi, card, netbanking, wallet
  const [formError, setFormError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  const { data: liveProducts = [], isLoading: productsLoading } = useMarketplaceProducts({});
  const { mutate: createOrder, isPending: isPlacingOrder } = useCreateOrder();

  // Load fallback demo data + format
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
  const { t } = useTranslation("consumer");
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
          // Attempt parsing address if formatted as comma separated
          const parts = profile.address.split(",");
          if (parts.length >= 3) {
            setAddress(parts[0].trim());
            setCity(parts[1].trim());
            // parse state and pin if formatted "State - PIN"
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
        <p className="text-slate-500 text-sm">Loading checkout details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-lg">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">Product Not Found</h3>
        <p className="text-slate-500 text-sm mb-6">The product you are trying to purchase does not exist or is currently unavailable.</p>
        <Link href="/consumer/marketplace" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold no-underline">
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
  const discount = 0; // Can be expanded with coupon logic if needed
  const totalAmount = subtotal + deliveryCharge + platformFee - discount;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form validations
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
            // Generate a mockup order ID if hook doesn't return one directly
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
      
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push("/consumer/marketplace")}
          className="p-2.5 rounded-full hover:bg-slate-100 transition-colors border-0 bg-transparent cursor-pointer"
          title={t("backToMarketplace")}>
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{t("checkoutTitle")}</h1>
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
            className="max-w-xl mx-auto py-12 px-8 rounded-3xl border border-slate-100 shadow-xl bg-white text-center"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{t("orderConfirmed")}</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Your direct farm order has been placed successfully with <strong>{farmerName}</strong>{t("theFarmerIsPackingYourHarvest")}
            </p>

            {/* Order details snapshot */}
            <div className="rounded-2xl p-5 mb-8 text-left space-y-3 bg-slate-50 border border-slate-100 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono font-bold text-slate-800">{generatedOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Produce Ordered:</span>
                <span className="font-semibold text-slate-800">{product.title} (x{quantity} {unit})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t("estimatedDelivery1")}</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-sky-500" />
                  {estimatedDelivery}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200/60 font-bold">
                <span className="text-slate-700">Total Paid:</span>
                <span className="text-emerald-700">₹{totalAmount.toFixed(0)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => router.push("/consumer/marketplace")}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border-0 cursor-pointer">
                {t("continueShopping")}
              </button>
              <button onClick={() => router.push("/consumer/orders")}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all border-0 cursor-pointer hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}>
                View Orders
              </button>
            </div>
          </motion.div>
        ) : (
          // ── CHECKOUT FORM ──────────────────────────
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Forms (8 Cols) */}
            <form onSubmit={handlePlaceOrder} className="lg:col-span-8 space-y-6">
              
              {/* Customer Information Card */}
              <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <User className="w-4.5 h-4.5 text-emerald-600" />
                  {t("customerInformation")}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t("fullName")}</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        required />
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)}
                        placeholder="10-digit number"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        required />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t("emailAddress")}</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="john.doe@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <MapPin className="w-4.5 h-4.5 text-emerald-600" />
                  {t("deliveryAddress")}
                </h3>
                
                <div className="space-y-4">
                  {/* Address */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t("streetAddress")}</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                        placeholder="House no., Apartment, Street, Area"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* City */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t("city")}</label>
                      <input type="text" value={city} onChange={e => setCity(e.target.value)}
                        placeholder={t("city")}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        required />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t("state")}</label>
                      <input type="text" value={stateVal} onChange={e => setStateVal(e.target.value)}
                        placeholder={t("state")}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        required />
                    </div>

                    {/* PIN */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">PIN Code</label>
                      <input type="text" value={pinCode} maxLength={6}
                        onChange={e => setPinCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="6-digit code"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200/80 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                        required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section Card */}
              <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <CreditCard className="w-4.5 h-4.5 text-emerald-600" />
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
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                        paymentMethod === pay.id
                          ? "bg-emerald-50/50 border-emerald-500 text-emerald-900 shadow-sm"
                          : "bg-white border-slate-200 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <pay.icon className={`w-5 h-5 ${paymentMethod === pay.id ? "text-emerald-600" : "text-slate-400"}`} />
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          paymentMethod === pay.id ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                        }`}>
                          {paymentMethod === pay.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-800">{pay.label}</p>
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
              <div className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span>Product Summary</span>
                  {product.isOrganic && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 border-emerald-200 rounded px-1.5 py-0.5 font-extrabold font-mono uppercase tracking-wider">{t("organic")}</span>
                  )}
                </h3>

                <div className="flex gap-4">
                  {/* Image mock */}
                  <div className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center text-3xl"
                    style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))" }}>
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover rounded-2xl" /> : "🌱"}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{product.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">Category: {product.category}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Farmer: {farmerName}</p>
                  </div>
                </div>

                <div className="rounded-2xl p-4 bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unit Price</span>
                    <span className="font-bold text-slate-800">₹{price} / {unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("availability")}</span>
                    <span className="font-semibold text-emerald-600">{stock > 0 ? `In Stock (${stock} ${unit})` : "Out of Stock"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("estDelivery")}</span>
                    <span className="font-semibold text-slate-800">{estimatedDelivery}</span>
                  </div>
                </div>

                {/* Qty Selector */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-slate-600">{t("quantity")}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-800">{quantity}</span>
                    <button
                      type="button"
                      disabled={quantity >= stock}
                      onClick={() => setQuantity(prev => Math.min(stock, prev + 1))}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100">
                  {t("billDetails")}
                </h3>

                <div className="text-xs space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal ({quantity} {unit})</span>
                    <span className="font-medium text-slate-800">₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("deliveryCharge")}</span>
                    <span className="font-medium text-slate-800">
                      {deliveryCharge === 0 ? <span className="text-emerald-600 font-bold">{t("free")}</span> : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Platform Handling Fee</span>
                    <span className="font-medium text-slate-800">₹{platformFee}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>{t("discount")}</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-slate-100 text-sm font-black">
                    <span className="text-slate-800">{t("finalTotal")}</span>
                    <span className="text-emerald-700 text-lg">₹{totalAmount.toFixed(0)}</span>
                  </div>
                </div>

                {/* Error */}
                {formError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl text-xs text-red-700 bg-red-50 border border-red-100 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
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
                      boxShadow: "0 4px 20px rgba(16,185,129,0.25)",
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
                    className="w-full py-3 rounded-2xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors text-xs border-0 bg-transparent cursor-pointer"
                  >
                    {t("cancelOrder")}
                  </button>
                </div>
              </div>

              {/* Secure payment shield indicator */}
              <div className="flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
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
        <p className="text-slate-500 text-sm">{t("loading")}</p>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}