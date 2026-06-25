import type {
  BillingManagementInput,
  BillingManagementResult,
} from "../types/index.js";
import {
  resolveBillingConcession,
  roundCurrency,
} from "./utils.js";

export function calculateBillingManagement(
  monthlyConsumption: number,
  input: BillingManagementInput = { enabled: false },
): BillingManagementResult {
  const { percent, slabLabel } = resolveBillingConcession(monthlyConsumption);

  if (!input.enabled) {
    return {
      enabled: false,
      monthlyConsumption,
      concessionPercent: percent,
      concessionSlabLabel: slabLabel,
      optimizedMonthlyConsumption: 0,
      monthlySavings: 0,
    };
  }

  const optimizedMonthlyConsumption = roundCurrency(
    monthlyConsumption * (1 - percent),
  );
  const monthlySavings = roundCurrency(
    monthlyConsumption - optimizedMonthlyConsumption,
  );

  return {
    enabled: true,
    monthlyConsumption,
    concessionPercent: percent,
    concessionSlabLabel: slabLabel,
    optimizedMonthlyConsumption,
    monthlySavings,
  };
}
