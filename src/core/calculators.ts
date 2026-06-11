/**
 * Prakriti Carbon Platform - Core Calculators
 * Carbon footprint calculators for electricity, transport, food, and custom items.
 */

import {
  GRID_ELECTRICITY_EMISSION_FACTOR,
  TRANSPORT_EMISSION_FACTORS,
  FOOD_EMISSION_FACTORS,
  MEAL_EMISSION_FACTORS,
  SWIGGY_DELIVERY_EMISSION,
  TransportMode,
  FoodCategory,
  MealType,
} from "./constants";

// --- ELECTRICITY FOOTPRINT ---

export interface ElectricityCalculationInput {
  /** Electricity consumption in Kilowatt-hours (kWh) */
  consumptionKwh: number;
}

export interface ElectricityCalculationOutput {
  /** Carbon footprint in kilograms of CO2 equivalent (kg CO2e) */
  co2eKg: number;
  /** Detailed breakdown of the calculation */
  breakdown: {
    consumptionKwh: number;
    emissionFactor: number;
  };
}

/**
 * Calculates the carbon footprint of grid electricity consumption in India.
 * @param input Electricity consumption details
 */
export function calculateElectricityFootprint(
  input: ElectricityCalculationInput
): ElectricityCalculationOutput {
  const { consumptionKwh } = input;
  const factor = GRID_ELECTRICITY_EMISSION_FACTOR;
  const co2eKg = Number((consumptionKwh * factor).toFixed(4));

  return {
    co2eKg,
    breakdown: {
      consumptionKwh,
      emissionFactor: factor,
    },
  };
}

// --- TRANSPORT FOOTPRINT ---

export interface TransportCalculationInput {
  /** Distance traveled in kilometers (km) */
  distanceKm: number;
  /** Transport mode key */
  mode: TransportMode;
}

export interface TransportCalculationOutput {
  /** Carbon footprint in kilograms of CO2 equivalent (kg CO2e) */
  co2eKg: number;
  /** Detailed breakdown of the calculation */
  breakdown: {
    distanceKm: number;
    mode: TransportMode;
    emissionFactor: number;
  };
}

/**
 * Calculates the carbon footprint of transport based on distance and mode.
 * @param input Transport mode and distance details
 */
export function calculateTransportFootprint(
  input: TransportCalculationInput
): TransportCalculationOutput {
  const { distanceKm, mode } = input;
  const factor = TRANSPORT_EMISSION_FACTORS[mode] ?? 0;
  const co2eKg = Number((distanceKm * factor).toFixed(4));

  return {
    co2eKg,
    breakdown: {
      distanceKm,
      mode,
      emissionFactor: factor,
    },
  };
}

// --- MEAL FOOTPRINT ---

export interface MealCalculationInput {
  /** Predefined meal type key */
  mealType: MealType;
  /** Whether the meal was ordered via delivery (e.g. Swiggy/Zomato) */
  hasDelivery: boolean;
}

export interface MealCalculationOutput {
  /** Carbon footprint in kilograms of CO2 equivalent (kg CO2e) */
  co2eKg: number;
  /** Detailed breakdown of the calculation */
  breakdown: {
    mealType: MealType;
    mealCo2eKg: number;
    deliveryCo2eKg: number;
    hasDelivery: boolean;
  };
}

/**
 * Calculates the carbon footprint of a meal including optional delivery surcharge.
 * @param input Meal type and delivery details
 */
export function calculateMealFootprint(
  input: MealCalculationInput
): MealCalculationOutput {
  const { mealType, hasDelivery } = input;
  const mealCo2eKg = MEAL_EMISSION_FACTORS[mealType] ?? 0;
  const deliveryCo2eKg = hasDelivery ? SWIGGY_DELIVERY_EMISSION : 0;
  const co2eKg = Number((mealCo2eKg + deliveryCo2eKg).toFixed(4));

  return {
    co2eKg,
    breakdown: {
      mealType,
      mealCo2eKg,
      deliveryCo2eKg,
      hasDelivery,
    },
  };
}

// --- CUSTOM ITEM FOOTPRINT ---

export interface CustomItemIngredient {
  /** Food category key */
  category: FoodCategory;
  /** Weight of the ingredient in kilograms (kg) */
  weightKg: number;
}

export interface CustomCalculationInput {
  /** List of ingredients and their weights */
  ingredients?: CustomItemIngredient[];
  /** Custom footprint override (e.g. for manual logging or custom items) */
  customCo2eKg?: number;
}

export interface CustomIngredientBreakdown {
  category: FoodCategory;
  weightKg: number;
  emissionFactor: number;
  co2eKg: number;
}

export interface CustomCalculationOutput {
  /** Carbon footprint in kilograms of CO2 equivalent (kg CO2e) */
  co2eKg: number;
  /** Detailed breakdown of the calculation */
  breakdown: {
    ingredientsTotal: number;
    customOverride: number;
    ingredients: CustomIngredientBreakdown[];
  };
}

/**
 * Calculates the carbon footprint of custom items (e.g., specific recipes or manual entries).
 * Supports both ingredient-based calculations and custom overrides.
 * @param input Custom ingredients or override value
 */
export function calculateCustomFootprint(
  input: CustomCalculationInput
): CustomCalculationOutput {
  const { ingredients = [], customCo2eKg } = input;

  let ingredientsTotal = 0;
  const ingredientsBreakdown: CustomIngredientBreakdown[] = [];

  for (const item of ingredients) {
    const factor = FOOD_EMISSION_FACTORS[item.category] ?? 0;
    const itemCo2e = Number((item.weightKg * factor).toFixed(4));
    ingredientsTotal += itemCo2e;
    ingredientsBreakdown.push({
      category: item.category,
      weightKg: item.weightKg,
      emissionFactor: factor,
      co2eKg: itemCo2e,
    });
  }

  ingredientsTotal = Number(ingredientsTotal.toFixed(4));
  const override = customCo2eKg !== undefined ? Number(customCo2eKg.toFixed(4)) : 0;

  // If override is provided, we use it; otherwise, sum the ingredients.
  const co2eKg = customCo2eKg !== undefined ? override : ingredientsTotal;

  return {
    co2eKg,
    breakdown: {
      ingredientsTotal,
      customOverride: override,
      ingredients: ingredientsBreakdown,
    },
  };
}

// --- WEEKLY BUDGET REMAINING ---

export interface BudgetRemainingInput {
  allocated: number;
  spent: number;
}

export interface BudgetRemainingOutput {
  remaining: number;
  remainingPercent: number;
  isOverspent: boolean;
}

/**
 * Calculates the remaining weekly carbon budget.
 * @param input Allocated and spent carbon footprint in kg CO2e
 */
export function calculateWeeklyBudgetRemaining(
  input: BudgetRemainingInput
): BudgetRemainingOutput {
  const { allocated, spent } = input;
  const remaining = Number((allocated - spent).toFixed(4));
  const remainingPercent = allocated > 0 ? Number(((remaining / allocated) * 100).toFixed(4)) : 0;

  return {
    remaining,
    remainingPercent,
    isOverspent: spent > allocated,
  };
}
