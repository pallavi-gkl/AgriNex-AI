/**
 * @fileoverview AI Shopping Assistant API route.
 * POST /api/ai/shopping-assistant
 * Uses Gemini to answer consumer questions about a specific product.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(req: Request) {
  try {
    const { question, product, context } = await req.json();

    if (!question || !product) {
      return NextResponse.json(
        { error: "question and product are required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemContext = `
You are AgriNex AI, a premium agriculture marketplace shopping assistant for Indian consumers.
You help customers make informed decisions about buying fresh farm produce directly from verified Indian farmers.
Always be helpful, accurate, and conversational. Respond in the same language as the question.
Format your response in clean markdown with emojis for a premium feel.
Keep responses concise (max 200 words) and actionable.

PRODUCT INFORMATION:
- Name: ${product.title}
- Category: ${product.category}
- Price: ₹${product.pricePerUnit}/${product.unitType}
- AI Quality Grade: ${product.qualityGrade || "N/A"}
- Freshness Score: ${product.freshnessScore || "N/A"}
- Farmer: ${product.farmerName || "Verified Farmer"}
- Farm Location: ${product.location || "India"}
- Organic: ${product.isOrganic ? "Yes ✓" : "No"}
- Available: ${product.quantityAvailable} ${product.unitType}
- Harvest Date: ${product.harvestDate || "Recent"}
- Shelf Life: ${product.shelfLifeDays || "N/A"} days
- Certificates: ${product.certificates?.join(", ") || "FSSAI Approved"}
- Market Price: ₹${product.marketPrice || product.pricePerUnit}/${product.unitType}
- AI Recommended Price: ₹${product.aiRecommendedPrice || product.pricePerUnit}/${product.unitType}

ADDITIONAL CONTEXT:
${context || "No additional context provided."}
    `.trim();

    const result = await model.generateContent([
      systemContext,
      `\n\nCustomer Question: ${question}`,
    ]);
    const response = result.response.text();

    return NextResponse.json({ answer: response });
  } catch (err: any) {
    console.error("Shopping assistant error:", err);
    return NextResponse.json(
      { error: err.message ?? "AI assistant failed" },
      { status: 500 }
    );
  }
}
