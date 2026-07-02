# AgriNex AI: AI Services & Voice Assistant PRD

This document specifies the requirements, flows, schema mappings, and API specifications for the **AI Services, Gemini Integrations, Image Quality Grader, and Voice-to-Action Speech Assistant** component of AgriNex AI.

---

## 1. Feature Description & Scope

The AI Core powers decision-making, quality verification, pricing optimization, and speech accessibility for both farmers and consumers.

### Key Capabilities
- **Gemini API Integration**: Interface with Gemini Flash model to evaluate crop quality, compute retail price corridors, and parse natural language utterances.
- **AI Crop Quality Vision Analyzer**: Processes uploaded crop photographs, outputs a score grade ("A+" to "C"), details blemishes, estimates water percentage, and outlines expected shelf life.
- **Smart Price Recommendation Engine**: Dynamically calculates optimal direct-to-consumer listing prices based on wholesale pricing, grade status, geographic supply-demand data, and market metrics.
- **Natural Language Voice Assistant**: Web Speech API parser translating spoken utterances in regional languages (English, Hindi, Telugu, Tamil, Marathi, Kannada) into API command payloads.

---

## 2. User Journeys & Screen Specifications

### 2.1 AI Voice Assistant Interaction
1. **Trigger**: User clicks the floating purple Mic Button.
2. **Active Mode UI**: Concentric pulsing circles overlay the screen. A waveform bounces while listening.
3. **Speech Processing**:
   - Spoken language (e.g. Hindi) is captured by Web Speech API -> transcribed to text.
   - Text is sent to the Voice Parser API which classifies intent (e.g., `ADD_PRODUCT`).
   - The UI shows parsed values (e.g. title: "Potato", quantity: "50kg") and asks for user verification.
   - Speech feedback plays via Text-to-Speech (TTS): *“मैंने पच्चीस रुपये किलो पर पचास किलो आलू जोड़ दिया है। कृपया पुष्टि करें।”*

### 2.2 Crop Quality Grading
1. **Trigger**: Farmer captures crop image during product creation.
2. **Analysis Flow**: Image is sent to `POST /api/ai/grade-crop`.
3. **UI Display**: Detailed overlay pinpointing blemishes directly on the crop picture, accompanied by a checklist of quality metrics:
   - Freshness index.
   - Estimated water content percentage.
   - Shelf-life timeline countdown.

---

## 3. Database Schema Mapping

The AI Core results write directly to the Products table during product listing generation:

```sql
-- Products: Storing AI vision results and suggested prices
-- Columns modified: quality_grade, quality_report, recommended_price

/*
Example quality_report JSONB entry:
{
  "freshness": "Excellent",
  "blemishes": ["Tiny scrape on lower rind"],
  "waterContentPercentage": 82.1,
  "estimatedShelfLifeDays": 14,
  "justification": "Crop shows uniform coloring, firm skin texture, and minimal surface bruising."
}
*/
```

---

## 4. API Endpoints Specification

### 4.1 AI Crop Quality Analyzer (`POST /api/ai/grade-crop`)
- **Request Payload**: Multipart file upload (`image`), text parameter (`cropType`).
- **Processing**: Gemini Vision API prompt processing.
- **Response**:
```json
{
  "grade": "A+",
  "freshness": "Excellent",
  "blemishes": [],
  "waterContentPercentage": 85.00,
  "estimatedShelfLifeDays": 14,
  "justification": "No visual decay, firm structure, uniform color distribution."
}
```

### 4.2 AI Price Recommendation Engine (`POST /api/ai/recommend-price`)
- **Request Payload**:
```json
{
  "cropType": "Onion",
  "grade": "A",
  "location": "Nasik, Maharashtra",
  "baseWholesalePrice": 18.00
}
```
- **Response**:
```json
{
  "recommendedPrice": 21.50,
  "minPrice": 20.00,
  "maxPrice": 23.00,
  "marketSentiment": "High Demand",
  "rationale": "High export demand in Nasik allows listing 19% above wholesale, remaining 25% cheaper than retail."
}
```

### 4.3 Voice-to-Action Assistant (`POST /api/ai/voice-assistant`)
- **Request Payload**:
```json
{
  "transcript": "Add fifty kilograms of onions at twenty rupees per kilogram",
  "language": "en"
}
```
- **Response**:
```json
{
  "action": "ADD_PRODUCT",
  "data": {
    "cropType": "Onion",
    "quantity": 50.00,
    "unit": "kg",
    "pricePerUnit": 20.00
  },
  "speechFeedback": "Added 50 kilograms of onions at 20 rupees per kilogram to your inventory. Please confirm."
}
```
---
