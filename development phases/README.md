# 🌾 AgriNex AI — Development Phases

> **Smart Connection Between Farmers & Consumers**  
> AI-Powered Full Stack Web Application | Version 1.0  
> Prepared by: Pallavi Goddindla

---

## 📋 Project Overview

AgriNex AI is an AI-powered digital agriculture ecosystem that directly connects **farmers** and **consumers**, eliminating middlemen through intelligent pricing, crop quality analysis, voice-first accessibility, and real-time order tracking.

This folder contains **7 development phase documents** — each describing what to build, how to build it, and the exact code references, API specs, and UI component logic required.

---

## 🗂️ Folder Structure

```
development phases/
├── README.md                          ← You are here
├── phase_1_foundation.md              ← Project setup, DB schema, Auth
├── phase_2_farmer_dashboard.md        ← Farmer analytics, AI crop grader
├── phase_3_consumer_marketplace.md    ← Marketplace, cart, 3D payment
├── phase_4_ai_voice_integration.md    ← Gemini AI, voice assistant
├── phase_5_live_tracking_logistics.md ← Live map, order lifecycle, OTP
├── phase_6_admin_console.md           ← KYC review, disputes, analytics
└── phase_7_testing_deployment.md      ← QA, polish, production deploy
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **UI Components** | shadcn/ui, Lucide Icons, Recharts, Framer Motion |
| **State / Data** | TanStack Query, React Hook Form, Zod |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Email + Google OAuth) |
| **Storage** | Supabase Storage |
| **AI** | Google Gemini API (gemini-1.5-flash) |
| **Maps** | Leaflet / react-leaflet |
| **Deployment** | Vercel (Frontend), Railway (Backend), Supabase (DB) |

---

## 🎨 Design System

AgriNex AI uses a **premium dark glassmorphic design system** with:

- **Background**: `#050814` — Deep obsidian blue with radial neon gradients
- 🟢 **Green** `#10b981` — Farmer / Agriculture theme
- 🔵 **Sky Blue** `#0ea5e9` — Consumer / Marketplace theme
- 🟣 **Purple** `#8b5cf6` — AI / Intelligence features
- 🟡 **Amber** `#f59e0b` — Alerts / Disputes
- **Glass panels**: `backdrop-filter: blur(16px)` with subtle white borders
- **Animations**: Framer Motion springs, neon scan lines, audio waveform pulses

---

## 👥 User Roles

| Role | Description |
|------|-------------|
| 🌾 **Farmer** | Lists produce, receives AI crop grades, manages orders, views earnings analytics |
| 🛒 **Consumer** | Discovers products, views traceability, checks out, tracks delivery |
| 🔐 **Admin** | Verifies KYC, resolves disputes, manages users, monitors platform health |

---

## 📅 Development Phases Summary

### ✅ Phase 1 — Project Foundation & Design System
**Duration**: Week 1–2  
**Delivers**:
- Monorepo scaffold (Next.js 15 + Express.js)
- Full glassmorphic CSS design system (`globals.css`, Tailwind config)
- Framer Motion animation presets
- Supabase PostgreSQL schema (6 tables: profiles, products, orders, order_items, reviews, notifications)
- Row Level Security (RLS) policies on all tables
- Multi-role Auth: Sign Up (Farmer / Consumer), Sign In, Onboarding flows
- Global root layout: Frosted sidebar + floating Voice AI button shell

---

### ✅ Phase 2 — Farmer Dashboard & Product Management
**Duration**: Week 3–4  
**Delivers**:
- Farmer dashboard widget grid (4 KPI cards)
- Earnings vs Market Average dual-line area chart (Recharts)
- AI Crop Grading widget — 3-state machine (idle → scanning → graded) with neon scan animation
- Voice input per field (mic icon on each form input)
- AI auto-price recommendation button & slider
- Traceability code auto-generation
- Incoming orders management table with status actions
- Express.js API: `GET /api/farmer/analytics`, `POST /api/products`, `GET /api/farmer/orders`

---

### ✅ Phase 3 — Consumer Marketplace & Checkout
**Duration**: Week 5–6  
**Delivers**:
- Marketplace search hero with voice search mic
- Category filter bubble carousel (spring bounce on hover)
- Product card grid with stagger entrance + hover lift animations
- Product detail modal with traceability timeline
- Cart slide-out drawer showing savings vs retail
- 3D card-flipping mock payment screen (CSS preserve-3d on CVV focus)
- Payment success → order creation → redirect to tracking
- Post-purchase star review system → trust score update
- Express.js API: `GET /api/products`, `POST /api/orders`, `POST /api/reviews`

---

### ✅ Phase 4 — AI Integration & Multilingual Voice Assistant
**Duration**: Week 7–8  
**Delivers**:
- Gemini Vision API crop quality grader (`POST /api/ai/grade-crop`)
- AI price recommendation engine (`POST /api/ai/recommend-price`)
- Natural language voice-to-action parser (`POST /api/ai/voice-assistant`)
- Support for 6 regional languages: English, Hindi, Telugu, Tamil, Marathi, Kannada
- Voice assistant UI: concentric pulsing circles, waveform, transcript box, action confirmation
- Web Speech API controller utility class with language code mapping
- TTS feedback via browser SpeechSynthesis API
- Rate limiting + image compression (Sharp) on AI endpoints

---

### ✅ Phase 5 — Live Order Tracking & Logistics
**Duration**: Week 9–10  
**Delivers**:
- Full order status lifecycle: `pending → accepted → quality_verified → dispatched → delivered`
- Leaflet map with CartoDB Dark tiles showing farmer pin 🌾, courier pin 🚚, consumer pin 🏠
- Simulated GPS courier movement along route
- Logistics summary card (ETA, distance remaining, status badge)
- Harvest-to-Doorstep traceability timeline (4 animated checkpoints)
- OTP generation on dispatch, consumer OTP entry for delivery verification
- Notification center slide-out panel with unread badge
- Express.js API: `PATCH /api/orders/:id/status`, `GET /api/orders/:id/route`, `POST /api/orders/:id/verify-delivery`

---

### ✅ Phase 6 — Admin Console & Platform Operations
**Duration**: Week 11–12  
**Delivers**:
- Admin tab navigation (Overview, KYC, Disputes, Users, Notifications)
- KPI metrics dashboard (active farmers, signups, orders, food waste reduced)
- Supply vs Demand grouped bar chart
- Platform growth line chart (3 series: farmers, consumers, orders)
- Environmental impact circular SVG gauge
- KYC split-panel: pending list + document viewer + approve/reject actions
- Approval particle burst animation + "Verified" badge flash
- AI-flagged dispute table with flag levels (HIGH / MEDIUM / LOW)
- Dispute actions: refund, warn seller (trust score -0.5), resolve
- User management table with suspension toggle
- System notification broadcaster (target: all farmers / all consumers / single user)
- Express.js API: 7 admin routes

---

### ✅ Phase 7 — Testing, Polishing & Deployment
**Duration**: Week 13–14  
**Delivers**:
- End-to-end test flows for all 3 roles (Farmer, Consumer, Admin)
- Accessibility mode: font size control, high contrast, reduced animations, ARIA labels
- Language switcher finalized with profile persistence
- Performance optimizations: Next.js image opt, TanStack Query caching, code splitting, Leaflet lazy load
- Production environment configuration (`.env` files)
- Supabase Storage bucket setup (crop-images + land-docs)
- Railway backend deployment
- Vercel frontend deployment
- Pre-launch checklist (Security, Functionality, UI/UX, Performance)

---

## 📊 Phase Timeline

```
Week 1  ████████░░░░░░░░░░░░░░░░░░  Phase 1: Foundation
Week 2  ████████░░░░░░░░░░░░░░░░░░  Phase 1: Foundation
Week 3  ░░░░░░░░████████░░░░░░░░░░  Phase 2: Farmer Dashboard
Week 4  ░░░░░░░░████████░░░░░░░░░░  Phase 2: Farmer Dashboard
Week 5  ░░░░░░░░░░░░░░░░████████░░  Phase 3: Consumer Marketplace
Week 6  ░░░░░░░░░░░░░░░░████████░░  Phase 3: Consumer Marketplace
Week 7  ░░░░░░░░░░░░░░░░░░░░████░░  Phase 4: AI + Voice
Week 8  ░░░░░░░░░░░░░░░░░░░░████░░  Phase 4: AI + Voice
Week 9  ░░░░░░░░░░░░░░░░░░░░░░████  Phase 5: Live Tracking
Week 10 ░░░░░░░░░░░░░░░░░░░░░░████  Phase 5: Live Tracking
Week 11 ░░░░░░░░░░░░░░░░░░░░░░████  Phase 6: Admin Console
Week 12 ░░░░░░░░░░░░░░░░░░░░░░████  Phase 6: Admin Console
Week 13 ░░░░░░░░░░░░░░░░░░░░░░████  Phase 7: Testing & Deploy
Week 14 ░░░░░░░░░░░░░░░░░░░░░░████  Phase 7: Testing & Deploy
```
**Total Duration**: ~14 Weeks (3.5 Months)

---

## 🗄️ Database Tables at a Glance

| Table | Purpose |
|-------|---------|
| `profiles` | All users (farmer / consumer / admin) with role, verification, trust score |
| `products` | Crop listings created by farmers with AI quality report JSONB |
| `orders` | Purchase records with full `tracking_history` JSONB audit log |
| `order_items` | Individual line items per order |
| `reviews` | Consumer ratings that update farmer trust scores |
| `notifications` | In-app alerts for order updates, KYC decisions, price alerts |

---

## 🤖 AI Features at a Glance

| Feature | Endpoint | Model |
|---------|----------|-------|
| Crop Quality Grader | `POST /api/ai/grade-crop` | Gemini 1.5 Flash (Vision) |
| Price Recommendation | `POST /api/ai/recommend-price` | Gemini 1.5 Flash |
| Voice-to-Action Parser | `POST /api/ai/voice-assistant` | Gemini 1.5 Flash |

---

## 🚀 Quick Start for Development Agent

1. **Start from Phase 1** — do not skip. The DB schema and design system are dependencies for all other phases.
2. **Each phase has a Deliverables Checklist** at the bottom — track `[ ]` → `[/]` (in-progress) → `[x]` (done).
3. **Code snippets are exact references** — use them directly in implementation.
4. **API endpoints are defined per phase** — build backend routes alongside the frontend components that consume them.
5. **Environment variables** — refer to Phase 7 for complete `.env` configuration before deployment.

---

## 📁 Related Documentation

| Document | Location |
|----------|----------|
| Full PRD (Product Requirements) | `c:\ass2\prd_demo.md` |
| UI/UX Design Specification | `c:\ass2\design_ui.md` |
| Consumer PRD | `c:\ass2\project requirements document\consumer.md` |
| Farmer PRD | `c:\ass2\project requirements document\farmer.md` |
| Admin PRD | `c:\ass2\project requirements document\admin.md` |
| Delivery & Tracking PRD | `c:\ass2\project requirements document\delivery_tracking.md` |
| AI & Voice PRD | `c:\ass2\project requirements document\ai_voice.md` |

---

*AgriNex AI — Empowering Indian farmers through technology, transparency, and AI.*
