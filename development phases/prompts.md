# 🤖 AgriNex AI — Agent Development Prompts

> **How to Use This File**
> Copy the prompt for the current phase and paste it directly to your development agent.
> Do NOT skip phases — each one builds on the previous.
> After each phase is completed, the agent MUST fill in the **Phase Completion Report** section at the bottom of that phase's prompt.

---

## ⚠️ GLOBAL RULES — Apply to ALL Phases

Paste these rules once at the start of your first conversation with the agent, before any phase prompt:

```
GLOBAL DEVELOPMENT RULES FOR AGRINEX AI:

1. TECH STACK: You must strictly use Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts, Supabase, Express.js, and Google Gemini API. Do not substitute any library.

2. DESIGN SYSTEM: Every UI component must follow the glassmorphic design system defined in the design_ui.md file. Use glass-panel, glass-input, gradient-text-*, and animation classes exactly as specified.

3. FILE REFERENCES: Read these files before starting any phase:
   - c:\ass2\development phases\README.md (master overview)
   - c:\ass2\design_ui.md (UI/UX design spec)
   - c:\ass2\prd_demo.md (product requirements)
   - c:\ass2\project requirements document\ (individual PRD files)
   - c:\ass2\development phases\phase_[N]_*.md (current phase spec)

4. PHASE LINKING: Never build a component without confirming its dependency phase is complete. If a dependency is missing, STOP and tell me what is missing before proceeding.

5. COMPLETION REPORT: After finishing each phase, you MUST provide a structured Phase Completion Report (template provided at the bottom of each phase prompt). Do not end your response without it.

6. MISSING INFORMATION RULE: If at any point you need information that is not in the phase file or PRD (e.g., Supabase URL, Gemini API key, specific image, color value, copy text), STOP coding and list every missing item clearly before proceeding. Do not assume or invent values for real credentials or environment variables.

7. FILE UPDATE ALERTS: If any file (schema, config, CSS) needs to be updated compared to what was built in a previous phase, highlight it clearly as: ⚠️ UPDATE REQUIRED: [filename] — [what to change].

8. NO PLACEHOLDERS: Do not use placeholder images, lorem ipsum text, or TODO comments in submitted code. All components must be functional and styled.

9. MOBILE FIRST: Every page and component must be fully responsive. Minimum breakpoint: 375px (mobile). Test all layouts at mobile, tablet (768px), and desktop (1280px).

10. TYPESCRIPT STRICT: All code must be fully typed. No `any` types unless explicitly required by a library (e.g., Recharts tooltip). Add JSDoc comments on all exported functions.
```

---

## 📦 PHASE 1 PROMPT — Project Foundation & Design System

> **Read before pasting**: This is the very first phase. There are no prior phases to depend on.

```
You are a senior full-stack developer building AgriNex AI — an AI-powered agriculture marketplace for Indian farmers and consumers.

CONTEXT FILES TO READ FIRST:
- c:\ass2\development phases\phase_1_foundation.md  ← Main spec for this phase
- c:\ass2\design_ui.md                              ← Full glassmorphic design tokens
- c:\ass2\prd_demo.md                               ← Product requirements
- c:\ass2\development phases\README.md              ← Master project overview

PHASE 1 TASK — Project Foundation & Design System:

You are building the base layer of the entire application. Everything built in Phases 2–7 will sit on top of what you create here.

YOUR TASKS:
1. Scaffold the monorepo structure (Next.js 15 frontend + Express.js backend) exactly as shown in phase_1_foundation.md section 1.
2. Install all required packages listed in sections 1.2 and 1.3.
3. Implement the complete globals.css (section 2.1) with all glassmorphic utility classes, gradient text classes, and all CSS keyframe animations.
4. Implement tailwind.config.ts (section 2.2) with custom colors, fonts, and animation tokens.
5. Create lib/animations.ts (section 2.3) with all Framer Motion presets (pageTransitionVariants, staggerContainerVariants, listItemVariants, hoverScaleVariants, modalOverlayVariants, modalContentVariants).
6. Execute the full Supabase schema SQL (section 3) — create all 6 tables: profiles, products, orders, order_items, reviews, notifications. Enable all RLS policies.
7. Set up Supabase client (lib/supabase.ts).
8. Build the Sign Up page with role selector toggle (Farmer / Consumer).
9. Build the Sign In page.
10. Build the Farmer Onboarding page (KYC document upload + bank details).
11. Build the Consumer Onboarding page (address + geolocation picker).
12. Build the root app/layout.tsx with frosted sidebar (260px) and floating Voice AI button shell (purple mic, bottom-right, no functionality yet).

PHASE LINKS:
- This phase has NO upstream dependencies.
- Phases 2, 3, 4, 5, 6 ALL depend on this phase being fully complete.
- The globals.css you create here is the ONLY stylesheet. Do not create any other global CSS files.
- The Supabase schema you run here defines the exact table structure all API endpoints in Phases 2–6 will use. Double-check column names match the schema exactly.

DESIGN RULES:
- Background must be #050814 with 3 radial gradients (green top-left, blue bottom-right, purple center).
- All form inputs must use .glass-input class.
- All cards and panels must use .glass-panel class.
- Sign Up / Sign In forms must be centered glass containers with glowing border on the active role (Farmer = emerald glow, Consumer = sky blue glow).
- The sidebar must have backdrop-filter: blur(16px) and a 1px white/8% border on its right edge.

⚠️ MISSING INFORMATION — Before you begin, confirm you have:
[ ] Supabase Project URL
[ ] Supabase Anon Key
[ ] Supabase Service Role Key (for backend)
If any of these are missing, STOP and ask me before writing any Supabase code.

---
PHASE 1 COMPLETION REPORT (Fill this in when done):

**Status**: [ ] Complete / [ ] Partially Complete / [ ] Blocked

**Completed Tasks**:
- List every task you completed

**Files Created/Modified**:
- List every file with its path

**⚠️ UPDATE REQUIRED Alerts**:
- List any files that need future updates as other phases build on them

**❓ Missing Information Requests**:
- List anything you needed but did not have (credentials, values, assets, copy text)

**🔗 Ready for Next Phase**:
- Confirm: "Phase 2 (Farmer Dashboard) can now begin" OR list what is blocking it
```

---

## 🌾 PHASE 2 PROMPT — Farmer Dashboard & Product Management

> **Read before pasting**: Phase 1 must be 100% complete. Supabase schema, auth flows, globals.css, and sidebar layout must already exist.

```
You are continuing development of AgriNex AI. Phase 1 (Foundation) is complete.

CONTEXT FILES TO READ FIRST:
- c:\ass2\development phases\phase_2_farmer_dashboard.md  ← Main spec for this phase
- c:\ass2\development phases\phase_1_foundation.md        ← Review what was built
- c:\ass2\project requirements document\farmer.md         ← Farmer PRD
- c:\ass2\design_ui.md                                    ← Design tokens

PHASE 2 TASK — Farmer Dashboard & Product Management:

UPSTREAM DEPENDENCIES FROM PHASE 1:
- ✅ Supabase schema: profiles, products, orders tables must exist
- ✅ globals.css: glass-panel, glass-input, gradient-text-*, anim-scan-line classes must exist
- ✅ lib/animations.ts: staggerContainerVariants, listItemVariants, hoverScaleVariants must exist
- ✅ Supabase Auth: Farmer role authentication must be working
- ✅ Root layout: Sidebar must be rendered for authenticated farmers

If any of the above is missing from Phase 1, STOP and tell me before building anything.

YOUR TASKS:
1. Create app/(farmer)/dashboard/page.tsx with the 4-column grid layout (StatsCards + EarningsChart + AICropGrader + ProductForm + OrdersTable).
2. Build the StatsCard component — 4 cards: Total Earnings, Bags Sold, Active Listings, Trust Score. Each with Lucide icon, gradient value text, and glass-panel-hover effect.
3. Build EarningsAreaChart (components/charts/EarningsAreaChart.tsx) using Recharts AreaChart — dual lines: personal earnings (neon green gradient fill) vs market average (sky-blue dashed). Include CustomTooltip styled as glass-panel.
4. Build AICropGraderWidget (components/farmer/AICropGraderWidget.tsx) with 3 states: idle (dotted upload zone), scanning (image + anim-scan-line sweeping), graded (result card with grade badge, shelf life, blemish list, "Apply AI Price" button).
5. Build ProductListingForm (components/farmer/ProductListingForm.tsx) — fields: Title, Category (dropdown), Description, Price/Unit, Unit Type, Quantity. Each field has a purple mic icon. Price field has "AI Price" button. On submit: POST /api/products.
6. Build IncomingOrdersTable (components/farmer/IncomingOrdersTable.tsx) — columns: Order ID, Consumer, Crop, Qty, Total, Status badge (color-coded), Action buttons (Accept / Dispatch).
7. Build Express.js endpoints:
   - GET /api/farmer/analytics?timeframe=monthly|weekly
   - POST /api/products (create listing with quality_report JSONB)
   - GET /api/farmer/orders (incoming orders for this farmer)
   - PATCH /api/orders/:id/status (accept or dispatch)
8. Create TanStack Query hooks for all endpoints.

PHASE LINKS:
- Uses globals.css glass-panel, anim-scan-line classes from Phase 1.
- Products created here appear in the Phase 3 consumer marketplace.
- The PATCH /api/orders/:id/status endpoint built here is also used in Phase 5 (logistics).
- The AICropGraderWidget calls POST /api/ai/grade-crop — this AI endpoint is fully implemented in Phase 4. For now, build the widget UI with a MOCK response that returns a hardcoded Grade A result. Phase 4 will replace the mock with the real Gemini call.

DESIGN RULES:
- Dashboard background: inherit from body (dark with radial glow).
- All chart grid lines: stroke "rgba(255,255,255,0.04)".
- Scan-line animation must use .anim-scan-line class from globals.css (do not re-create it inline).
- Grade badge (result state): 80×80px circle, 4px emerald border, box-shadow: 0 0 30px rgba(16,185,129,0.4).
- Orders table rows: border-b border-white/5, hover: bg-white/2.

⚠️ MISSING INFORMATION — Before you begin, confirm:
[ ] Phase 1 is complete and I have confirmed it.
[ ] Backend Express server is running and CORS is configured.
If anything is missing, STOP and ask.

---
PHASE 2 COMPLETION REPORT (Fill this in when done):

**Status**: [ ] Complete / [ ] Partially Complete / [ ] Blocked

**Completed Tasks**:
- List every task

**Files Created/Modified**:
- List every file with its path

**⚠️ UPDATE REQUIRED Alerts**:
- e.g., "Phase 4 must replace the mock gradeCrop() call in AICropGraderWidget.tsx with the real API"

**❓ Missing Information Requests**:
- e.g., "Need real Gemini API key to test AI grading in Phase 4"

**🔗 Ready for Next Phase**:
- Confirm: "Phase 3 (Consumer Marketplace) can now begin" OR list blockers
```

---

## 🛒 PHASE 3 PROMPT — Consumer Marketplace & Checkout

> **Read before pasting**: Phase 1 and Phase 2 must be complete. At least one product listing must exist in the Supabase `products` table.

```
You are continuing development of AgriNex AI. Phases 1 and 2 are complete.

CONTEXT FILES TO READ FIRST:
- c:\ass2\development phases\phase_3_consumer_marketplace.md  ← Main spec
- c:\ass2\project requirements document\consumer.md           ← Consumer PRD
- c:\ass2\design_ui.md                                        ← Design tokens
- c:\ass2\development phases\phase_1_foundation.md            ← Review Phase 1 outputs

PHASE 3 TASK — Consumer Marketplace & Checkout:

UPSTREAM DEPENDENCIES FROM PHASES 1 & 2:
- ✅ Products table exists and has data (from Phase 2 farmer listings)
- ✅ Orders and order_items tables exist (from Phase 1 schema)
- ✅ Reviews table exists (from Phase 1 schema)
- ✅ Consumer auth + onboarding flow exists (from Phase 1)
- ✅ glass-panel, glass-input, gradient-text classes, hoverScaleVariants, modalOverlayVariants, modalContentVariants exist (from Phase 1)

If any dependency is missing, STOP and tell me.

YOUR TASKS:
1. Create app/(consumer)/marketplace/page.tsx with full layout: search hero → category carousel → product grid.
2. Build MarketplaceSearchHero (components/consumer/MarketplaceSearchHero.tsx) — large glass search bar with live suggestions dropdown (debounced 300ms) + mic button (voice search stub — real AI in Phase 4).
3. Build CategoryFilterCarousel (components/consumer/CategoryFilterCarousel.tsx) — horizontally scrollable glass pill capsules. Active = emerald glow. Hover = Framer Motion spring scale.
4. Build ProductGrid (components/consumer/ProductGrid.tsx) — responsive grid (1/2/3/4 columns). Each ProductCard: crop image with hover scale, grade badge (top-right), farmer name + verified checkmark, price, quantity, reveal "View Details" button on hover.
5. Build ProductDetailModal (components/consumer/ProductDetailModal.tsx) — full-screen glass overlay. Left: crop image + grade badge + blemish list. Right: TraceabilityTimeline (4 checkpoints) + AddToCartForm.
6. Build TraceabilityTimeline (components/tracking/TraceabilityTimeline.tsx) — vertical line + 4 icon circles (Harvested/Graded/In Transit/Delivered), color-coded by completion.
7. Build CartDrawer (components/consumer/CartDrawer.tsx) — slide-in from right (Framer Motion x: "100%" → 0). Shows item list, subtotal, savings vs retail (emerald highlight), delivery estimate, "Proceed to Pay" button.
8. Build 3D Payment Modal (components/consumer/PaymentModal.tsx) — virtual card container with CSS preserve-3d. Card flips 180° rotateY on CVV input focus. Shows front (card number, name, expiry) and back (CVV). Form inputs below card. On success: POST /api/orders → success overlay.
9. Build ReviewModal (components/consumer/ReviewModal.tsx) — 1–5 star rating with glow on hover + text comment field. POST /api/reviews on submit.
10. Build Express.js endpoints:
    - GET /api/products (with search, category, lat, lng, maxDistance query params)
    - POST /api/orders (creates order + order_items rows)
    - POST /api/reviews (creates review, updates farmer trust_score)

PHASE LINKS:
- The TraceabilityTimeline component built here is REUSED in Phase 5 (live tracking page) — build it as a shared component in components/tracking/.
- The CartDrawer "Proceed to Pay" triggers the PaymentModal — on success it calls POST /api/orders. This order record is then tracked in Phase 5.
- Voice search mic in MarketplaceSearchHero is a stub — Phase 4 connects it to the real voice assistant.
- The reviews submitted here update farmer's trust_score in profiles — the admin sees this in Phase 6 dispute resolution.

DESIGN RULES:
- Marketplace page hero: radial-gradient(ellipse at center, rgba(16,185,129,0.07) 0%, transparent 70%) background.
- Category pill active state: bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)].
- Product card image hover: scale-105 with transition-transform duration-500.
- Payment card front gradient: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%).
- Payment card back gradient: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%).
- "Flipped" class triggers rotateY(180deg) with transition: transform 0.8s.

⚠️ MISSING INFORMATION — Before you begin, confirm:
[ ] At least 3–5 test product listings exist in Supabase products table
[ ] Consumer account exists for testing checkout flow
If missing, STOP and ask.

---
PHASE 3 COMPLETION REPORT (Fill this in when done):

**Status**: [ ] Complete / [ ] Partially Complete / [ ] Blocked

**Completed Tasks**:
- List every task

**Files Created/Modified**:
- List every file with path

**⚠️ UPDATE REQUIRED Alerts**:
- e.g., "Phase 4 must wire MarketplaceSearchHero mic to VoiceAssistantModal"
- e.g., "Phase 5 will import TraceabilityTimeline from components/tracking/"

**❓ Missing Information Requests**:
- List anything needed

**🔗 Ready for Next Phase**:
- Confirm: "Phase 4 (AI + Voice Integration) can now begin" OR list blockers
```

---

## 🤖 PHASE 4 PROMPT — AI Integration & Multilingual Voice Assistant

> **Read before pasting**: Phases 1, 2, and 3 must be complete. The Express.js backend must be running.

```
You are continuing development of AgriNex AI. Phases 1, 2, and 3 are complete.

CONTEXT FILES TO READ FIRST:
- c:\ass2\development phases\phase_4_ai_voice_integration.md  ← Main spec
- c:\ass2\project requirements document\ai_voice.md           ← AI & Voice PRD
- c:\ass2\design_ui.md                                        ← Design tokens (voice waveform animation)
- c:\ass2\development phases\phase_2_farmer_dashboard.md      ← AICropGraderWidget location
- c:\ass2\development phases\phase_3_consumer_marketplace.md  ← Voice search stub location

PHASE 4 TASK — AI Integration & Multilingual Voice Assistant:

UPSTREAM DEPENDENCIES FROM PHASES 1–3:
- ✅ Express.js backend is running with /api/products, /api/orders routes
- ✅ AICropGraderWidget exists in components/farmer/ with mock gradeCrop() call (Phase 2 stub)
- ✅ MarketplaceSearchHero mic button exists as a stub (Phase 3 stub)
- ✅ Floating Voice AI button exists in root layout as a shell (Phase 1 stub)
- ✅ voice-wave-circle CSS class and audio-pulse keyframe exist in globals.css (Phase 1)

If any dependency is missing, STOP and tell me.

YOUR TASKS:
1. Install @google/generative-ai on the backend: npm install @google/generative-ai
2. Create apps/api/src/ai/geminiClient.ts — initialize Gemini with GEMINI_API_KEY env var. Export geminiFlash and geminiVision model instances.
3. Create apps/api/src/ai/cropGrader.ts — implement gradeCrop(imageBuffer, mimeType, cropType). Use the exact Gemini prompt from phase_4_ai_voice_integration.md section 2.1.
4. Create apps/api/src/ai/priceEngine.ts — implement getRecommendedPrice(input). Use exact prompt from section 3.1.
5. Create apps/api/src/ai/voiceAssistant.ts — implement parseVoiceCommand(transcript, language). Use exact prompt from section 4.1. Support: en, hi, te, ta, mr, kn.
6. Create apps/api/src/middleware/upload.middleware.ts — Multer setup with memory storage for image uploads.
7. Create apps/api/src/routes/ai.routes.ts with 3 endpoints:
   - POST /api/ai/grade-crop (multipart, calls cropGrader.ts)
   - POST /api/ai/recommend-price (JSON, calls priceEngine.ts)
   - POST /api/ai/voice-assistant (JSON, calls voiceAssistant.ts)
8. Add express-rate-limit: max 10 requests/minute on all /api/ai/* routes.
9. Add sharp: compress uploaded crop images to max 800×800 before passing to Gemini.
10. REPLACE the mock gradeCrop() call in AICropGraderWidget.tsx (Phase 2) with a real fetch to POST /api/ai/grade-crop.
11. REPLACE the mock AI price button in ProductListingForm.tsx (Phase 2) with a real fetch to POST /api/ai/recommend-price.
12. Create lib/speech.ts — SpeechController class with startListening, stopListening. Include LANGUAGE_CODES map for 6 languages.
13. Build VoiceAssistantModal (components/layout/VoiceAssistantModal.tsx) with 4 states: idle, listening (pulsing circles + waveform), processing (spinner), result (transcript + parsed action + speechFeedback + Confirm/Cancel buttons).
14. WIRE the floating Voice AI button in app/layout.tsx to open VoiceAssistantModal.
15. WIRE MarketplaceSearchHero mic button (Phase 3) to launch VoiceAssistantModal with GET_PRICE intent pre-context.
16. Implement browser SpeechSynthesis TTS: after AI returns speechFeedback, speak it aloud in the user's language.

PHASE LINKS:
- This phase REPLACES stubs left in Phases 2 and 3. Explicitly open those files and update them.
- The VoiceAssistantModal built here is a GLOBAL component rendered in layout.tsx — it is available on every page (Farmer, Consumer, Admin).
- The LANGUAGE_CODES map in lib/speech.ts is used by Phase 6's language switcher.
- The rate limiting middleware pattern used here should be followed for any new AI endpoints added in future phases.

DESIGN RULES:
- VoiceAssistantModal overlay: bg-black/70 backdrop-blur-md fixed inset-0 z-50.
- Listening state inner card: box-shadow: 0 0 60px rgba(139,92,246,0.2).
- 3 concentric voice-wave-circle divs with animationDelay: 0s, 0.4s, 0.8s.
- Language selector pills: active = bg-purple-500/30 border border-purple-500/50 text-purple-300.
- Result state action buttons: Confirm = emerald glow, Cancel = slate glass.

⚠️ MISSING INFORMATION — Before you begin, confirm you have:
[ ] GEMINI_API_KEY (from Google AI Studio)
[ ] Backend .env file is set up with the key
If the API key is missing, STOP and ask me. Do not use a placeholder key.

---
PHASE 4 COMPLETION REPORT (Fill this in when done):

**Status**: [ ] Complete / [ ] Partially Complete / [ ] Blocked

**Completed Tasks**:
- List every task including the Phase 2 and 3 stubs you replaced

**Files Created/Modified**:
- List every file including those modified from previous phases

**⚠️ UPDATE REQUIRED Alerts**:
- e.g., "Phase 5 order dispatch should trigger OTP notification — voice assistant should later support CHECK_ORDERS action"

**❓ Missing Information Requests**:
- e.g., "Gemini API rate limits hit during testing — may need paid tier"

**🔗 Ready for Next Phase**:
- Confirm: "Phase 5 (Live Tracking & Logistics) can now begin" OR list blockers
```

---

## 🚚 PHASE 5 PROMPT — Live Order Tracking & Logistics

> **Read before pasting**: Phases 1–4 must be complete. Orders must be creatable via the consumer checkout (Phase 3).

```
You are continuing development of AgriNex AI. Phases 1 through 4 are complete.

CONTEXT FILES TO READ FIRST:
- c:\ass2\development phases\phase_5_live_tracking_logistics.md  ← Main spec
- c:\ass2\project requirements document\delivery_tracking.md     ← Delivery PRD
- c:\ass2\development phases\phase_3_consumer_marketplace.md     ← TraceabilityTimeline component

PHASE 5 TASK — Live Order Tracking & Logistics:

UPSTREAM DEPENDENCIES FROM PHASES 1–4:
- ✅ orders table exists with tracking_history JSONB column (Phase 1)
- ✅ notifications table exists (Phase 1)
- ✅ POST /api/orders creates an order with status: "pending" (Phase 3)
- ✅ PATCH /api/orders/:id/status exists for accept/dispatch (Phase 2)
- ✅ TraceabilityTimeline component exists in components/tracking/ (Phase 3)
- ✅ Farmer can see incoming orders and click Accept/Dispatch (Phase 2)
- ✅ Leaflet is installed (Phase 1 package list)

If any dependency is missing, STOP and tell me.

YOUR TASKS:
1. Add dynamic import for Leaflet map to avoid SSR errors: dynamic(() => import("react-leaflet"), { ssr: false }).
2. Create app/(consumer)/orders/[id]/track/page.tsx — full tracking page.
3. Build the Leaflet MapContainer using CartoDB Dark Matter tile layer. Add 3 markers: farmer (🌾), consumer (🏠), courier (🚚 bouncing).
4. Implement simulated GPS courier movement: useEffect with setInterval (every 3 seconds), interpolatePosition function moving courier 2% closer to destination per tick.
5. Build the Logistics Summary Card — 3 columns: Distance Remaining, ETA (minutes), Status Badge.
6. REUSE TraceabilityTimeline (components/tracking/) from Phase 3 on this page — pass the order's tracking_history.
7. Update PATCH /api/orders/:id/status to append new event object to tracking_history JSONB array AND insert a notifications row for the relevant user.
8. Add OTP generation: when status changes to "dispatched", generate a 4-digit OTP, store as "OTP:{code}" in payment_id column, insert notification to consumer with the OTP.
9. Create POST /api/orders/:id/verify-delivery — validates OTP, updates status to "delivered", appends final tracking event.
10. Build OTP Entry UI on the tracking page — 4 glass-input boxes (one per digit), auto-focus next on input.
11. Create GET /api/orders/:id/route — returns farmerCoords, consumerCoords, simulated currentCourierCoords (interpolated), estimatedTimeRemainingMin, distanceRemainingKm.
12. Build NotificationsPanel (components/layout/NotificationsPanel.tsx) — slide-out from right, lists all notifications for current user, unread badge on bell icon, mark-all-read button. Wire the bell icon in sidebar (Phase 1 layout).
13. Set up TanStack Query refetch every 5 seconds for the route endpoint on the tracking page.

PHASE LINKS:
- TraceabilityTimeline is SHARED — built in Phase 3, reused here. Do not duplicate it.
- The PATCH /api/orders/:id/status built in Phase 2 is EXTENDED here — open that file and add tracking_history append + notification insert logic.
- Notification rows inserted here (order updates, OTP) appear in the NotificationsPanel built in this phase.
- The Admin in Phase 6 will see order status history — the tracking_history JSONB you append here is the data source.

DESIGN RULES:
- Leaflet map tile: CartoDB Dark Matter — "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
- Map container: glass-panel rounded-2xl overflow-hidden h-96.
- Courier emoji (🚚) must have className="animate-bounce" on its Leaflet divIcon.
- Polyline: color #10b981, weight 3, dashArray "8 4".
- OTP input boxes: glass-input w-14 h-14 text-center text-2xl font-mono tracking-widest.
- Logistics summary card: grid grid-cols-3 gap-4 glass-panel rounded-2xl p-5.

⚠️ MISSING INFORMATION — Before you begin, confirm:
[ ] At least one complete order exists in Supabase (placed via Phase 3 checkout)
[ ] Farmer has accepted that order in Phase 2 dashboard
If no test orders exist, STOP and tell me — I will create test data.

---
PHASE 5 COMPLETION REPORT (Fill this in when done):

**Status**: [ ] Complete / [ ] Partially Complete / [ ] Blocked

**Completed Tasks**:
- List every task including files modified from Phase 2 and 3

**Files Created/Modified**:
- Include which Phase 2 files were extended

**⚠️ UPDATE REQUIRED Alerts**:
- e.g., "Phase 6 admin view needs tracking_history data — confirm JSONB structure is stable"

**❓ Missing Information Requests**:
- List anything needed

**🔗 Ready for Next Phase**:
- Confirm: "Phase 6 (Admin Console) can now begin" OR list blockers
```

---

## 🔐 PHASE 6 PROMPT — Admin Console & Platform Operations

> **Read before pasting**: Phases 1–5 must be complete. Admin role must exist in the profiles table.

```
You are continuing development of AgriNex AI. Phases 1 through 5 are complete.

CONTEXT FILES TO READ FIRST:
- c:\ass2\development phases\phase_6_admin_console.md        ← Main spec
- c:\ass2\project requirements document\admin.md             ← Admin PRD
- c:\ass2\design_ui.md                                       ← Design tokens (admin panel spec section 4.4)

PHASE 6 TASK — Admin Console & Platform Operations:

UPSTREAM DEPENDENCIES FROM PHASES 1–5:
- ✅ All 6 Supabase tables have data (profiles, products, orders, order_items, reviews, notifications)
- ✅ Farmer KYC upload flow exists (Phase 1 onboarding) — land certificates in Supabase storage
- ✅ Reviews table has ratings data (Phase 3 review submissions)
- ✅ orders table has tracking_history JSONB (Phase 5)
- ✅ Admin role exists in profiles ENUM (Phase 1 schema)
- ✅ Root layout sidebar renders (Phase 1) — admin gets same layout

If any dependency is missing, STOP and tell me.

YOUR TASKS:
1. Create app/(admin)/page.tsx — Overview tab as default. Render admin tab navigation: Overview, KYC Review, Disputes, Users, Notifications.
2. Build KPI Metrics Grid (4 cards): Active Farmers, Consumer Signups, Orders Completed, Food Waste Reduced (estimate based on order volume × avg weight × 0.12 factor).
3. Build SupplyDemandChart (components/charts/SupplyDemandChart.tsx) — Recharts grouped BarChart. X-axis: top 5 categories. Two bars per group: Listed qty (emerald) vs Ordered qty (sky blue). Both bars use custom SVG linearGradient fills.
4. Build GrowthChart (components/charts/GrowthChart.tsx) — Recharts LineChart. 3 lines: Farmer Registrations (green), Consumer Signups (blue), Orders (purple). All with neon glow dots.
5. Build EnvironmentalGauge — SVG circular progress arc. Fills emerald proportionally to (direct_orders / total_orders * 100%). Center text: percentage gradient. Below: brief description label.
6. Create app/(admin)/kyc/page.tsx — 2-column layout (320px list + flex preview).
7. Build KYCApplicationList (components/admin/KYCApplicationList.tsx) — scrollable list of pending farmers. Active selection: left border-l-2 border-l-purple-500 + bg-purple-500/10.
8. Build KYCReviewPanel (components/admin/KYCReviewPanel.tsx) — farmer profile header, land document viewer (iframe for PDF, img for images with click-to-zoom), Verify button (emerald glow) + Reject button (opens dialog for rejection note).
9. Add Verify approval animation: Framer Motion keyframe burst of 8–12 small emerald circles radiating outward from the Verify button. Flash "✓ Profile Verified" badge for 2 seconds.
10. Create app/(admin)/disputes/page.tsx — filterable disputes table.
11. Build DisputeTable (components/admin/DisputeTable.tsx) — auto-queries orders joined with reviews where rating ≤ 2. Compute flag level: HIGH if AI grade was A+ or A, MEDIUM if B, LOW if C.
12. Build DisputeActionMenu — dropdown with 3 options: Initiate Refund (update payment_status = refunded), Warn Seller (decrement trust_score by 0.5), Mark Resolved.
13. Create app/(admin)/users/page.tsx — searchable user table with columns: avatar, name, phone, role badge, verified status, trust score, joined date. Suspension toggle.
14. Create app/(admin)/notify/page.tsx — broadcast form: audience selector (All Farmers / All Consumers / Single User), title, message. Preview card. Send button inserts notifications rows.
15. Build all Express.js admin endpoints:
    - GET /api/admin/stats
    - GET /api/admin/kyc (paginated, pending only)
    - POST /api/admin/verify-farmer
    - GET /api/admin/disputes
    - POST /api/admin/disputes/:id/resolve
    - GET /api/admin/users
    - POST /api/admin/notify

PHASE LINKS:
- KYC data comes from Phase 1 (farmer onboarding uploads land certificate).
- Dispute data comes from Phase 3 (reviews table) and Phase 1 (products quality_grade column).
- Trust score updates here affect farmer's profile — this is the same profiles.trust_score updated by Phase 3 reviews.
- Charts pull real data from orders, profiles, and products tables — all populated by Phases 2–5.
- The SupplyDemandChart and GrowthChart follow the same Recharts patterns as EarningsAreaChart (Phase 2).

DESIGN RULES:
- Admin tabs: horizontal pill strip. Active tab: border-b-2 border-purple-500 text-purple-300 bg-purple-500/5.
- KYC list active row: border-l-2 border-purple-500 bg-purple-500/10.
- Document viewer: glass-panel rounded-2xl p-4. Image: cursor-zoom-in. PDF: iframe w-full h-80 rounded-xl.
- Dispute table flag badges: HIGH = bg-red-500/20 text-red-400, MEDIUM = bg-amber-500/20 text-amber-400, LOW = bg-yellow-500/20 text-yellow-300.
- Verify burst animation: 10 small divs (8px × 8px, emerald, rounded-full) animated with Framer Motion from center outward, opacity 1→0, scale 0→3.

⚠️ MISSING INFORMATION — Before you begin, confirm:
[ ] Admin account exists in Supabase (manually insert a profile row with role = 'admin')
[ ] Test farmer KYC applications exist (at least 2 pending)
[ ] Test reviews with low ratings exist (at least 1 dispute scenario)
If any test data is missing, STOP and ask me to provide it.

---
PHASE 6 COMPLETION REPORT (Fill this in when done):

**Status**: [ ] Complete / [ ] Partially Complete / [ ] Blocked

**Completed Tasks**:
- List every task

**Files Created/Modified**:
- List every file

**⚠️ UPDATE REQUIRED Alerts**:
- e.g., "Phase 7 accessibility panel should be linked from admin settings"

**❓ Missing Information Requests**:
- List anything needed

**🔗 Ready for Next Phase**:
- Confirm: "Phase 7 (Testing & Deployment) can now begin" OR list blockers
```

---

## 🚀 PHASE 7 PROMPT — Testing, Polishing & Deployment

> **Read before pasting**: All Phases 1–6 must be complete. This is the final phase.

```
You are in the final phase of AgriNex AI development. Phases 1 through 6 are all complete.

CONTEXT FILES TO READ FIRST:
- c:\ass2\development phases\phase_7_testing_deployment.md  ← Main spec
- c:\ass2\development phases\README.md                      ← Full project overview
- All previous phase completion reports                     ← Review all ⚠️ UPDATE REQUIRED alerts

PHASE 7 TASK — Testing, Polishing & Deployment:

UPSTREAM DEPENDENCIES — ALL PHASES:
- ✅ All 3 role flows (Farmer, Consumer, Admin) are fully built
- ✅ All AI endpoints are live (Phase 4)
- ✅ Live tracking map is working (Phase 5)
- ✅ Admin KYC + dispute tools are working (Phase 6)
- ✅ All ⚠️ UPDATE REQUIRED items from previous completion reports are resolved

Before proceeding, list every UPDATE REQUIRED alert from all previous phase reports and confirm each is resolved.

YOUR TASKS:

TESTING:
1. Run the complete Farmer flow test (section 1.1 of phase_7): signup → KYC → crop grading → listing → order accept → dispatch → delivery confirm → analytics.
2. Run the complete Consumer flow test (section 1.2): signup → search → product detail → cart → payment → tracking → OTP verify → review.
3. Run the complete Admin flow test (section 1.3): stats → KYC approve → dispute flag → user manage → broadcast notify.
4. Report all bugs found. Fix each bug before moving to polish steps.

POLISH:
5. Build AccessibilityPanel (components/settings/AccessibilityPanel.tsx) — 4 toggles: Font Size slider (14–20px), High Contrast Mode, Reduce Animations, Screen Reader Mode. Apply body class changes for each. Add CSS overrides in globals.css for .high-contrast, .reduced-motion, .large-font.
6. Finalize LanguageSwitcher (components/layout/LanguageSwitcher.tsx) — 6 language options with flag emoji. Save to profiles.language_preference on change. Update Speech API lang code.
7. Add ARIA labels to ALL icon-only buttons (mic buttons, bell icon, cart icon, close buttons).
8. Add alt text to ALL product images, farmer avatars, and document images.
9. Add role="dialog" and aria-labelledby to ALL modal components.
10. Replace all Next.js <img> tags with <Image> from next/image for Supabase Storage URLs.
11. Add dynamic import with { ssr: false } to the Leaflet MapContainer component (if not already done in Phase 5).
12. Add express-rate-limit to all /api/ai/* routes (10 req/min per IP).
13. Add sharp image compression to POST /api/ai/grade-crop before passing buffer to Gemini.

DEPLOYMENT:
14. Create apps/web/.env.local with all required Next.js env vars.
15. Create apps/api/.env with all required backend env vars.
16. Configure Supabase Storage: bucket "crop-images" (public read, authenticated write) + bucket "land-docs" (private).
17. Add CORS config to Express restricting to Vercel production URL.
18. Deploy backend to Railway (or provide step-by-step instructions if CLI not available).
19. Deploy frontend to Vercel (or provide step-by-step instructions).
20. Run the pre-launch checklist from section 7 of phase_7 file and report results for every item.

PHASE LINKS:
- This phase resolves ALL deferred items from previous phases.
- The AccessibilityPanel added here should be reachable via the sidebar Settings link (Phase 1 layout).
- The LanguageSwitcher uses LANGUAGE_CODES from lib/speech.ts (Phase 4).
- The Leaflet dynamic import must reference the component created in Phase 5.
- All production env vars must match what Supabase, Railway, and Vercel require.

⚠️ MISSING INFORMATION — Before you begin, confirm you have:
[ ] NEXT_PUBLIC_SUPABASE_URL
[ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
[ ] NEXT_PUBLIC_API_BASE_URL (Railway backend URL)
[ ] SUPABASE_SERVICE_KEY (backend only)
[ ] GEMINI_API_KEY
[ ] Railway account + CLI access (or manual deploy instructions needed)
[ ] Vercel account + CLI access (or manual deploy instructions needed)
If ANY of these are missing, STOP and list exactly what is needed before deployment steps.

---
PHASE 7 FINAL COMPLETION REPORT (Fill this in when done):

**Status**: [ ] Complete / [ ] Partially Complete / [ ] Blocked

**Bugs Found & Fixed**:
- List each bug and the fix applied

**Pre-Launch Checklist Results**:
- Copy the checklist from phase_7 and mark each item ✅ or ❌

**Deployment URLs**:
- Frontend (Vercel): https://___________
- Backend (Railway): https://___________
- Supabase Project: https://___________

**Files Created/Modified**:
- List every file

**❓ Final Missing Information**:
- List anything still needed post-deployment

**🎉 Platform Status**:
- LIVE ✅ / NOT LIVE ❌ (explain why)
```

---

## 📌 Quick Reference — Phase Dependency Chain

```
Phase 1 (Foundation)
    │
    ├──► Phase 2 (Farmer Dashboard)
    │         │
    │         ├──► Phase 3 (Consumer Marketplace)
    │         │         │
    │         │         ├──► Phase 4 (AI + Voice) ◄── Replaces stubs in Phase 2 & 3
    │         │         │
    │         │         └──► Phase 5 (Live Tracking) ◄── Extends Phase 2 PATCH endpoint
    │         │                   │
    │         └─────────────────► Phase 6 (Admin Console) ◄── Reads data from all phases
    │                                       │
    └──────────────────────────────────────► Phase 7 (Testing + Deploy) ◄── Completes everything
```

---

## 📝 Notes for Agent

- Always read the linked phase `.md` file before writing any code.
- If a phase file and a PRD file contradict each other, the **phase file takes priority** (it is more implementation-specific).
- When in doubt about a UI element, refer to `design_ui.md` for exact CSS values and component patterns.
- Never delete code from a previous phase. Only extend or replace stubs.
- Always run `npm run build` after completing a phase to catch TypeScript errors before reporting done.
