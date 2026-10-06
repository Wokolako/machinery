// The calculation engine (blueprint Section 7): pure functions over one shift.
// No database access here, so everything is unit-testable.

export const toMajor = (minor) => Number(minor) / 100;

export const toKg = (qty, unit) => (unit === "t" ? qty * 1000 : qty);

const round = (n, places) => (n === null ? null : Math.round(n * 10 ** places) / 10 ** places);

/**
 * @param {object} shift
 * @param {number} shift.inputKg
 * @param {number|null} shift.inputValue      scope's planned input value, major units
 * @param {number|null} shift.bandLow         expected multiplier band, or null if unscoped
 * @param {number|null} shift.bandHigh
 * @param {number} shift.hoursRun
 * @param {number} shift.wasteKg
 * @param {{gradeCode:string, kind:'good'|'reject'|'waste', qtyKg:number, pricePerKg:number}[]} shift.outputs
 * @param {number} [shift.meanPremiumShare]  machine's 30-day mean; enables grade_drift
 * @param {boolean} [shift.scoped]           false raises the unscoped flag
 */
export function computeShiftMetrics(shift) {
  const { inputKg, inputValue, bandLow, bandHigh, hoursRun, wasteKg, outputs } = shift;
  const scoped = shift.scoped ?? (inputValue !== null && bandLow !== null && bandHigh !== null);

  const goodKg = outputs.filter((o) => o.kind === "good").reduce((sum, o) => sum + o.qtyKg, 0);
  const premiumKg = outputs
    .filter((o) => o.gradeCode === "premium")
    .reduce((sum, o) => sum + o.qtyKg, 0);
  const rejectKg = outputs.filter((o) => o.kind === "reject").reduce((sum, o) => sum + o.qtyKg, 0);
  const outputValue = outputs.reduce((sum, o) => sum + o.qtyKg * o.pricePerKg, 0);

  const hasValue = typeof inputValue === "number" && inputValue > 0;
  const multiplier = hasValue ? outputValue / inputValue : null;
  const bandPosition =
    multiplier !== null && scoped ? (multiplier - bandLow) / (bandHigh - bandLow) : null;
  const grossMargin = hasValue ? outputValue - inputValue : null;
  const valuePerHour = grossMargin !== null && hoursRun > 0 ? grossMargin / hoursRun : null;
  const wasteValue = hasValue && inputKg > 0 ? wasteKg * (inputValue / inputKg) : null;
  const premiumShare = goodKg > 0 ? premiumKg / goodKg : 0;

  const flags = [];
  if (!scoped) flags.push("unscoped");
  if (bandPosition !== null && bandPosition < 0) flags.push("below_band");
  if (bandPosition !== null && bandPosition > 1) flags.push("above_band");
  if (
    typeof shift.meanPremiumShare === "number" &&
    goodKg > 0 &&
    Math.abs(premiumShare - shift.meanPremiumShare) > 0.2
  ) {
    flags.push("grade_drift");
  }

  return {
    goodKg,
    premiumKg,
    rejectKg,
    outputValue: round(outputValue, 2),
    multiplier: round(multiplier, 4),
    bandPosition: round(bandPosition, 4),
    yieldPct: inputKg > 0 ? round((goodKg / inputKg) * 100, 2) : null,
    grossMargin: round(grossMargin, 2),
    valuePerHour: round(valuePerHour, 2),
    wasteValue: round(wasteValue, 2),
    premiumShare: round(premiumShare, 4),
    flags,
  };
}
