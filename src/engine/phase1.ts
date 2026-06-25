import { RATE_CARD } from "../config/rate-cards.js";
import type { CloudType } from "../types/index.js";
import type { Phase1Input, Phase1Result } from "../types/phase1.js";
import {
  formatPaymentTermLabel,
  normalizeServiceSpends,
  resolveContractTermLabel,
  resolveManagedServicesPercent,
  resolveTermMonths,
  roundCurrency,
  sumServiceSpends,
} from "./utils.js";

const CLOUD_TYPE_LABELS: Record<CloudType, string> = {
  yntraa: "Yntraa",
  aws: "AWS",
  azure: "Azure",
};

const PLAN_LABELS: Record<Phase1Result["plan"], string> = {
  foundation: "Foundation",
  prime: "Prime",
  priority: "Priority",
};

function resolveMonthlyCloudSpend(input: Phase1Input): {
  monthlyCloudSpend: number;
  serviceSpends?: ReturnType<typeof normalizeServiceSpends>;
} {
  if (input.cloudType === "yntraa") {
    const serviceSpends = normalizeServiceSpends(input.serviceSpends);
    const monthlyCloudSpend =
      input.monthlyCloudSpend ?? sumServiceSpends(serviceSpends);
    return { monthlyCloudSpend, serviceSpends };
  }

  return { monthlyCloudSpend: input.monthlyCloudSpend ?? 0 };
}

function resolveNetCloudSpend(
  cloudType: CloudType,
  monthlyCloudSpend: number,
  securitySpend: number,
): number {
  if (cloudType === "yntraa") {
    return Math.max(0, monthlyCloudSpend - securitySpend);
  }
  return Math.max(0, monthlyCloudSpend);
}

/**
 * Phase 1 calculator logic (CloudAssure parity).
 * Term and payment discounts apply to the combined MS + advanced list amount,
 * then net amounts are split proportionally between plan and advanced lines.
 */
export function calculatePhase1(input: Phase1Input): Phase1Result {
  const { monthlyCloudSpend, serviceSpends } = resolveMonthlyCloudSpend(input);
  const securitySpend =
    input.cloudType === "yntraa" ? (input.securitySpend ?? 0) : 0;
  const advancedSpend =
    input.cloudType === "yntraa" ? (input.advancedSpend ?? 0) : 0;

  const netCloudSpend = resolveNetCloudSpend(
    input.cloudType,
    monthlyCloudSpend,
    securitySpend,
  );

  const { percent: managedServicesPercent } = resolveManagedServicesPercent(
    netCloudSpend,
    input.plan,
    input.doaApplicable,
  );

  const planMrcList = roundCurrency(netCloudSpend * managedServicesPercent);
  const advancedMrcList =
    input.cloudType === "yntraa"
      ? roundCurrency(advancedSpend * RATE_CARD.newEdgeChargePercent)
      : 0;
  const totalMrcList = planMrcList + advancedMrcList;

  const contractTermYears = input.contractTermYears ?? 0;
  const paymentTerm = input.paymentTerm ?? "arrear";
  const contractTermDiscountPercent =
    RATE_CARD.contractTermDiscounts[contractTermYears];
  const paymentTermDiscountPercent =
    RATE_CARD.paymentTermDiscounts[paymentTerm];
  const totalDiscountPercent =
    contractTermDiscountPercent + paymentTermDiscountPercent;
  const benefitAmount = roundCurrency(totalMrcList * totalDiscountPercent);
  const finalMrc = roundCurrency(totalMrcList - benefitAmount);

  const termMonths = resolveTermMonths(contractTermYears);
  const totalContractValue = roundCurrency(finalMrc * termMonths);

  const planShare = totalMrcList > 0 ? planMrcList / totalMrcList : 0;
  const advancedShare = totalMrcList > 0 ? advancedMrcList / totalMrcList : 0;
  const planMrcNet = roundCurrency(finalMrc * planShare);
  const advancedMrcNet = roundCurrency(finalMrc * advancedShare);

  const cloudCalculatorUrl =
    input.cloudType === "yntraa"
      ? "—"
      : input.cloudCalculatorUrl?.trim() || "–";

  return {
    customerName: input.customerName?.trim() || "—",
    cloudType: input.cloudType,
    cloudTypeLabel: CLOUD_TYPE_LABELS[input.cloudType],
    plan: input.plan,
    planLabel: PLAN_LABELS[input.plan],
    doaApplicable: input.doaApplicable,
    monthlyCloudSpend,
    serviceSpends:
      input.cloudType === "yntraa" ? serviceSpends : undefined,
    netCloudSpend,
    managedServicesPercent,
    planMrcList,
    advancedMrcList,
    totalMrcList,
    contractTermYears,
    contractTermLabel: resolveContractTermLabel(contractTermYears, termMonths),
    paymentTerm,
    paymentTermLabel: formatPaymentTermLabel(paymentTerm),
    contractTermDiscountPercent,
    paymentTermDiscountPercent,
    totalDiscountPercent,
    benefitAmount,
    planMrcNet,
    advancedMrcNet,
    finalMrc,
    totalContractValue,
    cloudCalculatorUrl,
  };
}
