/**
 * @fileoverview AI Image Search API route.
 * POST /api/ai/image-search
 * Accepts a base64 image, uses Gemini Vision to identify the crop,
 * then returns search suggestions for the marketplace.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "imageBase64 is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType,
        },
      },
      `You are an expert in Indian agriculture and food produce.
Look at this image and identify what crop, fruit, vegetable, or agricultural product is shown.
Respond in this exact JSON format:
{
  "cropName": "English name of the crop",
  "localName": "Indian/Hindi/regional name if applicable",
  "category": "one of: Vegetables, Fruits, Grains, Pulses, Spices, Leafy Greens, Dairy, Others",
  "searchQuery": "best search term to find this in a marketplace",
  "confidence": number between 0-100,
  "description": "one sentence about this crop",
  "priceRange": "estimated Indian market price range per kg"
}
If you cannot identify a crop/agricultural product, return: {"error": "not a recognizable crop"}`,
    ]);

    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse AI response" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Image search error:", err);
    return NextResponse.json({ error: err.message ?? "Image search failed" }, { status: 500 });
  }
}
