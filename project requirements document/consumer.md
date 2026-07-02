# AgriNex AI: Consumer Marketplace & Customer Dashboard PRD

This document specifies the requirements, flows, schema mappings, and API specifications for the **Consumer (Customer) Marketplace and Dashboard** component of AgriNex AI.

---

## 1. Feature Description & Scope

The Consumer Marketplace is the direct-to-consumer storefront where buyers discover, evaluate, purchase, and track agricultural produce sourced directly from verified farms.

### Key Capabilities
- **Multi-Role Authentication**: Secure consumer account registration, profile setup, shipping address, and language preferences.
- **Smart Search & Filters**: Fuzzy text search, speech search, category filter capsules, and geolocation-based farmer discovery.
- **Detailed Product View**: Rich product details showcasing product grades, visual blemishes, estimated shelf life, farmer verification status, carbon offset calculation, and traceability route.
- **Cart & Checkout**: Interactive item aggregation, automated freight calculation, and simulated 3D flipping card mock payment portal.
- **Interactive Reviews**: Post-purchase ratings and comments which feed directly into the farmer's trust score.

---

## 2. User Journeys & Screen Specifications

### 2.1 Customer Onboarding & Profile Setup
1. **Flow**: A consumer signs up using Supabase Auth -> redirected to profile onboarding.
2. **Details**: User enters their Full Name, Phone Number, Language Preference, and uses a geolocation-based picker (address lookup with latitude/longitude coordinates).
3. **UI Theme**: Frosted glass sign-in container with glowing accent border highlights.

### 2.2 Product Discovery (Main Marketplace Hub)
1. **Hero Search Section**: Features a massive glowing search bar with a microphone button allowing voice search.
2. **Category Carousel**: Rounded glass pill-shaped filters ("Vegetables", "Fruits", "Grains", "Pulses") that inflate and spring on hover.
3. **Product Cards Grid**: Grid of glassmorphic cards containing crop image, title, unit price, quantity available, farmer name, verification check badge, and crop grade tag (e.g., "Grade A").
4. **Interaction**: Hovering a card triggers a glowing border, translates the card upward by `4px`, and reveals a "View Details" button.

### 2.3 Product Detail & Traceability Modal
1. **Trigger**: Clicking a product card opens a center glass modal overlay.
2. **Traceability Path**: Renders an SVG path mapping direct shipping routes from farmer coordinates to customer shipping coordinates, with carbon offset estimates.
3. **Visual Quality Breakdown**: Shows a zoomable image of the crop with point indicators highlight blemishes detected during the farmer's AI crop quality grading.

### 2.4 Checkout & 3D Payment Portal
1. **Checkout Panel**: Glass slide-out drawer summary listing item totals, direct farmer pricing comparison (showing middleman markup savings), and delivery details.
2. **3D Payment Card Mock**: A credit card container that flips dynamically 180 degrees when the CVV input field is focused.

---

## 3. Database Schema Mapping

The customer dashboard queries and mutates the following Supabase PostgreSQL tables:

```sql
-- Profiles: Consumer Role Profile Information
-- Query: SELECT * FROM public.profiles WHERE id = auth.uid() AND role = 'consumer';
-- Updates: UPDATE public.profiles SET address = $1, location_lat = $2, location_lng = $3 WHERE id = auth.uid();

-- Orders: Purchases placed by consumers
-- Columns utilized: id, consumer_id, total_amount, status, payment_status, payment_id, delivery_address, delivery_lat, delivery_lng, tracking_history
```

---

## 4. API Endpoints Specification

### 4.1 Get Marketplace Products (`GET /api/products`)
- **Query Params**: `search=string`, `category=string`, `lat=number`, `lng=number`, `maxDistance=number`
- **Response**:
```json
[
  {
    "id": "prod-uuid-1",
    "title": "Fresh Red Potatoes",
    "category": "Vegetables",
    "pricePerUnit": 24.50,
    "unitType": "kg",
    "quantityAvailable": 120.00,
    "qualityGrade": "A+",
    "imageUrl": "https://supabase-url/storage/potatoes.jpg",
    "farmer": {
      "fullName": "Ramesh Kumar",
      "isVerified": true,
      "locationLat": 18.5204,
      "locationLng": 73.8567
    }
  }
]
```

### 4.2 Create New Order (`POST /api/orders`)
- **Payload**:
```json
{
  "farmerId": "farmer-uuid-123",
  "totalAmount": 1225.00,
  "deliveryAddress": "Apt 4B, Skyview Apts, Pune",
  "deliveryLat": 18.5560,
  "deliveryLng": 73.8820,
  "items": [
    {
      "productId": "prod-uuid-1",
      "quantity": 50.00,
      "priceAtPurchase": 24.50
    }
  ]
}
```
- **Response**: Returns created Order details containing tracking history and initial status set to `pending`.
