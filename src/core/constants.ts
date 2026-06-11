/**
 * Prakriti Carbon Platform - Core Constants
 * India-specific carbon emission factors and default budget allocations.
 */

/**
 * Grid electricity emission factor.
 * CEA (Central Electricity Authority of India) grid value.
 * Unit: kg CO2e / kWh
 * @source Central Electricity Authority (CEA) CO2 Baseline Database for the Indian Power Sector (2023/2024 value of ~0.710)
 */
export const GRID_ELECTRICITY_EMISSION_FACTOR = 0.710;

/**
 * Transport emission factors.
 * Unit: kg CO2e / km (or kg CO2e / passenger-km for public transit)
 */
export const TRANSPORT_EMISSION_FACTORS = {
  /**
   * Petrol Scooter.
   * Unit: kg CO2e / km
   * @source Automotive Research Association of India (ARAI) average mileage & tailpipe emissions
   */
  petrol_scooter: 0.0334,

  /**
   * Electric Scooter.
   * Based on average coal-heavy charging grid efficiency in India (approx. 0.03 kWh/km * 0.710 kg/kWh + lifecycle).
   * Unit: kg CO2e / km
   * @source Coal grid charging calculations and Automotive Research Association of India (ARAI)
   */
  electric_scooter: 0.0120,

  /**
   * Ola/Uber Cab.
   * Average of popular hatchback/sedan cabs in India (e.g., Maruti Dzire, Toyota Etios).
   * Unit: kg CO2e / km
   * @source Automotive Research Association of India (ARAI) average Dzire/Etios data
   */
  cab: 0.149,

  /**
   * Mumbai Local Train.
   * Unit: kg CO2e / passenger-km (pax-km)
   * @source Indian Railways environmental sustainability baseline report
   */
  mumbai_local: 0.0064,

  /**
   * Delhi Metro.
   * Unit: kg CO2e / passenger-km (pax-km)
   * @source Delhi Metro Rail Corporation (DMRC) official carbon footprint disclosure
   */
  delhi_metro: 0.0139,

  /**
   * CNG Auto Rickshaw.
   * Unit: kg CO2e / km
   * @source Automotive Research Association of India (ARAI) emissions testing
   */
  cng_auto: 0.1077,

  /**
   * Walking or Cycling.
   * Zero-emission mode.
   * Unit: kg CO2e / km
   */
  walk_cycle: 0.0,
} as const;

export type TransportMode = keyof typeof TRANSPORT_EMISSION_FACTORS;

/**
 * Food emission factors by ingredient type.
 * Unit: kg CO2e / kg of ingredient
 * @source Life Cycle Assessments (LCA) for Indian diets and agricultural commodities
 */
export const FOOD_EMISSION_FACTORS = {
  /**
   * Dairy products (milk, paneer, curd, ghee, etc.)
   * Unit: kg CO2e / kg
   */
  dairy: 1.5,

  /**
   * Red meat (mutton, beef, pork, etc.)
   * Unit: kg CO2e / kg
   */
  red_meat: 12.0,

  /**
   * Chicken / Poultry.
   * Unit: kg CO2e / kg
   */
  chicken: 3.0,

  /**
   * Fresh produce (vegetables, fruits).
   * Unit: kg CO2e / kg
   */
  fresh_produce: 0.2,

  /**
   * Processed grains (wheat flour, white/brown rice, lentils, etc.)
   * Unit: kg CO2e / kg
   */
  processed_grains: 0.6,

  /**
   * Packaged snacks (chips, biscuits, processed foods, instant noodles).
   * Unit: kg CO2e / kg
   */
  packaged_snacks: 1.2,
} as const;

export type FoodCategory = keyof typeof FOOD_EMISSION_FACTORS;

/**
 * Standard meal carbon footprints (pre-calculated).
 * Unit: kg CO2e / meal
 * @source Lifecycle analysis of typical Indian meals and restaurant food preparation
 */
export const MEAL_EMISSION_FACTORS = {
  /**
   * Mutton Biryani meal.
   * Unit: kg CO2e / meal
   */
  mutton_biryani: 5.0,

  /**
   * Chicken meal (e.g., Butter Chicken + Naan/Rice).
   * Unit: kg CO2e / meal
   */
  chicken: 1.8,

  /**
   * Veg Thali (standard North/South Indian veg thali with paneer, dal, rice, roti).
   * Unit: kg CO2e / meal
   */
  veg_thali: 1.5,

  /**
   * Vegan Bowl (completely plant-based salad, brown rice, legumes).
   * Unit: kg CO2e / meal
   */
  vegan_bowl: 0.5,
} as const;

export type MealType = keyof typeof MEAL_EMISSION_FACTORS;

/**
 * Additional emissions for food delivery services (e.g., Swiggy/Zomato).
 * Accounts for single-use plastic/paper packaging, delivery rider transport.
 * Unit: kg CO2e / order
 * @source Food delivery logistics lifecycle estimates
 */
export const SWIGGY_DELIVERY_EMISSION = 0.18;

/**
 * Default diet types available in Prakriti.
 */
export const DIET_TYPES = {
  vegan: {
    name: "Vegan",
    description: "100% plant-based diet, no animal products.",
  },
  vegetarian: {
    name: "Vegetarian",
    description: "Plant-based with dairy, no meat or eggs.",
  },
  non_vegetarian: {
    name: "Non-Vegetarian",
    description: "Balanced diet including chicken, fish, dairy, and plants.",
  },
  heavy_non_vegetarian: {
    name: "Heavy Non-Vegetarian",
    description: "Frequent consumption of red meat (mutton, beef) and chicken.",
  },
} as const;

export type DietType = keyof typeof DIET_TYPES;

/**
 * Default Weekly Carbon Budget.
 * Target: 2 tonnes CO2e / year (approximately 2000 kg).
 * 2000 kg / 52 weeks = 38.46 kg CO2e / week.
 */
export const DEFAULT_WEEKLY_BUDGET = 38.46;

/**
 * Default envelope allocation for the weekly budget.
 * Total sums to 38.46 kg CO2e.
 */
export const DEFAULT_ENVELOPE_ALLOCATION = {
  /**
   * Transport envelope.
   * Default: 12.0 kg CO2e/week
   */
  transport: 12.0,

  /**
   * Food envelope.
   * Default: 8.0 kg CO2e/week
   */
  food: 8.0,

  /**
   * Cooling & Energy envelope.
   * Default: 14.0 kg CO2e/week
   */
  energy: 14.0,

  /**
   * Lifestyle & other consumption envelope.
   * Default: 4.46 kg CO2e/week
   */
  lifestyle: 4.46,
} as const;

export type Envelope = keyof typeof DEFAULT_ENVELOPE_ALLOCATION;
