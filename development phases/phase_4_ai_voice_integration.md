# Phase 4: AI Integration & Multilingual Voice Assistant

**Phase Duration**: Week 7–8  
**Goal**: Fully implement all AI-powered features of the Express.js backend — the Gemini Vision crop quality analyzer, the smart price recommendation engine, and the natural language voice-to-action assistant with regional language support.

**Depends On**: Phase 1 (DB Schema), Phase 2 (Product Form), Phase 3 (Marketplace Search)

---

## Overview

This is the intelligence layer of AgriNex AI. After this phase, all AI endpoints will be live. Farmers will receive real AI crop grades from Gemini Vision API, accurate market price recommendations, and spoken command parsing in Hindi, Telugu, Tamil, Marathi, Kannada, and English.

---

## 1. Express.js Backend AI Module Structure

### 1.1 File Structure
```
apps/api/src/
├── ai/
│   ├── cropGrader.ts         # Gemini Vision crop quality analyzer
│   ├── priceEngine.ts        # Gemini price recommendation engine
│   └── voiceAssistant.ts     # Gemini speech intent classifier
├── routes/
│   ├── ai.routes.ts          # All /api/ai/* routes
│   ├── products.routes.ts
│   ├── orders.routes.ts
│   └── farmer.routes.ts
├── middleware/
│   ├── auth.middleware.ts    # Supabase JWT validation
│   └── upload.middleware.ts  # Multer file upload config
└── index.ts                  # Express server entry
```

### 1.2 Gemini Client Initialization (`ai/geminiClient.ts`)
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
export const geminiVision = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // multimodal
```

---

## 2. AI Crop Quality Analyzer

### 2.1 Backend Service (`ai/cropGrader.ts`)
```typescript
import { geminiVision } from "./geminiClient";
import type { CropGradeResult } from "../types";

const CROP_GRADER_PROMPT = (cropType: string) => `
You are an expert agronomy grader and crop inspector.
Evaluate the uploaded image of the crop: ${cropType}.
Assess surface decay, bruising, shape deformities, color patterns, and freshness.
Return ONLY a valid JSON object matching this exact structure. Do not wrap in markdown:
{
  "grade": "A+" | "A" | "B" | "C",
  "freshness": "Excellent" | "Good" | "Fair" | "Poor",
  "blemishes": ["list", "of", "issues"],
  "waterContentPercentage": number,
  "estimatedShelfLifeDays": number,
  "justification": "Detailed explanation of grade decision"
}
`;

export async function gradeCrop(imageBuffer: Buffer, mimeType: string, cropType: string): Promise<CropGradeResult> {
  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType: mimeType as "image/jpeg" | "image/png" | "image/webp"
    }
  };

  const result = await geminiVision.generateContent([CROP_GRADER_PROMPT(cropType), imagePart]);
  const responseText = result.response.text().trim();

  try {
    return JSON.parse(responseText) as CropGradeResult;
  } catch {
    throw new Error("Failed to parse AI response JSON");
  }
}
```

### 2.2 Route (`routes/ai.routes.ts`)
```typescript
// POST /api/ai/grade-crop
router.post("/grade-crop", upload.single("image"), async (req, res) => {
  const { cropType } = req.body;
  const file = req.file;

  if (!file || !cropType) {
    return res.status(400).json({ error: "Image and cropType are required" });
  }

  const result = await gradeCrop(file.buffer, file.mimetype, cropType);

  // Optionally compute a recommended price based on grade
  const recommendedPrice = await getRecommendedPrice({ cropType, grade: result.grade, location: "India", baseWholesalePrice: 20 });

  res.json({ ...result, recommendedPrice: recommendedPrice.recommendedPrice });
});
```

---

## 3. AI Price Recommendation Engine

### 3.1 Backend Service (`ai/priceEngine.ts`)
```typescript
const PRICE_PROMPT = ({ cropType, grade, location, baseWholesalePrice }: PriceInput) => `
You are an agricultural price optimization AI for India.
Crop: ${cropType}, Grade: ${grade}, Location: ${location}, Wholesale Rate: ₹${baseWholesalePrice}/kg.
Determine optimal direct-to-consumer price:
- Consumer price: 15–20% above wholesale (maximizing farmer revenue)
- Must remain 20–30% below retail grocery outlets (incentivizing consumer switch)
- Account for current demand signals for this crop at this location.
Return ONLY this JSON (no markdown):
{
  "recommendedPrice": number,
  "minPrice": number,
  "maxPrice": number,
  "marketSentiment": "High Demand" | "Stable" | "Low Demand",
  "rationale": "1-2 sentence explanation"
}
`;

export async function getRecommendedPrice(input: PriceInput): Promise<PriceResult> {
  const result = await geminiFlash.generateContent(PRICE_PROMPT(input));
  return JSON.parse(result.response.text().trim()) as PriceResult;
}
```

### 3.2 Route
```typescript
// POST /api/ai/recommend-price
router.post("/recommend-price", async (req, res) => {
  const { cropType, grade, location, baseWholesalePrice } = req.body;
  const result = await getRecommendedPrice({ cropType, grade, location, baseWholesalePrice });
  res.json(result);
});
```

---

## 4. Multilingual Voice-to-Action Assistant

### 4.1 Backend Service (`ai/voiceAssistant.ts`)
```typescript
const VOICE_PROMPT = (transcript: string, language: string) => `
You are the speech command engine for AgriNex AI, an Indian agricultural marketplace.
The user's language is: ${language} (ISO code).
Transcript: "${transcript}"

Classify the intention into ONE of these actions:
- "ADD_PRODUCT": User wants to list a crop for sale (needs cropType, quantity, unit, pricePerUnit)
- "CHECK_SALES": User wants to check their earnings or order list
- "GET_PRICE": User wants to know optimal price for a crop
- "UNKNOWN": Cannot determine intent

Return ONLY this JSON:
{
  "action": "ADD_PRODUCT" | "CHECK_SALES" | "GET_PRICE" | "UNKNOWN",
  "data": {
    "cropType": string | null,
    "quantity": number | null,
    "unit": string | null,
    "pricePerUnit": number | null
  },
  "speechFeedback": "Confirmation/response message in ${language === 'hi' ? 'Hindi (Devanagari script)' : language === 'te' ? 'Telugu script' : language === 'ta' ? 'Tamil script' : 'English'}"
}
`;

export async function parseVoiceCommand(transcript: string, language: string): Promise<VoiceResult> {
  const result = await geminiFlash.generateContent(VOICE_PROMPT(transcript, language));
  return JSON.parse(result.response.text().trim()) as VoiceResult;
}
```

### 4.2 Route
```typescript
// POST /api/ai/voice-assistant
router.post("/voice-assistant", async (req, res) => {
  const { transcript, language = "en" } = req.body;
  const result = await parseVoiceCommand(transcript, language);
  res.json(result);
});
```

---

## 5. Frontend Voice Assistant UI

### 5.1 Component: `components/layout/VoiceAssistantModal.tsx`
- **Trigger**: Floating purple Mic button (fixed, bottom-right of the screen, across all pages)
- **State Machine**: `idle` → `listening` → `processing` → `result` → `idle`

```tsx
// LISTENING STATE
<motion.div variants={modalOverlayVariants} initial="hidden" animate="visible" exit="exit"
  className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center">

  <div className="glass-panel rounded-3xl p-10 text-center relative w-80"
       style={{ boxShadow: "0 0 60px rgba(139,92,246,0.2)" }}>

    {/* Pulsing circles */}
    <div className="relative w-24 h-24 mx-auto mb-6">
      <div className="voice-wave-circle w-full h-full" style={{ animationDelay: "0s" }} />
      <div className="voice-wave-circle w-full h-full" style={{ animationDelay: "0.4s" }} />
      <div className="voice-wave-circle w-full h-full" style={{ animationDelay: "0.8s" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <MicIcon className="w-10 h-10 text-purple-400" />
      </div>
    </div>

    <p className="text-purple-300 font-semibold mb-2">Listening...</p>
    <p className="text-slate-400 text-sm">Speak in any language</p>

    {/* Language selector */}
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {["EN", "HI", "TE", "TA", "MR", "KN"].map((lang) => (
        <button key={lang} onClick={() => setLanguage(lang.toLowerCase())}
          className={`px-3 py-1 rounded-full text-xs ${activeLang === lang.toLowerCase() ? "bg-purple-500/30 border border-purple-500/50 text-purple-300" : "text-slate-500 border border-white/10"}`}>
          {lang}
        </button>
      ))}
    </div>
  </div>
</motion.div>

// RESULT STATE — after AI parsing
<motion.div ...>
  {/* Transcription */}
  <p className="text-slate-300 text-sm mb-4 italic">"{transcript}"</p>

  {/* Parsed Action */}
  <div className="glass-panel rounded-xl p-4 mb-4 border border-purple-500/20">
    <p className="text-purple-300 text-xs font-semibold mb-1">Action Detected</p>
    <p className="text-white font-semibold">{result.action}</p>
    {result.data.cropType && <p className="text-slate-400 text-sm mt-1">Crop: {result.data.cropType} | Qty: {result.data.quantity} {result.data.unit} | ₹{result.data.pricePerUnit}/kg</p>}
  </div>

  {/* AI Feedback */}
  <p className="text-slate-300 text-sm mb-4">{result.speechFeedback}</p>

  {/* Action Buttons */}
  <div className="flex gap-3">
    <button onClick={executeAction} className="flex-1 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">Confirm</button>
    <button onClick={reset} className="flex-1 py-2 rounded-xl glass-panel border-white/10 text-slate-400">Cancel</button>
  </div>
</motion.div>
```

### 5.2 Web Speech API Controller (`lib/speech.ts`)
```typescript
export class SpeechController {
  private recognition: any;

  constructor(langCode: string = "en-US") {
    if (typeof window !== "undefined") {
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
    this.recognition.onresult = (event: any) => onResult(event.results[0][0].transcript);
    this.recognition.onerror = (err: any) => onError?.(err);
  }

  public stopListening() {
    this.recognition?.stop();
  }
}

// Language code mapping
export const LANGUAGE_CODES: Record<string, string> = {
  en: "en-IN", hi: "hi-IN", te: "te-IN",
  ta: "ta-IN", mr: "mr-IN", kn: "kn-IN",
};
```

---

## 6. Deliverables for Phase 4

| Task | Status |
|------|--------|
| Gemini API client initialization (Backend) | ⬜ |
| `POST /api/ai/grade-crop` endpoint with Vision API | ⬜ |
| `POST /api/ai/recommend-price` endpoint | ⬜ |
| `POST /api/ai/voice-assistant` endpoint | ⬜ |
| Multer file upload middleware | ⬜ |
| VoiceAssistantModal UI (listening/processing/result states) | ⬜ |
| Web Speech API controller with language support | ⬜ |
| Language selector bubbles (EN/HI/TE/TA/MR/KN) | ⬜ |
| Pulsing waveform animation during listening | ⬜ |
| Action execution after voice command confirmation | ⬜ |
| TTS feedback via browser SpeechSynthesis API | ⬜ |
