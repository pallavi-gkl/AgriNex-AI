# Phase 5: Live Order Tracking & Logistics

**Phase Duration**: Week 9–10  
**Goal**: Implement the full order lifecycle management, live map-based tracking view (Leaflet), harvest-to-doorstep traceability audit timeline, and OTP-based delivery verification for both consumers and farmers.

**Depends On**: Phase 1 (DB Schema, Orders table), Phase 2 (Farmer order management), Phase 3 (Consumer order creation)

---

## Overview

This phase bridges the gap between order placement and delivery confirmation. The consumer watches a live map that simulates the delivery courier's real-time position. The farmer sees incoming order status transitions. The traceability timeline presents an immutable audit log from harvest to doorstep — a core transparency feature of AgriNex AI.

---

## 1. Order Lifecycle State Machine

### 1.1 Status Flow
```
[Consumer] POST /api/orders
    → status: "pending"
    
[Farmer] PATCH /api/orders/:id/status { status: "accepted" }
    → status: "accepted"
    
[AI Crop Grade verified] Triggered after grading
    → status: "quality_verified"
    
[Farmer/Dispatcher] PATCH /api/orders/:id/status { status: "dispatched" }
    → status: "dispatched" + simulated courier GPS begins
    
[Consumer OTP Verify] POST /api/orders/:id/verify-delivery { otp: "4821" }
    → status: "delivered"
```

### 1.2 Backend: Update Order Status (`PATCH /api/orders/:id/status`)
```typescript
router.patch("/orders/:id/status", authMiddleware, async (req, res) => {
  const { status, note, driverId } = req.body;
  const { id } = req.params;

  // Fetch current order
  const { data: order } = await supabase
    .from("orders").select("*").eq("id", id).single();

  // Append new event to tracking_history JSONB array
  const newEvent = {
    status,
    timestamp: new Date().toISOString(),
    note: note || `Status changed to ${status}`,
    ...(driverId && { driverId })
  };

  const updatedHistory = [...(order.tracking_history as any[]), newEvent];

  await supabase.from("orders").update({
    status,
    tracking_history: updatedHistory
  }).eq("id", id);

  // Send notification to relevant party
  const notifyUserId = status === "accepted" ? order.consumer_id : order.farmer_id;
  await supabase.from("notifications").insert({
    user_id: notifyUserId,
    title: `Order #${id.slice(0, 8)} Update`,
    message: newEvent.note,
    type: "order_update"
  });

  res.json({ orderId: id, currentStatus: status, updatedAt: newEvent.timestamp, trackingHistory: updatedHistory });
});
```

---

## 2. Live Map Tracking View

### 2.1 Component: `app/(consumer)/orders/[id]/track/page.tsx`

**Libraries**: `react-leaflet`, `leaflet` (already installed in Phase 1)

```tsx
"use client";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";

// Custom Icons
const farmerIcon = L.divIcon({ className: "", html: '<div class="text-2xl">🌾</div>', iconSize: [30, 30] });
const consumerIcon = L.divIcon({ className: "", html: '<div class="text-2xl">🏠</div>', iconSize: [30, 30] });
const courierIcon = L.divIcon({ className: "", html: '<div class="text-2xl animate-bounce">🚚</div>', iconSize: [30, 30] });

export default function TrackOrderPage({ params }: { params: { id: string } }) {
  const { routeData } = useOrderRoute(params.id); // TanStack Query hook, refetches every 5s
  const [courierPos, setCourierPos] = useState(routeData?.farmerCoords);

  // Simulate courier movement along route
  useEffect(() => {
    if (!routeData) return;
    const interval = setInterval(() => {
      setCourierPos((prev) => interpolatePosition(prev, routeData.consumerCoords, 0.02));
    }, 3000);
    return () => clearInterval(interval);
  }, [routeData]);

  if (!routeData) return <TrackingSkeletonLoader />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold gradient-text-blue">Live Order Tracking</h1>

      {/* Map Container */}
      <div className="glass-panel rounded-2xl overflow-hidden h-96">
        <MapContainer
          center={[routeData.farmerCoords.lat, routeData.farmerCoords.lng]}
          zoom={13}
          className="w-full h-full"
          style={{ background: "transparent" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="© OpenStreetMap, © CARTO"
          />
          <Marker position={[routeData.farmerCoords.lat, routeData.farmerCoords.lng]} icon={farmerIcon}>
            <Popup>📍 Farm Origin</Popup>
          </Marker>
          <Marker position={[routeData.consumerCoords.lat, routeData.consumerCoords.lng]} icon={consumerIcon}>
            <Popup>🏠 Delivery Address</Popup>
          </Marker>
          {courierPos && (
            <Marker position={[courierPos.lat, courierPos.lng]} icon={courierIcon}>
              <Popup>🚚 Courier in Transit</Popup>
            </Marker>
          )}
          <Polyline
            positions={[
              [routeData.farmerCoords.lat, routeData.farmerCoords.lng],
              [routeData.consumerCoords.lat, routeData.consumerCoords.lng],
            ]}
            color="#10b981"
            weight={3}
            dashArray="8 4"
          />
        </MapContainer>
      </div>

      {/* Logistics Summary Card */}
      <div className="glass-panel rounded-2xl p-5 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-slate-400 text-xs">Distance Remaining</p>
          <p className="text-sky-400 font-bold text-xl">{routeData.distanceRemainingKm} km</p>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-xs">ETA</p>
          <p className="text-emerald-400 font-bold text-xl">{routeData.estimatedTimeRemainingMin} min</p>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-xs">Status</p>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Traceability Timeline */}
      <TraceabilityTimeline trackingHistory={order.tracking_history} />
    </div>
  );
}
```

### 2.2 Map Tile Layer
- Use **CartoDB Dark Matter** tiles (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`) for a dark map that matches the AgriNex AI theme.

---

## 3. Harvest-to-Doorstep Traceability Timeline

### 3.1 Component: `components/tracking/TraceabilityTimeline.tsx`
```tsx
const CHECKPOINTS = [
  { key: "pending",          icon: "🌾", label: "Harvested",       color: "emerald" },
  { key: "quality_verified", icon: "🔬", label: "Quality Graded",  color: "purple"  },
  { key: "dispatched",       icon: "🚚", label: "In Transit",      color: "sky"     },
  { key: "delivered",        icon: "✅", label: "Delivered",        color: "green"   },
];

export const TraceabilityTimeline = ({ trackingHistory }: { trackingHistory: TrackingEvent[] }) => {
  const completedStatuses = trackingHistory.map((e) => e.status);

  return (
    <div className="glass-panel rounded-2xl p-6">
      <h3 className="font-semibold text-white mb-5">Traceability Audit</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-white/10" />

        {CHECKPOINTS.map((cp, i) => {
          const event = trackingHistory.find((e) => e.status === cp.key);
          const isComplete = completedStatuses.includes(cp.key);
          return (
            <motion.div key={cp.key} variants={listItemVariants} className="flex items-start gap-4 mb-6 last:mb-0 relative">
              {/* Icon circle */}
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all ${isComplete ? `bg-${cp.color}-500/20 border border-${cp.color}-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]` : "bg-white/5 border border-white/10"}`}>
                {cp.icon}
              </div>

              {/* Content */}
              <div className="pt-1">
                <p className={`font-semibold text-sm ${isComplete ? "text-white" : "text-slate-600"}`}>{cp.label}</p>
                {event ? (
                  <>
                    <p className="text-slate-400 text-xs">{event.note}</p>
                    <p className="text-slate-600 text-xs font-mono mt-0.5">
                      {new Date(event.timestamp).toLocaleString("en-IN")}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-600 text-xs">Pending...</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
```

---

## 4. Delivery OTP Verification

### 4.1 OTP Generation (Backend)
- When order status is changed to `dispatched`, generate a 4-digit OTP and store it in the order row.
- Send OTP to consumer via the notifications table (in production: via SMS).

```typescript
// In PATCH /api/orders/:id/status when status === "dispatched"
const otp = Math.floor(1000 + Math.random() * 9000).toString();
await supabase.from("orders").update({ payment_id: `OTP:${otp}` }).eq("id", id);
await supabase.from("notifications").insert({
  user_id: order.consumer_id,
  title: "Delivery OTP",
  message: `Your delivery OTP is ${otp}. Share with courier on arrival.`,
  type: "order_update"
});
```

### 4.2 OTP Verification Endpoint (`POST /api/orders/:id/verify-delivery`)
```typescript
router.post("/orders/:id/verify-delivery", authMiddleware, async (req, res) => {
  const { otp } = req.body;
  const { data: order } = await supabase.from("orders").select("*").eq("id", req.params.id).single();

  const storedOTP = (order.payment_id as string)?.replace("OTP:", "");
  if (storedOTP !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  // Update to delivered
  await supabase.from("orders").update({
    status: "delivered",
    tracking_history: [...order.tracking_history, {
      status: "delivered", timestamp: new Date().toISOString(), note: "OTP verified. Delivered successfully."
    }]
  }).eq("id", req.params.id);

  res.json({ success: true, message: "Delivery confirmed!" });
});
```

---

## 5. Notifications Center

### 5.1 Component: `components/layout/NotificationsPanel.tsx`
- **Access**: Bell icon in the sidebar header
- **Display**: Slide-out panel from right, listing all `notifications` for the logged-in user
- **Unread Badge**: Red count indicator on the bell icon
- **Mark-all-read**: Single button marks all notifications as `is_read = true`
- **Types with icons**:
  - `order_update` → Package icon (sky blue)
  - `price_alert` → Chart icon (emerald)
  - `verification` → Shield icon (purple)

---

## 6. Deliverables for Phase 5

| Task | Status |
|------|--------|
| `PATCH /api/orders/:id/status` endpoint | ⬜ |
| `GET /api/orders/:id/route` simulated GPS endpoint | ⬜ |
| `POST /api/orders/:id/verify-delivery` OTP endpoint | ⬜ |
| Leaflet map integration with dark tile layer | ⬜ |
| Simulated courier GPS movement on map | ⬜ |
| Logistics summary card (ETA, distance, status) | ⬜ |
| TraceabilityTimeline component (4 checkpoints) | ⬜ |
| OTP generation on dispatch and notifications insert | ⬜ |
| Consumer OTP entry UI (4-digit input with glass-input) | ⬜ |
| NotificationsPanel slide-out with unread badge | ⬜ |
| TanStack Query auto-refetch route every 5s | ⬜ |
