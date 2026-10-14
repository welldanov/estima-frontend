import { describe, expect, it } from "vitest";

import { VALUATION_STEPS, VALUATION_STEPS_TOTAL, getStepNumber } from "./steps";

describe("шаги визарда", () => {
  it("нумерует шаги с 1 по порядку", () => {
    expect(VALUATION_STEPS.map(getStepNumber)).toEqual([1, 2, 3, 4]);
  });

  it("последний шаг совпадает с общим числом шагов", () => {
    expect(getStepNumber("result")).toBe(VALUATION_STEPS_TOTAL);
  });
});
