# Phase 1: Project Foundation & Design System Setup

**Phase Duration**: Week 1–2  
**Goal**: Bootstrap the full-stack project structure, implement the global design system (glassmorphism theme, typography, animations), initialize the Supabase database schema, and build multi-role authentication flows.

---

## Overview

This is the bedrock phase. Nothing functional is built for end users yet — but every architectural decision, folder structure, design token, database schema, and authentication flow is locked in here. All future phases depend on this being correct and complete.

---

## 1. Project Scaffolding

### 1.1 Repository Structure
```
agrinex-ai/
├── apps/
│   ├── web/                  # Next.js 15 Frontend (App Router)
│   │   ├── app/
│   │   │   ├── (auth)/       # Sign in / Sign up / Onboarding routes
│   │   │   ├── (farmer)/     # Farmer Dashboard routes
│   │   │   ├── (consumer)/   # Consumer Marketplace routes
│   │   │   ├── (admin)/      # Admin Console routes
│   │   │   ├── layout.tsx    # Root Layout with Sidebar & Voice Button
│   │   │   └── page.tsx      # Landing / Role selector page
│   │   ├── components/
│   │   │   ├── ui/           # Shared glassmorphic UI primitives
│   │   │   ├── charts/       # Recharts wrappers
│   │   │   ├── modals/       # Overlay components
│   │   │   └── layout/       # Sidebar, Navbar, Footer
│   │   ├── lib/
│   │   │   ├── supabase.ts   # Supabase client setup
│   │   │   ├── animations.ts # Framer Motion presets
│   │   │   └── utils.ts      # General utilities
│   │   ├── hooks/            # Custom React hooks
│   │   ├── types/            # Global TypeScript interfaces
│   │   ├── globals.css       # Design system CSS
│   │   └── tailwind.config.ts
│   │
│   └── api/                  # Express.js Backend (Node.js + TypeScript)
│       ├── src/
│       │   ├── routes/       # API route files
│       │   ├── middleware/   # Auth, rate-limit, error handler
│       │   ├── services/     # Business logic
│       │   ├── ai/           # Gemini AI integration modules
│       │   └── index.ts      # Server entry point
│       └── package.json
│
├── supabase/
│   └── schema.sql            # Full PostgreSQL schema
└── package.json              # Root monorepo config
```

### 1.2 Package Installation (Frontend)
```bash
npx create-next-app@latest apps/web --typescript --tailwind --app
cd apps/web
npm install framer-motion recharts @supabase/supabase-js @supabase/ssr
npm install react-hook-form zod @hookform/resolvers
npm install @tanstack/react-query lucide-react
npm install leaflet react-leaflet @types/leaflet
```

### 1.3 Package Installation (Backend)
```bash
mkdir apps/api && cd apps/api
npm init -y
npm install express typescript ts-node cors dotenv multer
npm install @google/generative-ai @supabase/supabase-js
npm install -D @types/express @types/multer @types/cors nodemon
```

---

## 2. Global Design System Implementation

### 2.1 `globals.css` — Complete Glassmorphic Theme
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
@import "tailwindcss";

@layer base {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background-color: #050814;
    background-image:
      radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(14, 165, 233, 0.08) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 60%);
    background-attachment: fixed;
    color: #f8fafc;
    font-family: 'Outfit', 'Inter', sans-serif;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
}

/* GLASSMORPHISM UTILITIES */
@layer utilities {
  .glass-panel {
    background: rgba(13, 20, 38, 0.45);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  }

  .glass-panel-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass-panel-hover:hover {
    border-color: rgba(16, 185, 129, 0.3);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 20px rgba(16, 185, 129, 0.15);
    transform: translateY(-4px);
  }

  .glass-panel-hover-blue:hover {
    border-color: rgba(14, 165, 233, 0.3);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 20px rgba(14, 165, 233, 0.15);
    transform: translateY(-4px);
  }

  .glass-panel-hover-purple:hover {
    border-color: rgba(139, 92, 246, 0.3);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 20px rgba(139, 92, 246, 0.15);
    transform: translateY(-4px);
  }

  .glass-input {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #ffffff;
    border-radius: 0.75rem;
    padding: 0.75rem 1.25rem;
    width: 100%;
    transition: all 0.2s ease-in-out;
  }

  .glass-input:focus {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(139, 92, 246, 0.4);
    box-shadow: 0 0 15px rgba(139, 92, 246, 0.25);
    outline: none;
  }

  .gradient-text-green {
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .gradient-text-blue {
    background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .gradient-text-purple {
    background: linear-gradient(135deg, #c084fc 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

/* ANIMATIONS */
@keyframes scan-glow {
  0% { transform: translateY(0px); }
  50% { transform: translateY(220px); }
  100% { transform: translateY(0px); }
}

@keyframes audio-pulse {
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.4); opacity: 0; }
  100% { transform: scale(1); opacity: 0.6; }
}

@keyframes float-up {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes neon-flicker {
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.7; }
  94% { opacity: 1; }
}

.anim-scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  box-shadow: 0 0 15px #10b981, 0 0 5px #10b981;
  animation: scan-glow 2.5s ease-in-out infinite;
}

.voice-wave-circle {
  position: absolute;
  border: 2px solid rgba(139, 92, 246, 0.4);
  border-radius: 50%;
  animation: audio-pulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.anim-float { animation: float-up 4s ease-in-out infinite; }
.anim-neon-flicker { animation: neon-flicker 5s ease-in-out infinite; }
```

### 2.2 `tailwind.config.ts` — Extended Theme
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        emerald: { DEFAULT: "#10b981", glow: "rgba(16,185,129,0.2)" },
        sky: { DEFAULT: "#0ea5e9", glow: "rgba(14,165,233,0.2)" },
        indigo: { DEFAULT: "#8b5cf6", glow: "rgba(139,92,246,0.2)" },
        amber: { DEFAULT: "#f59e0b", glow: "rgba(245,158,11,0.2)" },
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "scan-glow": "scan-glow 2.5s ease-in-out infinite",
        "audio-pulse": "audio-pulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite",
        float: "float-up 4s ease-in-out infinite",
      },
      backdropBlur: { glass: "16px" },
    },
  },
  plugins: [],
};

export default config;
```

### 2.3 `lib/animations.ts` — Framer Motion Presets
```typescript
export const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
};

export const pageTransitionVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.3 } },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: SPRING_TRANSITION },
};

export const hoverScaleVariants = {
  hover: { scale: 1.03 },
  tap: { scale: 0.98 },
};

export const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: SPRING_TRANSITION },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
};
```

---

## 3. Supabase Database Schema

Execute in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom ENUM Types
CREATE TYPE user_role AS ENUM ('farmer', 'consumer', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'quality_verified', 'dispatched', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- 1. PROFILES TABLE
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'consumer',
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    location_lat DECIMAL(9,6),
    location_lng DECIMAL(9,6),
    address TEXT,
    language_preference VARCHAR(10) DEFAULT 'en',
    trust_score DECIMAL(3,2) DEFAULT 5.00 CHECK (trust_score BETWEEN 0.00 AND 5.00),
    is_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. PRODUCTS TABLE
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    unit_type VARCHAR(20) NOT NULL,
    quantity_available DECIMAL(10,2) NOT NULL CHECK (quantity_available >= 0),
    image_url TEXT,
    quality_grade VARCHAR(5) DEFAULT 'N/A',
    quality_report JSONB DEFAULT '{}',
    recommended_price DECIMAL(10,2),
    traceability_code VARCHAR(50) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. ORDERS TABLE
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    farmer_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_id VARCHAR(100),
    delivery_address TEXT NOT NULL,
    delivery_lat DECIMAL(9,6),
    delivery_lng DECIMAL(9,6),
    tracking_history JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10,2) NOT NULL
);

-- 5. REVIEWS TABLE
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Products viewable by all" ON public.products FOR SELECT USING (true);
CREATE POLICY "Farmers insert products" ON public.products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'farmer')
);
CREATE POLICY "Farmers manage own products" ON public.products FOR ALL USING (farmer_id = auth.uid());
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (
    consumer_id = auth.uid() OR farmer_id = auth.uid()
);
CREATE POLICY "Consumers place orders" ON public.orders FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'consumer')
);
CREATE POLICY "Parties update orders" ON public.orders FOR UPDATE USING (
    consumer_id = auth.uid() OR farmer_id = auth.uid()
);
CREATE POLICY "Notifications visible to owner" ON public.notifications FOR SELECT USING (user_id = auth.uid());
```

---

## 4. Multi-Role Authentication Flows

### 4.1 Supabase Client Setup (`lib/supabase.ts`)
```typescript
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 4.2 Authentication Screens

**Sign Up Screen** (`app/(auth)/signup/page.tsx`):
- Role selector toggle: Farmer | Consumer (glowing pill toggle, purple active state).
- Input fields: Full Name, Email, Phone, Password — all styled with `glass-input`.
- Submit triggers Supabase Auth `signUp()` → auto-creates a profile row via database trigger.
- On success: redirects to `/onboarding` for profile completion.

**Sign In Screen** (`app/(auth)/signin/page.tsx`):
- Email/password form with `glass-input`.
- Google OAuth button (Supabase provider).
- On login: redirects to role-specific dashboard (`/farmer/dashboard`, `/consumer/marketplace`, `/admin`).

**Onboarding Screen** (`app/(auth)/onboarding/page.tsx`):
- Farmer: Upload land certificate, select crop specializations, enter bank account number.
- Consumer: Enter shipping address with geolocation auto-detect button.

---

## 5. Global Root Layout

**`app/layout.tsx`** — Persistent Layout Shell:
- Renders **Frosted Sidebar** (260px width, glass-panel styled).
- Renders **Floating Voice AI Button** (fixed bottom-right, purple glowing mic icon).
- Sidebar items: Home, Dashboard, Marketplace, Orders, Analytics, Settings, Language Switcher.
- Verification badge shown next to farmer profile avatar (green check if verified, amber pending if not).

---

## 6. Deliverables for Phase 1

| Task | Status |
|------|--------|
| Next.js 15 + Express.js monorepo scaffolded | ⬜ |
| Tailwind config with custom design tokens | ⬜ |
| globals.css with glassmorphism utilities | ⬜ |
| Framer Motion animation presets file | ⬜ |
| Supabase schema executed in production | ⬜ |
| RLS policies enabled on all tables | ⬜ |
| Supabase Auth: Sign Up (with role) | ⬜ |
| Supabase Auth: Sign In | ⬜ |
| Farmer onboarding flow (KYC upload) | ⬜ |
| Consumer onboarding flow (address + coords) | ⬜ |
| Root layout with sidebar + voice button shell | ⬜ |
