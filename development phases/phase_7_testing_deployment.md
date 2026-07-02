# Phase 7: Testing, Polishing & Deployment

**Phase Duration**: Week 13–14  
**Goal**: Complete end-to-end QA across all three roles (farmer, consumer, admin), apply final UI polish and accessibility improvements, configure production environments, and deploy the full stack to Vercel (frontend), Railway (backend), and Supabase (database).

**Depends On**: All Phases 1–6 complete and functional.

---

## Overview

This final phase ensures AgriNex AI is stable, performant, and production-ready. It covers test flows, accessibility mode, language switching finalization, and the Vercel + Railway + Supabase deployment pipeline.

---

## 1. Full End-to-End Test Flows

### 1.1 Farmer Full Flow Test
1. Sign up as Farmer role → Profile onboarding → Upload land certificate.
2. Wait for Admin approval (in test: approve immediately from admin panel).
3. Capture crop photo → AI grading scans and returns Grade A result.
4. Use AI Price Recommendation → Price is auto-filled.
5. Use Voice Input → Dictate "Potato fifty kg twenty rupees" → Fields auto-populated.
6. Submit product listing.
7. Wait for consumer to place order → Accept order.
8. Mark as Dispatched → OTP generated.
9. Consumer verifies OTP → Order marked delivered.
10. View Earnings Analytics → Area chart reflects new earnings data.

### 1.2 Consumer Full Flow Test
1. Sign up as Consumer → Profile onboarding → Set delivery address.
2. Search "potato" → Category filter "Vegetables" → Locate listing.
3. View Product Detail Modal → Traceability modal displays harvest point, quality grade, shelf life.
4. Add to cart → Open Cart Drawer → Review savings vs retail.
5. Proceed to payment → 3D card flip on CVV focus → Confirm payment.
6. Navigate to Order Tracking → See live map with simulated courier movement.
7. Enter OTP when prompted → Order delivered.
8. Submit 5-star review → Farmer's trust score updates.

### 1.3 Admin Full Flow Test
1. Sign in as Admin → See metrics dashboard.
2. Navigate to KYC Review → See pending farmer application.
3. Zoom in on land certificate → Approve profile → Green burst animation.
4. Navigate to Disputes → Find a 1-star order where AI graded A+.
5. Flag as HIGH dispute → Issue refund → Decrease farmer trust score.
6. Navigate to Users → Suspend a test account.
7. Send a broadcast notification to all consumers.

---

## 2. Accessibility Mode Implementation

### 2.1 Accessibility Settings Panel (`components/settings/AccessibilityPanel.tsx`)
- **Accessible from**: Settings icon in sidebar → Accessibility tab
- **Options**:
  - **Font Size**: Slider from 14px to 20px (updates CSS variable `--base-font-size`)
  - **High Contrast Mode**: Toggle that overrides glass backgrounds with solid dark panels
  - **Reduce Animations**: Toggle that sets `prefers-reduced-motion: reduce` CSS equivalent
  - **Screen Reader Mode**: Ensures all icon buttons have `aria-label`, all images have `alt`, all modals have `role="dialog"` and `aria-labelledby`

### 2.2 Accessibility CSS Overrides
```css
/* High Contrast Mode */
body.high-contrast .glass-panel {
  background: #0d1426;
  border-color: rgba(255, 255, 255, 0.2);
}

/* Reduced Animations */
body.reduced-motion * {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}

/* Large Font Mode */
body.large-font {
  --base-font-size: 18px;
}
```

---

## 3. Language Switcher Final Implementation

### 3.1 Language Switcher Component (`components/layout/LanguageSwitcher.tsx`)
- Dropdown in the sidebar with flag emoji icons
- Languages: 🇬🇧 English, 🇮🇳 Hindi, 🇮🇳 Telugu, 🇮🇳 Tamil, 🇮🇳 Marathi, 🇮🇳 Kannada
- Saves selection to user profile `language_preference` column
- Updates the Speech API `lang` attribute for voice assistant

### 3.2 UI Label Translation Note
- For the MVP, static UI labels can remain in English with a translation key system (i18n-ready structure using `next-intl` or similar).
- Dynamic AI content (e.g., speechFeedback from Voice API) is already returned in the user's language by the Gemini prompt.

---

## 4. Performance Optimizations

### 4.1 Frontend
- **Next.js Image Optimization**: Use `<Image />` from `next/image` for all crop photos. Supabase Storage URLs auto-resized via `width` and `quality` props.
- **TanStack Query Caching**: All marketplace product queries cached for 5 minutes. Farm analytics cached for 10 minutes.
- **Code Splitting**: Each role's route group (`(farmer)`, `(consumer)`, `(admin)`) is a separate Next.js chunk. Admins don't download consumer JS and vice versa.
- **Leaflet Lazy Load**: Import Leaflet map component with `dynamic(() => import("..."), { ssr: false })` to avoid SSR issues.

### 4.2 Backend
- **Rate Limiting**: Use `express-rate-limit` on all AI endpoints (`/api/ai/*`) — max 10 requests/minute per IP to prevent Gemini API abuse.
- **Image Compression**: Use `sharp` to compress uploaded crop images to max 800×800 before passing to Gemini Vision.
- **Error Handling**: Global error handler middleware wraps all routes in try/catch with structured JSON responses.

---

## 5. Environment Configuration

### 5.1 Frontend `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_BASE_URL=https://agrinex-api.up.railway.app
```

### 5.2 Backend `.env`
```env
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGIN=https://agrinex-ai.vercel.app
```

---

## 6. Deployment Instructions

### 6.1 Supabase (Database)
1. Create project at `supabase.com`
2. Run `supabase/schema.sql` in the SQL Editor
3. Enable Supabase Auth with Email + Google OAuth provider
4. Create Storage bucket `crop-images` (public read, authenticated write)
5. Create Storage bucket `land-docs` (private, admin-only read)

### 6.2 Railway (Backend API)
```bash
# Railway CLI deployment
railway login
railway init
railway up
# Set environment variables in Railway dashboard
# Expose port 4000
```
- Add Railway service: Node.js
- Build command: `npm run build`
- Start command: `npm start`
- Add all `.env` variables in Railway dashboard

### 6.3 Vercel (Frontend)
```bash
vercel --prod
# OR connect GitHub repo in Vercel dashboard for auto-deploy on push
```
- Framework: Next.js (auto-detected)
- Add all `.env.local` variables in Vercel dashboard under Project Settings → Environment Variables
- Enable Vercel Image Optimization (auto for Supabase Storage URLs)

---

## 7. Pre-Launch Checklist

```
SECURITY
[ ] All Supabase RLS policies active and tested
[ ] API routes protected by auth middleware
[ ] CORS restricted to Vercel production URL
[ ] Rate limiting on AI endpoints
[ ] No API keys exposed in frontend code

FUNCTIONALITY
[ ] Farmer full flow works end-to-end
[ ] Consumer full flow works end-to-end
[ ] Admin full flow works end-to-end
[ ] Voice assistant works in EN, HI, TE
[ ] AI crop grader returns valid grades
[ ] 3D card payment mock completes order creation
[ ] Live tracking map renders with dark tiles
[ ] Traceability timeline shows all 4 checkpoints
[ ] OTP delivery verification works

UI / UX
[ ] All glassmorphism panel styles applied
[ ] All Framer Motion animations functioning
[ ] Hover states for all interactive cards
[ ] Gradient texts render correctly
[ ] Mobile responsive (375px minimum)
[ ] Dark map tiles load correctly

PERFORMANCE
[ ] Lighthouse score > 80 on all major pages
[ ] Supabase Storage images served via CDN
[ ] No SSR errors on page load
[ ] TanStack Query caching functional
```

---

## 8. Deliverables for Phase 7

| Task | Status |
|------|--------|
| Complete farmer flow E2E test | ⬜ |
| Complete consumer flow E2E test | ⬜ |
| Complete admin flow E2E test | ⬜ |
| Accessibility panel (font size, contrast, motion) | ⬜ |
| Language switcher finalized (6 languages) | ⬜ |
| Rate limiting on AI endpoints | ⬜ |
| Image compression with `sharp` | ⬜ |
| Leaflet dynamic import (no SSR error) | ⬜ |
| Supabase Storage buckets configured | ⬜ |
| Railway backend deployed | ⬜ |
| Vercel frontend deployed | ⬜ |
| All environment variables configured | ⬜ |
| Pre-launch checklist completed | ⬜ |
| Platform live at production URL | ⬜ |
