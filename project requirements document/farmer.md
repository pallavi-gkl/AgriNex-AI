# AgriNex AI: Farmer Dashboard & Inventory Management PRD

This document specifies the requirements, flows, schema mappings, and API specifications for the **Farmer Dashboard and Seller Inventory Management** component of AgriNex AI.

---

## 1. Feature Description & Scope

The Farmer Dashboard serves as the command center for farmers (both digitally literate and non-digitally literate) to manage listings, analyze earnings, evaluate crop quality using AI, view market prices, and process customer orders.

### Key Capabilities
- **KYC & Account Onboarding**: Setup profile, coordinates, crop specialization, bank details, and submit land verification records for approval.
- **Sales Analytics Dashboard**: Glow-styled area chart comparing individual earnings against the local market average.
- **AI-Powered Product Listing Form**: Structured form to add crops, select categories, update quantities, set prices, and view AI recommendations. Supports voice input to auto-populate fields.
- **AI Crop Grading & Scanning Interface**: Simulated camera or file uploader with a sweeping neon scan animation which grades uploaded crop pictures, evaluates blemishes, and suggests price corridors.
- **Order Management & Fulfillment**: Real-time interface listing incoming buyer requests, order history, and options to accept, dispatch, or view customer coordinates.

---

## 2. User Journeys & Screen Specifications

### 2.1 Onboarding & KYC Submission
1. **Flow**: A farmer registers -> redirected to verification onboarding.
2. **Action**: Uploads a photo of land certificate/permit and enters banking details.
3. **Status**: Profile shows "Pending Verification" with a disabled yellow warning badge. Complete listing functions are unlocked only after administrator review.

### 2.2 Sales & Analytics View
1. **Header Widgets**: Display cards with metrics: "Total Earnings (₹)", "Bags Sold", "Active Listings", "Trust Score (1-5)".
2. **Earnings Area Chart**:
   - Uses Recharts to plot monthly sales.
   - Shows two lines: `Personal Earnings` (neon green gradient fill) and `Local Market Average` (sky-blue dashed line).
   - Interactive pop-up showing sales details when hover over data nodes.

### 2.3 Interactive Crop Lister & AI Grader
1. **Camera Container**: Glass frame with dotted border.
2. **Camera Uploader Trigger**: Farmer uploads or captures a crop photo (e.g. Potatoes).
3. **Scan State**: Sweep line animation sweeps down and up over the image. A status message says "AI Grading Crop Quality...".
4. **Graded State Reveal**: The scan line disappears, and a grading card appears:
   - Green circle showing Grade ("A+", "A", "B", "C").
   - Shelf life projection: "Shelf Life: ~12 Days".
   - Price recommendations toggle tag showing "Recommended Base Price: ₹24/kg". Clicking the tag auto-fills the price input field.
5. **Form Submission**: Form can also be filled via speech input. User taps the mic icon, dictates "Potato fifty kg price twenty rupees", and the fields title, stock, and price are parsed and filled automatically.

---

## 3. Database Schema Mapping

The farmer dashboard mutates and updates the following Supabase PostgreSQL tables:

```sql
-- Profiles: Farmer KYC data and Verification Status updates
-- Columns utilized: is_verified, trust_score, location_lat, location_lng

-- Products: Farmer listings
-- Columns utilized: id, farmer_id, title, description, category, price_per_unit, unit_type, quantity_available, image_url, quality_grade, quality_report, recommended_price, traceability_code
```

---

## 4. API Endpoints Specification

### 4.1 Create Product Listing (`POST /api/products`)
- **Payload**:
```json
{
  "title": "Organically Grown Potatoes",
  "description": "Premium quality red potatoes direct from Satara farms.",
  "category": "Vegetables",
  "pricePerUnit": 24.00,
  "unitType": "kg",
  "quantityAvailable": 150.00,
  "imageUrl": "https://supabase-url/storage/crop-potatoes.jpg",
  "qualityGrade": "A",
  "qualityReport": {
    "freshness": "Excellent",
    "blemishes": ["Slight dirt patches"],
    "waterContentPercentage": 79.5,
    "estimatedShelfLifeDays": 12
  },
  "recommendedPrice": 24.50,
  "traceabilityCode": "ANX-SAT-POT-99"
}
```
- **Response**: Returns the created product object with a unique uuid.

### 4.2 Get Farmer Sales Data (`GET /api/farmer/analytics`)
- **Query Params**: `timeframe=monthly|weekly`
- **Response**:
```json
{
  "summary": {
    "totalEarnings": 34250.00,
    "bagsSold": 82,
    "trustScore": 4.8
  },
  "chartData": [
    { "month": "Jan", "personalEarnings": 12000, "marketAverage": 10500 },
    { "month": "Feb", "personalEarnings": 15000, "marketAverage": 13200 },
    { "month": "Mar", "personalEarnings": 7250, "marketAverage": 9000 }
  ]
}
```
---
