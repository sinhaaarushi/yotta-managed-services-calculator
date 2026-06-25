import type {
  ManagedServicesPlan,
  PaymentTerm,
  SlabRateResult,
  YntraaServiceCategory,
  YntraaServiceSpends,
} from "../types/index.js";
import { RATE_CARD } from "../config/rate-cards.js";

export function roundCurrency(value: number): number {
  return Math.round(value);
}

export function sumServiceSpends(spends: YntraaServiceSpends): number {
  return (
    spends.containerServices +
    spends.computeServices +
    spends.storageServices +
    spends.backupServices +
    spends.networkServices +
    spends.databaseServices
  );
}

export function normalizeServiceSpends(
  partial?: Partial<YntraaServiceSpends>,
): YntraaServiceSpends {
  return {
    containerServices: partial?.containerServices ?? 0,
    computeServices: partial?.computeServices ?? 0,
    storageServices: partial?.storageServices ?? 0,
    backupServices: partial?.backupServices ?? 0,
    networkServices: partial?.networkServices ?? 0,
    databaseServices: partial?.databaseServices ?? 0,
  };
}

export function getSpendForCategory(
  spends: YntraaServiceSpends,
  category: YntraaServiceCategory,
): number {
  const map: Record<YntraaServiceCategory, keyof YntraaServiceSpends> = {
    container_services: "containerServices",
    compute_services: "computeServices",
    storage_services: "storageServices",
    backup_services: "backupServices",
    network_services: "networkServices",
    database_services: "databaseServices",
  };
  return spends[map[category]];
}

export function resolveBillingConcession(monthlyConsumption: number): SlabRateResult {
  for (const slab of RATE_CARD.billingManagementSlabs) {
    if (slab.maxSpend === null || monthlyConsumption <= slab.maxSpend) {
      return { percent: slab.discount, slabLabel: slab.label };
    }
  }
  const last = RATE_CARD.billingManagementSlabs.at(-1)!;
  return { percent: last.discount, slabLabel: last.label };
}

export function resolveManagedServicesPercent(
  basisSpend: number,
  plan: ManagedServicesPlan,
  doaApplicable: boolean,
): SlabRateResult {
  if (plan === "foundation") {
    return { percent: 0, slabLabel: "Foundation (included)" };
  }

  const slabs = doaApplicable
    ? RATE_CARD.doaManagedServicesSlabs
    : RATE_CARD.managedServicesSlabs;

  for (const slab of slabs) {
    if (slab.maxSpend === null || basisSpend <= slab.maxSpend) {
      const percent = plan === "prime" ? slab.prime : slab.priority;
      return { percent, slabLabel: slab.label };
    }
  }

  const last = slabs.at(-1)!;
  const percent = plan === "prime" ? last.prime : last.priority;
  return { percent, slabLabel: last.label };
}

export function resolveContractTermLabel(years: 0 | 1 | 3, months: number): string {
  if (years === 0) {
    return "No Term (0 years, notional 12 months)";
  }
  return `${years} year(s) (${months} months)`;
}

export function resolveTermMonths(years: 0 | 1 | 3): number {
  return years > 0 ? years * 12 : 12;
}

export function formatPaymentTermLabel(term: PaymentTerm): string {
  const labels: Record<PaymentTerm, string> = {
    arrear: "Arrear",
    annual_advance: "Annual Advance",
    full_upfront: "Full Upfront",
  };
  return labels[term];
}

export function formatCurrencyInr(value: number): string {
  return `₹${roundCurrency(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}
