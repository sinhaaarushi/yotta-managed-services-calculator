import type { MonitoringInput, MonitoringResult } from "../types/index.js";
import { RATE_CARD } from "../config/rate-cards.js";
import { roundCurrency } from "./utils.js";

export function calculateMonitoring(input?: MonitoringInput): MonitoringResult {
  const enabled = input?.enabled ?? false;
  const workloadCount = input?.workloadCount ?? 0;
  const pricePerWorkload = RATE_CARD.monitoringPricePerWorkload;
  const amount = enabled
    ? roundCurrency(workloadCount * pricePerWorkload)
    : 0;

  return {
    enabled,
    workloadCount,
    pricePerWorkload,
    amount,
  };
}
