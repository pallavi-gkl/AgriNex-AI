"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Truck, ShieldCheck, ShoppingBag, CheckCircle,
  AlertCircle, Loader2, User, Phone, Mail, MapPin, CreditCard,
  Wallet, Landmark, Plus, Minus, Landmark as UpiIcon, Leaf,
  Sparkles, BadgeCheck, Star, Package, Clock, Zap, Lock,
  Shield,
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "12px", background: "linear-gradient(135deg, #F8FFF8, #EAF7EC)" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid #DCFCE7", borderTopColor: "#16A34A", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "#64748B", fontSize: "14px", fontWeight: 600 }}>Loading checkout details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ maxWidth: "480px", margin: "48px auto", textAlign: "center", padding: "40px 32px", background: "#ffffff", border: "1.5px solid #DCFCE7", borderRadius: "24px", boxShadow: "0 8px 32px rgba(22,163,74,0.06)" }}>
        <AlertCircle style={{ width: "52px", height: "52px", color: "#F59E0B", margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", marginBottom: "8px" }}>Product Not Found</h3>
        <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>The product you are trying to purchase does not exist or is currently unavailable.</p>
        <Link href="/consumer/marketplace"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "999px", fontSize: "14px", fontWeight: 700, textDecoration: "none", color: "#ffffff", background: "linear-gradient(135deg, #16A34A, #22C55E)" }}>
          <ArrowLeft style={{ width: "16px", height: "16px" }} /> {t("backToMarketplace")}
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

      await (supabase.from("profiles") as any)
        .update({ full_name: customerName, phone_number: mobile })
        .eq("id", user.id);

      let farmerId: string = product.farmer?.id ?? product.farmerId ?? "";
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!farmerId || !uuidRegex.test(farmerId)) {
        const { data: farmers } = await (supabase.from("profiles") as any)
          .select("id")
          .eq("role", "farmer")
          .limit(1);
        farmerId = farmers?.[0]?.id ?? "33007d38-d5e8-4dc4-af1a-fd4d0658a96b";
      }

      const fullAddress = `${address.trim()}, ${city.trim()}, ${stateVal.trim()} - ${pinCode.trim()}. Contact: ${customerName.trim()} (${mobile.trim()}). Payment: ${paymentMethod.toUpperCase()}.`;

      createOrder(
        { farmerId, totalAmount, deliveryAddress: fullAddress, items: [{ productId: product.id, quantity, priceAtPurchase: price }] },
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

  // ── Shared styles ──────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: "#ffffff",
    border: "1.5px solid #DCFCE7",
    borderRadius: "22px",
    boxShadow: "0 4px 24px rgba(22,163,74,0.04)",
    padding: "24px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "50px",
    paddingLeft: "44px",
    paddingRight: "16px",
    borderRadius: "14px",
    border: "1.5px solid #BBF7D0",
    background: "#F8FFF8",
    fontSize: "14px",
    color: "#0F172A",
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.2s",
    boxSizing: "border-box" as const,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 800,
    color: "#64748B",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    marginBottom: "6px",
  };

  const sectionTitle = (icon: React.ReactNode, title: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1.5px solid #F1F5F9" }}>
      <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{title}</h3>
    </div>
  );

  const InputField = ({ label, icon, value, onChange, type = "text", placeholder, required, span2 = false, pattern }: any) => (
    <div style={{ gridColumn: span2 ? "1 / -1" : undefined }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          pattern={pattern}
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor = "#16A34A"; e.target.style.boxShadow = "0 0 0 4px rgba(22,163,74,0.1)"; e.target.style.background = "#ffffff"; }}
          onBlur={e => { e.target.style.borderColor = "#BBF7D0"; e.target.style.boxShadow = "none"; e.target.style.background = "#F8FFF8"; }}
        />
      </div>
    </div>
  );

  return (
    <div style={{ background: "linear-gradient(135deg, #F8FFF8 0%, #EAF7EC 60%, #F3FAF0 100%)", minHeight: "100vh", padding: "28px 20px 60px", fontFamily: "Inter, sans-serif" }}>
      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .co-hover:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(22,163,74,0.08) !important; transition: all 0.25s ease; }
        .co-btn-main:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(22,163,74,0.38) !important; }
        .co-btn-main:active { transform: translateY(0); }
        .co-pay-card:hover { border-color: #22C55E !important; background: #F0FDF4 !important; }
      `}</style>

      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>

        {/* Back */}
        <button onClick={() => router.push("/consumer/marketplace")}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#64748B", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginBottom: "24px", padding: 0, fontFamily: "inherit" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#16A34A")}
          onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}>
          <ArrowLeft style={{ width: "16px", height: "16px" }} />
          {t("backToMarketplace")}
        </button>

        <AnimatePresence mode="wait">
          {orderSuccess ? (
            // ── SUCCESS SCREEN ───────────────────────────────────────────────
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center", padding: "48px 40px", background: "#ffffff", border: "1.5px solid #BBF7D0", borderRadius: "28px", boxShadow: "0 20px 60px rgba(22,163,74,0.10)" }}>
              <div style={{ width: "88px", height: "88px", borderRadius: "50%", background: "linear-gradient(135deg, #DCFCE7, #BBF7D0)", border: "2px solid #86EFAC", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <CheckCircle style={{ width: "44px", height: "44px", color: "#16A34A" }} />
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0F172A", margin: "0 0 8px", letterSpacing: "-0.5px" }}>{t("orderConfirmed")}</h2>
              <p style={{ color: "#64748B", fontSize: "15px", marginBottom: "28px", lineHeight: 1.65 }}>
                Your farm order has been placed with <strong style={{ color: "#0F172A" }}>{farmerName}</strong>. The farmer is preparing your harvest.
              </p>

              <div style={{ background: "#F8FFF8", border: "1.5px solid #DCFCE7", borderRadius: "16px", padding: "20px", marginBottom: "28px", textAlign: "left" }}>
                {[
                  ["Order ID", generatedOrderId, "#16A34A", true],
                  ["Produce Ordered", `${product.title} (×${quantity} ${unit})`, "#0F172A", false],
                  [`${t("estimatedDelivery1")}`, estimatedDelivery, "#0F172A", false],
                  ["Total Paid", `₹${totalAmount.toFixed(0)}`, "#16A34A", false],
                ].map(([label, value, color, mono]) => (
                  <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                    <span style={{ fontSize: "13px", color: "#94A3B8", fontWeight: 600 }}>{label}:</span>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: String(color), fontFamily: mono ? "monospace" : "inherit" }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => router.push("/consumer/marketplace")}
                  style={{ flex: 1, height: "48px", borderRadius: "14px", border: "1.5px solid #DCFCE7", background: "#ffffff", color: "#64748B", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
                  {t("continueShopping")}
                </button>
                <button onClick={() => router.push("/consumer/orders")}
                  style={{ flex: 1, height: "48px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #16A34A, #22C55E)", color: "#ffffff", fontWeight: 800, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 16px rgba(22,163,74,0.3)", fontFamily: "inherit" }}>
                  View My Orders
                </button>
              </div>
            </motion.div>
          ) : (
            // ── CHECKOUT FORM ─────────────────────────────────────────────────
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

              {/* Hero Header */}
              <div style={{ background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)", borderRadius: "22px", padding: "28px 32px", marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", boxShadow: "0 8px 32px rgba(22,163,74,0.22)" }}>
                <div>
                  <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#ffffff", margin: "0 0 6px", letterSpacing: "-0.5px" }}>🛒 {t("checkoutTitle")}</h1>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", margin: 0, fontWeight: 500 }}>Complete your order directly from verified farmers.</p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {[
                    { icon: "🔒", label: "Secure Payment" },
                    { icon: "🌾", label: "Direct from Farmer" },
                    { icon: "🤖", label: "AI Verified" },
                    { icon: "🚚", label: "Fast Delivery" },
                  ].map(b => (
                    <span key={b.label} style={{ padding: "6px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", fontSize: "12px", fontWeight: 700, color: "#ffffff", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: "5px" }}>
                      {b.icon} {b.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Two-column layout */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "28px", alignItems: "start" }}>

                {/* ── LEFT: Form ── */}
                <form onSubmit={handlePlaceOrder} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                  {/* Customer Information */}
                  <div className="co-hover" style={card}>
                    {sectionTitle(<User style={{ width: "18px", height: "18px", color: "#16A34A" }} />, t("customerInformation"))}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <InputField label={t("fullName")} icon={<User style={{ width: "15px", height: "15px", color: "#94A3B8" }} />} value={customerName} onChange={(e: any) => setCustomerName(e.target.value)} placeholder="Rahul Sharma" required />
                      <InputField label="Mobile Number" icon={<Phone style={{ width: "15px", height: "15px", color: "#94A3B8" }} />} value={mobile} type="tel" onChange={(e: any) => setMobile(e.target.value)} placeholder="10-digit number" required />
                      <InputField label={t("emailAddress")} icon={<Mail style={{ width: "15px", height: "15px", color: "#94A3B8" }} />} value={email} type="email" onChange={(e: any) => setEmail(e.target.value)} placeholder="you@example.com" required span2 />
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="co-hover" style={card}>
                    {sectionTitle(<MapPin style={{ width: "18px", height: "18px", color: "#16A34A" }} />, t("deliveryAddress"))}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <InputField label={t("streetAddress")} icon={<MapPin style={{ width: "15px", height: "15px", color: "#94A3B8" }} />} value={address} onChange={(e: any) => setAddress(e.target.value)} placeholder="House no., Apartment, Street, Area" required />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                        {/* City */}
                        <div>
                          <label style={labelStyle}>{t("city")}</label>
                          <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder={t("city")} required
                            style={{ ...inputStyle, paddingLeft: "16px" }}
                            onFocus={e => { e.target.style.borderColor = "#16A34A"; e.target.style.boxShadow = "0 0 0 4px rgba(22,163,74,0.1)"; e.target.style.background = "#ffffff"; }}
                            onBlur={e => { e.target.style.borderColor = "#BBF7D0"; e.target.style.boxShadow = "none"; e.target.style.background = "#F8FFF8"; }} />
                        </div>
                        {/* State */}
                        <div>
                          <label style={labelStyle}>{t("state")}</label>
                          <input type="text" value={stateVal} onChange={e => setStateVal(e.target.value)} placeholder={t("state")} required
                            style={{ ...inputStyle, paddingLeft: "16px" }}
                            onFocus={e => { e.target.style.borderColor = "#16A34A"; e.target.style.boxShadow = "0 0 0 4px rgba(22,163,74,0.1)"; e.target.style.background = "#ffffff"; }}
                            onBlur={e => { e.target.style.borderColor = "#BBF7D0"; e.target.style.boxShadow = "none"; e.target.style.background = "#F8FFF8"; }} />
                        </div>
                        {/* PIN */}
                        <div>
                          <label style={labelStyle}>PIN Code</label>
                          <input type="text" value={pinCode} maxLength={6} onChange={e => setPinCode(e.target.value.replace(/\D/g, ""))} placeholder="6-digit code" required
                            style={{ ...inputStyle, paddingLeft: "16px" }}
                            onFocus={e => { e.target.style.borderColor = "#16A34A"; e.target.style.boxShadow = "0 0 0 4px rgba(22,163,74,0.1)"; e.target.style.background = "#ffffff"; }}
                            onBlur={e => { e.target.style.borderColor = "#BBF7D0"; e.target.style.boxShadow = "none"; e.target.style.background = "#F8FFF8"; }} />
                        </div>
                      </div>

                      {/* Delivery PIN verified badge */}
                      {pinCode.length === 6 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px" }}>
                          <BadgeCheck style={{ width: "15px", height: "15px", color: "#16A34A" }} />
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#16A34A" }}>PIN {pinCode} — Delivery available in this area</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="co-hover" style={card}>
                    {sectionTitle(<CreditCard style={{ width: "18px", height: "18px", color: "#16A34A" }} />, "Select Payment Method")}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                      {[
                        { id: "cod", label: "Cash on Delivery", icon: <Truck style={{ width: "22px", height: "22px" }} />, desc: "Pay at doorstep", emoji: "💵" },
                        { id: "upi", label: "UPI Instant Pay", icon: <UpiIcon style={{ width: "22px", height: "22px" }} />, desc: "GPay · PhonePe · BHIM", emoji: "📲" },
                        { id: "card", label: "Card Payment", icon: <CreditCard style={{ width: "22px", height: "22px" }} />, desc: "Credit / Debit Cards", emoji: "💳" },
                        { id: "netbanking", label: "Net Banking", icon: <Landmark style={{ width: "22px", height: "22px" }} />, desc: "Direct bank transfer", emoji: "🏦" },
                        { id: "wallet", label: "Wallets", icon: <Wallet style={{ width: "22px", height: "22px" }} />, desc: "Paytm · Mobikwik", emoji: "👛" },
                      ].map((pay) => {
                        const active = paymentMethod === pay.id;
                        return (
                          <div key={pay.id} className="co-pay-card" onClick={() => setPaymentMethod(pay.id)}
                            style={{ padding: "16px 14px", borderRadius: "16px", cursor: "pointer", border: `1.5px solid ${active ? "#16A34A" : "#DCFCE7"}`, background: active ? "#F0FDF4" : "#ffffff", transition: "all 0.2s", position: "relative", overflow: "hidden" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                              <div style={{ color: active ? "#16A34A" : "#94A3B8" }}>{pay.icon}</div>
                              <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${active ? "#16A34A" : "#CBD5E1"}`, background: active ? "#16A34A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {active && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ffffff" }} />}
                              </div>
                            </div>
                            <p style={{ fontSize: "12px", fontWeight: 800, color: active ? "#16A34A" : "#0F172A", margin: "0 0 3px" }}>{pay.label}</p>
                            <p style={{ fontSize: "10px", color: "#94A3B8", fontWeight: 500, margin: 0 }}>{pay.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery Timeline */}
                  <div className="co-hover" style={card}>
                    {sectionTitle(<Truck style={{ width: "18px", height: "18px", color: "#16A34A" }} />, "Delivery Timeline")}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "4px" }}>
                      {[
                        { icon: "📦", label: "Order Confirmed", sub: "Instantly", done: true },
                        { icon: "🌾", label: "Farmer Packs", sub: "Within 2 hrs", done: true },
                        { icon: "🚛", label: "Shipped", sub: "Same day", done: true },
                        { icon: "🏠", label: "Delivered", sub: estimatedDelivery, done: false },
                      ].map((step, i, arr) => (
                        <div key={step.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                          {/* Connector line */}
                          {i < arr.length - 1 && (
                            <div style={{ position: "absolute", top: "20px", left: "50%", width: "100%", height: "2px", background: step.done ? "linear-gradient(to right, #16A34A, #22C55E)" : "#E2E8F0", zIndex: 0 }} />
                          )}
                          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: step.done ? "linear-gradient(135deg, #16A34A, #22C55E)" : "#F1F5F9", border: `2px solid ${step.done ? "#16A34A" : "#E2E8F0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", position: "relative", zIndex: 1, boxShadow: step.done ? "0 4px 12px rgba(22,163,74,0.25)" : "none" }}>
                            {step.icon}
                          </div>
                          <p style={{ fontSize: "11px", fontWeight: 800, color: step.done ? "#0F172A" : "#94A3B8", textAlign: "center", marginTop: "8px", marginBottom: "2px" }}>{step.label}</p>
                          <p style={{ fontSize: "10px", color: "#94A3B8", textAlign: "center", margin: 0 }}>{step.sub}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Purchase Insights */}
                  <div className="co-hover" style={card}>
                    {sectionTitle(<Sparkles style={{ width: "18px", height: "18px", color: "#7C3AED" }} />, "AI Purchase Insights")}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                      {[
                        { icon: "✅", label: "Freshness", value: "94%", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
                        { icon: "🌡️", label: "Storage", value: "Cool & Dry", color: "#0369A1", bg: "#EFF6FF", border: "#BFDBFE" },
                        { icon: "🍽️", label: "Shelf Life", value: "7–10 Days", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
                        { icon: "⚡", label: "AI Quality", value: `Grade ${product.qualityGrade || "A"}`, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
                        { icon: "🌿", label: "Organic", value: product.isOrganic ? "Certified" : "Natural", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
                        { icon: "💚", label: "Health", value: "High Nutrient", color: "#0D9488", bg: "#F0FDFA", border: "#99F6E4" },
                      ].map(item => (
                        <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: "14px", padding: "14px 12px", textAlign: "center" }}>
                          <div style={{ fontSize: "20px", marginBottom: "6px" }}>{item.icon}</div>
                          <p style={{ fontSize: "10px", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>{item.label}</p>
                          <p style={{ fontSize: "13px", fontWeight: 900, color: item.color, margin: 0 }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security Footer */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                    {[
                      { icon: <Lock style={{ width: "16px", height: "16px", color: "#0369A1" }} />, text: "SSL Secured", bg: "#EFF6FF", border: "#BFDBFE" },
                      { icon: <Shield style={{ width: "16px", height: "16px", color: "#16A34A" }} />, text: "Buyer Protection", bg: "#F0FDF4", border: "#BBF7D0" },
                      { icon: <Leaf style={{ width: "16px", height: "16px", color: "#16A34A" }} />, text: "Direct Farmer Pay", bg: "#F0FDF4", border: "#BBF7D0" },
                      { icon: <ShieldCheck style={{ width: "16px", height: "16px", color: "#7C3AED" }} />, text: "Encrypted", bg: "#F5F3FF", border: "#DDD6FE" },
                    ].map(item => (
                      <div key={item.text} style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: "14px", padding: "12px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        {item.icon}
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textAlign: "center" }}>{item.text}</span>
                      </div>
                    ))}
                  </div>

                </form>

                {/* ── RIGHT: Sticky Summary ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "sticky", top: "20px" }}>

                  {/* Product Summary Card */}
                  <div className="co-hover" style={card}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", paddingBottom: "14px", borderBottom: "1.5px solid #F1F5F9" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Product Summary</h3>
                      {product.isOrganic && (
                        <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 800, background: "#DCFCE7", color: "#16A34A", border: "1px solid #86EFAC" }}>🌿 {t("organic")}</span>
                      )}
                    </div>

                    {/* Product image + name */}
                    <div style={{ display: "flex", gap: "14px", marginBottom: "16px" }}>
                      <div style={{ width: "72px", height: "72px", borderRadius: "16px", overflow: "hidden", flexShrink: 0, border: "1.5px solid #DCFCE7" }}>
                        {product.imageUrl
                          ? <img src={product.imageUrl} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>🌱</div>}
                      </div>
                      <div>
                        <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: "0 0 4px", lineHeight: 1.3 }}>{product.title}</h4>
                        <p style={{ fontSize: "12px", color: "#94A3B8", margin: "0 0 4px", fontWeight: 500 }}>Category: {product.category}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <BadgeCheck style={{ width: "13px", height: "13px", color: "#16A34A" }} />
                          <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: 700 }}>{farmerName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Details rows */}
                    <div style={{ background: "#F8FFF8", border: "1px solid #DCFCE7", borderRadius: "14px", padding: "14px", marginBottom: "16px" }}>
                      {[
                        ["Unit Price", `₹${price} / ${unit}`],
                        [t("availability"), stock > 0 ? `In Stock (${stock} ${unit})` : "Out of Stock"],
                        [t("estDelivery"), estimatedDelivery],
                        ["Quality Grade", `Grade ${product.qualityGrade || "A"} (AI Verified)`],
                      ].map(([label, value], i) => (
                        <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < 3 ? "1px solid #F1F5F9" : "none" }}>
                          <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 600 }}>{label}</span>
                          <span style={{ fontSize: "12px", color: "#0F172A", fontWeight: 800 }}>{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Quantity selector */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748B" }}>{t("quantity")}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0", background: "#F1F5F9", borderRadius: "14px", border: "1.5px solid #E2E8F0", overflow: "hidden" }}>
                        <button type="button" disabled={quantity <= 1} onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          style={{ width: "40px", height: "40px", border: "none", background: "transparent", cursor: quantity <= 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: quantity <= 1 ? 0.4 : 1, transition: "background 0.15s", fontFamily: "inherit" }}
                          onMouseEnter={e => quantity > 1 && (e.currentTarget.style.background = "#DCFCE7")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <Minus style={{ width: "14px", height: "14px", color: "#0F172A" }} />
                        </button>
                        <span style={{ width: "64px", textAlign: "center", fontSize: "14px", fontWeight: 800, color: "#0F172A", fontFamily: "monospace" }}>{quantity} {unit}</span>
                        <button type="button" disabled={quantity >= stock} onClick={() => setQuantity(prev => Math.min(stock, prev + 1))}
                          style={{ width: "40px", height: "40px", border: "none", background: "transparent", cursor: quantity >= stock ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: quantity >= stock ? 0.4 : 1, transition: "background 0.15s", fontFamily: "inherit" }}
                          onMouseEnter={e => quantity < stock && (e.currentTarget.style.background = "#DCFCE7")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <Plus style={{ width: "14px", height: "14px", color: "#0F172A" }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Farmer Trust Card */}
                  <div className="co-hover" style={{ ...card, background: "linear-gradient(135deg, #F0FDF4, #ffffff)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                      <div style={{ fontSize: "24px" }}>👨‍🌾</div>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A", margin: 0 }}>{farmerName}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "3px" }}>
                          <BadgeCheck style={{ width: "13px", height: "13px", color: "#16A34A" }} />
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#16A34A" }}>Verified Farmer</span>
                        </div>
                      </div>
                      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Star style={{ width: "14px", height: "14px", color: "#F59E0B", fill: "#F59E0B" }} />
                        <span style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A" }}>4.9</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ flex: 1, padding: "6px 10px", borderRadius: "99px", background: "#DCFCE7", border: "1px solid #86EFAC", fontSize: "11px", fontWeight: 700, color: "#16A34A", textAlign: "center" }}>✅ KYC Verified</span>
                      <span style={{ flex: 1, padding: "6px 10px", borderRadius: "99px", background: "#FFFBEB", border: "1px solid #FDE68A", fontSize: "11px", fontWeight: 700, color: "#D97706", textAlign: "center" }}>🏆 Top Seller</span>
                    </div>
                  </div>

                  {/* Bill Summary Card */}
                  <div className="co-hover" style={card}>
                    <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", margin: "0 0 16px", paddingBottom: "12px", borderBottom: "1.5px solid #F1F5F9" }}>{t("billDetails")}</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                      {[
                        { label: `Subtotal (${quantity} ${unit})`, value: `₹${subtotal.toFixed(0)}`, accent: false },
                        { label: t("deliveryCharge"), value: deliveryCharge === 0 ? "FREE ✅" : `₹${deliveryCharge}`, accent: deliveryCharge === 0 },
                        { label: "Platform Handling Fee", value: `₹${platformFee}`, accent: false },
                        ...(discount > 0 ? [{ label: t("discount"), value: `-₹${discount}`, accent: true }] : []),
                      ].map(row => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 600 }}>{row.label}</span>
                          <span style={{ fontSize: "13px", fontWeight: 800, color: row.accent ? "#16A34A" : "#0F172A" }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    {/* Grand Total */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: "14px", marginBottom: "16px" }}>
                      <div>
                        <p style={{ fontSize: "12px", color: "#16A34A", fontWeight: 700, margin: "0 0 2px" }}>Grand Total</p>
                        <p style={{ fontSize: "10px", color: "#94A3B8", margin: 0 }}>All taxes included</p>
                      </div>
                      <span style={{ fontSize: "28px", fontWeight: 900, color: "#16A34A", letterSpacing: "-0.5px" }}>₹{totalAmount.toFixed(0)}</span>
                    </div>

                    {/* Error */}
                    {formError && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", borderRadius: "12px", background: "#FEF2F2", border: "1px solid #FECACA", fontSize: "13px", color: "#DC2626", fontWeight: 600, marginBottom: "14px" }}>
                        <AlertCircle style={{ width: "15px", height: "15px", flexShrink: 0 }} />{formError}
                      </div>
                    )}

                    {/* Place Order Button */}
                    <button type="submit" form="" onClick={handlePlaceOrder} disabled={isPlacingOrder}
                      className="co-btn-main"
                      style={{ width: "100%", height: "56px", borderRadius: "16px", border: "none", background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)", color: "#ffffff", fontWeight: 900, fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: isPlacingOrder ? "not-allowed" : "pointer", opacity: isPlacingOrder ? 0.75 : 1, boxShadow: "0 6px 22px rgba(22,163,74,0.32)", transition: "all 0.2s", fontFamily: "inherit", marginBottom: "10px" }}>
                      {isPlacingOrder ? (
                        <><Loader2 style={{ width: "18px", height: "18px", animation: "spin 1s linear infinite" }} /> Placing Order...</>
                      ) : (
                        <>🛒 Place Order · ₹{totalAmount.toFixed(0)}</>
                      )}
                    </button>

                    <button type="button" onClick={() => router.push("/consumer/marketplace")}
                      style={{ width: "100%", height: "44px", borderRadius: "14px", border: "1.5px solid #FECACA", background: "#ffffff", color: "#EF4444", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#FEF2F2")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#ffffff")}>
                      {t("cancelOrder")}
                    </button>
                  </div>

                  {/* Security badges */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px" }}>
                    <ShieldCheck style={{ width: "14px", height: "14px", color: "#16A34A" }} />
                    <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>Verified direct payout to local farmers.</span>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { t } = useTranslation("consumer");
  return (
    <Suspense fallback={
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "12px" }}>
        <Loader2 style={{ width: "32px", height: "32px", color: "#16A34A", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "#94A3B8", fontSize: "14px" }}>{t("loading")}</p>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}