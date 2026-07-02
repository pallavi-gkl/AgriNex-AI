# Phase 6: Admin Console & Platform Operations

**Phase Duration**: Week 11–12  
**Goal**: Build the complete Administrator Portal — real-time platform analytics, farmer KYC verification split-panel board, AI-flagged dispute resolution dashboard, and system-wide notification management.

**Depends On**: All previous phases (uses data from all tables)

---

## Overview

This phase empowers AgriNex AI operators to oversee the entire platform. Admins verify farmer credentials, investigate AI-flagged quality disputes, monitor supply-demand health, and broadcast system notifications. This phase completes the three-role ecosystem of AgriNex AI.

---

## 1. Admin Console Layout (`app/(admin)/page.tsx`)

### 1.1 Navigation Tabs
```tsx
const ADMIN_TABS = [
  { id: "overview",   label: "Overview",      icon: <ChartBarIcon /> },
  { id: "kyc",        label: "KYC Review",    icon: <IdentificationIcon /> },
  { id: "disputes",   label: "Disputes",      icon: <ExclamationTriangleIcon /> },
  { id: "users",      label: "Users",         icon: <UsersIcon /> },
  { id: "notify",     label: "Notifications", icon: <BellIcon /> },
];
```
- Horizontal tab strip at the top of the admin page
- Active tab: glowing underline in purple with glass-panel-hover-purple styling

---

## 2. Platform Analytics Overview Dashboard

### 2.1 Summary Metrics Grid (4 KPI Cards)
```tsx
const METRICS = [
  { label: "Active Farmers",    value: stats.activeFarmers,    icon: "🌾", color: "green"  },
  { label: "Consumer Signups",  value: stats.consumerSignups,  icon: "👥", color: "blue"   },
  { label: "Orders Completed",  value: stats.ordersCompleted,  icon: "📦", color: "purple" },
  { label: "Food Waste Reduced",value: `${stats.foodWasteTons}t`, icon: "♻️", color: "amber" },
];
```

### 2.2 Charts on Overview Tab

**Supply vs Demand Bar Chart** (`components/charts/SupplyDemandChart.tsx`):
- Type: Grouped BarChart (Recharts)
- X-Axis: Top crop categories (Vegetables, Fruits, Grains, Pulses)
- Y-Axis: Volume in kg (listed vs ordered)
- Bars: `Listed` (emerald gradient) vs `Ordered` (sky blue gradient)

**Platform Growth Line Chart** (`components/charts/GrowthChart.tsx`):
- Type: LineChart
- Tracks: Farmer Registrations, Consumer Registrations, Orders — monthly
- Three colored lines (green, blue, purple) with glow effect

**Environmental Impact Circular Gauge**:
- SVG-based circular progress gauge
- Fills with an emerald arc representing `(directOrders / totalOrders) * 100%`
- Center displays percentage with gradient text
- Below the gauge: "Direct orders bypass middlemen, reducing transport by an estimated 34%"

---

## 3. KYC Document Verification Panel

### 3.1 Component: `app/(admin)/kyc/page.tsx`
**Layout**: CSS Grid with 2 columns — `320px` fixed left (list) + flex-1 right (preview)

```tsx
<div className="grid h-full" style={{ gridTemplateColumns: "320px 1fr" }}>
  {/* LEFT: Application List */}
  <div className="glass-panel h-full overflow-y-auto border-r border-white/5">
    <div className="p-4 border-b border-white/5">
      <p className="text-slate-400 text-xs">{applications.length} Pending Applications</p>
    </div>
    {applications.map((app) => (
      <button key={app.profileId}
        onClick={() => setSelected(app)}
        className={`w-full p-4 text-left border-b border-white/5 hover:bg-white/5 transition-all ${selected?.profileId === app.profileId ? "bg-purple-500/10 border-l-2 border-l-purple-500" : ""}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-sky-500/20 flex items-center justify-center text-white font-bold">
            {app.fullName[0]}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{app.fullName}</p>
            <p className="text-slate-400 text-xs">{app.locationAddress}</p>
            <p className="text-slate-600 text-xs font-mono">{new Date(app.submittedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </button>
    ))}
  </div>

  {/* RIGHT: Document Preview */}
  {selected ? (
    <KYCReviewPanel application={selected} onVerify={handleVerify} onReject={handleReject} />
  ) : (
    <div className="flex items-center justify-center h-full text-slate-600">
      <p>Select an application to review</p>
    </div>
  )}
</div>
```

### 3.2 KYC Review Panel (`components/admin/KYCReviewPanel.tsx`)
```tsx
<div className="p-6 space-y-6">
  {/* Farmer Info Header */}
  <div className="flex items-center gap-4">
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/30 to-sky-500/30 flex items-center justify-center text-3xl">
      {application.fullName[0]}
    </div>
    <div>
      <h2 className="text-xl font-bold text-white">{application.fullName}</h2>
      <p className="text-slate-400">{application.locationAddress}</p>
      <p className="text-slate-500 text-sm font-mono">{application.phoneNumber}</p>
    </div>
  </div>

  {/* Land Document Viewer */}
  <div className="glass-panel rounded-2xl p-4">
    <p className="text-slate-400 text-xs mb-3">Uploaded Land Certificate</p>
    {application.landCertificateUrl.endsWith(".pdf") ? (
      <iframe src={application.landCertificateUrl} className="w-full h-80 rounded-xl" />
    ) : (
      <img src={application.landCertificateUrl} className="w-full rounded-xl object-contain max-h-80 cursor-zoom-in" onClick={openZoomModal} />
    )}
  </div>

  {/* Action Buttons */}
  <div className="flex gap-3">
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleVerify(application.profileId)}
      className="flex-1 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition-all"
      style={{ boxShadow: "0 0 20px rgba(16,185,129,0.15)" }}
    >
      <CheckBadgeIcon className="w-5 h-5" />
      Verify & Approve
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setShowRejectDialog(true)}
      className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/20 transition-all"
    >
      Reject
    </motion.button>
  </div>
</div>
```

**On Verify Click**:
1. Call `POST /api/admin/verify-farmer` with `status: "APPROVED"`
2. Show neon green particle burst animation (Framer Motion keyframes)
3. "✓ Profile Verified" banner flashes in emerald
4. Application removed from the pending list

---

## 4. Dispute Resolution Dashboard

### 4.1 Component: `app/(admin)/disputes/page.tsx`
- **Table Columns**: Order ID, Consumer, Farmer, Reported Issue, AI Grade at Time of Sale, Consumer Rating Given, Flag Level
- **Flag Logic**: Automatically flagged if consumer rating ≤ 2 AND quality_grade in product was "A+" or "A"
- **Flag Level Badge**: `HIGH` (red), `MEDIUM` (amber), `LOW` (yellow)

```tsx
// Dispute Row
<tr className="border-b border-white/5 hover:bg-white/2 transition-all">
  <td className="py-3 px-4 text-slate-400 font-mono text-xs">{d.orderId.slice(0, 8)}...</td>
  <td className="py-3 px-4 text-white text-sm">{d.consumerName}</td>
  <td className="py-3 px-4 text-emerald-300 text-sm">{d.farmerName}</td>
  <td className="py-3 px-4">
    <span className="text-amber-400 text-xs italic">"{d.consumerComment}"</span>
  </td>
  <td className="py-3 px-4">
    <GradeBadge grade={d.aiGrade} />
  </td>
  <td className="py-3 px-4">
    <StarRating rating={d.consumerRating} />
  </td>
  <td className="py-3 px-4">
    <FlagBadge level={d.flagLevel} />
  </td>
  <td className="py-3 px-4">
    <DisputeActionMenu onRefund={...} onWarn={...} onReview={...} />
  </td>
</tr>
```

**Dispute Actions**:
- **Initiate Refund**: Updates `payment_status = "refunded"` on the order
- **Warn Seller**: Decrements farmer's `trust_score` by 0.5
- **Flag as Resolved**: Marks dispute as handled, no further action

---

## 5. User Management Table

### 5.1 Component: `app/(admin)/users/page.tsx`
- **Search**: Filter by name, phone, or role
- **Table Columns**: Avatar, Full Name, Phone, Role badge, Verified status, Trust Score, Joined Date, Actions
- **Actions**: View Profile, Toggle Suspension (sets `is_verified = false`), Send Notification

---

## 6. System Notification Dispatcher

### 6.1 Component: `app/(admin)/notify/page.tsx`
- **Form**: Target audience selector (All Farmers / All Consumers / Single User by phone), Notification Title, Message
- **Broadcast Button**: Inserts notification rows for all matching `user_id`s
- **Preview**: Shows a mock notification card in the AgriNex glassmorphic style before sending

---

## 7. API Endpoints for Admin Phase

```typescript
GET    /api/admin/stats            → Platform metrics summary
GET    /api/admin/kyc              → Pending farmer applications (paginated)
POST   /api/admin/verify-farmer    → Approve or reject KYC
GET    /api/admin/disputes         → List flagged low-rating orders
POST   /api/admin/disputes/:id/resolve  → Mark resolved + optional refund/warn
GET    /api/admin/users            → All users (with filters)
POST   /api/admin/notify           → Broadcast notification to user segment
```

---

## 8. Deliverables for Phase 6

| Task | Status |
|------|--------|
| Admin tab navigation layout | ⬜ |
| KPI metrics cards with real data | ⬜ |
| Supply vs Demand grouped bar chart | ⬜ |
| Platform growth line chart (3 series) | ⬜ |
| Environmental impact SVG circular gauge | ⬜ |
| KYC split-panel list + document preview | ⬜ |
| Verify approval with particle burst animation | ⬜ |
| Rejection dialog with justification notes | ⬜ |
| Dispute table with auto-flag logic | ⬜ |
| DisputeActionMenu (refund, warn, resolve) | ⬜ |
| User management table with suspension toggle | ⬜ |
| Notification dispatcher form + broadcast | ⬜ |
| All admin API endpoints (7 routes) | ⬜ |
