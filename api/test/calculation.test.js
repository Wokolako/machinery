import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeShiftMetrics, toKg, toMajor } from "../src/services/calculation.service.js";

// Blueprint Section 7 worked example, used as a fixture (not a default).
const workedExample = {
  inputKg: 400,
  inputValue: 2000,
  bandLow: 1.5,
  bandHigh: 17,
  hoursRun: 7.5,
  wasteKg: 20,
  outputs: [
    { gradeCode: "premium", kind: "good", qtyKg: 120, pricePerKg: 150 },
    { gradeCode: "commercial", kind: "good", qtyKg: 200, pricePerKg: 20 },
    { gradeCode: "reject", kind: "reject", qtyKg: 60, pricePerKg: 0 },
  ],
};

describe("computeShiftMetrics", () => {
  it("reproduces the blueprint's worked example", () => {
    const m = computeShiftMetrics(workedExample);
    assert.equal(m.outputValue, 22000);
    assert.equal(m.multiplier, 11);
    assert.equal(m.bandPosition, 0.6129);
    assert.equal(m.yieldPct, 80);
    assert.equal(m.grossMargin, 20000);
    assert.equal(m.valuePerHour, 2666.67);
    assert.equal(m.wasteValue, 100);
    assert.equal(m.goodKg, 320);
    assert.equal(m.rejectKg, 60);
    assert.deepEqual(m.flags, []);
  });

  it("flags a multiplier above the band rather than celebrating it", () => {
    const m = computeShiftMetrics({
      ...workedExample,
      outputs: [{ gradeCode: "premium", kind: "good", qtyKg: 380, pricePerKg: 150 }],
    });
    assert.equal(m.multiplier, 28.5);
    assert.ok(m.bandPosition > 1);
    assert.ok(m.flags.includes("above_band"));
  });

  it("flags a multiplier below the band", () => {
    const m = computeShiftMetrics({
      ...workedExample,
      outputs: [{ gradeCode: "commercial", kind: "good", qtyKg: 50, pricePerKg: 20 }],
    });
    assert.equal(m.multiplier, 0.5);
    assert.ok(m.flags.includes("below_band"));
  });

  it("raises grade_drift when the premium share moves more than 20 points", () => {
    const m = computeShiftMetrics({
      ...workedExample,
      meanPremiumShare: 0.375,
      outputs: [
        { gradeCode: "premium", kind: "good", qtyKg: 300, pricePerKg: 150 },
        { gradeCode: "commercial", kind: "good", qtyKg: 20, pricePerKg: 20 },
      ],
    });
    assert.ok(m.flags.includes("grade_drift"));
  });

  it("does not raise grade_drift within 20 points of the mean", () => {
    const m = computeShiftMetrics({ ...workedExample, meanPremiumShare: 0.375 });
    assert.ok(!m.flags.includes("grade_drift"));
  });

  it("marks a shift with no scope as unscoped and leaves money metrics empty", () => {
    const m = computeShiftMetrics({
      ...workedExample,
      inputValue: null,
      bandLow: null,
      bandHigh: null,
      scoped: false,
    });
    assert.deepEqual(m.flags, ["unscoped"]);
    assert.equal(m.multiplier, null);
    assert.equal(m.bandPosition, null);
    assert.equal(m.grossMargin, null);
    assert.equal(m.yieldPct, 80);
  });

  it("returns null value per hour when no hours were run", () => {
    const m = computeShiftMetrics({ ...workedExample, hoursRun: 0 });
    assert.equal(m.valuePerHour, null);
  });
});

describe("unit helpers", () => {
  it("converts minor units to major", () => {
    assert.equal(toMajor(200000), 2000);
    assert.equal(toMajor(15000), 150);
  });

  it("converts tonnes to kilograms", () => {
    assert.equal(toKg(140, "t"), 140000);
    assert.equal(toKg(140, "kg"), 140);
  });
});
