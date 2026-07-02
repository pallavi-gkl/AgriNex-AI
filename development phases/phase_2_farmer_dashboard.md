# Phase 2: Farmer Dashboard & Product Management

**Phase Duration**: Week 3–4  
**Goal**: Build the complete Farmer Dashboard — including the sales analytics area chart, AI crop quality grading scanner widget, speech-enabled product creation form, and incoming order management interface.

**Depends On**: Phase 1 (Auth, Design System, Supabase Schema)

---

## Overview

This phase delivers all core features for the Farmer role. After completing this phase, a verified farmer can: view their earnings vs market averages on a live chart, upload a crop image for AI grading, create a product listing (with or without voice input), manage their inventory, and accept/reject incoming orders from buyers.

---

## 1. Farmer Dashboard Layout (`app/(farmer)/dashboard/page.tsx`)

### 1.1 Dashboard Widget Grid Structure
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
  {/* Row 1: Stats cards */}
  <StatsCard label="Total Earnings" value="₹34,250" color="green" />
  <StatsCard label="Bags Sold" value="82" color="blue" />
  <StatsCard label="Active Listings" value="7" color="purple" />
  <StatsCard label="Trust Score" value="4.8 / 5.0" color="amber" />

  {/* Row 2: Earnings Chart (full width) */}
  <EarningsAreaChart className="col-span-3" />

  {/* Row 3: AI Crop Grader + Product Form */}
  <AICropGraderWidget className="col-span-1" />
  <ProductListingForm className="col-span-2" />

  {/* Row 4: Orders table */}
  <IncomingOrdersTable className="col-span-3" />
</div>
```

### 1.2 StatsCard Component
- **Shape**: Rounded glass card (`glass-panel glass-panel-hover rounded-2xl p-5`)
- **Content**: Icon (Lucide), Label text (slate-400), Value text (large, gradient colored)
- **Hover**: Neon glow matching the card color (green/blue/purple/amber)
- **Animation**: Framer Motion `listItemVariants` stagger entrance

---

## 2. Earnings vs Market Average Area Chart

### 2.1 Component: `components/charts/EarningsAreaChart.tsx`
```tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, defs, linearGradient, stop } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-panel rounded-xl p-3 text-sm">
        <p className="text-slate-400 text-xs mb-2 font-mono">{label}</p>
        <p className="text-emerald-400 font-semibold">My Sales: ₹{payload[0].value.toLocaleString()}</p>
        <p className="text-sky-400 font-semibold">Market Avg: ₹{payload[1].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export const EarningsAreaChart = ({ data }: { data: ChartData[] }) => (
  <div className="glass-panel rounded-2xl p-6">
    <h3 className="gradient-text-green text-lg font-semibold mb-4">Earnings vs Market Average</h3>
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="personalEarnings" stroke="#10b981" strokeWidth={2.5} fill="url(#earningsGrad)" dot={{ r: 5, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 7, fill: "#34d399", boxShadow: "0 0 12px #10b981" }} />
        <Area type="monotone" dataKey="marketAverage" stroke="#0ea5e9" strokeWidth={2} fill="none" strokeDasharray="6 4" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
```

**Data Source**: `GET /api/farmer/analytics?timeframe=monthly`  
**TanStack Query Hook**: `useFarmerAnalytics(timeframe)` auto-refetches every 5 minutes.

---

## 3. AI Crop Quality Grading Widget

### 3.1 Component: `components/farmer/AICropGraderWidget.tsx`
**States**: `idle` → `uploading` → `scanning` → `graded`

```tsx
// STATE: idle — Dotted glass upload zone
<div className="glass-panel rounded-2xl border-2 border-dashed border-white/10 p-8 text-center cursor-pointer hover:border-emerald-500/40 transition-all">
  <CameraIcon className="text-emerald-400 mx-auto mb-3 w-10 h-10" />
  <p className="text-slate-400">Upload or capture crop photo</p>
  <input type="file" accept="image/*" capture="environment" hidden />
</div>

// STATE: scanning — Image with animating scan line overlay
<div className="relative rounded-xl overflow-hidden">
  <img src={previewUrl} className="w-full rounded-xl object-cover" />
  <div className="anim-scan-line" />
  <p className="text-center text-emerald-400 text-sm mt-3 animate-pulse">AI Grading Crop Quality...</p>
</div>

// STATE: graded — Result card (Framer Motion fade-in)
<motion.div variants={modalContentVariants} initial="hidden" animate="visible">
  <div className="text-center mb-4">
    <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center mx-auto mb-2"
         style={{ boxShadow: "0 0 30px rgba(16,185,129,0.4)" }}>
      <span className="gradient-text-green text-3xl font-bold">{grade.grade}</span>
    </div>
    <p className="text-slate-300">Shelf Life: <span className="text-emerald-400 font-semibold">~{grade.estimatedShelfLifeDays} Days</span></p>
  </div>
  <div className="space-y-2 text-sm">
    <p className="text-slate-400">Freshness: <span className="text-white">{grade.freshness}</span></p>
    <p className="text-slate-400">Water Content: <span className="text-sky-400">{grade.waterContentPercentage}%</span></p>
    {grade.blemishes.length > 0 && (
      <p className="text-amber-400 text-xs">Blemishes: {grade.blemishes.join(", ")}</p>
    )}
  </div>
  <button onClick={applyRecommendedPrice} className="mt-4 w-full text-xs py-2 px-4 rounded-lg border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all">
    ✦ Apply Recommended Price: ₹{grade.recommendedPrice}/kg
  </button>
</motion.div>
```

**API Call**: `POST /api/ai/grade-crop` with multipart form data  
**State Transition Timing**: After upload → show scan animation for 1.5 seconds → show result card

---

## 4. Speech-Enabled Product Listing Form

### 4.1 Component: `components/farmer/ProductListingForm.tsx`
- **Fields**: Title, Category (dropdown), Description, Price/Unit (with AI price tag), Unit Type, Quantity
- **Voice Input Per Field**: Each input row has a small purple mic icon button
- **On Mic Tap**: Activates Web Speech API for that single field. The transcript auto-fills the input value.
- **"AI Auto-Price" Button**: Next to Price field. Fires `POST /api/ai/recommend-price` using the current crop type and grade. Updates price input with recommended value and shows rationale text below.

```tsx
// Price field with AI button
<div className="relative">
  <input className="glass-input pr-36" placeholder="Price per unit (₹)" {...register("pricePerUnit")} />
  <button type="button" onClick={getAIPrice}
    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-purple-500/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-1">
    <SparklesIcon className="w-3 h-3" /> AI Price
  </button>
</div>
{aiRationale && (
  <p className="text-xs text-purple-300/70 mt-1 italic">{aiRationale}</p>
)}
```

**Form submission**: `POST /api/products` creates the listing with quality report and traceability code.

---

## 5. Incoming Orders Management Table

### 5.1 Component: `components/farmer/IncomingOrdersTable.tsx`
- **Display**: Table rows in a glass panel. Columns: Order ID, Consumer Name, Crop(s), Qty, Total ₹, Status badge, Actions.
- **Status Badges**: Color-coded pill badges:
  - `pending` → amber
  - `accepted` → blue
  - `quality_verified` → green
  - `dispatched` → purple
  - `delivered` → slate
- **Actions**: Accept button (green glow), View Details button, Mark Dispatched (after accepting).

**API Calls**:
- `GET /api/farmer/orders` — Fetch farmer's incoming order list
- `PATCH /api/orders/:id/status` — Update status (accepted / dispatched)

---

## 6. Deliverables for Phase 2

| Task | Status |
|------|--------|
| Farmer dashboard page with grid layout | ⬜ |
| StatsCard widget (4 metrics) | ⬜ |
| EarningsAreaChart with real API data | ⬜ |
| AICropGraderWidget (idle/scanning/graded states) | ⬜ |
| ProductListingForm with per-field voice input | ⬜ |
| AI Price recommendation button integration | ⬜ |
| Traceability code auto-generation | ⬜ |
| Incoming orders table with status management | ⬜ |
| `GET /api/farmer/analytics` endpoint | ⬜ |
| `POST /api/products` endpoint | ⬜ |
| `GET /api/farmer/orders` endpoint | ⬜ |
