// Worked example from the blueprint, Section 7. Illustrative figures only:
// the product ships with no default band, prices or norms.
export const scope = {
  machine: "CR-04 Jaw crusher",
  material: "Sapphire concentrate",
  inputKg: 400,
  inputValue: 2000,
  bandLow: 1.5,
  bandHigh: 17,
  plannedHours: 8,
};

export const shiftFacts = {
  hoursRun: 7.5,
  wasteKg: 20,
  premiumPrice: 150,
  commercialPrice: 20,
  // Machine's 30-day mean premium share, used by the grade_drift rule.
  meanPremiumShare: 0.375,
};

export const maxGoodKg = scope.inputKg - shiftFacts.wasteKg;

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

export function computeShift(goodKg: number, premiumKg: number): ShiftMetrics {
  const premium = Math.min(premiumKg, goodKg);
  const commercial = goodKg - premium;
  const reject = maxGoodKg - goodKg;

  const outputValue =
    premium * shiftFacts.premiumPrice + commercial * shiftFacts.commercialPrice;
  const multiplier = outputValue / scope.inputValue;
  const bandPosition =
    (multiplier - scope.bandLow) / (scope.bandHigh - scope.bandLow);
  const grossMargin = outputValue - scope.inputValue;
  const inputPricePerKg = scope.inputValue / scope.inputKg;
  const premiumShare = goodKg > 0 ? premium / goodKg : 0;

  const flags: FlagCode[] = [];
  if (bandPosition < 0) flags.push("below_band");
  if (bandPosition > 1) flags.push("above_band");
  if (goodKg > 0 && Math.abs(premiumShare - shiftFacts.meanPremiumShare) > 0.2) {
    flags.push("grade_drift");
  }

  return {
    premiumKg: premium,
    commercialKg: commercial,
    rejectKg: reject,
    outputValue,
    multiplier,
    bandPosition,
    yieldPct: (goodKg / scope.inputKg) * 100,
    grossMargin,
    valuePerHour: grossMargin / shiftFacts.hoursRun,
    wasteValue: shiftFacts.wasteKg * inputPricePerKg,
    premiumShare,
    flags,
  };
}

export const flagText: Record<FlagCode, string> = {
  below_band: "Multiplier below the scope's band. The approver must add a note.",
  above_band:
    "Multiplier above the scope's band. The approver must add a note and the partner is alerted.",
  grade_drift:
    "Premium share is more than 20 points from this machine's 30-day mean. A re-grade sample is scheduled.",
};
