import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const {
      cropName = "Alphonso Mango",
      grade = "A+",
      isOrganic = true,
      location = "Ratnagiri, Maharashtra",
      uniqueFeatures = ["GI Tagged", "Sun-ripened", "Fiberless sweet pulp"],
    } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a copywriter for agricultural eCommerce products. Create a high-converting listing for crop: "${cropName}", grade: "${grade}", organic: ${isOrganic}, location: "${location}", features: [${uniqueFeatures.join(
      ", "
    )}].
    Return exactly a JSON object matching this structure:
    {
      "title": "Optimized Premium Product Title",
      "description": "Engaging detailed product description (about 150 words)",
      "short_description": "Catchy 2-sentence summary",
      "usps": ["USP 1", "USP 2", "USP 3"],
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "suggested_price_range": "₹320 - ₹380 per Kg"
    }
    Format the response as raw JSON without any markdown formatting.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);

    return NextResponse.json(data);
  } catch (error: any) {
    console.warn("AI Product writer API warning (using fallback data):", error.message);

    return NextResponse.json({
      title: "Premium GI-Tagged Ratnagiri Alphonso Mangoes (Organic Grade A+)",
      description: "Indulge in the luscious taste of authentic, GI-tagged Alphonso Mangoes (Hapus) direct from the sun-drenched orchards of Ratnagiri, Maharashtra. Hand-picked at peak maturity and naturally sun-ripened, these Grade A+ mangoes boast a rich golden hue, zero fiber, and an incredibly sweet, aromatic pulp. Grown using 100% organic composts and sustainable farming methods, they offer unparalleled purity and flavor. Ideal for premium tables, direct consumption, or high-end culinary creation.",
      short_description: "Authentic, GI-tagged Ratnagiri Alphonso Hapus mangoes. Naturally sun-ripened, organic, fiberless pulp, Grade A+ export quality.",
      usps: [
        "100% Genuine GI-Tagged Ratnagiri Hapus",
        "Naturally Sun-Ripened (Chemical Free)",
        "Certified Organic Farming Practices",
      ],
      keywords: ["Ratnagiri Alphonso Mango", "Hapus Mango Buy Online", "Organic Alphonso Mangoes", "Premium Grade A+ Hapus"],
      suggested_price_range: "₹340 - ₹390 per Kg",
    });
  }
}
