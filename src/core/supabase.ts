/**
 * Prakriti Carbon Platform - Supabase & Mock LocalStorage DB Engine
 * Implements a dual-engine database wrapper supporting both production Supabase
 * and a robust LocalStorage mock database. Pre-seeds Arjun Mumbai's demo data on first load.
 */

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { UserSchema, DailyLogSchema, WeeklyBudgetSchema } from "./schemas";

function validateUser(data: any): any {
  const res = UserSchema.safeParse(data);
  if (!res.success) {
    console.warn("Local storage User validation failed:", res.error);
  }
  return res.success ? res.data : data;
}

function validateWeeklyBudgets(data: any): any[] {
  const res = z.array(WeeklyBudgetSchema).safeParse(data);
  if (!res.success) {
    console.warn("Local storage WeeklyBudgets validation failed:", res.error);
  }
  return res.success ? res.data : data;
}

function validateDailyLogs(data: any): any[] {
  const res = z.array(DailyLogSchema).safeParse(data);
  if (!res.success) {
    console.warn("Local storage DailyLogs validation failed:", res.error);
  }
  return res.success ? res.data : data;
}

// --- ENVIRONMENT CONFIGURATION ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Supabase client instance. Will be null if credentials are not configured.
 */
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// --- SSR & NODE SAFE STORAGE FALLBACK ---
const memoryStorage: Record<string, string> = {};

export const mockStorage = {
  getItem(key: string): string | null {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memoryStorage[key] || null;
  },
  setItem(key: string, value: string): void {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    } else {
      memoryStorage[key] = value;
    }
  },
  removeItem(key: string): void {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    } else {
      delete memoryStorage[key];
    }
  },
  clear(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear();
    } else {
      for (const key in memoryStorage) {
        delete memoryStorage[key];
      }
    }
  }
};

// --- SCHEMA INTERFACES ---

export interface User {
  id: string;
  name: string;
  city: string;
  transport_mode: string;
  diet_type: string;
  pet_type: string;
  pet_stage: "egg" | "baby" | "toddler" | "adolescent" | "adult";
  pebbles_balance: number;
  pebbles: number; // compat
  weekly_budgets_completed: number; // compat
  weeklyBudgetsCompleted: number; // compat
  created_at: string;
}

export interface WeeklyBudget {
  id: string;
  user_id: string;
  userId: string; // compat
  week_of: string; // YYYY-MM-DD (start of the week, Monday)
  weekOf: string; // compat
  transport_kg: number;
  transport: number; // compat
  food_kg: number;
  food: number; // compat
  energy_kg: number;
  energy: number; // compat
  lifestyle_kg: number;
  lifestyle: number; // compat
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  envelope: "transport" | "food" | "energy" | "lifestyle";
  activity: string;
  co2_kg: number;
  source: "manual" | "scan";
  created_at: string;
}

export interface Intention {
  id: string;
  user_id: string;
  trigger: string;
  action: string;
  envelope: "transport" | "food" | "energy" | "lifestyle";
  active: boolean;
  created_at: string;
}

export interface Adventure {
  id: string;
  user_id: string;
  userId: string; // compat
  started_at: string; // YYYY-MM-DD or ISO
  startedAt: string; // compat
  returns_at: string; // YYYY-MM-DD or ISO
  returnsAt: string; // compat
  completed: boolean;
  claimed: boolean; // compat
  reward_pebbles: number;
  reward: number; // compat
}

// --- UTILITY DATE FUNCTIONS FOR DYNAMIC SEEDING ---

/**
 * Gets the Monday of the week for a given date.
 */
export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  // Adjust so Monday is the start of the week
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Gets a formatted YYYY-MM-DD date string relative to the current week's Monday.
 * @param weeksOffset Number of weeks to offset (negative for past, positive for future)
 * @param daysFromMonday Number of days to offset from Monday (0 = Monday, 6 = Sunday)
 */
export function getOffsetDateString(weeksOffset: number, daysFromMonday: number): string {
  const monday = getMonday(new Date());
  const targetDate = new Date(monday.getTime());
  targetDate.setDate(monday.getDate() + (weeksOffset * 7) + daysFromMonday);
  return targetDate.toISOString().split("T")[0];
}

/**
 * Gets the YYYY-MM-DD string for the Monday of the week for a given date.
 */
export function getWeekString(date?: Date): string {
  return getMonday(date || new Date()).toISOString().split("T")[0];
}

/**
 * Generates a random or pseudo-random unique ID.
 */
function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15);
}

// --- MAPPING UTILITIES ---

function mapUser(u: any): User {
  if (!u) return u;
  const pebbles_balance = u.pebbles_balance !== undefined ? u.pebbles_balance : (u.pebbles ?? 0);
  const weekly_budgets_completed = u.weekly_budgets_completed !== undefined ? u.weekly_budgets_completed : (u.weeklyBudgetsCompleted ?? 0);
  return {
    ...u,
    pebbles_balance,
    pebbles: pebbles_balance,
    weekly_budgets_completed,
    weeklyBudgetsCompleted: weekly_budgets_completed,
  };
}

function mapBudget(b: any): WeeklyBudget {
  if (!b) return b;
  const transport_kg = b.transport_kg !== undefined ? b.transport_kg : (b.transport ?? 12.0);
  const food_kg = b.food_kg !== undefined ? b.food_kg : (b.food ?? 8.0);
  const energy_kg = b.energy_kg !== undefined ? b.energy_kg : (b.energy ?? 14.0);
  const lifestyle_kg = b.lifestyle_kg !== undefined ? b.lifestyle_kg : (b.lifestyle ?? 4.46);
  return {
    ...b,
    user_id: b.user_id || b.userId,
    userId: b.user_id || b.userId,
    week_of: b.week_of || b.weekOf,
    weekOf: b.week_of || b.weekOf,
    transport_kg,
    transport: transport_kg,
    food_kg,
    food: food_kg,
    energy_kg,
    energy: energy_kg,
    lifestyle_kg,
    lifestyle: lifestyle_kg,
  };
}

function mapAdventure(a: any): Adventure {
  if (!a) return a;
  const reward_pebbles = a.reward_pebbles !== undefined ? a.reward_pebbles : (a.reward ?? 50);
  const completed = a.completed !== undefined ? a.completed : false;
  const claimed = a.claimed !== undefined ? a.claimed : completed;
  return {
    ...a,
    user_id: a.user_id || a.userId,
    userId: a.user_id || a.userId,
    started_at: a.started_at || a.startedAt || new Date().toISOString(),
    startedAt: a.started_at || a.startedAt || new Date().toISOString(),
    returns_at: a.returns_at || a.returnsAt || new Date().toISOString(),
    returnsAt: a.returns_at || a.returnsAt || new Date().toISOString(),
    completed,
    claimed,
    reward_pebbles,
    reward: reward_pebbles,
  };
}

// --- SEED DEMO DATA (ARJUN MUMBAI) ---

/**
 * Seeds Arjun Mumbai's demo data into storage:
 * - 280 kWh electricity total
 * - 12 Swiggy orders total
 * - 850 km scooter total
 * - Current week's consumption: exactly 60% of the weekly budget (23.076 kg out of 38.46 kg)
 * - Pet: Lion-Tailed Macaque at toddler stage
 * - Pebbles: 120
 */
export function seedDemoData(): void {
  const arjunId = "arjun-mumbai-uuid";

  const arjun: User = {
    id: arjunId,
    name: "Arjun",
    city: "Mumbai",
    transport_mode: "electric_scooter",
    diet_type: "vegetarian",
    pet_type: "Lion-Tailed Macaque",
    pet_stage: "toddler",
    pebbles_balance: 120,
    pebbles: 120,
    weekly_budgets_completed: 0,
    weeklyBudgetsCompleted: 0,
    created_at: new Date().toISOString(),
  };

  // Weekly Budgets for the last 4 weeks
  const budgets: WeeklyBudget[] = [
    {
      id: "budget-w3",
      user_id: arjunId,
      userId: arjunId,
      week_of: getOffsetDateString(-3, 0),
      weekOf: getOffsetDateString(-3, 0),
      transport_kg: 12.0,
      transport: 12.0,
      food_kg: 8.0,
      food: 8.0,
      energy_kg: 14.0,
      energy: 14.0,
      lifestyle_kg: 4.46,
      lifestyle: 4.46,
      created_at: new Date(getOffsetDateString(-3, 0)).toISOString(),
    },
    {
      id: "budget-w2",
      user_id: arjunId,
      userId: arjunId,
      week_of: getOffsetDateString(-2, 0),
      weekOf: getOffsetDateString(-2, 0),
      transport_kg: 12.0,
      transport: 12.0,
      food_kg: 8.0,
      food: 8.0,
      energy_kg: 14.0,
      energy: 14.0,
      lifestyle_kg: 4.46,
      lifestyle: 4.46,
      created_at: new Date(getOffsetDateString(-2, 0)).toISOString(),
    },
    {
      id: "budget-w1",
      user_id: arjunId,
      userId: arjunId,
      week_of: getOffsetDateString(-1, 0),
      weekOf: getOffsetDateString(-1, 0),
      transport_kg: 12.0,
      transport: 12.0,
      food_kg: 8.0,
      food: 8.0,
      energy_kg: 14.0,
      energy: 14.0,
      lifestyle_kg: 4.46,
      lifestyle: 4.46,
      created_at: new Date(getOffsetDateString(-1, 0)).toISOString(),
    },
    {
      id: "budget-w0",
      user_id: arjunId,
      userId: arjunId,
      week_of: getOffsetDateString(0, 0),
      weekOf: getOffsetDateString(0, 0),
      transport_kg: 12.0,
      transport: 12.0,
      food_kg: 8.0,
      food: 8.0,
      energy_kg: 14.0,
      energy: 14.0,
      lifestyle_kg: 4.46,
      lifestyle: 4.46,
      created_at: new Date(getOffsetDateString(0, 0)).toISOString(),
    },
  ];

  // Daily Logs spread across the 4 weeks
  const logs: DailyLog[] = [
    // --- WEEK -3 ---
    // Electricity: 80 kWh * 0.710 = 56.80 kg CO2e
    {
      id: "log-w3-elec",
      user_id: arjunId,
      date: getOffsetDateString(-3, 1), // Tuesday
      envelope: "energy",
      activity: "Electricity Bill (80 kWh)",
      co2_kg: 56.80,
      source: "manual",
      created_at: new Date(getOffsetDateString(-3, 1)).toISOString(),
    },
    // Scooter: 250 km * 0.0120 = 3.00 kg CO2e
    {
      id: "log-w3-scooter",
      user_id: arjunId,
      date: getOffsetDateString(-3, 2), // Wednesday
      envelope: "transport",
      activity: "Scooter Commutes (250 km)",
      co2_kg: 3.00,
      source: "manual",
      created_at: new Date(getOffsetDateString(-3, 2)).toISOString(),
    },
    // Swiggy 1: Veg Thali + Delivery = 1.5 + 0.18 = 1.68 kg CO2e
    {
      id: "log-w3-swiggy1",
      user_id: arjunId,
      date: getOffsetDateString(-3, 4), // Friday
      envelope: "food",
      activity: "Swiggy Order: Veg Thali",
      co2_kg: 1.68,
      source: "scan",
      created_at: new Date(getOffsetDateString(-3, 4)).toISOString(),
    },
    // Swiggy 2: Veg Thali + Delivery = 1.68 kg CO2e
    {
      id: "log-w3-swiggy2",
      user_id: arjunId,
      date: getOffsetDateString(-3, 5), // Saturday
      envelope: "food",
      activity: "Swiggy Order: Veg Thali",
      co2_kg: 1.68,
      source: "scan",
      created_at: new Date(getOffsetDateString(-3, 5)).toISOString(),
    },
    // Swiggy 3: Veg Thali + Delivery = 1.68 kg CO2e
    {
      id: "log-w3-swiggy3",
      user_id: arjunId,
      date: getOffsetDateString(-3, 6), // Sunday
      envelope: "food",
      activity: "Swiggy Order: Veg Thali",
      co2_kg: 1.68,
      source: "scan",
      created_at: new Date(getOffsetDateString(-3, 6)).toISOString(),
    },

    // --- WEEK -2 ---
    // Electricity: 85 kWh * 0.710 = 60.35 kg CO2e
    {
      id: "log-w2-elec",
      user_id: arjunId,
      date: getOffsetDateString(-2, 1),
      envelope: "energy",
      activity: "Electricity Bill (85 kWh)",
      co2_kg: 60.35,
      source: "manual",
      created_at: new Date(getOffsetDateString(-2, 1)).toISOString(),
    },
    // Scooter: 250 km * 0.0120 = 3.00 kg CO2e
    {
      id: "log-w2-scooter",
      user_id: arjunId,
      date: getOffsetDateString(-2, 2),
      envelope: "transport",
      activity: "Scooter Commutes (250 km)",
      co2_kg: 3.00,
      source: "manual",
      created_at: new Date(getOffsetDateString(-2, 2)).toISOString(),
    },
    // Swiggy 4: Veg Thali + Delivery = 1.68 kg CO2e
    {
      id: "log-w2-swiggy1",
      user_id: arjunId,
      date: getOffsetDateString(-2, 4),
      envelope: "food",
      activity: "Swiggy Order: Veg Thali",
      co2_kg: 1.68,
      source: "scan",
      created_at: new Date(getOffsetDateString(-2, 4)).toISOString(),
    },
    // Swiggy 5: Veg Thali + Delivery = 1.68 kg CO2e
    {
      id: "log-w2-swiggy2",
      user_id: arjunId,
      date: getOffsetDateString(-2, 5),
      envelope: "food",
      activity: "Swiggy Order: Veg Thali",
      co2_kg: 1.68,
      source: "scan",
      created_at: new Date(getOffsetDateString(-2, 5)).toISOString(),
    },
    // Swiggy 6: Veg Thali + Delivery = 1.68 kg CO2e
    {
      id: "log-w2-swiggy3",
      user_id: arjunId,
      date: getOffsetDateString(-2, 6),
      envelope: "food",
      activity: "Swiggy Order: Veg Thali",
      co2_kg: 1.68,
      source: "scan",
      created_at: new Date(getOffsetDateString(-2, 6)).toISOString(),
    },

    // --- WEEK -1 ---
    // Electricity: 90 kWh * 0.710 = 63.90 kg CO2e
    {
      id: "log-w1-elec",
      user_id: arjunId,
      date: getOffsetDateString(-1, 1),
      envelope: "energy",
      activity: "Electricity Bill (90 kWh)",
      co2_kg: 63.90,
      source: "manual",
      created_at: new Date(getOffsetDateString(-1, 1)).toISOString(),
    },
    // Scooter: 250 km * 0.0120 = 3.00 kg CO2e
    {
      id: "log-w1-scooter",
      user_id: arjunId,
      date: getOffsetDateString(-1, 2),
      envelope: "transport",
      activity: "Scooter Commutes (250 km)",
      co2_kg: 3.00,
      source: "manual",
      created_at: new Date(getOffsetDateString(-1, 2)).toISOString(),
    },
    // Swiggy 7: Veg Thali + Delivery = 1.68 kg CO2e
    {
      id: "log-w1-swiggy1",
      user_id: arjunId,
      date: getOffsetDateString(-1, 4),
      envelope: "food",
      activity: "Swiggy Order: Veg Thali",
      co2_kg: 1.68,
      source: "scan",
      created_at: new Date(getOffsetDateString(-1, 4)).toISOString(),
    },
    // Swiggy 8: Veg Thali + Delivery = 1.68 kg CO2e
    {
      id: "log-w1-swiggy2",
      user_id: arjunId,
      date: getOffsetDateString(-1, 5),
      envelope: "food",
      activity: "Swiggy Order: Veg Thali",
      co2_kg: 1.68,
      source: "scan",
      created_at: new Date(getOffsetDateString(-1, 5)).toISOString(),
    },
    // Swiggy 9: Veg Thali + Delivery = 1.68 kg CO2e
    {
      id: "log-w1-swiggy3",
      user_id: arjunId,
      date: getOffsetDateString(-1, 6),
      envelope: "food",
      activity: "Swiggy Order: Veg Thali",
      co2_kg: 1.68,
      source: "scan",
      created_at: new Date(getOffsetDateString(-1, 6)).toISOString(),
    },

    // --- WEEK 0 (CURRENT WEEK) ---
    // Electricity: 25 kWh * 0.710 = 17.75 kg CO2e
    {
      id: "log-w0-elec",
      user_id: arjunId,
      date: getOffsetDateString(0, 0), // Monday
      envelope: "energy",
      activity: "Electricity: AC & Lights (25 kWh)",
      co2_kg: 17.75,
      source: "manual",
      created_at: new Date(getOffsetDateString(0, 0)).toISOString(),
    },
    // Scooter: 100 km * 0.0120 = 1.20 kg CO2e
    {
      id: "log-w0-scooter",
      user_id: arjunId,
      date: getOffsetDateString(0, 1), // Tuesday
      envelope: "transport",
      activity: "Commute to Bandra (100 km Scooter)",
      co2_kg: 1.20,
      source: "manual",
      created_at: new Date(getOffsetDateString(0, 1)).toISOString(),
    },
    // Swiggy 10: Veg Thali + Delivery = 1.68 kg CO2e
    {
      id: "log-w0-swiggy1",
      user_id: arjunId,
      date: getOffsetDateString(0, 2), // Wednesday
      envelope: "food",
      activity: "Swiggy Order: Veg Thali",
      co2_kg: 1.68,
      source: "scan",
      created_at: new Date(getOffsetDateString(0, 2)).toISOString(),
    },
    // Swiggy 11: Veg Thali + Delivery = 1.68 kg CO2e
    {
      id: "log-w0-swiggy2",
      user_id: arjunId,
      date: getOffsetDateString(0, 3), // Thursday
      envelope: "food",
      activity: "Swiggy Order: Veg Thali",
      co2_kg: 1.68,
      source: "scan",
      created_at: new Date(getOffsetDateString(0, 3)).toISOString(),
    },
    // Swiggy 12: Vegan Bowl + Delivery = 0.5 + 0.18 = 0.68 kg CO2e
    {
      id: "log-w0-swiggy3",
      user_id: arjunId,
      date: getOffsetDateString(0, 3), // Thursday
      envelope: "food",
      activity: "Swiggy Order: Vegan Bowl",
      co2_kg: 0.68,
      source: "scan",
      created_at: new Date(getOffsetDateString(0, 3)).toISOString(),
    },
    // Lifestyle adjustment so current week = exactly 23.076 kg CO2e (60% of 38.46)
    // 23.076 - (17.75 + 1.20 + 1.68 + 1.68 + 0.68) = 0.086 kg CO2e
    {
      id: "log-w0-life",
      user_id: arjunId,
      date: getOffsetDateString(0, 3),
      envelope: "lifestyle",
      activity: "Eco-friendly Bamboo Toothbrush & Soap",
      co2_kg: 0.086,
      source: "manual",
      created_at: new Date(getOffsetDateString(0, 3)).toISOString(),
    },
  ];

  // Seeding Intentions
  const intentions: Intention[] = [
    {
      id: "intent-mumbailocal",
      user_id: arjunId,
      trigger: "When commuting to the Bandra office",
      action: "Take the Mumbai Local instead of an Ola cab",
      envelope: "transport",
      active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "intent-veganmeal",
      user_id: arjunId,
      trigger: "When ordering lunch on Swiggy",
      action: "Choose a Vegan Bowl instead of mutton/chicken dishes",
      envelope: "food",
      active: true,
      created_at: new Date().toISOString(),
    },
  ];

  // Seeding Adventures
  const adventures: Adventure[] = [
    {
      id: "adv-completed-1",
      user_id: arjunId,
      userId: arjunId,
      started_at: getOffsetDateString(-1, 0),
      startedAt: getOffsetDateString(-1, 0),
      returns_at: getOffsetDateString(-1, 3),
      returnsAt: getOffsetDateString(-1, 3),
      completed: true,
      claimed: true,
      reward_pebbles: 50,
      reward: 50,
    },
    {
      id: "adv-active-2",
      user_id: arjunId,
      userId: arjunId,
      started_at: getOffsetDateString(0, 0),
      startedAt: getOffsetDateString(0, 0),
      returns_at: getOffsetDateString(0, 3),
      returnsAt: getOffsetDateString(0, 3),
      completed: false,
      claimed: false,
      reward_pebbles: 80,
      reward: 80,
    },
  ];

  mockStorage.setItem("prakriti_user", JSON.stringify(arjun));
  mockStorage.setItem("prakriti_weekly_budgets", JSON.stringify(budgets));
  mockStorage.setItem("prakriti_daily_logs", JSON.stringify(logs));
  mockStorage.setItem("prakriti_intentions", JSON.stringify(intentions));
  mockStorage.setItem("prakriti_adventures", JSON.stringify(adventures));
  mockStorage.setItem("prakriti_demo_mode", "true");
}

// --- DATABASE SERVICE IMPLEMENTATION ---

export const dbService = {
  /**
   * Determines whether the app is currently running in Demo Mode (using mock DB).
   * Forced to true if Supabase credentials are not present.
   */
  isDemoMode(): boolean {
    if (!supabase) return true;
    return mockStorage.getItem("prakriti_demo_mode") !== "false";
  },

  /**
   * Toggles Demo Mode. Cannot set to false if Supabase is not configured.
   */
  setDemoMode(demo: boolean): void {
    if (!supabase && !demo) {
      console.warn("Cannot disable demo mode: Supabase credentials are not configured.");
      return;
    }
    mockStorage.setItem("prakriti_demo_mode", demo ? "true" : "false");
  },

  /**
   * Retrieves the current user profile.
   * Auto-seeds Arjun Mumbai's demo data on first visit in demo mode.
   */
  async getCurrentUser(): Promise<User | null> {
    if (this.isDemoMode()) {
      let userStr = mockStorage.getItem("prakriti_user");
      if (!userStr) {
        seedDemoData();
        userStr = mockStorage.getItem("prakriti_user");
      }
      if (!userStr) return null;
      try {
        const raw = JSON.parse(userStr);
        return mapUser(validateUser(raw));
      } catch (e) {
        console.error("Failed to parse user JSON:", e);
        return null;
      }
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const { data, error } = await supabase.from("users").select("*").maybeSingle();
      if (error) throw error;
      return mapUser(data);
    }
  },

  /**
   * Updates user profile fields.
   */
  async updateUser(updates: Partial<User>): Promise<User> {
    const dbUpdates: any = { ...updates };
    if (updates.pebbles !== undefined) dbUpdates.pebbles_balance = updates.pebbles;
    if (updates.weeklyBudgetsCompleted !== undefined) dbUpdates.weekly_budgets_completed = updates.weeklyBudgetsCompleted;

    if (this.isDemoMode()) {
      const user = await this.getCurrentUser();
      if (!user) throw new Error("No user found to update.");
      const updatedUser = { ...user, ...dbUpdates };
      mockStorage.setItem("prakriti_user", JSON.stringify(updatedUser));
      return mapUser(updatedUser);
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const user = await this.getCurrentUser();
      if (!user) throw new Error("No user found to update.");
      const { data, error } = await supabase
        .from("users")
        .update(dbUpdates)
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;
      return mapUser(data);
    }
  },

  /**
   * Creates a fresh profile for the user, wiping demo logs and creating a new clean weekly budget.
   */
  async createFreshUser(
    name: string,
    city: string,
    transportMode: string,
    dietType: string
  ): Promise<User> {
    const newUser: User = {
      id: this.isDemoMode() ? generateId() : "", // Supabase will auto-gen ID or use authenticated UUID
      name,
      city,
      transport_mode: transportMode,
      diet_type: dietType,
      pet_type: "Lion-Tailed Macaque",
      pet_stage: "egg",
      pebbles_balance: 0,
      pebbles: 0,
      weekly_budgets_completed: 0,
      weeklyBudgetsCompleted: 0,
      created_at: new Date().toISOString(),
    };

    if (this.isDemoMode()) {
      mockStorage.setItem("prakriti_user", JSON.stringify(newUser));
      mockStorage.setItem("prakriti_demo_mode", "false"); // Turn off demo mode label

      // Setup 1 clean default budget for current week
      const defaultBudget: WeeklyBudget = {
        id: generateId(),
        user_id: newUser.id,
        userId: newUser.id,
        week_of: getOffsetDateString(0, 0),
        weekOf: getOffsetDateString(0, 0),
        transport_kg: 12.0,
        transport: 12.0,
        food_kg: 8.0,
        food: 8.0,
        energy_kg: 14.0,
        energy: 14.0,
        lifestyle_kg: 4.46,
        lifestyle: 4.46,
        created_at: new Date().toISOString(),
      };

      mockStorage.setItem("prakriti_weekly_budgets", JSON.stringify([defaultBudget]));
      mockStorage.setItem("prakriti_daily_logs", JSON.stringify([]));
      mockStorage.setItem("prakriti_intentions", JSON.stringify([]));
      mockStorage.setItem("prakriti_adventures", JSON.stringify([]));
      return mapUser(newUser);
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const { data, error } = await supabase.from("users").insert(newUser).select().single();
      if (error) throw error;

      // Create initial budget
      const defaultBudget = {
        user_id: data.id,
        week_of: getOffsetDateString(0, 0),
        transport_kg: 12.0,
        food_kg: 8.0,
        energy_kg: 14.0,
        lifestyle_kg: 4.46,
      };
      await supabase.from("weekly_budgets").insert(defaultBudget);

      return mapUser(data);
    }
  },

  // --- WEEKLY BUDGETS ---

  /**
   * Fetches all weekly budgets for the current user.
   */
  async getWeeklyBudgets(): Promise<WeeklyBudget[]> {
    if (this.isDemoMode()) {
      await this.getCurrentUser(); // Ensures seeded if empty
      const budgetsStr = mockStorage.getItem("prakriti_weekly_budgets");
      if (!budgetsStr) return [];
      try {
        const raw = JSON.parse(budgetsStr);
        return validateWeeklyBudgets(raw).map(mapBudget);
      } catch (e) {
        console.error("Failed to parse weekly budgets:", e);
        return [];
      }
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const user = await this.getCurrentUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("weekly_budgets")
        .select("*")
        .eq("user_id", user.id)
        .order("week_of", { ascending: false });
      if (error) throw error;
      return data.map(mapBudget);
    }
  },

  /**
   * Gets the budget for the current week. Creates one if it doesn't exist.
   */
  async getCurrentWeeklyBudget(): Promise<WeeklyBudget | null> {
    const currentWeekOf = getOffsetDateString(0, 0);
    const budgets = await this.getWeeklyBudgets();
    const current = budgets.find((b) => b.week_of === currentWeekOf);

    if (current) return mapBudget(current);

    // Create a new budget for the current week with default envelopes
    const user = await this.getCurrentUser();
    if (!user) return null;

    const newBudgetPayload = {
      user_id: user.id,
      week_of: currentWeekOf,
      transport_kg: 12.0,
      food_kg: 8.0,
      energy_kg: 14.0,
      lifestyle_kg: 4.46,
    };

    return this.createWeeklyBudget(newBudgetPayload);
  },

  /**
   * Creates a new weekly budget record.
   */
  async createWeeklyBudget(budget: Omit<WeeklyBudget, "id" | "created_at" | "userId" | "weekOf" | "transport" | "food" | "energy" | "lifestyle">): Promise<WeeklyBudget> {
    const newBudget: WeeklyBudget = {
      ...budget,
      id: generateId(),
      userId: budget.user_id,
      weekOf: budget.week_of,
      transport: budget.transport_kg,
      food: budget.food_kg,
      energy: budget.energy_kg,
      lifestyle: budget.lifestyle_kg,
      created_at: new Date().toISOString(),
    };

    if (this.isDemoMode()) {
      const budgets = await this.getWeeklyBudgets();
      budgets.push(newBudget);
      mockStorage.setItem("prakriti_weekly_budgets", JSON.stringify(budgets));
      return mapBudget(newBudget);
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const { data, error } = await supabase.from("weekly_budgets").insert(newBudget).select().single();
      if (error) throw error;
      return mapBudget(data);
    }
  },

  /**
   * Updates an existing weekly budget's envelope allocations.
   */
  async updateWeeklyBudget(id: string, updates: Partial<WeeklyBudget>): Promise<WeeklyBudget> {
    const dbUpdates: any = { ...updates };
    if (updates.transport !== undefined) dbUpdates.transport_kg = updates.transport;
    if (updates.food !== undefined) dbUpdates.food_kg = updates.food;
    if (updates.energy !== undefined) dbUpdates.energy_kg = updates.energy;
    if (updates.lifestyle !== undefined) dbUpdates.lifestyle_kg = updates.lifestyle;

    if (this.isDemoMode()) {
      const budgets = await this.getWeeklyBudgets();
      const idx = budgets.findIndex((b) => b.id === id);
      if (idx === -1) throw new Error("Budget not found.");
      const updated = { ...budgets[idx], ...dbUpdates };
      budgets[idx] = updated;
      mockStorage.setItem("prakriti_weekly_budgets", JSON.stringify(budgets));
      return mapBudget(updated);
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const { data, error } = await supabase
        .from("weekly_budgets")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return mapBudget(data);
    }
  },

  // --- DAILY LOGS ---

  /**
   * Fetches all footprint daily logs for the current user.
   */
  async getDailyLogs(userId?: string): Promise<DailyLog[]> {
    if (this.isDemoMode()) {
      await this.getCurrentUser(); // Ensures seeded if empty
      const logsStr = mockStorage.getItem("prakriti_daily_logs");
      if (!logsStr) return [];
      try {
        const raw = JSON.parse(logsStr);
        return validateDailyLogs(raw);
      } catch (e) {
        console.error("Failed to parse daily logs:", e);
        return [];
      }
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const user = await this.getCurrentUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", targetUserId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    }
  },

  /**
   * Adds a new carbon footprint activity log.
   */
  async createDailyLog(log: Omit<DailyLog, "id" | "created_at">): Promise<DailyLog> {
    const newLog: DailyLog = {
      ...log,
      id: generateId(),
      created_at: new Date().toISOString(),
    };

    if (this.isDemoMode()) {
      const logs = await this.getDailyLogs();
      logs.unshift(newLog); // Prepend so it appears newest first
      mockStorage.setItem("prakriti_daily_logs", JSON.stringify(logs));
      return newLog;
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const { data, error } = await supabase.from("daily_logs").insert(newLog).select().single();
      if (error) throw error;
      return data;
    }
  },

  /**
   * Deletes a carbon log by ID.
   */
  async deleteDailyLog(id: string): Promise<void> {
    if (this.isDemoMode()) {
      const logs = await this.getDailyLogs();
      const filtered = logs.filter((l) => l.id !== id);
      mockStorage.setItem("prakriti_daily_logs", JSON.stringify(filtered));
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const { error } = await supabase.from("daily_logs").delete().eq("id", id);
      if (error) throw error;
    }
  },

  // --- INTENTIONS ---

  /**
   * Fetches the user's eco-commitments (intentions).
   */
  async getIntentions(): Promise<Intention[]> {
    if (this.isDemoMode()) {
      await this.getCurrentUser(); // Ensures seeded if empty
      const intentionsStr = mockStorage.getItem("prakriti_intentions");
      return intentionsStr ? JSON.parse(intentionsStr) : [];
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const user = await this.getCurrentUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("intentions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  },

  /**
   * Creates a new intention.
   */
  async createIntention(intention: Omit<Intention, "id" | "created_at">): Promise<Intention> {
    const newIntention: Intention = {
      ...intention,
      id: generateId(),
      created_at: new Date().toISOString(),
    };

    if (this.isDemoMode()) {
      const intentions = await this.getIntentions();
      intentions.push(newIntention);
      mockStorage.setItem("prakriti_intentions", JSON.stringify(intentions));
      return newIntention;
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const { data, error } = await supabase.from("intentions").insert(newIntention).select().single();
      if (error) throw error;
      return data;
    }
  },

  /**
   * Updates an intention (e.g. toggles active state).
   */
  async updateIntention(id: string, updates: Partial<Intention>): Promise<Intention> {
    if (this.isDemoMode()) {
      const intentions = await this.getIntentions();
      const idx = intentions.findIndex((i) => i.id === id);
      if (idx === -1) throw new Error("Intention not found.");
      const updated = { ...intentions[idx], ...updates };
      intentions[idx] = updated;
      mockStorage.setItem("prakriti_intentions", JSON.stringify(intentions));
      return updated;
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const { data, error } = await supabase
        .from("intentions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // --- ADVENTURES & VIRTUAL PET ---

  /**
   * Fetches Western Ghats adventures for the current user.
   */
  async getAdventures(userId?: string): Promise<Adventure[]> {
    if (this.isDemoMode()) {
      await this.getCurrentUser(); // Ensures seeded if empty
      const adventuresStr = mockStorage.getItem("prakriti_adventures");
      const adventures = adventuresStr ? JSON.parse(adventuresStr) : [];
      return adventures.map(mapAdventure);
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const user = await this.getCurrentUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];
      const { data, error } = await supabase
        .from("adventures")
        .select("*")
        .eq("user_id", targetUserId);
      if (error) throw error;
      return data.map(mapAdventure);
    }
  },

  /**
   * Starts a new pet adventure.
   */
  async createAdventure(adventure: Omit<Adventure, "id" | "completed" | "userId" | "startedAt" | "returnsAt" | "reward" | "claimed">): Promise<Adventure> {
    const newAdventure: Omit<Adventure, "userId" | "startedAt" | "returnsAt" | "reward" | "claimed"> = {
      ...adventure,
      id: generateId(),
      completed: false,
    };

    if (this.isDemoMode()) {
      const adventures = await this.getAdventures();
      const mapped = mapAdventure(newAdventure);
      adventures.push(mapped);
      mockStorage.setItem("prakriti_adventures", JSON.stringify(adventures));
      return mapped;
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const { data, error } = await supabase.from("adventures").insert(newAdventure).select().single();
      if (error) throw error;
      return mapAdventure(data);
    }
  },

  /**
   * Completes an adventure and awards pebbles.
   */
  async completeAdventure(id: string, rewardPebbles?: number): Promise<Adventure> {
    let pebbles = rewardPebbles;
    if (pebbles === undefined) {
      const advs = await this.getAdventures();
      const found = advs.find(a => a.id === id);
      pebbles = found?.reward_pebbles ?? found?.reward ?? 50;
    }

    if (this.isDemoMode()) {
      const adventures = await this.getAdventures();
      const idx = adventures.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error("Adventure not found.");

      const updatedAdventure = {
        ...adventures[idx],
        completed: true,
        claimed: adventures[idx].claimed !== undefined ? adventures[idx].claimed : true,
        reward_pebbles: pebbles,
        reward: pebbles,
      };
      adventures[idx] = updatedAdventure;

      mockStorage.setItem("prakriti_adventures", JSON.stringify(adventures));
      return updatedAdventure;
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const { data, error } = await supabase
        .from("adventures")
        .update({ completed: true, reward_pebbles: pebbles })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return mapAdventure(data);
    }
  },

  // --- RESET & MANAGEMENT ---

  /**
   * Performs a Start Fresh reset:
   * - Wipes all daily logs, intentions, adventures.
   * - Wipes historical budgets.
   * - Resets the user's pet to the egg stage and pebbles to 0.
   * - Creates a default budget for the current week.
   */
  async resetDatabase(): Promise<void> {
    if (this.isDemoMode()) {
      mockStorage.removeItem("prakriti_user");
      mockStorage.removeItem("prakriti_weekly_budgets");
      mockStorage.removeItem("prakriti_daily_logs");
      mockStorage.removeItem("prakriti_intentions");
      mockStorage.removeItem("prakriti_adventures");
      mockStorage.setItem("prakriti_demo_mode", "false"); // Disable demo mode, now active fresh session

      const freshUser: User = {
        id: generateId(),
        name: "Green Guardian",
        city: "Mumbai",
        transport_mode: "walk_cycle",
        diet_type: "vegetarian",
        pet_type: "Lion-Tailed Macaque",
        pet_stage: "egg",
        pebbles_balance: 0,
        pebbles: 0,
        weekly_budgets_completed: 0,
        weeklyBudgetsCompleted: 0,
        created_at: new Date().toISOString(),
      };

      const freshBudget: WeeklyBudget = {
        id: generateId(),
        user_id: freshUser.id,
        userId: freshUser.id,
        week_of: getOffsetDateString(0, 0),
        weekOf: getOffsetDateString(0, 0),
        transport_kg: 12.0,
        transport: 12.0,
        food_kg: 8.0,
        food: 8.0,
        energy_kg: 14.0,
        energy: 14.0,
        lifestyle_kg: 4.46,
        lifestyle: 4.46,
        created_at: new Date().toISOString(),
      };

      mockStorage.setItem("prakriti_user", JSON.stringify(freshUser));
      mockStorage.setItem("prakriti_weekly_budgets", JSON.stringify([freshBudget]));
      mockStorage.setItem("prakriti_daily_logs", JSON.stringify([]));
      mockStorage.setItem("prakriti_intentions", JSON.stringify([]));
      mockStorage.setItem("prakriti_adventures", JSON.stringify([]));
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      const user = await this.getCurrentUser();
      if (user) {
        // Delete everything belonging to user
        await supabase.from("daily_logs").delete().eq("user_id", user.id);
        await supabase.from("weekly_budgets").delete().eq("user_id", user.id);
        await supabase.from("intentions").delete().eq("user_id", user.id);
        await supabase.from("adventures").delete().eq("user_id", user.id);

        // Reset user
        await supabase
          .from("users")
          .update({
            pet_stage: "egg",
            pebbles_balance: 0,
            weekly_budgets_completed: 0,
            transport_mode: "walk_cycle",
          })
          .eq("id", user.id);

        // Seed fresh budget for the current week
        const freshBudget = {
          user_id: user.id,
          week_of: getOffsetDateString(0, 0),
          transport_kg: 12.0,
          food_kg: 8.0,
          energy_kg: 14.0,
          lifestyle_kg: 4.46,
        };
        await supabase.from("weekly_budgets").insert(freshBudget);
      }
    }
  },

  /**
   * Seeds the Arjun Mumbai demo dataset.
   */
  async seedDemoData(): Promise<void> {
    if (this.isDemoMode()) {
      seedDemoData();
    } else {
      console.warn("Seeding demo data is only supported in local mock/demo database mode.");
    }
  },

  // --- COMPATIBILITY METHODS & ALIASES ---

  async getUser(): Promise<User | null> {
    return this.getCurrentUser();
  },

  async saveUser(user: User): Promise<User> {
    const dbUser: any = {
      id: user.id,
      name: user.name,
      city: user.city,
      transport_mode: user.transport_mode,
      diet_type: user.diet_type,
      pet_type: user.pet_type,
      pet_stage: user.pet_stage,
      pebbles_balance: user.pebbles_balance !== undefined ? user.pebbles_balance : (user.pebbles ?? 0),
      weekly_budgets_completed: user.weekly_budgets_completed !== undefined ? user.weekly_budgets_completed : (user.weeklyBudgetsCompleted ?? 0),
      created_at: user.created_at,
    };
    return this.updateUser(dbUser);
  },

  async getWeeklyBudget(userId: string, weekOf: string): Promise<WeeklyBudget | null> {
    const budgets = await this.getWeeklyBudgets();
    const found = budgets.find((b) => b.week_of === weekOf);
    return found ? mapBudget(found) : null;
  },

  async saveWeeklyBudget(budget: WeeklyBudget): Promise<WeeklyBudget> {
    const dbBudget: any = {
      id: budget.id,
      user_id: budget.user_id || budget.userId,
      week_of: budget.week_of || budget.weekOf,
      transport_kg: budget.transport_kg !== undefined ? budget.transport_kg : (budget.transport ?? 12.0),
      food_kg: budget.food_kg !== undefined ? budget.food_kg : (budget.food ?? 8.0),
      energy_kg: budget.energy_kg !== undefined ? budget.energy_kg : (budget.energy ?? 14.0),
      lifestyle_kg: budget.lifestyle_kg !== undefined ? budget.lifestyle_kg : (budget.lifestyle ?? 4.46),
      created_at: budget.created_at,
    };
    if (dbBudget.id) {
      return this.updateWeeklyBudget(dbBudget.id, dbBudget);
    } else {
      return this.createWeeklyBudget(dbBudget);
    }
  },

  async addDailyLog(log: Omit<DailyLog, "id" | "created_at">): Promise<DailyLog> {
    const dbLog: any = {
      user_id: log.user_id,
      date: log.date,
      envelope: log.envelope,
      activity: log.activity,
      co2_kg: log.co2_kg,
      source: log.source,
    };
    return this.createDailyLog(dbLog);
  },

  async startAdventure(userId: string, startedAt: string, returnsAt: string, reward: number): Promise<Adventure> {
    return this.createAdventure({
      user_id: userId,
      started_at: startedAt,
      returns_at: returnsAt,
      reward_pebbles: reward,
    });
  },

  async claimAdventureReward(id: string): Promise<{ updatedUser: User; adventure: Adventure } | null> {
    const adventures = await this.getAdventures();
    const idx = adventures.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    const adventure = adventures[idx];
    adventure.completed = true;
    adventure.claimed = true;

    if (this.isDemoMode()) {
      mockStorage.setItem("prakriti_adventures", JSON.stringify(adventures));
      const user = await this.getCurrentUser();
      if (user) {
        user.pebbles_balance = (user.pebbles_balance || 0) + adventure.reward_pebbles;
        user.pebbles = user.pebbles_balance;
        
        // Evolve pet
        if (user.pebbles_balance >= 200 && user.pet_stage === "toddler") {
          user.pet_stage = "adolescent";
        } else if (user.pebbles_balance >= 100 && user.pet_stage === "egg") {
          user.pet_stage = "baby";
        } else if (user.pebbles_balance >= 150 && user.pet_stage === "baby") {
          user.pet_stage = "toddler";
        }
        mockStorage.setItem("prakriti_user", JSON.stringify(user));
        return { updatedUser: mapUser(user), adventure: mapAdventure(adventure) };
      }
      return null;
    } else {
      if (!supabase) throw new Error("Supabase client is not initialized.");
      await supabase.from("adventures").update({ completed: true, claimed: true }).eq("id", id);
      const user = await this.getCurrentUser();
      if (user) {
        const newBalance = (user.pebbles_balance || 0) + adventure.reward_pebbles;
        let newStage = user.pet_stage;
        if (newBalance >= 200 && user.pet_stage === "toddler") {
          newStage = "adolescent";
        } else if (newBalance >= 100 && user.pet_stage === "egg") {
          newStage = "baby";
        } else if (newBalance >= 150 && user.pet_stage === "baby") {
          newStage = "toddler";
        }
        const { data: updatedUserData, error } = await supabase
          .from("users")
          .update({ pebbles_balance: newBalance, pet_stage: newStage })
          .eq("id", user.id)
          .select()
          .single();
        if (error) throw error;
        return { updatedUser: mapUser(updatedUserData), adventure: mapAdventure(adventure) };
      }
      return null;
    }
  },

  async resetDemoData(): Promise<User> {
    await this.resetDatabase();
    const user = await this.getCurrentUser();
    if (!user) throw new Error("Could not retrieve user after database reset.");
    return user;
  }
};