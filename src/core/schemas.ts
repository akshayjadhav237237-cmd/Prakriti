import { z } from "zod";

// UserProfile schema
export const UserSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  city: z.string().min(1, { message: "City is required" }),
  transport_mode: z.string().min(1, { message: "Transport mode is required" }),
  diet_type: z.string().min(1, { message: "Diet preference is required" }),
  pet_type: z.string().optional(),
  pet_stage: z.enum(["egg", "baby", "toddler", "adolescent", "adult"]).optional(),
  weekly_budgets_completed: z.number().int().nonnegative().optional(),
  created_at: z.string().optional(),
  pebbles_balance: z.number().int().nonnegative().default(150),
}).passthrough();

// DailyLog schema
export const DailyLogSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format (YYYY-MM-DD)" }),
  envelope: z.string().refine((val): val is "transport" | "food" | "energy" | "lifestyle" =>
    ["transport", "food", "energy", "lifestyle"].includes(val), {
      message: "Envelope must be one of: transport, food, energy, lifestyle",
    }),
  activity: z.string().min(1, { message: "Activity description is required" }),
  co2_kg: z.number().nonnegative({ message: "Carbon footprint must be a positive number" }),
  source: z.string().refine((val): val is "manual" | "scan" =>
    ["manual", "scan"].includes(val), {
      message: "Source must be 'manual' or 'scan'",
    }),
  created_at: z.string().optional(),
}).passthrough();

// WeeklyBudget schema
export const WeeklyBudgetSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  week_of: z.string().min(1, { message: "Week identifier is required" }),
  transport_kg: z.number().nonnegative({ message: "Transport budget must be non-negative" }),
  food_kg: z.number().nonnegative({ message: "Food budget must be non-negative" }),
  energy_kg: z.number().nonnegative({ message: "Energy budget must be non-negative" }),
  lifestyle_kg: z.number().nonnegative({ message: "Lifestyle budget must be non-negative" }),
  transport_spent: z.number().nonnegative().default(0),
  food_spent: z.number().nonnegative().default(0),
  energy_spent: z.number().nonnegative().default(0),
  lifestyle_spent: z.number().nonnegative().default(0),
  created_at: z.string().optional(),
}).passthrough();

// Extracted Item schema for scan breakdown
export const ExtractedItemSchema = z.object({
  item: z.string(),
  category: z.string(),
  co2_kg: z.number().nonnegative(),
});

// ScanResult schema
export const ScanResultSchema = z.object({
  bill_type: z.string().default('other'),
  merchant: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  total_co2_kg: z.number().min(0),
  breakdown: z.array(z.object({
    item: z.string(),
    category: z.string(),
    co2_kg: z.number().min(0),
  })).default([]),
  envelope_category: z.enum([
    'transport', 'food', 'energy', 'lifestyle'
  ]).default('lifestyle'),
  confidence: z.enum([
    'high', 'medium', 'low'
  ]).default('medium'),
});

// ImplementationIntention sub-schema
export const ImplementationIntentionSchema = z.object({
  trigger: z.string().min(1),
  action: z.string().min(1),
});

// Insight schema
export const InsightSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  co2_saved_kg: z.number().nonnegative(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  implementation_intention: ImplementationIntentionSchema,
  envelope: z.enum(["transport", "food", "energy", "lifestyle"]),
});

// Root Insights Response wrapper schema
export const InsightsResponseSchema = z.object({
  insights: z.array(InsightSchema).length(3),
});

// OnboardingInput schema with custom errors
export const OnboardingInputSchema = z.object({
  city: z.string().refine((val): val is "Mumbai" | "Pune" | "Delhi" | "Bangalore" | "Chennai" | "Hyderabad" | "Other" =>
    ["Mumbai", "Pune", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Other"].includes(val), {
      message: "Please select a valid Indian city",
    }),
  transport: z.string().refine((val): val is "Petrol Scooter" | "Metro/Train" | "Cab" | "Walk/Cycle" | "Bus" | "Electric Scooter" =>
    ["Petrol Scooter", "Metro/Train", "Cab", "Walk/Cycle", "Bus", "Electric Scooter"].includes(val), {
      message: "Please select your primary transport mode",
    }),
  diet: z.string().refine((val): val is "Non-veg" | "Occasional meat" | "Vegetarian" | "Vegan" =>
    ["Non-veg", "Occasional meat", "Vegetarian", "Vegan"].includes(val), {
      message: "Please select your diet preference",
    }),
});

// TS Types exported from schemas
export type UserProfileType = z.infer<typeof UserSchema>;
export type DailyLogType = z.infer<typeof DailyLogSchema>;
export type WeeklyBudgetType = z.infer<typeof WeeklyBudgetSchema>;
export type ScanResultType = z.infer<typeof ScanResultSchema>;
export type InsightType = z.infer<typeof InsightSchema>;
export type OnboardingInputType = z.infer<typeof OnboardingInputSchema>;
