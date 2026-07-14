# AgriNex AI: Comprehensive System Design Specification

This document contains the complete technical specifications, system architecture, database schema, design system, API endpoints, and screen flows for **AgriNex AI**. This file is structured to be read and executed by an automated development agent to construct the full-stack application.

---

## 1. Technical Stack Architecture

- **Frontend Framework**: Next.js 15 (App Router) + TypeScript + React 19
- **UI Components & Styles**: Tailwind CSS, shadcn/ui, Lucide Icons, glassmorphism design system
- **State Management & Data Fetching**: React Hook Form, Zod, TanStack Query (React Query)
- **Animations & Micro-interactions**: Framer Motion
- **Data Visualizations**: Recharts (for glowing SVG-based charts)
- **Database & Auth**: Supabase (PostgreSQL, Realtime Subscriptions, Supabase Auth, Storage Buckets)
- **Backend API Server**: Node.js + Express.js + TypeScript (for AI processing and heavy calculations)
- **AI Integrations**: Gemini API (Gemini 1.5 Flash or Gemini 2.5 Flash for image grading, price recommendation engine, multilingual natural language voice parser)

---

## 2. Design System & Glassmorphic CSS Styling

The visual theme uses a vibrant, colorful, glassmorphic theme designed for maximum impact. It features translucent glass panes with thin bright borders, colored neon drop shadows, and radial background gradients.

### 2.1 CSS Variables & Global Styles (`globals.css`)

Ensure the global stylesheet contains the following setup:

```css
@import "tailwindcss";

@layer base {
  :root {
    --background: 220 33% 5%;
    --foreground: 210 40% 98%;
    
    --glass-bg: rgba(13, 20, 38, 0.45);
    --glass-border: rgba(255, 255, 255, 0.08);
    --glass-border-hover: rgba(52, 211, 153, 0.25);
    --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
    
    --neon-green-glow: 0 0 20px rgba(52, 211, 153, 0.2);
    --neon-blue-glow: 0 0 20px rgba(14, 165, 233, 0.2);
    --neon-amber-glow: 0 0 20px rgba(245, 158, 11, 0.2);
  }

  body {
    background-color: #050814;
    background-image: 
      radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(14, 165, 233, 0.08) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.03) 0%, transparent 60%);
    background-attachment: fixed;
    color: #f1f5f9;
    font-family: 'Outfit', 'Inter', sans-serif;
  }
}

/* Glassmorphic Utilities */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-panel-hover:hover {
  border-color: var(--glass-border-hover);
  box-shadow: var(--glass-shadow), var(--neon-green-glow);
  transform: translateY(-4px);
}

.glass-panel-blue:hover {
  border-color: rgba(14, 165, 233, 0.25);
  box-shadow: var(--glass-shadow), var(--neon-blue-glow);
  transform: translateY(-4px);
}

.glass-panel-amber:hover {
  border-color: rgba(245, 158, 11, 0.25);
  box-shadow: var(--glass-shadow), var(--neon-amber-glow);
  transform: translateY(-4px);
}

.glass-input {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(52, 211, 153, 0.4);
  box-shadow: var(--neon-green-glow);
  outline: none;
}

/* Premium Gradient Text */
.gradient-text-green {
  background: linear-gradient(135deg, #a7f3d0 0%, #34d399 50%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-text-blue {
  background: linear-gradient(135deg, #bae6fd 0%, #38bdf8 50%, #0284c7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-text-rainbow {
  background: linear-gradient(135deg, #34d399 0%, #38bdf8 50%, #fbbf24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Animated pulses for camera grading */
@keyframes scanning {
  0% { top: 0%; }
  50% { top: 100%; }
  100% { top: 0%; }
}
.scan-line {
  position: absolute;
  height: 4px;
  width: 100%;
  background: linear-gradient(to right, transparent, #34d399, transparent);
  box-shadow: 0 0 12px #34d399;
  animation: scanning 3s ease-in-out infinite;
}
```

---

## 3. PostgreSQL Database Schema

Execute the following script inside the Supabase SQL editor to initialize tables, relationships, and basic functions.

```sql
-- ENABLE UUID AND GEOGRAPHY EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CUSTOM TYPES
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
    language_preference VARCHAR(10) DEFAULT 'en', -- 'en', 'hi', 'te', 'ta', 'mr', 'kn'
    trust_score DECIMAL(3,2) DEFAULT 5.00 CHECK (trust_score >= 0.00 AND trust_score <= 5.00),
    is_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PRODUCTS TABLE
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- e.g., 'Vegetables', 'Fruits', 'Grains', 'Pulses'
    price_per_unit DECIMAL(10,2) NOT NULL,
    unit_type VARCHAR(20) NOT NULL, -- e.g., 'kg', 'quintal', 'crate'
    quantity_available DECIMAL(10,2) NOT NULL CHECK (quantity_available >= 0),
    image_url TEXT,
    quality_grade VARCHAR(5) DEFAULT 'N/A', -- 'A+', 'A', 'B', 'C'
    quality_report JSONB DEFAULT '{}'::jsonb, -- detailed visual analysis payload
    recommended_price DECIMAL(10,2),
    traceability_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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
    tracking_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) NOT NULL, -- 'order_update', 'price_alert', 'verification'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Products Policies
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Farmers can insert products" ON public.products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'farmer')
);
CREATE POLICY "Farmers can update/delete their own products" ON public.products FOR ALL USING (
    farmer_id = auth.uid()
);

-- Orders Policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (
    consumer_id = auth.uid() OR farmer_id = auth.uid()
);
CREATE POLICY "Consumers can place orders" ON public.orders FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'consumer')
);
CREATE POLICY "Involved parties can update order status" ON public.orders FOR UPDATE USING (
    consumer_id = auth.uid() OR farmer_id = auth.uid()
);
```

---

## 4. API Endpoints & AI Integrations

The Express backend coordinates heavy computation, Gemini AI prompts, and voice parsing.

### 4.1 AI Crop Quality Analyzer (`POST /api/ai/grade-crop`)
**Request Payload**: Multi-part Form (Image file, `cropType` parameter).
**Processing**: Uses Gemini Vision (e.g., `gemini-1.5-flash` or `gemini-2.5-flash`) to parse details from the image buffer.
**System Prompt**:
```text
You are an expert agronomy grader and crop inspector.
Evaluate the uploaded image of the crop: ${cropType}.
Provide an objective evaluation. Identify surface decay, bruising, shape deformities, and color patterns.
Return a valid JSON object matching this structure EXACTLY. Do not wrap in markdown block.
{
  "grade": "A+" | "A" | "B" | "C",
  "freshness": "Excellent" | "Good" | "Fair" | "Poor",
  "blemishes": ["list", "of", "bruises/blemishes"],
  "waterContentPercentage": number,
  "estimatedShelfLifeDays": number,
  "justification": "Detailed sentence explaining grading reasons"
}
```

### 4.2 AI Price Recommend Engine (`POST /api/ai/recommend-price`)
**Request Payload**:
```json
{
  "cropType": "Potato",
  "grade": "A",
  "location": "Pune, Maharashtra",
  "baseWholesalePrice": 22.0
}
```
**AI Prompt**:
```text
Based on the crop: ${cropType}, Quality Grade: ${grade}, Location: ${location}, and the current base wholesale market rate of ₹${baseWholesalePrice} per kg:
Determine the optimal direct-to-consumer listing price. The consumer price should be 15-20% higher than wholesale (maximizing farmer revenue) but 20-30% lower than retail grocery outlets (incentivizing consumers).
Return JSON only:
{
  "recommendedPrice": number,
  "minPrice": number,
  "maxPrice": number,
  "marketSentiment": "High Demand" | "Stable" | "Low Demand",
  "rationale": "Brief justification describing consumer value and wholesale margins"
}
```

### 4.3 Voice-to-Action Translator (`POST /api/ai/voice-assistant`)
Translates transcribed speech input in regional languages and parses them into system commands.
**Input**: `{ "transcript": "मैंने पचास किलो आलू बेचे हैं पच्चीस रुपये किलो पर", "language": "hi" }`
**AI Prompt**:
```text
You are the speech parsing engine for AgriNex AI.
You receive a text transcript representing commands spoken by farmers or consumers in regional languages.
Analyze this command and categorize the intention into one of the following ACTIONS:
- "ADD_PRODUCT" (When listing a product for sale: requires crop type, quantity, unit, price)
- "CHECK_SALES" (When checking order earnings or list updates)
- "GET_PRICE" (When querying optimal market price recommendations)

Respond strictly in JSON format:
{
  "action": "ADD_PRODUCT" | "CHECK_SALES" | "GET_PRICE" | "UNKNOWN",
  "data": {
    "cropType": string | null,
    "quantity": number | null,
    "unit": string | null,
    "pricePerUnit": number | null
  },
  "speechFeedback": "Speech response in native script translating action confirmation, e.g., 'मैंने पच्चीस रुपये किलो पर पचास किलो आलू जोड़ दिया है। कृपया पुष्टि करें।'"
}
```

---

## 5. UI Layout, Screens & Animations

The system contains four primary interfaces. Each uses Glassmorphic panels (`glass-panel`), backdrop filters, and Framer Motion spring actions to deliver a fluid experience.

### 5.1 Main Layout (Floating Neon Sidebar)
- **Visuals**: A sidebar with frosted glass, thin semi-transparent white borders, and an glowing neon green border highlight.
- **Widgets**:
  - Global Language Selector (Dropdown with flags: EN, HI, TE, TA, MR, KN).
  - Floating Audio Helper: Active on all screens. Users click a mic button to dictate actions, trigger AI speech analysis, and receive a glowing overlay with the text parsed by the AI.

### 5.2 Farmer Dashboard
- **Component 1: Earnings Area Graph (Recharts)**
  - Shows two lines: Personal Earnings (neon green gradient fill) and Local Market Averages (dashed sky-blue).
  - Highlights glowing data points on hover.
- **Component 2: Quick-Grade Vision Camera**
  - Integrated camera/file uploader container.
  - While uploading, a glowing green `scan-line` sweeps vertically across the image.
  - Returns grading card: shows "Grade A", shelf life indicator, and estimated price suggestions.
- **Component 3: AI Product Listing Form**
  - Supports speech input to pre-fill input fields.
  - Price input features a tiny "AI Auto-Price Recommend" tag next to it; clicking it queries the pricing backend and applies recommended rates.

### 5.3 Consumer Marketplace
- **Component 1: Category Filter Panel**
  - Dynamic bubbles (Fruits, Vegetables, Grains) that inflate and bounce on hover.
- **Component 2: Product Grid Cards**
  - Glass-panels displaying crop photos, farmer's name, verification checkmarks, and grade tags.
  - Hovering scales the card slightly, shows a colored shadow, and animates a "View Details" button.
- **Component 3: Product Detail Overlay (Traceability & Quality Report)**
  - Opens in a center glass modal with a full fade-in overlay.
  - Visual breakdown: Displays the photo, the visual blemishes identified by the Gemini model, and a Google Map block indicating the farm's coordinates and direct shipping routes.
- **Component 4: Immersive Payment Screen**
  - 3D card flipping mock interface. Entering card details flips the card dynamically using CSS 3D transforms.

### 5.4 Administrator Panel
- **Component 1: Metrics Board**
  - Grid of glowing stats: total registered farmers, active orders, food waste metrics, and average dispute time.
- **Component 2: KYC Farmer Review Panel**
  - Admins inspect uploaded land credentials or farm certificates and click "Verify Profile", which flashes a green checkmark and triggers a real-time notification to the farmer's dashboard.

---

## 6. Framer Motion & Animation Code Reference

Implement these transitions inside your component file wrappers:

```typescript
// Fade-in Staggered Container
export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  }
};
```

---

## 7. Speech Integration Logic (HTML5 Web Speech API)

This utility can be imported on the frontend client to initialize voice-driven queries:

```typescript
export class SpeechController {
  private recognition: any;

  constructor(langCode: string = 'en-US') {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = langCode;
      }
    }
  }

  public startListening(onResult: (text: string) => void, onError?: (err: any) => void) {
    if (!this.recognition) return;
    this.recognition.start();
    
    this.recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      onResult(resultText);
    };

    this.recognition.onerror = (err: any) => {
      if (onError) onError(err);
    };
  }

  public stopListening() {
    if (this.recognition) this.recognition.stop();
  }
}
```
