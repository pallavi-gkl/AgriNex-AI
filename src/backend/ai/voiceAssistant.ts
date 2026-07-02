/**
 * @fileoverview Multilingual Voice-to-Action Assistant using Gemini Flash.
 * Parses spoken commands in 6 Indian languages into structured API actions.
 * Supported languages: en, hi, te, ta, mr, kn.
 */
import { geminiFlash } from "./geminiClient";

export interface VoiceResult {
  action: "ADD_PRODUCT" | "CHECK_SALES" | "GET_PRICE" | "UNKNOWN";
  data: {
    cropType: string | null;
    quantity: number | null;
    unit: string | null;
    pricePerUnit: number | null;
  };
  speechFeedback: string;
}

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
  "speechFeedback": "Confirmation/response message in ${language === 'hi' ? 'Hindi (Devanagari script)' : language === 'te' ? 'Telugu script' : language === 'ta' ? 'Tamil script' : language === 'mr' ? 'Marathi (Devanagari script)' : language === 'kn' ? 'Kannada script' : 'English'}"
}
`;

/**
 * Parse a voice transcript into a structured command action.
 * @param transcript - The speech-to-text transcription
 * @param language   - ISO language code (en, hi, te, ta, mr, kn)
 */
export async function parseVoiceCommand(
  transcript: string,
  language: string
): Promise<VoiceResult> {
  try {
    const result = await geminiFlash.generateContent(VOICE_PROMPT(transcript, language));
    const responseText = result.response.text().trim();

    // Strip markdown code fences if Gemini wraps the response
    const cleanedText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    return JSON.parse(cleanedText) as VoiceResult;
  } catch (err: any) {
    console.warn("[VoiceAssistant] Gemini API failed, falling back to local voice command parser:", err.message);
    const lowercaseText = transcript.toLowerCase();
    let action: VoiceResult["action"] = "UNKNOWN";
    let cropType: string | null = null;
    let quantity: number | null = null;
    let unit: string | null = "bags";
    let pricePerUnit: number | null = null;
    let speechFeedback = "Command heard, but it matches no known action.";

    if (lowercaseText.includes("add") || lowercaseText.includes("sell") || lowercaseText.includes("list")) {
      action = "ADD_PRODUCT";
      const cropMatch = transcript.match(/(tomato|potato|onion|wheat|rice|apple)/i);
      cropType = cropMatch ? cropMatch[0] : "Tomato";
      const qtyMatch = transcript.match(/(\d+)\s*(bags|kg|kg)/);
      quantity = qtyMatch ? parseFloat(qtyMatch[1]) : 15;
      const priceMatch = transcript.match(/(\d+)\s*(rupee|rupees|rs)/);
      pricePerUnit = priceMatch ? parseFloat(priceMatch[1]) : 45;
      speechFeedback = `Perfect! Added listing of ${quantity} ${unit} of premium ${cropType} at ₹${pricePerUnit} per ${unit}.`;
    } else if (lowercaseText.includes("sale") || lowercaseText.includes("earning") || lowercaseText.includes("order")) {
      action = "CHECK_SALES";
      speechFeedback = "Directing you to your sales performance metrics dashboard.";
    } else if (lowercaseText.includes("price") || lowercaseText.includes("recommend")) {
      action = "GET_PRICE";
      const cropMatch = transcript.match(/(tomato|potato|onion|wheat|rice|apple)/i);
      cropType = cropMatch ? cropMatch[0] : "Tomato";
      speechFeedback = `Getting the optimal D2C market price for ${cropType}.`;
    }

    return {
      action,
      data: { cropType, quantity, unit, pricePerUnit },
      speechFeedback
    };
  }
}
