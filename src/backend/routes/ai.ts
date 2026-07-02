/**
 * @fileoverview AI routes for AgriNex AI — Phase 4 (Real Gemini API).
 *
 * Routes:
 *   POST /api/ai/grade-crop        — Gemini Vision crop quality analysis
 *   POST /api/ai/recommend-price   — Gemini Flash price recommendation
 *   POST /api/ai/voice-assistant   — Gemini Flash voice command parsing
 *
 * Rate limited: 10 requests/minute per IP on all routes.
 */
import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import sharp from "sharp";
import { upload } from "../middleware/upload.middleware";
import { gradeCrop } from "../ai/cropGrader";
import { getRecommendedPrice } from "../ai/priceEngine";
import { parseVoiceCommand } from "../ai/voiceAssistant";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiting — 10 requests/minute on all /api/ai/* routes
// ─────────────────────────────────────────────────────────────────────────────
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many AI requests. Please wait a moment before trying again.",
    retryAfterSeconds: 60,
  },
});

router.use(aiRateLimiter);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/grade-crop
// Accepts multipart/form-data: image file + cropType field.
// Compresses image to max 800×800 with sharp, then sends to Gemini Vision.
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/grade-crop",
  upload.single("image"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { cropType } = req.body;
      const file = req.file;

      if (!file || !cropType) {
        res.status(400).json({ error: "Image and cropType are required" });
        return;
      }

      // Compress and resize with sharp — max 800×800, keep aspect ratio
      const compressedBuffer = await sharp(file.buffer)
        .resize(800, 800, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      const gradeResult = await gradeCrop(compressedBuffer, "image/jpeg", cropType);

      // Also compute a recommended price based on the grade
      let recommendedPrice: number | null = null;
      let rationale: string | null = null;
      try {
        const priceResult = await getRecommendedPrice({
          cropType,
          grade: gradeResult.grade,
          location: "India",
          baseWholesalePrice: 20,
        });
        recommendedPrice = priceResult.recommendedPrice;
        rationale = priceResult.rationale;
      } catch (priceErr) {
        console.error("[AI] Price recommendation failed (non-blocking):", priceErr);
      }

      res.json({
        ...gradeResult,
        recommendedPrice: recommendedPrice ?? 0,
        rationale: rationale ?? "",
      });
    } catch (err: any) {
      console.error("[AI] grade-crop error:", err.message);
      res.status(500).json({ error: "AI crop grading failed. Please try again." });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/recommend-price
// Body: { cropType, grade, location, baseWholesalePrice }
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/recommend-price",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { cropType, grade, location, baseWholesalePrice } = req.body;

      if (!cropType) {
        res.status(400).json({ error: "cropType is required" });
        return;
      }

      const result = await getRecommendedPrice({
        cropType,
        grade: grade ?? "A",
        location: location ?? "India",
        baseWholesalePrice: baseWholesalePrice ?? 20,
      });

      res.json(result);
    } catch (err: any) {
      console.error("[AI] recommend-price error:", err.message);
      res.status(500).json({ error: "AI price recommendation failed. Please try again." });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/voice-assistant
// Body: { transcript, language }
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/voice-assistant",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { transcript, language = "en" } = req.body;

      if (!transcript) {
        res.status(400).json({ error: "transcript is required" });
        return;
      }

      const result = await parseVoiceCommand(transcript, language);
      res.json(result);
    } catch (err: any) {
      console.error("[AI] voice-assistant error:", err.message);
      res.status(500).json({ error: "Voice command processing failed. Please try again." });
    }
  }
);

export default router;
