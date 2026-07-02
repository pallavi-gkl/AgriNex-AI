import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(req: Request) {
  try {
    const { messages, currentPath, role, language } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    // Determine context based on role and path
    let contextInstructions = "";
    if (role === "farmer") {
      contextInstructions = `
The user is a FARMER. You should help them with:
- Crop disease diagnosis and pest identification
- Fertilizer recommendations and irrigation planning
- Weather-based farming advice and yield predictions
- Market price analysis and recommendations on the best time to sell
- Government scheme guidance and crop rotation suggestions
- Inventory management and product listing assistance
      `;
    } else if (role === "consumer" || role === "all") {
      contextInstructions = `
The user is a CUSTOMER. You should help them with:
- Product recommendations and natural-language product search
- Nutrition facts, calories, and recipe suggestions
- Comparing products and checking price fairness/freshness
- Delivery information, order tracking, and wishlist suggestions
- Seasonal buying advice and sustainable purchasing recommendations
      `;
    } else if (role === "admin") {
      contextInstructions = `
The user is an ADMINISTRATOR. You should help them with:
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

    const systemPrompt = `
You are AgriNex AI, a premium conversational AI agricultural assistant.
You help farmers, consumers, and administrators with intelligent, real-time advice.

CURRENT CONTEXT:
${contextInstructions}

PAGE CONTEXT:
${pageInstructions}

LANGUAGE INSTRUCTIONS:
- The user's selected language is: "${language || "en"}".
- ALWAYS reply in the requested language (English, Hindi, Telugu, Tamil, Kannada, Marathi).
- Use natural, fluent phrasing for the region.

formatting GUIDELINES:
- Respond in clean, elegant markdown with appropriate emojis.
- Keep replies concise, friendly, and actionable. Max 150-200 words.
- Never mention internal technical details.
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

    // Start chat with history
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
