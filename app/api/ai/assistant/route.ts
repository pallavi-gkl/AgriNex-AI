import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  te: "Telugu (తెలుగు)",
  ta: "Tamil (தமிழ்)",
  kn: "Kannada (ಕನ್ನಡ)",
  ml: "Malayalam (മലയാളം)",
};

export async function POST(req: Request) {
  try {
    const { messages, currentPath, role, language, location, weather } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const langCode = (language || "en").toLowerCase();
    const langName = LANGUAGE_NAMES[langCode] || "English";

    // Determine context based on role and path
    let contextInstructions = "";
    if (role === "farmer") {
      contextInstructions = `
The user is a FARMER. You should help them with:
- Crop disease diagnosis and pest identification
- Fertilizer recommendations and irrigation planning
- Weather-based farming advice and yield predictions
- Market price analysis and recommendations on the best time to sell
- Government scheme guidance (PM-KISAN, PMFBY, eNAM, etc.) and crop rotation suggestions
- Inventory management and product listing assistance on the AgriNex platform
      `;
    } else if (role === "consumer" || role === "all") {
      contextInstructions = `
The user is a CUSTOMER shopping on AgriNex. You should help them with:
- Product recommendations and natural-language product search
- Nutrition facts, calories, and recipe suggestions
- Comparing products and checking price fairness/freshness
- Delivery information, order tracking, and wishlist suggestions
- Seasonal buying advice and sustainable purchasing recommendations
      `;
    } else if (role === "admin") {
      contextInstructions = `
The user is an ADMINISTRATOR of AgriNex. You should help them with:
- Platform analytics and user management insights
- Fraud detection summaries and farmer verification assistance
- Complaint analysis and revenue analytics
- System health monitoring and business reports
      `;
    }

    // Determine current page details
    let pageInstructions = `The user is currently on the path: "${currentPath || "/"}".`;
    if (currentPath?.includes("/marketplace")) {
      pageInstructions += " They are browsing the marketplace. You can recommend fresh crops, suggest seasonal purchases, or guide their search.";
    } else if (currentPath?.includes("/farmer/dashboard")) {
      pageInstructions += " They are viewing the farmer dashboard. Discuss analytics, tasks, crop health, or sales trends.";
    } else if (currentPath?.includes("/farmer/inventory")) {
      pageInstructions += " They are in their inventory. Suggest stock level actions, pricing changes, or grading analysis.";
    } else if (currentPath?.includes("/consumer/dashboard")) {
      pageInstructions += " They are viewing their customer dashboard. Talk about savings, points, active orders, or personalized recommendations.";
    } else if (currentPath?.includes("/orders")) {
      pageInstructions += " They are viewing their orders page. Help them track order states or write reviews.";
    }

    let locationInstructions = "";
    if (location && location.city) {
      locationInstructions = `
LOCATION & WEATHER CONTEXT:
- Saved Village/City: ${location.city}
- State: ${location.state || "N/A"}
- Country: ${location.country || "India"}
- Geolocation Coordinates: Lat ${location.latitude || "N/A"}, Lng ${location.longitude || "N/A"}
${weather ? `- Current Weather: ${weather.condition || "N/A"} (${weather.temperature}°C, ${weather.humidity || "N/A"}% Humidity, ${weather.wind_speed || "N/A"} km/h Wind)` : ""}

INSTRUCTION: You MUST automatically adapt all agricultural (crop recommendations, disease guidance, fertilizer recommendations, irrigation advice, weather-based advice, gov schemes) and consumer (delivery estimates, nearby produce availability, local pricing) recommendations to this saved location. Refer to this location and weather naturally in your response (e.g. "Based on your saved location in Pune, Maharashtra...") instead of asking the user for their location.
`;
    }

    const systemPrompt = `
You are AgriNex AI, a premium conversational AI agricultural assistant embedded in the AgriNex platform — an AI-powered marketplace connecting Indian farmers directly with consumers.

SCOPE RESTRICTION (CRITICAL):
- You ONLY answer questions related to agriculture, farming, food, crop science, weather (as it relates to farming), nutrition, market prices for agricultural products, government agricultural schemes, the AgriNex platform features, and anything relevant to the farming-to-consumer supply chain.
- If a user asks a question UNRELATED to agriculture, food, farming, or the AgriNex platform, politely decline and redirect them. Say something like: "I am specialized in agriculture and the AgriNex platform. I can help you with crop advice, market prices, product recommendations, or platform features."
- NEVER answer questions about politics, entertainment, sports, or general knowledge unrelated to agriculture.

CURRENT CONTEXT:
${contextInstructions}

PAGE CONTEXT:
${pageInstructions}

${locationInstructions}

LANGUAGE INSTRUCTIONS (CRITICAL):
- The user's selected language is: "${langCode}" (${langName}).
- YOU MUST WRITE YOUR ENTIRE RESPONSE in ${langName}.
- Do NOT mix in English words unless they are proper nouns, scientific crop names, or brand names (e.g., "AgriNex", "PM-KISAN").
- Use natural, fluent, region-appropriate phrasing in the selected language.
- If the language is Hindi, use Devanagari script. If Telugu, use Telugu script. If Tamil, use Tamil script. If Kannada, use Kannada script. If Malayalam, use Malayalam script.

RESPONSE FORMAT:
- Respond in clean, elegant markdown with appropriate emojis.
- Keep replies concise, friendly, and actionable. Max 150–200 words unless detail is essential.
- Never mention internal technical details, API keys, or database references.
    `.trim();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    // Convert message history to Gemini format
    const contents = messages.map((m: any) => ({
      role: m.role === "ai" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    // Start chat with history (all but last message)
    const chat = model.startChat({
      history: contents.slice(0, -1),
    });

    const lastMessage = contents[contents.length - 1]?.parts[0]?.text || "Hello";
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    return NextResponse.json({ answer: text });
  } catch (err: any) {
    console.error("General assistant error:", err);
    return NextResponse.json(
      { error: err.message ?? "Assistant service failed" },
      { status: 500 }
    );
  }
}
