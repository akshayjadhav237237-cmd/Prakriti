import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScanResultSchema } from "@/core/schemas";

export const dynamic = "force-dynamic";

// Helper to clean and parse JSON response from Gemini
function cleanAndParseJson(text: string) {
  try {
    const clean = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    try {
      return JSON.parse(clean);
    } catch (innerErr) {
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON in response: " + text);
      }
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e: any) {
    console.error("Failed to parse JSON from Gemini text output:", text, e);
    throw new Error("Failed to parse Gemini response: " + e.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // Return 500 error with exact message if API key is missing
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { imageBase64, mimeType } = body;

    console.log('1. API Key present:', !!apiKey);
    console.log('2. Image received:', !!imageBase64);
    console.log('3. MimeType:', mimeType);

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Missing imageBase64 parameter in the request body." },
        { status: 400 }
      );
    }

    if (!mimeType) {
      return NextResponse.json(
        { error: "Missing mimeType parameter in the request body." },
        { status: 400 }
      );
    }

    // Strip the data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    let base64Data = cleanBase64;
    let actualMimeType = mimeType;
    if (base64Data.startsWith("data:")) {
      const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        actualMimeType = match[1];
        base64Data = match[2];
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `You are a carbon accounting engine for India. Analyze this image of an Indian receipt or utility bill. Extract items and map to carbon emissions.

For ELECTRICITY BILLS (MSEB/BESCOM/Tata Power): Extract billing period and net kWh consumed. Calculate: kWh × 0.710 = kg CO2.

For PETROL SLIPS: Extract liters and fuel type. Calculate: liters × 2.31 (petrol) or 2.68 (diesel) = kg CO2.

For GROCERY/FOOD RECEIPTS: Extract each food item. Apply these factors per kg: dairy=1.5, red_meat=12.0, chicken=3.0, fresh_produce=0.2, processed_grains=0.6, packaged_snacks=1.2.
Recognize Indian items: Paneer→dairy, Ghee→dairy, Atta→processed_grains, Dahi→dairy, Mutton→red_meat.

For SWIGGY/ZOMATO: Extract items ordered. Add 0.18 kg for delivery. Add 0.05 kg if packaging charge present.

Return ONLY valid JSON, no markdown:
{
  "bill_type": string,
  "merchant": string,
  "date": string,
  "total_co2_kg": number,
  "breakdown": [{"item": string, "category": string, "co2_kg": number}],
  "envelope_category": "transport"|"food"|"energy"|"lifestyle",
  "confidence": "high"|"medium"|"low"
}`;

    const modelNames = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-flash-latest",
      "gemini-pro-vision"
    ];

    let result, lastError;
    for (const name of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: name });
        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: actualMimeType,
              data: base64Data
            }
          }
        ]);
        console.log("Model that worked:", name);
        break;
      } catch (e: any) {
        console.log("Model failed:", name, e.message);
        lastError = e;
      }
    }
    if (!result) throw lastError;

    const text = result.response.text();
    console.log("4. Raw Gemini response:", text);

    const geminiJson = cleanAndParseJson(text);
    
    // Validate response payload strictly using ScanResultSchema (Zod)
    const validated = ScanResultSchema.parse(geminiJson);

    // Map the validated Gemini JSON to the schema expected by the frontend scan/page.tsx
    const mappedData = {
      merchant: validated.merchant || "Unknown Merchant",
      date: validated.date || new Date().toISOString().split("T")[0],
      category: validated.envelope_category || "lifestyle",
      totalAmount: 0.0, 
      co2eKg: validated.total_co2_kg || 0.0,
      items: validated.breakdown.map((item: any) => ({
        name: item.item || "Uncategorized Item",
        quantity: 1,
        unit: "item",
        co2eKg: item.co2_kg || 0.0
      })),
      confidence: validated.confidence === "high" ? 0.95 : validated.confidence === "medium" ? 0.75 : 0.45
    };

    return NextResponse.json({
      success: true,
      data: mappedData
    });

  } catch (err: any) {
    console.error("Error in real Gemini OCR API route:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process receipt image using Gemini" },
      { status: 500 }
    );
  }
}
