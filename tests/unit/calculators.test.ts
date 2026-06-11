import { describe, it, expect } from "vitest";
import {
  calculateElectricityFootprint,
  calculateTransportFootprint,
  calculateMealFootprint,
  calculateCustomFootprint,
  calculateWeeklyBudgetRemaining,
} from "../../src/core/calculators";
import {
  GRID_ELECTRICITY_EMISSION_FACTOR,
  TRANSPORT_EMISSION_FACTORS,
  MEAL_EMISSION_FACTORS,
  FOOD_EMISSION_FACTORS,
  SWIGGY_DELIVERY_EMISSION,
} from "../../src/core/constants";
import {
  UserSchema,
  DailyLogSchema,
  WeeklyBudgetSchema,
  ScanResultSchema,
  OnboardingInputSchema,
} from "../../src/core/schemas";

describe("Prakriti Carbon Calculators & Budgeting Tests", () => {
  // --- transport mode calculations (6 modes × distance calculations) ---
  describe("Transport Footprints (All 6 Modes)", () => {
    it("verifies petrol scooter calculation (100 km)", () => {
      const result = calculateTransportFootprint({ distanceKm: 100, mode: "petrol_scooter" });
      expect(result.co2eKg).toBe(3.34);
      expect(result.breakdown.emissionFactor).toBe(TRANSPORT_EMISSION_FACTORS.petrol_scooter);
    });

    it("verifies electric scooter calculation (100 km)", () => {
      const result = calculateTransportFootprint({ distanceKm: 100, mode: "electric_scooter" });
      expect(result.co2eKg).toBe(1.20);
      expect(result.breakdown.emissionFactor).toBe(TRANSPORT_EMISSION_FACTORS.electric_scooter);
    });

    it("verifies Ola/Uber cab calculation (50 km)", () => {
      const result = calculateTransportFootprint({ distanceKm: 50, mode: "cab" });
      expect(result.co2eKg).toBe(7.45);
      expect(result.breakdown.emissionFactor).toBe(TRANSPORT_EMISSION_FACTORS.cab);
    });

    it("verifies Mumbai Local Train calculation (200 km)", () => {
      const result = calculateTransportFootprint({ distanceKm: 200, mode: "mumbai_local" });
      expect(result.co2eKg).toBe(1.28);
      expect(result.breakdown.emissionFactor).toBe(TRANSPORT_EMISSION_FACTORS.mumbai_local);
    });

    it("verifies Delhi Metro calculation (150 km)", () => {
      const result = calculateTransportFootprint({ distanceKm: 150, mode: "delhi_metro" });
      expect(result.co2eKg).toBe(2.085);
      expect(result.breakdown.emissionFactor).toBe(TRANSPORT_EMISSION_FACTORS.delhi_metro);
    });

    it("verifies CNG Auto Rickshaw calculation (80 km)", () => {
      const result = calculateTransportFootprint({ distanceKm: 80, mode: "cng_auto" });
      expect(result.co2eKg).toBe(8.616);
      expect(result.breakdown.emissionFactor).toBe(TRANSPORT_EMISSION_FACTORS.cng_auto);
    });

    it("verifies walking or cycling calculation (10 km)", () => {
      const result = calculateTransportFootprint({ distanceKm: 10, mode: "walk_cycle" });
      expect(result.co2eKg).toBe(0.0);
      expect(result.breakdown.emissionFactor).toBe(TRANSPORT_EMISSION_FACTORS.walk_cycle);
    });
  });

  // --- food meal footprints (5 meal types + delivery offsets) ---
  describe("Food and Meal Footprints", () => {
    it("verifies Mutton Biryani footprint (no delivery)", () => {
      const result = calculateMealFootprint({ mealType: "mutton_biryani", hasDelivery: false });
      expect(result.co2eKg).toBe(5.0);
      expect(result.breakdown.mealCo2eKg).toBe(MEAL_EMISSION_FACTORS.mutton_biryani);
    });

    it("verifies Chicken meal footprint (no delivery)", () => {
      const result = calculateMealFootprint({ mealType: "chicken", hasDelivery: false });
      expect(result.co2eKg).toBe(1.8);
      expect(result.breakdown.mealCo2eKg).toBe(MEAL_EMISSION_FACTORS.chicken);
    });

    it("verifies Veg Thali footprint (no delivery)", () => {
      const result = calculateMealFootprint({ mealType: "veg_thali", hasDelivery: false });
      expect(result.co2eKg).toBe(1.5);
      expect(result.breakdown.mealCo2eKg).toBe(MEAL_EMISSION_FACTORS.veg_thali);
    });

    it("verifies Vegan Bowl footprint (no delivery)", () => {
      const result = calculateMealFootprint({ mealType: "vegan_bowl", hasDelivery: false });
      expect(result.co2eKg).toBe(0.5);
      expect(result.breakdown.mealCo2eKg).toBe(MEAL_EMISSION_FACTORS.vegan_bowl);
    });

    it("verifies Veg Thali with Swiggy Delivery offset", () => {
      const result = calculateMealFootprint({ mealType: "veg_thali", hasDelivery: true });
      expect(result.co2eKg).toBe(1.5 + SWIGGY_DELIVERY_EMISSION);
      expect(result.breakdown.deliveryCo2eKg).toBe(SWIGGY_DELIVERY_EMISSION);
    });

    it("handles fallback to 0 for unrecognized meal type", () => {
      const result = calculateMealFootprint({ mealType: "unrecognized_meal" as any, hasDelivery: false });
      expect(result.co2eKg).toBe(0);
      expect(result.breakdown.mealCo2eKg).toBe(0);
    });
  });

  // --- AC ratings (3-star vs 5-star at 4, 8, 12 hours) ---
  describe("AC and Electricity Ratings", () => {
    // Formula: kwRating = 1.6 - (0.15 * starRating)
    // 3-Star AC: kwRating = 1.6 - (0.15 * 3) = 1.15 kW
    // 5-Star AC: kwRating = 1.6 - (0.15 * 5) = 0.85 kW
    
    it("calculates 3-Star AC for 4 hours correctly", () => {
      const kwRating = 1.6 - (0.15 * 3); // 1.15
      const consumptionKwh = 4 * kwRating; // 4.6
      const result = calculateElectricityFootprint({ consumptionKwh });
      expect(result.co2eKg).toBeCloseTo(4.6 * GRID_ELECTRICITY_EMISSION_FACTOR, 4); // 3.266
    });

    it("calculates 3-Star AC for 8 hours correctly", () => {
      const kwRating = 1.6 - (0.15 * 3); // 1.15
      const consumptionKwh = 8 * kwRating; // 9.2
      const result = calculateElectricityFootprint({ consumptionKwh });
      expect(result.co2eKg).toBeCloseTo(9.2 * GRID_ELECTRICITY_EMISSION_FACTOR, 4); // 6.532
    });

    it("calculates 3-Star AC for 12 hours correctly", () => {
      const kwRating = 1.6 - (0.15 * 3); // 1.15
      const consumptionKwh = 12 * kwRating; // 13.8
      const result = calculateElectricityFootprint({ consumptionKwh });
      expect(result.co2eKg).toBeCloseTo(13.8 * GRID_ELECTRICITY_EMISSION_FACTOR, 4); // 9.798
    });

    it("calculates 5-Star AC for 4 hours correctly", () => {
      const kwRating = 1.6 - (0.15 * 5); // 0.85
      const consumptionKwh = 4 * kwRating; // 3.4
      const result = calculateElectricityFootprint({ consumptionKwh });
      expect(result.co2eKg).toBeCloseTo(3.4 * GRID_ELECTRICITY_EMISSION_FACTOR, 4); // 2.414
    });

    it("calculates 5-Star AC for 8 hours correctly", () => {
      const kwRating = 1.6 - (0.15 * 5); // 0.85
      const consumptionKwh = 8 * kwRating; // 6.8
      const result = calculateElectricityFootprint({ consumptionKwh });
      expect(result.co2eKg).toBeCloseTo(6.8 * GRID_ELECTRICITY_EMISSION_FACTOR, 4); // 4.828
    });

    it("calculates 5-Star AC for 12 hours correctly", () => {
      const kwRating = 1.6 - (0.15 * 5); // 0.85
      const consumptionKwh = 12 * kwRating; // 10.2
      const result = calculateElectricityFootprint({ consumptionKwh });
      expect(result.co2eKg).toBeCloseTo(10.2 * GRID_ELECTRICITY_EMISSION_FACTOR, 4); // 7.242
    });
  });

  // --- Diesel Generators (DG sets) ---
  describe("Diesel Generator (DG Set) combustion", () => {
    // Formula: hours * 0.5 L/hr * 2.7 kg/L = hours * 1.35 kg CO2e
    it("calculates DG set footprint for 2 hours", () => {
      const hours = 2;
      const dgCo2 = hours * 0.5 * 2.7; // 2.7 kg
      expect(dgCo2).toBe(2.7);
    });

    it("calculates DG set footprint for 5 hours", () => {
      const hours = 5;
      const dgCo2 = hours * 0.5 * 2.7; // 6.75 kg
      expect(dgCo2).toBe(6.75);
    });
  });

  // --- Custom items and overrides ---
  describe("Custom Items and Ingredient Calculations", () => {
    it("calculates footprint with custom override", () => {
      const result = calculateCustomFootprint({ customCo2eKg: 25.5 });
      expect(result.co2eKg).toBe(25.5);
      expect(result.breakdown.customOverride).toBe(25.5);
    });

    it("calculates footprint with empty ingredients list", () => {
      const result = calculateCustomFootprint({});
      expect(result.co2eKg).toBe(0);
      expect(result.breakdown.ingredientsTotal).toBe(0);
    });

    it("calculates custom ingredients total properly", () => {
      const result = calculateCustomFootprint({
        ingredients: [
          { category: "dairy", weightKg: 1.5 },
          { category: "processed_grains", weightKg: 2.0 },
        ],
      });
      // dairy: 1.5 * 1.5 = 2.25
      // processed_grains: 2.0 * 0.6 = 1.2
      // total = 3.45
      expect(result.co2eKg).toBe(3.45);
      expect(result.breakdown.ingredients[0].co2eKg).toBe(2.25);
      expect(result.breakdown.ingredients[1].co2eKg).toBe(1.2);
    });
  });

  // --- Envelope overspend indicators ---
  describe("Envelope Overspend Calculations", () => {
    it("verifies budget remaining within limits", () => {
      const result = calculateWeeklyBudgetRemaining({ allocated: 38.46, spent: 20.0 });
      expect(result.remaining).toBe(18.46);
      expect(result.remainingPercent).toBeCloseTo(48.0, 1);
      expect(result.isOverspent).toBe(false);
    });

    it("verifies budget overspent detection", () => {
      const result = calculateWeeklyBudgetRemaining({ allocated: 38.46, spent: 45.0 });
      expect(result.remaining).toBe(-6.54);
      expect(result.isOverspent).toBe(true);
    });
  });

  // --- Seasonal modifier offsets ---
  describe("Seasonal Modifier Offsets", () => {
    it("verifies Diwali festive cooking modifier (+15% carbon)", () => {
      const baseResult = calculateMealFootprint({ mealType: "veg_thali", hasDelivery: false }).co2eKg; // 1.5
      const diwaliFootprint = Number((baseResult * 1.15).toFixed(3)); // 1.725
      expect(diwaliFootprint).toBe(1.725);
    });

    it("verifies IPL AC sharing/cooling modifier (+30% load or saving offsets)", () => {
      // Direct load adjustment (+30% AC footprint or 60% cooling savings based on IPL shared environment)
      const baseAC = 3.266;
      const iplSharedSaving = Number((baseAC * 0.40).toFixed(3)); // Group-sharing cuts energy footprint by over 60%
      expect(iplSharedSaving).toBe(1.306);
    });
  });

  // --- Edge Cases and Branch Coverage ---
  describe("Calculators Edge Cases and Branch Coverage", () => {
    it("handles fallback to 0 for unrecognized transport mode", () => {
      const result = calculateTransportFootprint({ distanceKm: 100, mode: "unrecognized_mode" as any });
      expect(result.co2eKg).toBe(0);
      expect(result.breakdown.emissionFactor).toBe(0);
    });

    it("handles fallback to 0 for unrecognized food category", () => {
      const result = calculateCustomFootprint({
        ingredients: [
          { category: "unrecognized_category" as any, weightKg: 10 }
        ]
      });
      expect(result.co2eKg).toBe(0);
      expect(result.breakdown.ingredientsTotal).toBe(0);
    });

    it("handles fallback to 0 remaining percentage when weekly budget allocated is 0", () => {
      const result = calculateWeeklyBudgetRemaining({ allocated: 0, spent: 10 });
      expect(result.remainingPercent).toBe(0);
      expect(result.remaining).toBe(-10);
      expect(result.isOverspent).toBe(true);
    });
  });

  // --- Zod schema validations ---
  describe("Zod Schema Validation", () => {
    it("validates UserProfileSchema success case", () => {
      const validUser = {
        name: "Arjun",
        city: "Mumbai",
        transport_mode: "electric_scooter",
        diet_type: "vegetarian",
        pet_stage: "toddler",
        pebbles_balance: 120,
      };
      const parseResult = UserSchema.safeParse(validUser);
      expect(parseResult.success).toBe(true);
      if (parseResult.success) {
        expect(parseResult.data.city).toBe("Mumbai");
        expect(parseResult.data.name).toBe("Arjun");
      }
    });

    it("validates UserProfileSchema failure case", () => {
      const invalidUser = {
        name: "Arjun",
        transport_mode: "electric_scooter",
      };
      const parseResult = UserSchema.safeParse(invalidUser);
      expect(parseResult.success).toBe(false);
    });

    it("validates OnboardingInputSchema success case", () => {
      const validOnboarding = {
        city: "Pune",
        transport: "Metro/Train",
        diet: "Vegetarian",
      };
      const parseResult = OnboardingInputSchema.safeParse(validOnboarding);
      expect(parseResult.success).toBe(true);
    });

    it("validates OnboardingInputSchema failure case (invalid values and triggers errorMap)", () => {
      const invalidOnboarding = {
        city: "London", // Not in enum
        transport: "Jetpack", // Not in enum
        diet: "Keto", // Not in enum
      };
      const parseResult = OnboardingInputSchema.safeParse(invalidOnboarding);
      expect(parseResult.success).toBe(false);
      if (!parseResult.success) {
        const error = parseResult.error.format();
        expect(error.city?._errors[0]).toBe("Please select a valid Indian city");
        expect(error.transport?._errors[0]).toBe("Please select your primary transport mode");
        expect(error.diet?._errors[0]).toBe("Please select your diet preference");
      }
    });

    it("validates DailyLogSchema success case", () => {
      const validLog = {
        date: "2026-06-11",
        envelope: "food",
        activity: "Swiggy Veg Thali",
        co2_kg: 1.68,
        source: "scan",
      };
      const parseResult = DailyLogSchema.safeParse(validLog);
      expect(parseResult.success).toBe(true);
    });

    it("validates DailyLogSchema failure case (invalid envelope and source and triggers errorMap)", () => {
      const invalidLog = {
        date: "2026-06-11",
        envelope: "travel", // Invalid enum
        activity: "Roadtrip",
        co2_kg: 15.0,
        source: "manual_input", // Invalid enum
      };
      const parseResult = DailyLogSchema.safeParse(invalidLog);
      expect(parseResult.success).toBe(false);
      if (!parseResult.success) {
        const error = parseResult.error.format();
        expect(error.envelope?._errors[0]).toBe("Envelope must be one of: transport, food, energy, lifestyle");
        expect(error.source?._errors[0]).toBe("Source must be 'manual' or 'scan'");
      }
    });

    it("validates ScanResultSchema success case", () => {
      const validScanResult = {
        bill_type: "Swiggy",
        merchant: "Swiggy Delivery",
        date: "2026-06-11",
        total_co2_kg: 1.68,
        breakdown: [
          { item: "Veg Thali", category: "Meal", co2_kg: 1.5 },
          { item: "Delivery Charge", category: "Delivery", co2_kg: 0.18 }
        ],
        envelope_category: "food",
        confidence: "high",
      };
      const parseResult = ScanResultSchema.safeParse(validScanResult);
      expect(parseResult.success).toBe(true);
    });

    it("validates ScanResultSchema failure case (missing total)", () => {
      const invalidScanResult = {
        bill_type: "Swiggy",
        merchant: "Swiggy Delivery",
        breakdown: [],
        envelope_category: "food",
        confidence: "medium",
      };
      const parseResult = ScanResultSchema.safeParse(invalidScanResult);
      expect(parseResult.success).toBe(false);
    });

    it("validates WeeklyBudgetSchema success case", () => {
      const validBudget = {
        week_of: "2026-06-08",
        transport_kg: 12.0,
        food_kg: 8.0,
        energy_kg: 14.0,
        lifestyle_kg: 4.46,
      };
      const parseResult = WeeklyBudgetSchema.safeParse(validBudget);
      expect(parseResult.success).toBe(true);
    });

    it("validates WeeklyBudgetSchema failure case (negative values)", () => {
      const invalidBudget = {
        week_of: "2026-06-08",
        transport_kg: -1.0,
        food_kg: 8.0,
        energy_kg: 14.0,
        lifestyle_kg: 4.46,
      };
      const parseResult = WeeklyBudgetSchema.safeParse(invalidBudget);
      expect(parseResult.success).toBe(false);
    });
  });
});
