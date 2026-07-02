# Phase 3: Consumer Marketplace & Checkout Experience

**Phase Duration**: Week 5–6  
**Goal**: Build the complete Consumer-facing Marketplace — product discovery with AI smart search, category filter bubbles, glassmorphic product cards, traceability modal, interactive cart, and 3D flipping card payment simulation.

**Depends On**: Phase 1 (Auth, DB Schema), Phase 2 (Products exist in DB)

---

## Overview

This phase delivers the full buyer experience. A consumer can browse all verified farm products, filter by category or location, view detailed traceability reports, add items to cart, and complete a dummy payment through an immersive 3D card flip animation checkout.

---

## 1. Consumer Marketplace Layout (`app/(consumer)/marketplace/page.tsx`)

### 1.1 Page Structure
```tsx
<main>
  {/* Hero Search Section */}
  <MarketplaceSearchHero />

  {/* Category Filter Bubbles */}
  <CategoryFilterCarousel />

  {/* Product Grid */}
  <ProductGrid />

  {/* Product Detail Modal (conditionally shown) */}
  {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={clearSelection} />}
</main>
```

---

## 2. AI Smart Search Hero Section

### 2.1 Component: `components/consumer/MarketplaceSearchHero.tsx`
- **Visual**: Full-width glass container with radial emerald glow in the background.
- **Search Bar**: Oversized input (`glass-input`) with a microphone icon button on the right.
- **Live Suggestions Dropdown**: As the user types, a glass dropdown shows matching crop names and nearby farmer names (debounced at 300ms).
- **Voice Search**: Clicking the mic triggers Web Speech API capture. Transcript fills the search input and auto-fires search.

```tsx
<section className="relative py-14 px-6 text-center">
  {/* Background radial glow */}
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.07)_0%,_transparent_70%)] pointer-events-none" />
  
  <h1 className="text-4xl font-bold gradient-text-green mb-2">Fresh from the Farm</h1>
  <p className="text-slate-400 mb-8 text-lg">Discover verified produce directly from Indian farmers</p>

  <div className="max-w-2xl mx-auto relative">
    <input
      className="glass-input text-lg py-4 pl-6 pr-16"
      placeholder="Search crops, vegetables, grains..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
    <button onClick={startVoiceSearch}
      className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center hover:bg-purple-500/30 transition-all">
      <MicIcon className="w-4 h-4 text-purple-400" />
    </button>
    {suggestions.length > 0 && <SearchSuggestionDropdown items={suggestions} />}
  </div>
</section>
```

---

## 3. Category Filter Bubbles

### 3.1 Component: `components/consumer/CategoryFilterCarousel.tsx`
- **Categories**: Vegetables, Fruits, Grains, Pulses, Spices, Leafy Greens, Dairy, Others
- **Style**: Horizontal scrollable row of rounded glass capsule pills
- **Hover Effect**: Framer Motion spring scale-up + neon border glow matching category color
- **Active State**: Filled background with neon glow

```tsx
<motion.button
  key={cat}
  variants={hoverScaleVariants}
  whileHover="hover"
  whileTap="tap"
  onClick={() => setActiveCategory(cat)}
  className={`px-5 py-2 rounded-full border whitespace-nowrap transition-all ${
    activeCategory === cat
      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
      : "glass-panel border-white/10 text-slate-400 hover:border-emerald-500/30"
  }`}
>
  {cat}
</motion.button>
```

---

## 4. Product Cards Grid

### 4.1 Component: `components/consumer/ProductGrid.tsx`
- **Grid**: Responsive — 1 col mobile, 2 col tablet, 3 col desktop, 4 col large
- **Card Structure**: glass-panel, rounded-2xl, overflow-hidden

```tsx
// ProductCard.tsx
<motion.div
  variants={listItemVariants}
  whileHover={{ y: -6, transition: { type: "spring", stiffness: 300 } }}
  className="glass-panel rounded-2xl overflow-hidden cursor-pointer group"
  onClick={() => setSelectedProduct(product)}
>
  {/* Crop Image */}
  <div className="relative h-48 overflow-hidden">
    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    {/* Grade Badge */}
    <span className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold bg-emerald-500/80 text-white">
      Grade {product.qualityGrade}
    </span>
  </div>

  {/* Card Content */}
  <div className="p-4">
    <div className="flex items-center gap-2 mb-1">
      <h3 className="font-semibold text-white text-sm">{product.title}</h3>
      {product.farmer.isVerified && (
        <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
      )}
    </div>
    <p className="text-slate-400 text-xs mb-3">by {product.farmer.fullName}</p>
    <div className="flex items-center justify-between">
      <span className="gradient-text-green font-bold text-lg">₹{product.pricePerUnit}/{product.unitType}</span>
      <span className="text-slate-500 text-xs">{product.quantityAvailable} {product.unitType} left</span>
    </div>
    
    {/* View Details — shown on hover */}
    <button className="mt-3 w-full py-2 rounded-xl border border-emerald-500/30 text-emerald-400 text-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-500/10">
      View Details & Order
    </button>
  </div>
</motion.div>
```

**API Call**: `GET /api/products?search={query}&category={cat}&lat={lat}&lng={lng}`

---

## 5. Product Detail & Traceability Modal

### 5.1 Component: `components/consumer/ProductDetailModal.tsx`
- **Overlay**: Full-screen dark backdrop (`backdrop-blur-sm bg-black/60`)
- **Modal**: Large centered glass panel (`glass-panel rounded-3xl max-w-4xl w-full`)
- **Animation**: `modalOverlayVariants` + `modalContentVariants` from Phase 1

**Modal Content Sections**:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  {/* Left: Product Image + Grade */}
  <div>
    <img src={product.imageUrl} className="w-full rounded-2xl object-cover h-60" />
    <div className="flex gap-3 mt-4">
      <GradeBadge grade={product.qualityGrade} />
      <FarmerVerifiedBadge isVerified={product.farmer.isVerified} name={product.farmer.fullName} />
    </div>
    {product.qualityReport?.blemishes?.length > 0 && (
      <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <p className="text-amber-400 text-xs font-semibold mb-1">Blemishes Detected</p>
        <ul className="text-slate-300 text-xs list-disc ml-4">
          {product.qualityReport.blemishes.map((b) => <li key={b}>{b}</li>)}
        </ul>
      </div>
    )}
  </div>

  {/* Right: Traceability Timeline + Order Form */}
  <div>
    <TraceabilityTimeline product={product} />
    <AddToCartForm product={product} />
  </div>
</div>
```

**TraceabilityTimeline** — Vertical progress line with 4 checkpoints:
1. 🌾 **Harvested** — Farmer's location + date
2. 🔬 **Quality Graded** — AI grade (A/A+/B/C) + shelf life
3. 🚚 **Dispatched** — Transit activated (if applicable)
4. 🏠 **Arrived** — Delivery confirmed

---

## 6. Cart & Checkout Flow

### 6.1 Cart Slide-Out Drawer (`components/consumer/CartDrawer.tsx`)
- Triggered by the cart icon in the sidebar.
- Slides in from the right with Framer Motion `x: "100%" → x: 0`.
- Lists all cart items with quantity selectors.
- Shows: Subtotal, Estimated Delivery, **Savings vs Retail** (highlighted in emerald), Total.
- "Proceed to Pay" button → opens Payment modal.

### 6.2 3D Flipping Card Payment Modal

```tsx
// PaymentModal.tsx
const [isFlipped, setIsFlipped] = useState(false);

// Card Container
<div className="perspective-1000 h-48 w-80 mx-auto mb-8">
  <div className={`payment-card-inner ${isFlipped ? "flipped" : ""}`} style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transition: "transform 0.8s" }}>
    
    {/* Front */}
    <div className="payment-card-front absolute inset-0 rounded-2xl p-6" style={{ backfaceVisibility: "hidden", background: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)" }}>
      <ChipIcon />
      <p className="text-white/70 text-xs mt-6">Card Number</p>
      <p className="text-white font-mono text-lg tracking-widest">{cardNumber || "•••• •••• •••• ••••"}</p>
      <div className="flex justify-between mt-4">
        <div><p className="text-white/60 text-xs">Card Holder</p><p className="text-white text-sm">{cardHolder || "YOUR NAME"}</p></div>
        <div><p className="text-white/60 text-xs">Expires</p><p className="text-white text-sm">{expiry || "MM/YY"}</p></div>
      </div>
    </div>

    {/* Back */}
    <div className="payment-card-back absolute inset-0 rounded-2xl" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)" }}>
      <div className="h-10 bg-black/40 mt-8" /> {/* Magnetic stripe */}
      <div className="px-6 mt-4">
        <p className="text-white/60 text-xs">CVV</p>
        <div className="bg-white/10 rounded px-3 py-2 mt-1 font-mono text-white">{cvv || "•••"}</div>
      </div>
    </div>
  </div>
</div>

{/* Payment Form Inputs */}
<input className="glass-input" placeholder="Card Number" onChange={(e) => setCardNumber(e.target.value)} />
<input className="glass-input" placeholder="Card Holder Name" onChange={(e) => setCardHolder(e.target.value)} />
<div className="grid grid-cols-2 gap-3">
  <input className="glass-input" placeholder="MM/YY" />
  <input className="glass-input" placeholder="CVV" onFocus={() => setIsFlipped(true)} onBlur={() => setIsFlipped(false)} onChange={(e) => setCvv(e.target.value)} />
</div>
<button className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold" onClick={handlePayment}>
  Pay ₹{totalAmount.toFixed(2)}
</button>
```

**On Payment Success**: Creates order via `POST /api/orders` → shows success overlay with confetti animation → redirects to Order Tracking page.

---

## 7. Post-Purchase Review System

### 7.1 Component: `components/consumer/ReviewModal.tsx`
- Triggered after order status changes to `delivered`.
- Star rating selector (1–5 stars with animated glow on hover).
- Text comment field (`glass-input`).
- Submits via `POST /api/reviews` → updates farmer's `trust_score` in the DB.

---

## 8. Deliverables for Phase 3

| Task | Status |
|------|--------|
| Marketplace search hero with voice input | ⬜ |
| Category filter bubble carousel | ⬜ |
| ProductGrid with stagger animation | ⬜ |
| ProductCard hover interactions | ⬜ |
| ProductDetailModal with traceability timeline | ⬜ |
| CartDrawer slide-out with totals | ⬜ |
| 3D Flipping Card Payment Modal | ⬜ |
| Payment success overlay + order creation | ⬜ |
| Post-purchase Review modal | ⬜ |
| `GET /api/products` with filters | ⬜ |
| `POST /api/orders` with order_items | ⬜ |
| `POST /api/reviews` with trust score update | ⬜ |
