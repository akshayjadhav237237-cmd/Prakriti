import { describe, it, expect } from 'vitest';
import { calcTransport, calcFood, calcEnergy, calcLifestyle } from '../app/calculate/page';

describe('calcTransport', () => {
  it('returns 0 for cycling commute', () => {
    expect(calcTransport({
      commuteMode: 'Cycle', commuteKm: 10, commuteDays: 5,
      weekendMode: 'Walk', weekendKm: 5,
      domesticFlights: 0, intlFlights: 0,
    })).toBe(0);
  });

  it('calculates petrol scooter correctly', () => {
    // 0.0334 * 20km * 5 days = 3.34 kg
    const result = calcTransport({
      commuteMode: 'Petrol Scooter', commuteKm: 20, commuteDays: 5,
      weekendMode: 'Walk', weekendKm: 0,
      domesticFlights: 0, intlFlights: 0,
    });
    expect(result).toBeCloseTo(3.34, 1);
  });

  it('adds domestic flight emissions correctly', () => {
    // 2 flights/year = 2*90/52 = 3.46 kg/week
    const result = calcTransport({
      commuteMode: 'Metro', commuteKm: 10, commuteDays: 5,
      weekendMode: 'Walk', weekendKm: 0,
      domesticFlights: 2, intlFlights: 0,
    });
    const flightPortion = (2 * 90) / 52;
    const metroPortion = 0.0041 * 10 * 5;
    expect(result).toBeCloseTo(flightPortion + metroPortion, 1);
  });

  it('handles car commute', () => {
    // 0.1710 * 15km * 5 days = 12.825 kg
    const result = calcTransport({
      commuteMode: 'Car', commuteKm: 15, commuteDays: 5,
      weekendMode: 'Walk', weekendKm: 0,
      domesticFlights: 0, intlFlights: 0,
    });
    expect(result).toBeCloseTo(12.83, 1);
  });
});

describe('calcFood', () => {
  it('vegan diet with no delivery', () => {
    // 0.8 * 7 = 5.6 kg
    expect(calcFood({ dietType: 'Vegan', deliveryOrders: 0, wasteLevel: 'Never' }))
      .toBeCloseTo(5.6, 1);
  });

  it('adds delivery emissions', () => {
    // vegetarian: 1.2*7=8.4, delivery: 3*1.18=3.54, waste 1.0
    expect(calcFood({ dietType: 'Vegetarian', deliveryOrders: 3, wasteLevel: 'Never' }))
      .toBeCloseTo(11.94, 1);
  });

  it('waste multiplier increases total', () => {
    const noWaste = calcFood({ dietType: 'Vegetarian', deliveryOrders: 0, wasteLevel: 'Never' });
    const highWaste = calcFood({ dietType: 'Vegetarian', deliveryOrders: 0, wasteLevel: 'Often' });
    expect(highWaste).toBeGreaterThan(noWaste);
    expect(highWaste / noWaste).toBeCloseTo(1.3, 1);
  });

  it('heavy meat is highest diet type', () => {
    const vegan = calcFood({ dietType: 'Vegan', deliveryOrders: 0, wasteLevel: 'Never' });
    const heavy = calcFood({ dietType: 'Heavy meat', deliveryOrders: 0, wasteLevel: 'Never' });
    expect(heavy).toBeGreaterThan(vegan);
  });
});

describe('calcEnergy', () => {
  it('calculates from kWh directly', () => {
    // 100 kWh/month → 100/4.33 * 0.71 = 16.4 kg/week
    const result = calcEnergy({
      monthlyBill: 0, monthlyKwh: 100, provider: 'MSEB',
      hasAC: false, acHours: 0, lpgCylinders: 0,
    });
    expect(result).toBeCloseTo((100 / 4.33) * 0.71, 1);
  });

  it('adds AC emissions', () => {
    const withoutAC = calcEnergy({
      monthlyBill: 0, monthlyKwh: 100, provider: 'MSEB',
      hasAC: false, acHours: 0, lpgCylinders: 0,
    });
    const withAC = calcEnergy({
      monthlyBill: 0, monthlyKwh: 100, provider: 'MSEB',
      hasAC: true, acHours: 8, lpgCylinders: 0,
    });
    expect(withAC).toBeGreaterThan(withoutAC);
  });

  it('adds LPG emissions', () => {
    // 1 cylinder = 14.2 kg CO₂e → /4.33 per week = 3.28 kg/week
    const result = calcEnergy({
      monthlyBill: 0, monthlyKwh: 0, provider: 'Other',
      hasAC: false, acHours: 0, lpgCylinders: 1,
    });
    expect(result).toBeCloseTo(14.2 / 4.33, 1);
  });

  it('uses bill as fallback when kWh is 0', () => {
    // ₹600 bill / ₹6 per kWh = 100 kWh → 16.4 kg/week
    const fromBill = calcEnergy({
      monthlyBill: 600, monthlyKwh: 0, provider: 'MSEB',
      hasAC: false, acHours: 0, lpgCylinders: 0,
    });
    const fromKwh = calcEnergy({
      monthlyBill: 0, monthlyKwh: 100, provider: 'MSEB',
      hasAC: false, acHours: 0, lpgCylinders: 0,
    });
    expect(fromBill).toBeCloseTo(fromKwh, 0);
  });
});

describe('calcLifestyle', () => {
  it('returns 0 for minimal lifestyle', () => {
    const result = calcLifestyle({
      shoppingOrders: 0, shoppingCategory: 'Mixed',
      screenHours: 0, devices: [],
      gymMembership: false, hotelStays: 0, liveEvents: 0,
    });
    expect(result).toBe(0);
  });

  it('gym membership adds 0.5 kg/wk', () => {
    const without = calcLifestyle({
      shoppingOrders: 0, shoppingCategory: 'Mixed',
      screenHours: 0, devices: [],
      gymMembership: false, hotelStays: 0, liveEvents: 0,
    });
    const with_ = calcLifestyle({
      shoppingOrders: 0, shoppingCategory: 'Mixed',
      screenHours: 0, devices: [],
      gymMembership: true, hotelStays: 0, liveEvents: 0,
    });
    expect(with_ - without).toBeCloseTo(0.5, 1);
  });

  it('electronics orders have higher factor than grocery', () => {
    const electronics = calcLifestyle({
      shoppingOrders: 1, shoppingCategory: 'Electronics',
      screenHours: 0, devices: [],
      gymMembership: false, hotelStays: 0, liveEvents: 0,
    });
    const grocery = calcLifestyle({
      shoppingOrders: 1, shoppingCategory: 'Grocery',
      screenHours: 0, devices: [],
      gymMembership: false, hotelStays: 0, liveEvents: 0,
    });
    expect(electronics).toBeGreaterThan(grocery);
  });
});

describe('total calculation', () => {
  it('all categories sum correctly', () => {
    const t = calcTransport({
      commuteMode: 'Petrol Scooter', commuteKm: 20, commuteDays: 5,
      weekendMode: 'Walk', weekendKm: 0,
      domesticFlights: 0, intlFlights: 0,
    });
    const f = calcFood({ dietType: 'Vegetarian', deliveryOrders: 3, wasteLevel: 'Sometimes' });
    const e = calcEnergy({
      monthlyBill: 0, monthlyKwh: 120, provider: 'MSEB',
      hasAC: true, acHours: 6, lpgCylinders: 1,
    });
    const l = calcLifestyle({
      shoppingOrders: 4, shoppingCategory: 'Mixed',
      screenHours: 6, devices: ['Phone', 'Laptop'],
      gymMembership: true, hotelStays: 0, liveEvents: 0,
    });
    const total = +(t + f + e + l).toFixed(2);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(200); // sanity check
  });
});
