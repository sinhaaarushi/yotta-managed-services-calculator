/**
 * Browser-side Phase 1 calculator.
 * Logic mirrors src/engine/phase1.ts — keep in sync when rate rules change.
 */

const RATE_CARD = {
  managedServicesSlabs: [
    { maxSpend: 10_000_000, prime: 0.15, priority: 0.2 },
    { maxSpend: 50_000_000, prime: 0.12, priority: 0.17 },
    { maxSpend: null, prime: 0.1, priority: 0.15 },
  ],
  doaManagedServicesSlabs: [
    { maxSpend: 10_000_000, prime: 0.12, priority: 0.15 },
    { maxSpend: 50_000_000, prime: 0.09, priority: 0.12 },
    { maxSpend: null, prime: 0.07, priority: 0.1 },
  ],
  newEdgeChargePercent: 0.07,
  contractTermDiscounts: { 0: 0, 1: 0.01, 3: 0.03 },
  paymentTermDiscounts: {
    arrear: 0,
    annual_advance: 0.01,
    full_upfront: 0.03,
  },
};

const CLOUD_TYPE_LABELS = {
  yntraa: "Yntraa",
  aws: "AWS",
  azure: "Azure",
};

const PLAN_LABELS = {
  foundation: "Foundation",
  prime: "Prime",
  priority: "Priority",
};

const PAYMENT_TERM_LABELS = {
  arrear: "Arrear",
  annual_advance: "Annual Advance",
  full_upfront: "Full Upfront",
};

function roundCurrency(value) {
  return Math.round(value);
}

function normalizeServiceSpends(partial = {}) {
  return {
    containerServices: partial.containerServices ?? 0,
    computeServices: partial.computeServices ?? 0,
    storageServices: partial.storageServices ?? 0,
    backupServices: partial.backupServices ?? 0,
    networkServices: partial.networkServices ?? 0,
    databaseServices: partial.databaseServices ?? 0,
  };
}

function sumServiceSpends(spends) {
  return (
    spends.containerServices +
    spends.computeServices +
    spends.storageServices +
    spends.backupServices +
    spends.networkServices +
    spends.databaseServices
  );
}

function resolveManagedServicesPercent(basisSpend, plan, doaApplicable) {
  if (plan === "foundation") return 0;

  const slabs = doaApplicable
    ? RATE_CARD.doaManagedServicesSlabs
    : RATE_CARD.managedServicesSlabs;

  for (const slab of slabs) {
    if (slab.maxSpend === null || basisSpend <= slab.maxSpend) {
      return plan === "prime" ? slab.prime : slab.priority;
    }
  }

  const last = slabs[slabs.length - 1];
  return plan === "prime" ? last.prime : last.priority;
}

function resolveContractTermLabel(years, months) {
  if (years === 0) return "No Term (0 years, notional 12 months)";
  return `${years} year(s) (${months} months)`;
}

function resolveTermMonths(years) {
  return years > 0 ? years * 12 : 12;
}

function resolveMonthlyCloudSpend(input) {
  if (input.cloudType === "yntraa") {
    const serviceSpends = normalizeServiceSpends(input.serviceSpends);
    const monthlyCloudSpend =
      input.monthlyCloudSpend ?? sumServiceSpends(serviceSpends);
    return { monthlyCloudSpend, serviceSpends };
  }
  return { monthlyCloudSpend: input.monthlyCloudSpend ?? 0 };
}

function resolveNetCloudSpend(cloudType, monthlyCloudSpend, securitySpend) {
  if (cloudType === "yntraa") {
    return Math.max(0, monthlyCloudSpend - securitySpend);
  }
  return Math.max(0, monthlyCloudSpend);
}

export function calculatePhase1(input) {
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

  const managedServicesPercent = resolveManagedServicesPercent(
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
    serviceSpends: input.cloudType === "yntraa" ? serviceSpends : undefined,
    netCloudSpend,
    managedServicesPercent,
    planMrcList,
    advancedMrcList,
    totalMrcList,
    contractTermYears,
    contractTermLabel: resolveContractTermLabel(contractTermYears, termMonths),
    paymentTerm,
    paymentTermLabel: PAYMENT_TERM_LABELS[paymentTerm],
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
