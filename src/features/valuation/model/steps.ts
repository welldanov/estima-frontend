export const VALUATION_STEPS = ["type", "address", "details", "result"] as const;

export type ValuationStep = (typeof VALUATION_STEPS)[number];

export const VALUATION_STEPS_TOTAL = VALUATION_STEPS.length;

export function getStepNumber(step: ValuationStep): number {
  return VALUATION_STEPS.indexOf(step) + 1;
}
