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
        co2_saved_kg: 14.5,
        difficulty: "Medium",
        implementation_intention: {
          trigger: "commuting to the Bandra office",
          action: "take the Mumbai Local instead of an Ola cab"
        },
        envelope: "transport"
      },
      {
        title: "Try a Plant-Based Swiggy Day",
        body: "Heavy non-vegetarian or meat meals have a high carbon index. Choosing a vegetarian Thali or a Vegan Bowl for lunch just twice a week reduces your weekly food emissions by over 10 kg CO₂e.",
        co2_saved_kg: 4.8,
        difficulty: "Easy",
        implementation_intention: {
          trigger: "ordering lunch on Swiggy",
          action: "choose a Vegan Bowl or Veg Thali instead of mutton or chicken"
        },
        envelope: "food"
      },
      {
        title: "Optimize AC Temperature",
        body: "Air conditioning makes up a large portion of home energy. Setting your AC to 26°C rather than 21°C saves approximately 30% on electricity consumption and prevents grid-coal emissions.",
        co2_saved_kg: 9.2,
        difficulty: "Easy",
        implementation_intention: {
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
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to mock insights.");
      // Small artificial delay to simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (body.prompt) {
        return NextResponse.json({
          success: true,
          mocked: true,
          data: [
            { tip: "Use the Mumbai Metro instead of an auto-rickshaw for daily office trips.", saving: "~4.5 kg/wk", category: "transport" },
            { tip: "Opt for induction cooking instead of LPG cylinders to save cooking emissions.", saving: "~2.8 kg/wk", category: "energy" },
            { tip: "Commit to one plant-based day a week on Swiggy or Zomato.", saving: "~1.5 kg/wk", category: "food" }
          ]
        });
      }
      return NextResponse.json({
        success: true,
        mocked: true,
        data: getMockInsights()
      });
    }

    let prompt = "";
    if (body.prompt) {
      prompt = body.prompt;
    } else {
      // Validate incoming logs payload
      const logsRes = z.array(DailyLogSchema).safeParse(body.logs || []);
      if (!logsRes.success) {
        return NextResponse.json(
          { error: "Invalid logs payload: " + logsRes.error.message },
          { status: 400 }
        );
      }
      const logs = logsRes.data;
      prompt = `You are Prakriti, India's carbon budgeting companion.
Analyze the user's daily activity logs of carbon emissions:
${JSON.stringify(logs, null, 2)}

Provide exactly 3 specific, actionable, India-context-aware insights to help them reduce their carbon footprint.
Each insight MUST have:
1. "title": Short title (e.g. "Ride the Mumbai Local")
2. "body": Context and why they should do it, citing relevant emissions savings in kg CO2e.
3. "co2_saved_kg": The estimated carbon savings per week if they implement this (positive number).
4. "difficulty": "Easy", "Medium", or "Hard".
5. "implementation_intention": An object with:
   - "trigger": The behavioral trigger (e.g. "commuting to the Bandra office")
   - "action": The specific replacement action (e.g. "take the Mumbai Local train instead of a private cab")
6. "envelope": "transport", "food", "energy", or "lifestyle".

Respond ONLY with a valid JSON object matching this schema:
{
  "insights": [
    {
      "title": string,
      "body": string,
      "co2_saved_kg": number,
      "difficulty": "Easy" | "Medium" | "Hard",
      "implementation_intention": {
        "trigger": string,
        "action": string
      },
      "envelope": "transport" | "food" | "energy" | "lifestyle"
    }
  ]
}
No markdown formatting, no backticks, just the raw JSON.`;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

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
      let validatedData = parsedData;

      if (!body.prompt) {
        // Validate insights response payload strictly using Zod InsightsResponseSchema
        validatedData = InsightsResponseSchema.parse(parsedData);
      }

      return NextResponse.json({
        success: true,
        mocked: false,
        data: validatedData
      });

    } catch (apiError: unknown) {
      console.error("Gemini API call failed, falling back to mock insights:", apiError);
      const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
      
      if (body.prompt) {
        return NextResponse.json({
          success: true,
          mocked: true,
          data: [
            { tip: "Use the Mumbai Metro instead of an auto-rickshaw for daily office trips.", saving: "~4.5 kg/wk", category: "transport" },
            { tip: "Opt for induction cooking instead of LPG cylinders to save cooking emissions.", saving: "~2.8 kg/wk", category: "energy" },
            { tip: "Commit to one plant-based day a week on Swiggy or Zomato.", saving: "~1.5 kg/wk", category: "food" }
          ],
          warning: errorMessage || "Gemini API call failed. Returned mock insights instead."
        });
      }
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

