const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

async function testAssistant() {
  try {
    const messages = [{ role: "user", text: "Hello, recommend some crops for dry soil." }];
    const currentPath = "/farmer/dashboard";
    const role = "farmer";
    const language = "en";

    const systemPrompt = "You are AgriNex AI, a premium conversational AI agricultural assistant.";

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt
    });

    const contents = messages.map((m) => ({
      role: m.role === "ai" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    console.log("Starting chat...");
    const chat = model.startChat({
      history: contents.slice(0, -1),
    });

    const lastMessage = contents[contents.length - 1]?.parts[0]?.text || "Hello";
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();
    console.log("Success! Assistant says:", text);
  } catch (err) {
    console.error("Assistant API Logic Failed:", err);
  }
}

testAssistant();
