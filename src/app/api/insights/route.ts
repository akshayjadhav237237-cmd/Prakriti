import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { DailyLogSchema, InsightsResponseSchema } from "@/core/schemas";

export const dynamic = "force-dynamic";

// Helper to clean and parse JSON response from Gemini
function cleanAndParseJson(text: string) {
  try {
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/```$/, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini text output:", text, e);
    throw new Error("Invalid JSON returned from Gemini");
  }
}

// Generate realistic mock insights as fallback
function getMockInsights() {
  return {
    insights: [
      {
        title: "Ride the Mumbai Local",
        body: "Your transport footprint shows private transit logs. Switching to the Mumbai Local train for Bandra or South Mumbai commutes reduces emissions from 150g/km to just 6g/km, while beating the traffic!",
        co2SavingsKg: 14.5,
        difficulty: "Medium",
        implementationIntention: {
          trigger: "commuting to the Bandra office",
          action: "take the Mumbai Local instead of an Ola cab"
        },
        envelope: "transport"
      },
      {
        title: "Try a Plant-Based Swiggy Day",
        body: "Heavy non-vegetarian or meat meals have a high carbon index. Choosing a vegetarian Thali or a Vegan Bowl for lunch just twice a week reduces your weekly food emissions by over 10 kg CO₂e.",
        co2SavingsKg: 4.8,
        difficulty: "Easy",
        implementationIntention: {
          trigger: "ordering lunch on Swiggy",
          action: "choose a Vegan Bowl or Veg Thali instead of mutton or chicken"
        },
        envelope: "food"
      },
      {
        title: "Optimize AC Temperature",
        body: "Air conditioning makes up a large portion of home energy. Setting your AC to 26°C rather than 21°C saves approximately 30% on electricity consumption and prevents grid-coal emissions.",
        co2SavingsKg: 9.2,
        difficulty: "Easy",
        implementationIntention: {
          trigger: "turning on the bedroom AC",
          action: "set the temperature to 26°C and run a ceiling fan"
        },
        envelope: "energy"
      }
    ]
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    // Validate incoming logs payload
    const logsRes = z.array(DailyLogSchema).safeParse(body.logs || []);
    if (!logsRes.success) {
      return NextResponse.json(
        { error: "Invalid logs payload: " + logsRes.error.message },
        { status: 400 }
      );
    }
    const logs = logsRes.data;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to mock insights.");
      // Small artificial delay to simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return NextResponse.json({
        success: true,
        mocked: true,
        data: getMockInsights()
      });
    }

    try {
      let text = "";
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json"
          }
        });
        const result = await model.generateContent([prompt]);
        text = result.response.text();
      } catch (err: any) {
        console.warn("gemini-1.5-flash failed for insights, trying gemini-flash-latest. Error:", err.message);
        const model = genAI.getGenerativeModel({
          model: "gemini-flash-latest",
          generationConfig: {
            responseMimeType: "application/json"
          }
        });
        const result = await model.generateContent([prompt]);
        text = result.response.text();
      }
      
      const parsedData = cleanAndParseJson(text);
      // Validate insights response payload strictly using Zod InsightsResponseSchema
      const validatedData = InsightsResponseSchema.parse(parsedData);

      return NextResponse.json({
        success: true,
        mocked: false,
        data: validatedData
      });

    } catch (apiError: unknown) {
      console.error("Gemini API call failed, falling back to mock insights:", apiError);
      const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
      return NextResponse.json({
        success: true,
        mocked: true,
        data: getMockInsights(),
        warning: errorMessage || "Gemini API call failed. Returned mock insights instead."
      });
    }

  } catch (err: unknown) {
    console.error("Error in insights API route:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: errorMessage || "Failed to generate AI insights" },
      { status: 500 }
    );
  }
}
