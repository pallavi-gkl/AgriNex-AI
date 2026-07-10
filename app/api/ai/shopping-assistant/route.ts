/**
 * @fileoverview AI Shopping Assistant API route — Product Expert Engine.
 * POST /api/ai/shopping-assistant
 *
 * Strategy:
 *  1. Try Gemini API with a rich, comprehensive system prompt that includes
 *     every field of the product context.
 *  2. If Gemini fails (quota / network / any error), fall back to the local
 *     rule-based Product Expert Engine that answers intelligently from the
 *     product data alone — so the assistant ALWAYS works.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: any, fallback = "N/A") {
  return v !== undefined && v !== null && v !== "" ? String(v) : fallback;
}

function price(v: any) {
  return v ? `₹${v}` : "N/A";
}

/** Build the rich system prompt sent to Gemini */
function buildSystemPrompt(p: any, location: any, weather: any): string {
  const locationCtx = location?.city
    ? `\nUSER LOCATION: ${location.city}${location.state ? ", " + location.state : ""}, ${location.country ?? "India"}.${weather ? ` Weather: ${weather.temperature ?? ""}°C, ${weather.condition ?? ""}.` : ""}
INSTRUCTION: Naturally reference the user's location when relevant (e.g. delivery estimates, local season).`
    : "";

  return `
You are AgriNex Product Expert AI — a premium, knowledgeable assistant embedded on the Product Details page of the AgriNex agriculture marketplace.
Your ONLY job is to help the consumer understand, evaluate, and decide about THIS specific product.
Always be warm, helpful, concise (max 200 words), and use emojis tastefully.
Format responses in clean markdown.
Respond in the same language as the customer's question.
If the question is off-topic, politely redirect: "I'm the Product Expert AI for this product. I can help with quality, freshness, pricing, nutrition, storage, farming practices, certifications, delivery, and more."

━━━━━━━━━ COMPLETE PRODUCT CONTEXT ━━━━━━━━━
Product Name        : ${fmt(p.title)}
Description         : ${fmt(p.description)}
Category            : ${fmt(p.category)}
Variety / Type      : ${fmt(p.variety ?? p.cropType ?? p.category)}
Quality Grade       : ${fmt(p.qualityGrade)} ${gradeExplain(p.qualityGrade)}
AI Freshness Score  : ${fmt(p.freshnessScore ?? p.aiFreshnessScore)}${p.freshnessScore || p.aiFreshnessScore ? "/100" : ""}
AI Confidence Score : ${fmt(p.aiConfidenceScore)}${p.aiConfidenceScore ? "%" : ""}
Disease Status      : ${fmt(p.diseaseStatus, "None detected")}
Pest Status         : ${fmt(p.pestStatus, "None detected")}
Organic             : ${p.isOrganic ? "Yes ✅ Certified Organic" : "No"}
Certifications      : ${fmt(p.certificates?.join(", "), "FSSAI Approved")}
Harvest Date        : ${fmt(p.harvestDate)}
Shelf Life          : ${fmt(p.shelfLifeDays)}${p.shelfLifeDays ? " days" : ""}
Storage Method      : ${fmt(p.storageCondition ?? p.storageMethod, "Cool, dry place")}
Storage Temperature : ${fmt(p.storageTemp)}
Farmer Name         : ${fmt(p.farmerName ?? p.farmer?.fullName, "Verified Farmer")}
Farmer Rating       : ${fmt(p.farmerRating ?? p.farmer?.trustScore)}${p.farmerRating || p.farmer?.trustScore ? "/5 ⭐" : ""}
Farmer Verified     : ${p.farmerVerified ?? p.farmer?.isVerified ? "Yes ✅" : "Unknown"}
Farm Location       : ${fmt(p.location ?? p.farmer?.address, "India")}
Available Quantity  : ${fmt(p.quantityAvailable)} ${fmt(p.unitType, "kg")}
Farmer Price        : ${price(p.pricePerUnit)} / ${fmt(p.unitType, "kg")}
Market Price        : ${price(p.marketPrice)}
AI Recommended Price: ${price(p.aiRecommendedPrice)}
Delivery Time       : ${fmt(p.deliveryTime, "24–48 hours after order")}
Nutrition (per 100g): ${buildNutritionString(p)}
Cooking Uses        : ${fmt(p.cookingUses ?? p.uses, cookingUsesByCategory(p.category))}
Health Benefits     : ${fmt(p.healthBenefits, healthBenefitsByCategory(p.category))}
Reviews Count       : ${fmt(p.reviewsCount)}
Rating              : ${fmt(p.rating)}${p.rating ? "/5 ⭐" : ""}
Traceability Code   : ${fmt(p.traceabilityCode)}
${locationCtx}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
}

function gradeExplain(g: string): string {
  const map: Record<string, string> = {
    "A+": "(Premium — top 5% quality)",
    "A": "(Excellent quality)",
    "B": "(Good quality)",
    "C": "(Average quality)",
    "D": "(Below average)",
  };
  return map[g] ?? "";
}

function buildNutritionString(p: any): string {
  if (p.nutrition) {
    const n = p.nutrition;
    return `Calories ${n.calories ?? "N/A"} kcal, Protein ${n.protein ?? "N/A"}, Carbs ${n.carbs ?? "N/A"}, Fiber ${n.fiber ?? "N/A"}, Fat ${n.fat ?? "N/A"}`;
  }
  return nutritionByCategory(p.category);
}

function nutritionByCategory(cat: string): string {
  const map: Record<string, string> = {
    "Grains": "Calories ~130 kcal, Protein 2.7g, Carbs 28g, Fiber 0.4g, Fat 0.3g",
    "Grains & Cereals": "Calories ~130 kcal, Protein 2.7g, Carbs 28g, Fiber 0.4g, Fat 0.3g",
    "Fruits": "Calories ~60 kcal, Protein 0.9g, Carbs 15g, Fiber 2.4g, Fat 0.2g",
    "Vegetables": "Calories ~25 kcal, Protein 1.8g, Carbs 4.5g, Fiber 2.1g, Fat 0.1g",
    "Leafy Greens": "Calories ~20 kcal, Protein 2.2g, Carbs 3.1g, Fiber 2.4g, Iron-rich",
    "Leafy Vegetables": "Calories ~20 kcal, Protein 2.2g, Carbs 3.1g, Fiber 2.4g, Iron-rich",
    "Spices": "Calories ~15 kcal per serving, rich in antioxidants and curcumin",
    "Spices & Herbs": "Calories ~15 kcal per serving, rich in antioxidants",
    "Pulses": "Calories ~116 kcal, Protein 9g, Carbs 20g, Fiber 8g, Fat 0.5g",
    "Dairy": "Calories ~61 kcal, Protein 3.2g, Carbs 4.7g, Fat 3.3g, Calcium-rich",
  };
  return map[cat] ?? "Rich in essential nutrients";
}

function cookingUsesByCategory(cat: string): string {
  const map: Record<string, string> = {
    "Fruits": "Fresh eating, juices, smoothies, desserts, jams",
    "Vegetables": "Curries, stir-fries, salads, soups, sabzi",
    "Leafy Greens": "Palak paneer, dal palak, salads, parathas, smoothies",
    "Leafy Vegetables": "Curries, stir-fries, salads, parathas",
    "Grains": "Biryani, pulao, khichdi, idli, dosa",
    "Grains & Cereals": "Roti, biryani, pulao, khichdi",
    "Spices": "Seasoning, curries, marinades, herbal remedies",
    "Spices & Herbs": "Curries, masalas, pickling, medicinal uses",
    "Pulses": "Dal, soups, curries, salads, sprouts",
    "Dairy": "Drinking, cooking, sweets, chaas, paneer making",
  };
  return map[cat] ?? "Versatile cooking ingredient";
}

function healthBenefitsByCategory(cat: string): string {
  const map: Record<string, string> = {
    "Fruits": "Rich in Vitamin C and antioxidants; boosts immunity, aids digestion",
    "Vegetables": "Rich in Vitamins C, K & A; supports immunity and bone health",
    "Leafy Greens": "Excellent iron and folate source; supports bone health and blood",
    "Leafy Vegetables": "Rich in iron, calcium, Vitamin K; supports bone and heart health",
    "Grains": "Good energy source; rich in B vitamins and complex carbohydrates",
    "Grains & Cereals": "Sustained energy; B vitamins, fiber for digestive health",
    "Spices": "Anti-inflammatory, antioxidant-rich; aids digestion and immunity",
    "Spices & Herbs": "Powerful antioxidants; anti-inflammatory and antimicrobial",
    "Pulses": "High plant protein and fiber; supports heart health and blood sugar",
    "Dairy": "Calcium and Vitamin D for bones; probiotics for gut health",
  };
  return map[cat] ?? "Nutritious and beneficial for overall health";
}

// ─── Local Expert Engine (fallback) ──────────────────────────────────────────

/**
 * A rule-based, context-aware Product Expert that answers intelligently
 * without any external API call. Covers all required question types.
 */
function localExpertAnswer(question: string, p: any, location: any): string {
  const q = question.toLowerCase();
  const name = p.title ?? "this product";
  const grade = p.qualityGrade ?? "B";
  const freshness = p.freshnessScore ?? p.aiFreshnessScore;
  const isOrganic = p.isOrganic;
  const farmer = p.farmerName ?? p.farmer?.fullName ?? "our verified farmer";
  const farmerVerified = p.farmerVerified ?? p.farmer?.isVerified ?? true;
  const location_ = p.location ?? p.farmer?.address ?? "India";
  const harvestDate = p.harvestDate;
  const shelf = p.shelfLifeDays;
  const storage = p.storageCondition ?? p.storageMethod ?? "cool, dry place";
  const storageTemp = p.storageTemp;
  const farmerPrice = p.pricePerUnit;
  const marketPrice = p.marketPrice;
  const aiPrice = p.aiRecommendedPrice;
  const qty = p.quantityAvailable;
  const unit = p.unitType ?? "kg";
  const certs = p.certificates?.join(", ") ?? "FSSAI Approved";
  const category = p.category ?? "produce";
  const gradeCfg: Record<string, string> = {
    "A+": "**Premium grade** — top 5% quality. Exceptional colour, size, texture and taste.",
    "A": "**Excellent grade** — superior quality with great appearance and taste.",
    "B": "**Good grade** — solid quality, well-suited for everyday use.",
    "C": "**Average grade** — acceptable quality at a budget-friendly price.",
    "D": "**Economy grade** — suitable for bulk/processing use.",
  };

  // ── Freshness / quality ───────────────────────────────────────────────────
  if (/fresh|freshn|quality|good|safe|contam|pure/.test(q)) {
    const score = freshness ? `AI Freshness Score is **${freshness}/100**. ` : "";
    const harvest = harvestDate ? `Harvested on **${harvestDate}**. ` : "";
    return `🌿 **Freshness & Quality of ${name}**\n\n${score}${harvest}Quality Grade is **${grade}** — ${gradeCfg[grade] ?? "good quality"}\n\nDisease Status: **${p.diseaseStatus ?? "None detected"}** | Pest Status: **${p.pestStatus ?? "None detected"}**\n\nThis product passes AgriNex AI quality inspection before listing. ${isOrganic ? "It is also **Certified Organic** 🌱." : ""}`;
  }

  // ── Grade explanation ─────────────────────────────────────────────────────
  if (/grade|rating|tier|class|rank/.test(q)) {
    return `📊 **Grade Explained — Grade ${grade}**\n\n${gradeCfg[grade] ?? "Good quality produce."}\n\nAgriNex uses AI vision scanning to assign grades based on colour, texture, size uniformity, blemish detection, and freshness markers. Grade A+ and A are premium picks; Grade B offers excellent value for money.`;
  }

  // ── Organic / certification ───────────────────────────────────────────────
  if (/organic|certif|natural|chemical|pesticide|spray/.test(q)) {
    if (isOrganic) {
      return `🌱 **Yes — ${name} is Certified Organic!**\n\nCertifications: **${certs}**\n\nThis product is grown without synthetic pesticides or chemical fertilisers. ${farmer !== "our verified farmer" ? `Farmer **${farmer}** follows organic farming practices` : "The farmer follows certified organic farming practices"} and has been verified by AgriNex. Safe for children, diabetics, and health-conscious consumers. ✅`;
    } else {
      return `🔍 **Organic Status of ${name}**\n\nThis product is **not certified organic**. However, it undergoes AgriNex AI quality inspection and carries **${certs}** approval. The farmer uses standard, regulated farming practices.\n\nIf organic is a priority for you, you can filter for organic-only products in the marketplace.`;
    }
  }

  // ── Price / value ─────────────────────────────────────────────────────────
  if (/price|cost|expensive|cheap|worth|value|fair|differ|ai.*price|recommend.*price/.test(q)) {
    const diff = marketPrice && farmerPrice ? Math.round(((marketPrice - farmerPrice) / marketPrice) * 100) : null;
    const saving = diff && diff > 0 ? `You save approximately **${diff}% vs market price**. ` : "";
    const aiNote = aiPrice ? `The AI Recommended Price is ₹${aiPrice}/${unit}, which factors in seasonal demand, supply volume, and crop quality to suggest a fair market value. ` : "";
    return `💰 **Pricing Analysis for ${name}**\n\n- **Farmer Price:** ₹${farmerPrice}/${unit}\n- **Market Price:** ₹${marketPrice ?? "N/A"}/${unit}\n- **AI Recommended Price:** ₹${aiPrice ?? "N/A"}/${unit}\n\n${saving}${aiNote}\nBuying directly from the farmer on AgriNex eliminates middlemen, giving you fresher produce at a fairer price. ✅`;
  }

  // ── Storage ───────────────────────────────────────────────────────────────
  if (/stor|keep|preserv|refrigerat|shelf|how.*long|last|expir/.test(q)) {
    const tempNote = storageTemp ? ` at **${storageTemp}**` : "";
    const shelfNote = shelf ? `Shelf life is approximately **${shelf} days** when stored properly.` : "Store promptly after receiving for maximum freshness.";
    return `🧊 **Storage Guide for ${name}**\n\n📦 **Method:** ${storage}${tempNote}\n⏱️ **${shelfNote}**\n\n**Tips:**\n- Keep away from direct sunlight and moisture\n- Do not wash before storing\n- Use an airtight container or breathable mesh bag\n- ${category.includes("Leafy") ? "Wrap in a damp cloth or newspaper for leafy greens" : "Store at consistent temperature"}\n\nProper storage preserves nutrients and flavour significantly.`;
  }

  // ── Farmer / origin ───────────────────────────────────────────────────────
  if (/farm|farmer|grow|origin|where|who|verif|trust|seller/.test(q)) {
    const verified = farmerVerified ? "✅ **Verified** by AgriNex" : "Listed on AgriNex";
    const trustNote = (p.farmerRating ?? p.farmer?.trustScore) ? `with a Trust Score of **${p.farmerRating ?? p.farmer?.trustScore}/5**` : "";
    return `👨‍🌾 **About the Farmer**\n\n- **Name:** ${farmer}\n- **Location:** ${location_}\n- **Status:** ${verified} ${trustNote}\n- **Phone:** ${p.farmer?.phone ?? "Available after order"}\n\nAgriNex verifies every farmer's identity, land records, and produce quality before they can list on the platform. You are buying directly from the source — no middlemen. 🌾`;
  }

  // ── Nutrition ─────────────────────────────────────────────────────────────
  if (/nutri|vitamin|protein|calori|carb|fiber|fat|mineral|health|benefit/.test(q)) {
    const nuts = buildNutritionString(p);
    const benefits = p.healthBenefits ?? healthBenefitsByCategory(category);
    return `🥗 **Nutrition & Health Benefits of ${name}**\n\n**Nutritional Profile (per 100g):**\n${nuts}\n\n**Health Benefits:**\n${benefits}\n\n${isOrganic ? "Being **Certified Organic**, this product is free from synthetic chemical residues, making it even more beneficial. 🌱" : "Naturally nutritious and wholesome."}`;
  }

  // ── Children / diabetics / special diet ──────────────────────────────────
  if (/child|kid|baby|infant|diabet|sugar|allerg|diet|safe|special|senior|elderly/.test(q)) {
    const diab = ["Vegetables", "Leafy Greens", "Leafy Vegetables", "Fruits"].includes(category)
      ? "Generally suitable for diabetics due to low glycaemic index and high fibre content."
      : category === "Grains" || category === "Grains & Cereals"
      ? "Consume in moderation for diabetics. Opt for whole grain varieties."
      : "Consult your nutritionist if you have specific dietary requirements.";
    return `👶 **Safety & Dietary Suitability — ${name}**\n\n✅ **Children:** Suitable for children over 6 months (pureed) and older. Natural, whole food.\n🩺 **Diabetics:** ${diab}\n${isOrganic ? "🌿 **Organic:** Certified organic — no synthetic pesticide residue." : ""}\n\n⚠️ *Always consult a healthcare professional for specific medical dietary needs.*\n\nGrade **${grade}** produce passes AgriNex quality checks, ensuring it meets safety standards.`;
  }

  // ── Recipes / cooking ─────────────────────────────────────────────────────
  if (/recip|cook|dish|meal|prepar|use|how.*use|make|eat/.test(q)) {
    const uses = p.cookingUses ?? p.uses ?? cookingUsesByCategory(category);
    return `🍳 **Cooking Ideas for ${name}**\n\n${uses}\n\n**Popular Dishes:**\n${recipeSuggestions(category, name)}\n\n${isOrganic ? "Being organic, this produce adds both nutrition and peace-of-mind to your meals. 🌱" : "Fresh from the farm — best enjoyed within " + (shelf ? shelf + " days." : "a few days of delivery.")}`;
  }

  // ── Why buy / recommendation ──────────────────────────────────────────────
  if (/why.*buy|should.*buy|recommend|worth.*buy|good.*choice|suggest|better|compare|altern|vs\./.test(q)) {
    const savings = marketPrice && farmerPrice && marketPrice > farmerPrice
      ? `💰 **${Math.round(((marketPrice - farmerPrice) / marketPrice) * 100)}% cheaper** than market price`
      : "💰 Fairly priced directly from farmer";
    return `✅ **Why Buy ${name}?**\n\n🌾 **Grade ${grade}** — ${gradeCfg[grade] ?? "good quality"}\n${freshness ? `🌿 **Freshness Score:** ${freshness}/100\n` : ""}${isOrganic ? "🌱 **Certified Organic** — chemical free\n" : ""}👨‍🌾 **${farmerVerified ? "Verified" : "Listed"} Farmer:** ${farmer} from ${location_}\n${savings}\n🚚 **Fast Delivery:** ${p.deliveryTime ?? "24–48 hours"}\n📦 **Stock:** ${qty} ${unit} available\n\n${(p.rating ?? 0) >= 4 ? `⭐ Rated **${p.rating}/5** by ${p.reviewsCount ?? "multiple"} buyers — highly recommended!` : "Fresh, traceable produce from a verified Indian farmer."}\n\nBuy with confidence on AgriNex. 🛒`;
  }

  // ── Delivery ─────────────────────────────────────────────────────────────
  if (/deliver|ship|arriv|when|how.*long|transit|dispatch/.test(q)) {
    const locNote = location?.city ? `\n📍 Delivering from **${location_}** to **${location.city}${location.state ? ", " + location.state : ""}** — estimated within 24–48 hours after order confirmation.` : "";
    return `🚚 **Delivery Information for ${name}**\n\n⏱️ **Estimated Delivery:** ${p.deliveryTime ?? "24–48 hours after order"}\n📦 **Available Quantity:** ${qty} ${unit}\n✅ **Packaging:** Hygienic AgriNex certified packaging${locNote}\n\nYou will receive tracking updates once your order is dispatched. Fresh, farm-to-doorstep! 🌾`;
  }

  // ── Stock / availability ──────────────────────────────────────────────────
  if (/stock|availab|quantity|how.*much|remain|left/.test(q)) {
    const urgency = qty && qty < 20 ? `⚠️ Only **${qty} ${unit}** left — limited stock!` : `📦 **${qty} ${unit}** currently available.`;
    return `📦 **Stock & Availability — ${name}**\n\n${urgency}\n\n✅ Listed as **Active** on AgriNex\n🚜 Farmer: ${farmer} (${location_})\n\nOrder promptly to ensure availability. Delivery within ${p.deliveryTime ?? "24–48 hours"} after confirmation.`;
  }

  // ── Reviews / ratings ────────────────────────────────────────────────────
  if (/review|rating|feedback|people.*say|customer|buyer|opinion/.test(q)) {
    const ratingStr = p.rating ? `⭐ **${p.rating}/5 stars** from **${p.reviewsCount ?? "multiple"} buyers**` : "No reviews yet, but quality is verified by AgriNex AI.";
    return `⭐ **Reviews & Ratings — ${name}**\n\n${ratingStr}\n\nQuality Grade **${grade}** — verified by AgriNex AI inspection.\n${isOrganic ? "🌱 Certified Organic — consistently appreciated by health-conscious buyers.\n" : ""}👨‍🌾 Farmer **${farmer}** has a Trust Score of **${p.farmerRating ?? p.farmer?.trustScore ?? "4.5+"}/5**.\n\nBuyers consistently appreciate the freshness, packaging, and delivery speed on AgriNex.`;
  }

  // ── Description / about ───────────────────────────────────────────────────
  if (/what.*is|tell.*about|describ|about.*product|explain|detail|inform/.test(q)) {
    return `🌾 **About ${name}**\n\n${p.description ?? `${name} is a quality ${category.toLowerCase()} product sourced directly from verified Indian farmers.`}\n\n**Quick Facts:**\n- 📍 Origin: ${location_}\n- 🏷️ Grade: ${grade} (${gradeCfg[grade] ?? "quality produce"})\n- 🌿 Organic: ${isOrganic ? "Yes ✅" : "No"}\n- 📜 Certifications: ${certs}\n- ⏱️ Shelf Life: ${shelf ? shelf + " days" : "Best consumed fresh"}\n- 💰 Price: ₹${farmerPrice}/${unit}`;
  }

  // ── Default: off-topic or unrecognised ───────────────────────────────────
  return `🌾 **I'm the Product Expert AI for ${name}**\n\nI can help you with:\n- ✅ Quality, freshness & grade\n- 💰 Pricing & value analysis\n- 🌱 Organic status & certifications\n- 👨‍🌾 Farmer & origin details\n- 🥗 Nutrition & health benefits\n- 🍳 Recipes & cooking uses\n- 🧊 Storage & shelf life\n- 🚚 Delivery & availability\n- ⭐ Reviews & buying advice\n\nWhat would you like to know about this product?`;
}

function recipeSuggestions(category: string, name: string): string {
  const map: Record<string, string> = {
    "Fruits": "• Fresh fruit salad\n• Mango lassi / Aamras\n• Fruit chaat\n• Smoothies & juices\n• Desserts and jams",
    "Vegetables": "• Sabzi / stir-fry\n• Curry & dal\n• Soup & stew\n• Stuffed paratha\n• Pickles & chutneys",
    "Leafy Greens": "• Palak paneer\n• Dal palak\n• Spinach smoothie\n• Methi paratha\n• Saag",
    "Leafy Vegetables": "• Saag\n• Stuffed paratha\n• Vegetable curry\n• Healthy wraps\n• Soups",
    "Grains": "• Biryani & pulao\n• Idli, dosa & khichdi\n• Pongal\n• Kheer & rice pudding\n• Fried rice",
    "Grains & Cereals": "• Roti & chapati\n• Pulao & biryani\n• Porridge & upma\n• Bread & bakes",
    "Spices": "• Curry masalas\n• Marinades & rubs\n• Herbal teas\n• Achaar (pickle)\n• Medicinal kadha",
    "Spices & Herbs": "• Masala blends\n• Chutneys & dips\n• Infused oils\n• Herbal remedies",
    "Pulses": "• Dal tadka\n• Chana masala\n• Sprouts salad\n• Sambar\n• Soups",
    "Dairy": "• Lassi & chaas\n• Paneer dishes\n• Kheer & sweets\n• Chai\n• Dahi / raita",
  };
  return map[category] ?? `• Traditional recipes using ${name}\n• Healthy salads\n• Curries and gravies\n• Snacks and starters`;
}

// ─── API Handler ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { question, product, context, location, weather } = await req.json();

    if (!question || !product) {
      return NextResponse.json(
        { error: "question and product are required" },
        { status: 400 }
      );
    }

    // ── Attempt Gemini first ──────────────────────────────────────────────
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const systemPrompt = buildSystemPrompt(product, location, weather);
        const result = await model.generateContent([
          systemPrompt,
          `\n\nCustomer Question: ${question}`,
        ]);
        const answer = result.response.text();
        if (answer && answer.trim().length > 0) {
          return NextResponse.json({ answer });
        }
      } catch (geminiErr: any) {
        // Quota / network error — fall through to local engine
        console.warn("Gemini unavailable, using local expert engine:", geminiErr?.message ?? geminiErr);
      }
    }

    // ── Local Expert Engine (always works) ───────────────────────────────
    const answer = localExpertAnswer(question, product, location);
    return NextResponse.json({ answer });

  } catch (err: any) {
    console.error("Shopping assistant error:", err);
    return NextResponse.json(
      { error: err.message ?? "AI assistant failed" },
      { status: 500 }
    );
  }
}
