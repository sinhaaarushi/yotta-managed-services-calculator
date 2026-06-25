import type {
  CloudType,
  NewEdgeInput,
  NewEdgeResult,
  NewEdgeServiceType,
  YntraaServiceSpends,
} from "../types/index.js";
import { RATE_CARD } from "../config/rate-cards.js";
import { getSpendForCategory, roundCurrency } from "./utils.js";

const YNTRAA_CATEGORY_MAP: Partial<Record<NewEdgeServiceType, Parameters<typeof getSpendForCategory>[1]>> = {
  container_services: "container_services",
  compute_services: "compute_services",
  storage_services: "storage_services",
  backup_services: "backup_services",
  network_services: "network_services",
  database_services: "database_services",
};

export function resolveNewEdgeConsumption(
  cloudType: CloudType,
  serviceType: NewEdgeServiceType,
  serviceSpends: YntraaServiceSpends,
  monthlyCloudSpend: number,
  override?: number,
): number {
  if (override !== undefined) {
    return override;
  }

  const yntraaCategory = YNTRAA_CATEGORY_MAP[serviceType];
  if (cloudType === "yntraa" && yntraaCategory) {
    return getSpendForCategory(serviceSpends, yntraaCategory);
  }

  const minimum = RATE_CARD.newEdgeServiceMinimums[serviceType];
  if (minimum !== undefined) {
    return minimum;
  }

  return monthlyCloudSpend;
}

export function calculateNewEdge(
  cloudType: CloudType,
  monthlyCloudSpend: number,
  serviceSpends: YntraaServiceSpends,
  input?: NewEdgeInput,
): NewEdgeResult {
  const enabled = input?.enabled ?? false;
  const serviceType = input?.serviceType ?? "database_services";
  const monthlyConsumption = resolveNewEdgeConsumption(
    cloudType,
    serviceType,
    serviceSpends,
    monthlyCloudSpend,
    input?.monthlyConsumption,
  );
  const chargePercent = RATE_CARD.newEdgeChargePercent;
  const amount = enabled
    ? roundCurrency(monthlyConsumption * chargePercent)
    : 0;

  return {
    enabled,
    serviceType,
    monthlyConsumption,
    chargePercent,
    amount,
  };
}
