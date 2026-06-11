import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateElectricityFootprint,
  calculateTransportFootprint,
  calculateMealFootprint,
  calculateCustomFootprint,
} from "./calculators";
import { dbService, getOffsetDateString } from "./supabase";
import {
  GRID_ELECTRICITY_EMISSION_FACTOR,
  TRANSPORT_EMISSION_FACTORS,
  MEAL_EMISSION_FACTORS,
  FOOD_EMISSION_FACTORS,
} from "./constants";

describe("Carbon Calculators", () => {
  it("should calculate electricity footprint correctly", () => {
    const res = calculateElectricityFootprint({ consumptionKwh: 100 });
    expect(res.co2eKg).toBe(100 * GRID_ELECTRICITY_EMISSION_FACTOR);
    expect(res.breakdown.emissionFactor).toBe(GRID_ELECTRICITY_EMISSION_FACTOR);
  });

  it("should calculate transport footprint correctly", () => {
    const res = calculateTransportFootprint({ distanceKm: 850, mode: "electric_scooter" });
    expect(res.co2eKg).toBe(Number((850 * TRANSPORT_EMISSION_FACTORS.electric_scooter).toFixed(4)));
  });

  it("should calculate meal footprint correctly", () => {
    const resWithoutDelivery = calculateMealFootprint({ mealType: "veg_thali", hasDelivery: false });
    expect(resWithoutDelivery.co2eKg).toBe(MEAL_EMISSION_FACTORS.veg_thali);

    const resWithDelivery = calculateMealFootprint({ mealType: "veg_thali", hasDelivery: true });
    expect(resWithDelivery.co2eKg).toBe(Number((MEAL_EMISSION_FACTORS.veg_thali + 0.18).toFixed(4)));
  });

  it("should calculate custom ingredient footprints", () => {
    const res = calculateCustomFootprint({
      ingredients: [
        { category: "dairy", weightKg: 2 },
        { category: "fresh_produce", weightKg: 5 },
      ],
    });
    const expected = Number((2 * FOOD_EMISSION_FACTORS.dairy + 5 * FOOD_EMISSION_FACTORS.fresh_produce).toFixed(4));
    expect(res.co2eKg).toBe(expected);
  });
});

describe("dbService Seeding and Demo Mode", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  it("should detect demo mode correctly when Supabase is not configured", () => {
    expect(dbService.isDemoMode()).toBe(true);
  });

  it("should seed Arjun Mumbai's demo data on first user request", async () => {
    const user = await dbService.getCurrentUser();
    expect(user).not.toBeNull();
    expect(user?.name).toBe("Arjun");
    expect(user?.city).toBe("Mumbai");
    expect(user?.pet_stage).toBe("toddler");

    const budgets = await dbService.getWeeklyBudgets();
    expect(budgets.length).toBe(4);

    const logs = await dbService.getDailyLogs();
    // Verify electricity total
    const electricityLogs = logs.filter(l => l.envelope === "energy" && l.activity.includes("Electricity"));
    const totalElecCo2 = electricityLogs.reduce((sum, l) => sum + l.co2_kg, 0);
    // 280 kWh * 0.71 = 198.8 kg
    expect(totalElecCo2).toBeCloseTo(198.8, 2);

    // Verify scooter total
    const scooterLogs = logs.filter(l => l.envelope === "transport" && l.activity.includes("Scooter"));
    const totalScooterCo2 = scooterLogs.reduce((sum, l) => sum + l.co2_kg, 0);
    // 850 km * 0.012 = 10.2 kg
    expect(totalScooterCo2).toBeCloseTo(10.2, 2);

    // Verify Swiggy orders
    const swiggyLogs = logs.filter(l => l.source === "scan" && l.activity.includes("Swiggy"));
    expect(swiggyLogs.length).toBe(12);

    // Verify current week consumed is 60%
    const currentWeekOf = getOffsetDateString(0, 0);
    const currentBudget = budgets.find(b => b.week_of === currentWeekOf);
    expect(currentBudget).toBeDefined();
    
    const currentLogs = logs.filter(l => l.date >= currentWeekOf);
    const currentWeekTotalCo2 = currentLogs.reduce((sum, l) => sum + l.co2_kg, 0);
    // total weekly budget is 38.46, 60% of that is 23.076
    expect(currentWeekTotalCo2).toBeCloseTo(23.076, 3);
  });

  it("should handle start fresh reset database", async () => {
    await dbService.resetDatabase();
    
    const user = await dbService.getCurrentUser();
    expect(user?.name).toBe("Green Guardian");
    expect(user?.pet_stage).toBe("egg");
    expect(user?.pebbles_balance).toBe(0);

    const budgets = await dbService.getWeeklyBudgets();
    expect(budgets.length).toBe(1); // Only current week

    const logs = await dbService.getDailyLogs();
    expect(logs.length).toBe(0); // No logs
  });
});
