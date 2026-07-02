const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

async function test() {
  if (!key) {
    console.error("No Gemini API key found");
    return;
  }
  try {
    const genAI = new GoogleGenerativeAI(key);
    // Since GoogleGenerativeAI library doesn't expose ListModels directly on its client,
    // let's fetch it via https using fetch
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log("Available models:", data.models ? data.models.map(m => m.name) : data);
  } catch (err) {
    console.error("Failed to list models:", err.message);
  }
}

test();
