const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const key = process.env.GEMINI_API_KEY;
console.log("Using API Key:", key ? key.substring(0, 8) + "..." : "undefined");

async function test() {
  if (!key) {
    console.error("No Gemini API key found");
    return;
  }
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Hello, respond with 'OK' if you can read this.");
    console.log("Success! Response:", result.response.text());
  } catch (err) {
    console.error("Gemini API call failed:", err.message);
  }
}

test();
