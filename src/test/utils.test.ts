import { describe, it, expect } from 'vitest';
import { formatKg, getEnvelopeStatus, weeklyToMonthly, percentageDiff } from '../lib/utils';

describe('formatKg', () => {
  it('formats correctly', () => {
    expect(formatKg(34.8)).toBe('34.8 kg CO₂e');
    expect(formatKg(0)).toBe('0.0 kg CO₂e');
    expect(formatKg(100.123)).toBe('100.1 kg CO₂e');
  });
});

describe('getEnvelopeStatus', () => {
  it('returns safe when under 80%', () => {
    expect(getEnvelopeStatus(7, 10)).toBe('safe');
  });
  it('returns warning when 80-100%', () => {
    expect(getEnvelopeStatus(8.5, 10)).toBe('warning');
  });
  it('returns over when > 100%', () => {
    expect(getEnvelopeStatus(11.2, 10)).toBe('over');
  });
  it('returns warning at exactly 80%', () => {
    expect(getEnvelopeStatus(8, 10)).toBe('warning');
  });
});

describe('weeklyToMonthly', () => {
  it('converts correctly', () => {
    expect(weeklyToMonthly(10)).toBeCloseTo(43.3, 1);
  });
  it('returns 0 for 0 input', () => {
    expect(weeklyToMonthly(0)).toBe(0);
  });
});

describe('percentageDiff', () => {
  it('negative when below benchmark', () => {
    expect(percentageDiff(34.8, 52.1)).toBeLessThan(0);
  });
  it('positive when above benchmark', () => {
    expect(percentageDiff(60, 52.1)).toBeGreaterThan(0);
  });
  it('0 when equal', () => {
    expect(percentageDiff(52.1, 52.1)).toBe(0);
  });
});
