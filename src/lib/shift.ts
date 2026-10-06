// Pure calculations for one shift, following the blueprint's Section 7.
// Every input comes from the database via the API's /demo-shift endpoint.

export type ShiftParams = {
  inputKg: number;
  inputValue: number;
  bandLow: number;
  bandHigh: number;
  hoursRun: number;
  wasteKg: number;
  premiumPrice: number;
  commercialPrice: number;
  meanPremiumShare: number;
};

export type FlagCode = "below_band" | "above_band" | "grade_drift";

export type ShiftMetrics = {
  premiumKg: number;
  commercialKg: number;
  rejectKg: number;
  outputValue: number;
  multiplier: number;
  bandPosition: number;
  yieldPct: number;
  grossMargin: number;
  valuePerHour: number;
  wasteValue: number;
  premiumShare: number;
  flags: FlagCode[];
};

export const maxGoodKg = (p: ShiftParams) => p.inputKg - p.wasteKg;

export function computeShift(p: ShiftParams, goodKg: number, premiumKg: number): ShiftMetrics {
  const premium = Math.min(premiumKg, goodKg);
  const commercial = goodKg - premium;
  const reject = maxGoodKg(p) - goodKg;

  const outputValue = premium * p.premiumPrice + commercial * p.commercialPrice;
  const multiplier = outputValue / p.inputValue;
  const bandPosition = (multiplier - p.bandLow) / (p.bandHigh - p.bandLow);
  const grossMargin = outputValue - p.inputValue;
  const inputPricePerKg = p.inputValue / p.inputKg;
  const premiumShare = goodKg > 0 ? premium / goodKg : 0;

  const flags: FlagCode[] = [];
  if (bandPosition < 0) flags.push("below_band");
  if (bandPosition > 1) flags.push("above_band");
  if (goodKg > 0 && Math.abs(premiumShare - p.meanPremiumShare) > 0.2) {
    flags.push("grade_drift");
  }

  return {
    premiumKg: premium,
    commercialKg: commercial,
    rejectKg: reject,
    outputValue,
    multiplier,
    bandPosition,
    yieldPct: (goodKg / p.inputKg) * 100,
    grossMargin,
    valuePerHour: grossMargin / p.hoursRun,
    wasteValue: p.wasteKg * inputPricePerKg,
    premiumShare,
    flags,
  };
}
