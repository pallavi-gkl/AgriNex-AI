/**
 * @fileoverview Gemini API client initialization for AgriNex AI.
 * Exports geminiFlash (text) and geminiVision (multimodal) model instances.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/** Gemini 1.5 Flash — fast text generation (price engine, voice assistant) */
export const geminiFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/** Gemini 1.5 Flash — multimodal vision (crop image analysis) */
export const geminiVision = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
