import type {
  CalculatorInput,
  CalculatorResult,
  CloudType,
  ManagedServicesBundleResult,
  YntraaServiceSpends,
} from "../types/index.js";
import { calculateBillingManagement } from "./billing.js";
import { calculateManagedServices } from "./managed-services.js";
import { calculateMonitoring } from "./monitoring.js";
import { calculateNewEdge } from "./newedge.js";
import { calculateValueAddedServices } from "./value-added.js";
import {
  normalizeServiceSpends,
  resolveContractTermLabel,
  resolveTermMonths,
  roundCurrency,
  sumServiceSpends,
} from "./utils.js";

function resolveMonthlyCloudSpend(input: CalculatorInput): {
  monthlyCloudSpend: number;
  serviceSpends?: YntraaServiceSpends;
} {
  if (input.cloudType === "yntraa") {
    const serviceSpends = normalizeServiceSpends(input.serviceSpends);
    const fromCategories = sumServiceSpends(serviceSpends);
    const monthlyCloudSpend = input.monthlyCloudSpend ?? fromCategories;
    return { monthlyCloudSpend, serviceSpends };
  }

  return {
    monthlyCloudSpend: input.monthlyCloudSpend ?? 0,
  };
}

function resolveManagedServicesBasis(
  cloudType: CloudType,
  monthlyCloudSpend: number,
  securitySpend: number,
): number {
  if (cloudType === "yntraa") {
    return Math.max(0, monthlyCloudSpend - securitySpend);
  }
  return Math.max(0, monthlyCloudSpend);
}

function buildManagedServicesBundle(
  input: CalculatorInput,
  monthlyCloudSpend: number,
  serviceSpends: YntraaServiceSpends,
  msBasisSpend: number,
): ManagedServicesBundleResult {
  const contractTermYears = input.phase1?.contractTermYears ?? 0;
  const paymentTerm = input.phase1?.paymentTerm ?? "arrear";

  const managedServices = calculateManagedServices(
    msBasisSpend,
    input.managedServices ?? { enabled: true, plan: "priority" },
    contractTermYears,
    paymentTerm,
  );

  const newEdge = calculateNewEdge(
    input.cloudType,
    monthlyCloudSpend,
    serviceSpends,
    input.newEdge,
  );

  // Phase 1 fallback: advanced spend at 7% when NewEdge block not explicitly enabled
  let advancedAmount = 0;
  if (
    input.cloudType === "yntraa" &&
    !input.newEdge?.enabled &&
    (input.phase1?.advancedSpend ?? 0) > 0
  ) {
    advancedAmount = roundCurrency((input.phase1?.advancedSpend ?? 0) * 0.07);
  }

  const monitoring = calculateMonitoring(input.monitoring);

  const totalEstimatedPrice = roundCurrency(
    managedServices.netAmount + newEdge.amount + advancedAmount + monitoring.amount,
  );

  return {
    managedServices,
    newEdge: {
      ...newEdge,
      amount: newEdge.amount + advancedAmount,
    },
    monitoring,
    totalEstimatedPrice,
  };
}

export function calculate(input: CalculatorInput): CalculatorResult {
  const { monthlyCloudSpend, serviceSpends } = resolveMonthlyCloudSpend(input);
  const spends = serviceSpends ?? normalizeServiceSpends();
  const securitySpend = input.phase1?.securitySpend ?? 0;

  const billingManagement = calculateBillingManagement(
    monthlyCloudSpend,
    input.billingManagement ?? { enabled: false },
  );

  const msBasisSpend = resolveManagedServicesBasis(
    input.cloudType,
    monthlyCloudSpend,
    securitySpend,
  );

  const managedServicesBundle = buildManagedServicesBundle(
    input,
    monthlyCloudSpend,
    spends,
    msBasisSpend,
  );

  const valueAddedServices = calculateValueAddedServices(
    monthlyCloudSpend,
    input.valueAddedServices,
  );

  const optimizedConsumption = billingManagement.enabled
    ? billingManagement.optimizedMonthlyConsumption
    : 0;

  const finalMonthlyBill = roundCurrency(
    optimizedConsumption +
      managedServicesBundle.totalEstimatedPrice +
      valueAddedServices.totalAmount,
  );

  const contractTermYears = input.phase1?.contractTermYears ?? 0;
  const termMonths = resolveTermMonths(contractTermYears);
  const totalContractValue = roundCurrency(
    managedServicesBundle.totalEstimatedPrice * termMonths,
  );

  return {
    cloudType: input.cloudType,
    customerName: input.phase1?.customerName ?? "—",
    monthlyCloudSpend,
    serviceSpends: input.cloudType === "yntraa" ? spends : undefined,
    billingManagement,
    managedServicesBundle,
    valueAddedServices,
    finalMonthlyBill,
    totalContractValue,
    contractTermLabel: resolveContractTermLabel(contractTermYears, termMonths),
    paymentTerm: input.phase1?.paymentTerm ?? "arrear",
    cloudCalculatorUrl:
      input.cloudType === "yntraa"
        ? "—"
        : input.phase1?.cloudCalculatorUrl ?? "—",
  };
}

export { RATE_CARD } from "../config/rate-cards.js";
export * from "./utils.js";
