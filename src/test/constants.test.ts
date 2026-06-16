import { describe, it, expect } from 'vitest';

// India-specific emission factors — validated against public sources
const EMISSION_FACTORS = {
  CEA_GRID: 0.71,           // CEA 2023, kg CO₂e per kWh
  PETROL_SCOOTER: 0.0334,   // ARAI, kg CO₂e per km
  CAR: 0.1710,              // ARAI, kg CO₂e per km
  BUS: 0.0089,              // CEA modal, kg CO₂e per km
  METRO: 0.0041,            // CEA modal, kg CO₂e per km
  LPG_CYLINDER: 14.2,       // CPCB, kg CO₂e per 14.2kg cylinder
  DOMESTIC_FLIGHT: 90,      // ICAO, kg CO₂e per flight
  SWIGGY_ORDER: 1.18,       // packaging + delivery + food avg
};

const BENCHMARKS = {
  INDIA_WEEKLY: 52.1,
  MUMBAI_WEEKLY: 45.2,
  GLOBAL_WEEKLY: 65.4,
  PARIS_BUDGET_WEEKLY: 38.46,
};

describe('Emission factors are in expected ranges', () => {
  it('CEA grid factor is in 0.5–1.0 range', () => {
    expect(EMISSION_FACTORS.CEA_GRID).toBeGreaterThan(0.5);
    expect(EMISSION_FACTORS.CEA_GRID).toBeLessThan(1.0);
  });

  it('Petrol scooter < car (per km)', () => {
    expect(EMISSION_FACTORS.PETROL_SCOOTER).toBeLessThan(EMISSION_FACTORS.CAR);
  });

  it('Metro < bus < scooter < car (per km)', () => {
    expect(EMISSION_FACTORS.METRO).toBeLessThan(EMISSION_FACTORS.BUS);
    expect(EMISSION_FACTORS.BUS).toBeLessThan(EMISSION_FACTORS.PETROL_SCOOTER);
    expect(EMISSION_FACTORS.PETROL_SCOOTER).toBeLessThan(EMISSION_FACTORS.CAR);
  });

  it('Paris budget is less than India average', () => {
    expect(BENCHMARKS.PARIS_BUDGET_WEEKLY).toBeLessThan(BENCHMARKS.INDIA_WEEKLY);
  });

  it('Mumbai avg is less than India avg', () => {
    expect(BENCHMARKS.MUMBAI_WEEKLY).toBeLessThan(BENCHMARKS.INDIA_WEEKLY);
  });

  it('LPG cylinder factor is positive and realistic', () => {
    expect(EMISSION_FACTORS.LPG_CYLINDER).toBeGreaterThan(10);
    expect(EMISSION_FACTORS.LPG_CYLINDER).toBeLessThan(20);
  });
});
