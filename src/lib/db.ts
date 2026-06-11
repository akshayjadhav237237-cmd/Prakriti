import { createClient } from "@supabase/supabase-js";

// Safe creation of Supabase client (only if environment variables are set)
const supabaseUrl = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL : "";
const supabaseAnonKey = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : "";

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export interface UserProfile {
  id: string;
  city: string;
  transport: string;
  diet: string;
  pebbles: number;
  created_at: string;
}

export interface BudgetEnvelope {
  transport: number;
  food: number;
  energy: number;
  lifestyle: number;
  transport_spent: number;
  food_spent: number;
  energy_spent: number;
  lifestyle_spent: number;
}

// Helper to generate UUID-like string
const generateUUID = () => {
  return "user_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export async function saveUserProfile(profile: Omit<UserProfile, "id" | "created_at" | "pebbles">): Promise<UserProfile> {
  const newId = generateUUID();
  const fullProfile: UserProfile = {
    id: newId,
    city: profile.city,
    transport: profile.transport,
    diet: profile.diet,
    pebbles: 150, // Default starting pebbles
    created_at: new Date().toISOString()
  };

  // 1. Save to LocalStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("prakriti_user_id", fullProfile.id);
    localStorage.setItem("prakriti_city", fullProfile.city);
    localStorage.setItem("prakriti_transport", fullProfile.transport);
    localStorage.setItem("prakriti_diet", fullProfile.diet);
    localStorage.setItem("prakriti_pebbles", fullProfile.pebbles.toString());
    localStorage.setItem("prakriti_user_profile", JSON.stringify(fullProfile));
    
    // Initialize default carbon budget envelopes (spent/remaining)
    // Typical monthly budget is partitioned weekly (e.g. 50 kg CO2 / week)
    // Envelopes: Transport (15 kg), Food (12 kg), Energy (15 kg), Lifestyle (8 kg)
    const initialBudget: BudgetEnvelope = {
      transport: 15,
      food: 12,
      energy: 15,
      lifestyle: 8,
      transport_spent: 3.5, // initial spent so the progress bar has some values
      food_spent: 2.1,
      energy_spent: 4.8,
      lifestyle_spent: 1.5,
    };
    localStorage.setItem("prakriti_budget", JSON.stringify(initialBudget));
    
    // Dispatch custom event to notify Navbar and other client components
    window.dispatchEvent(new Event("prakriti_state_changed"));
  }

  // 2. Try Supabase if configured
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            id: fullProfile.id,
            city: fullProfile.city,
            transport: fullProfile.transport,
            diet: fullProfile.diet,
            pebbles: fullProfile.pebbles
          }
        ])
        .select();

      if (error) {
        console.warn("Supabase insert error, fell back to local storage:", error.message);
      } else if (data && data[0]) {
        return data[0] as UserProfile;
      }
    } catch (e) {
      console.warn("Supabase query failed, using local storage instead.", e);
    }
  }

  return fullProfile;
}

export function getBudget(): BudgetEnvelope {
  const defaultBudget: BudgetEnvelope = {
    transport: 15,
    food: 12,
    energy: 15,
    lifestyle: 8,
    transport_spent: 3.5,
    food_spent: 2.1,
    energy_spent: 4.8,
    lifestyle_spent: 1.5,
  };

  if (typeof window === "undefined") return defaultBudget;
  const stored = localStorage.getItem("prakriti_budget");
  if (!stored) {
    localStorage.setItem("prakriti_budget", JSON.stringify(defaultBudget));
    return defaultBudget;
  }
  try {
    return JSON.parse(stored) as BudgetEnvelope;
  } catch {
    return defaultBudget;
  }
}

export function updateBudget(budget: BudgetEnvelope) {
  if (typeof window !== "undefined") {
    localStorage.setItem("prakriti_budget", JSON.stringify(budget));
    window.dispatchEvent(new Event("prakriti_state_changed"));
  }
}
