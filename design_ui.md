# AgriNex AI: UI/UX Design Specification & Frontend Code References

This document outlines the visual identity, design system, component specifications, chart configurations, and animation guidelines for the **AgriNex AI** platform. It is structured to serve as an exact implementation guide for automated code generation.

---

## 1. Theme & Design Tokens

AgriNex AI uses a **premium, dark-themed, glassmorphic design system** with vibrant neon colors representing the combination of nature (agriculture) and advanced technology (AI).

### 1.1 Color Palette
- **Primary Background**: `#050814` (Deep obsidian blue)
- **Primary Green (Agriculture / Farmer)**: `#10b981` (Emerald) -> Neon Glow: `rgba(16, 185, 129, 0.2)`
- **Secondary Blue (Consumer / Marketplace)**: `#0ea5e9` (Sky Blue) -> Neon Glow: `rgba(14, 165, 233, 0.2)`
- **Accent Purple (AI / Intelligence)**: `#8b5cf6` (Vibrant Indigo/Purple) -> Neon Glow: `rgba(139, 92, 246, 0.2)`
- **Warning Amber (Alerts / Disputes)**: `#f59e0b` (Amber) -> Neon Glow: `rgba(245, 158, 11, 0.2)`
- **Glass Panel Background**: `rgba(13, 20, 38, 0.45)`
- **Glass Border Standard**: `rgba(255, 255, 255, 0.08)`
- **Text Primary**: `#f8fafc` (Slate 50)
- **Text Secondary**: `#94a3b8` (Slate 400)

### 1.2 Glassmorphism CSS Styles (`index.css` / `globals.css`)
Apply these styles to the main CSS file:
```css
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
  }

  .gradient-text-blue {
    background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .gradient-text-purple {
    background: linear-gradient(135deg, #c084fc 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
```

---

## 2. Animation & Transitions Specification

We use **Framer Motion** for smooth React-based micro-interactions and transitions.

### 2.1 Standard Framer Motion Presets

```typescript
// Smooth Spring Transition
export const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

// Page Fade In & Slide Up
export const pageTransitionVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.3 } }
};

// Staggered Children Container
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

// Animated List Items
export const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: SPRING_TRANSITION }
};

// Tap & Hover Scale Preset
export const hoverScaleVariants = {
  hover: { scale: 1.03 },
  tap: { scale: 0.98 }
};
```

### 2.2 CSS/SVG Scan-line Animation (for AI Crop Analyzer)
```css
@keyframes scan-glow {
  0% { transform: translateY(0%); }
  50% { transform: translateY(220px); } /* height of scan area */
  100% { transform: translateY(0%); }
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
```

### 2.3 Audio Waveform Pulse (Voice Assistant UI)
```css
@keyframes audio-pulse {
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.4); opacity: 0; }
  100% { transform: scale(1); opacity: 0.6; }
}

.voice-wave-circle {
  position: absolute;
  border: 2px solid rgba(139, 92, 246, 0.4);
  border-radius: 50%;
  animation: audio-pulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}
```

---

## 3. Data Visualizations & Recharts Guidelines

All charts should be styled to blend with the dark glass theme. They should use glowing gradient fills, customized tooltips, and minimal grid lines.

### 3.1 Personal Earnings vs Market Average Area Chart (Farmer Dashboard)
- **Type**: Double Line Area Chart (`AreaChart`)
- **Data Keys**:
  - `earnings` (Personal Sales): Glowing Solid Neon Emerald Line (`#10b981`) with Emerald Gradient fill.
  - `average` (Local Wholesale Market): Dashed Sky Blue Line (`#0ea5e9`) with zero fill.
- **Visual Spec**:
  ```tsx
  {/* Tooltip Wrapper Styling */}
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel border-emerald-500/20 p-3 rounded-lg shadow-lg">
          <p className="text-xs text-slate-400 mb-1 font-mono">{label}</p>
          <p className="text-sm font-semibold text-emerald-400">My Sales: ₹{payload[0].value}</p>
          <p className="text-sm font-semibold text-sky-400">Market Avg: ₹{payload[1].value}</p>
        </div>
      );
    }
    return null;
  };
  ```

### 3.2 Demand Forecasting & Price Recommendations (Farmer Tool)
- **Type**: Interactive Bar Chart (`BarChart`) with vertical gradient pills.
- **Fills**: Custom gradient from `#8b5cf6` (Vibrant Indigo) at the top to `rgba(139, 92, 246, 0.05)` at the base.
- **X-Axis**: Crop categories or timeline.
- **Y-Axis**: Predicted demand score (1 - 100).

---

## 4. Platform Interface Layouts

### 4.1 Global Layout & Voice Assistant
- **Frosted Floating Sidebar**: Width `260px`. Features glass-panel styling with subtle borders. Consists of a Profile Indicator (displays verification status badge), navigation links, and Language Switcher.
- **Floating AI Voice Assistant Button**: Fixed to the bottom-right corner.
  - Features a glowing purple circular button with a Microphone icon (`LucideIcon.Mic`).
  - **On Click**: Opens a central modal.
  - **Assistant Modal Overlay**:
    - Translucent dark overlay with radial purple backdrop-blur.
    - Central animated SVG waveform showing speech volume pulses.
    - Transcription box: Shows speech-to-text in real time in a glowing font.
    - AI Action parsing banner: Shows system feedback (e.g., "Adding 50kg Potato...").

---

### 4.2 Farmer Dashboard
The dashboard uses three major widget containers.

#### 1. Crop Quality Analysis & Grading Card
- **Upload Zone**: A glass-panel box with dotted border. Drag-and-drop or select photo.
- **Scan Simulation**: When the image is uploaded, display the photo with the green vertical `anim-scan-line` moving up and down for 2 seconds.
- **Result Pane**: Transitions from the scan screen to reveal:
  - **Visual Grade Badge**: Large green circle containing letter "A" or "A+" with glow.
  - **Freshness Score**: Interactive meter displaying estimated water content and shelf life days.
  - **Defect Mapping**: Photo of crop with colored pinpoint dots marking detected blemishes (from AI Vision payload coordinates).

#### 2. Auto-Price Recommendation Card
- An interactive pricing slider.
- Includes a togglable **"AgriNex AI Pricing Engine"** button. Clicking this executes the API, updates the price slider to the recommended value, and renders the AI Rationale (e.g. *“Due to low arrivals in Pune market today, listing at ₹26/kg will maximize return while remaining lower than retail.”*).

#### 3. Speech-enabled Product Creation Form
- Standard input fields (Title, Category, Price, Unit, Stock).
- Input fields display a small purple mic icon. Tapping the mic lets the farmer describe just that field (e.g. "Onions") to populate it instantly.

---

### 4.3 Consumer Marketplace

#### 1. Marketplace Header & Search
- **AI Smart Search**: Giant central glassmorphic bar. Includes text search, category tags below, and a microphone button.
- **Category Filter Bubbles**: Horizontal scrollable list (e.g., "Leafy Greens", "Fruits", "Spices"). Bubbles are shaped as glass capsules that bounce on hover using Framer Motion springs.

#### 2. Product Detail & Traceability Modal
When a customer clicks a product card, a modal opens containing:
- **Product Overview**: Product title, grade badge, farmer information (avatar + verified checkmark).
- **Interactive Traceability Map**:
  - A visual SVG route connecting the farmer's coordinates (origin) to the consumer's delivery address (destination).
  - Estimated carbon offset calculation in a glowing text block.
  - Step-by-step audit logs: *Harvested Date* -> *Quality Graded* -> *Dispatched*.

#### 3. 3D Card Flipping Mock Payment Screen
- Consists of a virtual debit card container.
- When the user focuses on the card CVV field, the card rotates 180 degrees on the Y-axis.
- Styled using standard CSS 3D perspectives:
  ```css
  .payment-card-inner {
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }
  .payment-card-inner.flipped {
    transform: rotateY(180deg);
  }
  .payment-card-front, .payment-card-back {
    backface-visibility: hidden;
  }
  ```

---

### 4.4 Administrator Panel

#### 1. Metrics Board Grid
- **Total Farmers Registered**: Glass-panel with custom neon green line indicator.
- **Supply / Demand Ratio**: Circular progress meter showing live inventory metrics.
- **AI Dispute Monitor**: Shows flag count with amber highlights when a consumer files a rating review discrepant with the crop quality grading.

#### 2. KYC Verification Dashboard
- Splitted pane layout.
- **Left Side**: Scrollable list of pending farmer applications.
- **Right Side**: Interactive previewer. Displays the uploaded land document. Clicking "Approve & Verify" triggers a particle burst animation (Framer Motion) and flashes a "Verified Profile" badge.
