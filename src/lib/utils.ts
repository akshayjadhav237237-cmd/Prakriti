/**
 * Format carbon emission value to a standard string
 */
export function formatKg(kg: number): string {
  return `${kg.toFixed(1)} kg CO₂e`;
}

/**
 * Get status code based on spent vs allocated budget
 */
export function getEnvelopeStatus(spent: number, allocated: number): 'safe' | 'warning' | 'over' {
  if (allocated <= 0) return 'over';
  const pct = spent / allocated;
  if (pct > 1) return 'over';
  if (pct >= 0.8) return 'warning';
  return 'safe';
}

/**
 * Convert weekly carbon footprint to monthly average
 */
export function weeklyToMonthly(weekly: number): number {
  return +(weekly * 4.33).toFixed(2);
}

/**
 * Calculate the percentage difference between two footprint metrics
 */
export function percentageDiff(value: number, benchmark: number): number {
  if (benchmark === 0) return 0;
  return +(((value - benchmark) / benchmark) * 100).toFixed(1);
}
