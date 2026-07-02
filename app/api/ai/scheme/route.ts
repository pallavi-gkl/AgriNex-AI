import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const {
      state = "Haryana",
      cropTypes = ["Basmati Rice"],
      landHoldingAcres = 24.5,
      isOrganic = true,
      hasKisanCard = true,
    } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are an Indian government agriculture scheme expert. Recommend active schemes for a farmer in state: "${state}", crops: [${cropTypes.join(
      ", "
    )}], land size: ${landHoldingAcres} acres. Organic farmer: ${isOrganic}, has Kisan Credit Card: ${hasKisanCard}.
    Return exactly a JSON object matching this structure:
    {
      "schemes": [
        {
          "name": "Scheme Full Name",
          "benefit": "benefit summary",
          "eligibility": "eligibility criteria",
          "deadline": "application deadline or 'Ongoing'",
          "ministry": "Ministry Name",
          "how_to_apply": "step-by-step instructions",
          "estimated_benefit_inr": number (financial benefit in rupees)
        }
      ]
    }
    Format the response as raw JSON without any markdown formatting.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);

    return NextResponse.json(data);
  } catch (error: any) {
    console.warn("AI Scheme recommender API warning (using fallback data):", error.message);

    return NextResponse.json({
      schemes: [
        {
          name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
          benefit: "Direct income support of ₹6,000 per year in three equal installments directly into bank accounts.",
          eligibility: "All small and marginal landholding farmer families across India (up to 2 hectares).",
          deadline: "Ongoing",
          ministry: "Ministry of Agriculture & Farmers Welfare",
          how_to_apply: "Register on the PM-KISAN online portal or visit the nearest Common Service Centre (CSC) with Aadhaar and land records.",
          estimated_benefit_inr: 6000,
        },
        {
          name: "Paramparagat Krishi Vikas Yojana (PKVY)",
          benefit: "Financial assistance of ₹50,000 per hectare for 3 years, of which 60% (₹30,000) is given as incentive for organic farming inputs.",
          eligibility: "Farmers practicing organic farming forming clusters of 50 or more acres.",
          deadline: "July 31, 2026",
          ministry: "Ministry of Agriculture & Farmers Welfare",
          how_to_apply: "Apply through local Block Agriculture Officers or register on the PKVY organic portal.",
          estimated_benefit_inr: 50000,
        },
        {
          name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
          benefit: "Comprehensive crop insurance coverage against natural calamities at a very low premium: 2% for Kharif, 1.5% for Rabi.",
          eligibility: "All farmers growing notified crops in notified areas including tenant farmers.",
          deadline: "July 31, 2026 (for Kharif season)",
          ministry: "Ministry of Agriculture & Farmers Welfare",
          how_to_apply: "Apply online at PMFBY portal or link insurance with Kisan Credit Card (KCC) account at your bank.",
          estimated_benefit_inr: 25000,
        },
      ],
    });
  }
}
