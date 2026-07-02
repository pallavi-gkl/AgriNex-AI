# AgriNex AI: Logistics, Delivery & Live Tracking PRD

This document specifies the requirements, flows, schema mappings, and API specifications for the **Delivery Management, Logistics Coordination, and Live Map Tracking** component of AgriNex AI.

---

## 1. Feature Description & Scope

The Logistics module coordinates transit operations between farmers (origin) and consumers (destination). It allows delivery dispatchers to assign consignments, tracks drivers, and provides customers with real-time transit status.

### Key Capabilities
- **Logistics Order Lifecycle**: Structured state transitions for orders:
  `pending` -> `accepted` -> `quality_verified` -> `dispatched` -> `delivered`.
- **Live Transit Tracking Map**: High-fidelity map routing interface that renders origin, destination, and current courier location.
- **Traceability Timeline**: Displays harvest-to-doorstep timeline data, certifying quality checks and transport timestamps.
- **Delivery Verification**: Secure hand-off authentication (e.g. OTP validation or physical signature capture).

---

## 2. User Journeys & Screen Specifications

### 2.1 Order Lifecycle Management
1. **Order Acceptance**: Customer places order (status `pending`). Farmer reviews stock, accepts order (status `accepted`).
2. **AI Quality Verification**: Crop undergoes image scanning. Upon successful AI grading, status updates to `quality_verified`.
3. **Dispatch**: Delivery courier picks up load. Courier clicks "Dispatch Cargo" (status updates to `dispatched`).
4. **Delivery**: Courier reaches buyer. Validates delivery via numeric code or OTP (status updates to `delivered`).

### 2.2 Live Tracking View (Customer Dashboard)
1. **Interactive Route Map**:
   - Renders path using Leaflet or Mapbox.
   - Shows farmer pin (Green Icon), customer pin (Blue Icon), and moving delivery courier icon (Amber Cargo Icon).
2. **Simulated GPS Location updates**: System simulates location movements between coordinates along the route every few seconds.
3. **Logistics Summary Card**: Displays estimated arrival time, distance remaining, driver details, and contact button.

### 2.3 Product Traceability Timeline
1. **Visual Timeline**: Dynamic vertical progress line.
2. **Audit Checkpoints**:
   - **Point 1 (Harvested)**: Date and time stamp logged by the farmer.
   - **Point 2 (Graded)**: Grade report (e.g., Grade A Potatoes) issued by the Gemini AI Vision Analyzer.
   - **Point 3 (In Transit)**: Dispatch timestamp and route activation records.
   - **Point 4 (Arrived)**: Delivery verification check.

---

## 3. Database Schema Mapping

This component reads and writes directly to the orders tracking history field:

```sql
-- Orders: Modifying status, payment status, and tracking coordinates
-- Column: tracking_history JSONB (Default structure below)
/*
[
  { "status": "pending", "timestamp": "2026-06-28T05:00:00Z", "note": "Order placed" },
  { "status": "accepted", "timestamp": "2026-06-28T05:10:00Z", "note": "Farmer Ramesh accepted order" },
  { "status": "quality_verified", "timestamp": "2026-06-28T05:12:00Z", "note": "AI Graded: Grade A Potatoes" },
  { "status": "dispatched", "timestamp": "2026-06-28T05:30:00Z", "note": "In Transit via Rider Anil" },
  { "status": "delivered", "timestamp": "2026-06-28T06:05:00Z", "note": "Delivered successfully" }
]
*/
```

---

## 4. API Endpoints Specification

### 4.1 Update Order Status (`PATCH /api/orders/:id/status`)
- **Payload**:
```json
{
  "status": "dispatched",
  "note": "Rider has collected the produce. Out for delivery.",
  "driverId": "driver-uuid-889"
}
```
- **Response**:
```json
{
  "orderId": "order-uuid-1234",
  "currentStatus": "dispatched",
  "updatedAt": "2026-06-28T05:30:00Z",
  "trackingHistory": [
    { "status": "pending", "timestamp": "..." },
    { "status": "accepted", "timestamp": "..." },
    { "status": "quality_verified", "timestamp": "..." },
    { "status": "dispatched", "timestamp": "2026-06-28T05:30:00Z" }
  ]
}
```

### 4.2 Get Live Routing Details (`GET /api/orders/:id/route`)
- **Response**:
```json
{
  "orderId": "order-uuid-1234",
  "farmerCoords": { "lat": 18.5204, "lng": 73.8567 },
  "consumerCoords": { "lat": 18.5560, "lng": 73.8820 },
  "currentCourierCoords": { "lat": 18.5380, "lng": 73.8690 },
  "estimatedTimeRemainingMin": 15,
  "distanceRemainingKm": 3.4
}
```
---
