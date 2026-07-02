# AgriNex AI: Admin Console & Operations PRD

This document specifies the requirements, flows, schema mappings, and API specifications for the **Admin Console and Operations Dashboard** component of AgriNex AI.

---

## 1. Feature Description & Scope

The Admin Console is the administrative portal used by AgriNex operators to verify farmer credentials, monitor platform transactions, view high-level logistics logs, and manage disputes.

### Key Capabilities
- **Platform Analytics Dashboard**: Renders real-time grid of user sign-up trends, supply-demand ratios, food waste reduction metrics, and dispute counts.
- **Farmer KYC Verification Board**: Visual console displaying uploaded farmer land certificates and banking records. Allows administrators to verify profiles, initiating database updates and farmer notifications.
- **Dispute Resolution Panel**: Triggers alert flags when user ratings indicate that the delivered crop quality was significantly lower than the automated crop quality grade computed by the AI.
- **Real-Time Notification Dispatcher**: System-wide notifications management console.

---

## 2. User Journeys & Screen Specifications

### 2.1 Analytics & Performance Board
1. **Summary Cards Grid**: Displays glassmorphic metrics: "Active Farmers", "Consumer Signups", "Orders Completed", "Est. Food Waste Reduced (tons)".
2. **Environmental Impact Tracker**: Styled circular progress gauge displaying the volume of direct farmer-to-consumer transactions compared to standard wholesale logs (indicating reduced travel distance and packaging waste).

### 2.2 KYC Document Verification Queue
1. **Layout**: Split-pane glass console.
2. **Left Panel**: Scrollable list of pending farmer verification applications with simple indicators (e.g. "Ramesh Kumar - Satara - Pending Land Verification").
3. **Right Preview Panel**: Details of selected farmer:
   - Profile information & location coordinates.
   - Interactive zoomable image of the land document.
   - Action Buttons: "Verify Profile" (flashes a neon checkmark animation and updates dashboard status) and "Reject Profile" (opens a dialog to enter justification notes).

### 2.3 Automated Dispute Resolution Screen
1. **Dispute Row Logs**: Table listing flagged orders.
2. **AI Verification Flag**: System automatically flags disputes where a buyer rates a crop 1-2 stars and claims "bruised/decayed crops" but the crop listing was graded "A+" by the AI.
3. **Admin Actions**: Initiate escrow refund, trigger independent quality review, or apply warning flags to the seller's profile, decreasing their trust score.

---

## 3. Database Schema Mapping

The admin console interacts with several tables to oversee system health:

```sql
-- Profiles: Querying pending applications and updating validation flags
-- Query: SELECT * FROM public.profiles WHERE role = 'farmer' AND is_verified = FALSE;
-- Action: UPDATE public.profiles SET is_verified = TRUE WHERE id = $1;

-- Reviews: Dispute management
-- Query: SELECT * FROM public.reviews r JOIN public.orders o ON r.order_id = o.id WHERE r.rating <= 2;

-- Notifications: Alert farmer on approval/denial
-- Action: INSERT INTO public.notifications (user_id, title, message, type) VALUES ($1, $2, $3, 'verification');
```

---

## 4. API Endpoints Specification

### 4.1 Get Pending Farmer KYC Listings (`GET /api/admin/kyc`)
- **Query Params**: `page=number`, `limit=number`
- **Response**:
```json
[
  {
    "profileId": "farmer-uuid-456",
    "fullName": "Suresh Patil",
    "phoneNumber": "+919876543210",
    "locationAddress": "Kolhapur, Maharashtra",
    "landCertificateUrl": "https://supabase-url/storage/land-docs/doc-456.pdf",
    "submittedAt": "2026-06-28T05:00:00Z"
  }
]
```

### 4.2 Verify Farmer KYC (`POST /api/admin/verify-farmer`)
- **Payload**:
```json
{
  "profileId": "farmer-uuid-456",
  "status": "APPROVED", // "APPROVED" or "REJECTED"
  "rejectionReason": null
}
```
- **Response**:
```json
{
  "success": true,
  "profileId": "farmer-uuid-456",
  "isVerified": true,
  "notified": true
}
```
---
