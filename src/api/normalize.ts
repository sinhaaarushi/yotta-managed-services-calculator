import type {
  CloudType,
  ContractTermYears,
  ManagedServicesPlan,
  PaymentTerm,
} from "../types/index.js";
import type { Phase1Input } from "../types/phase1.js";

const CLOUD_TYPE_MAP: Record<string, CloudType> = {
  yntraa: "yntraa",
  aws: "aws",
  azure: "azure",
};

const PLAN_MAP: Record<string, ManagedServicesPlan> = {
  foundation: "foundation",
  prime: "prime",
  priority: "priority",
};

const PAYMENT_TERM_MAP: Record<string, PaymentTerm> = {
  arrear: "arrear",
  annual_advance: "annual_advance",
  full_upfront: "full_upfront",
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

export function normalizeCloudType(value: unknown): CloudType | null {
  if (typeof value !== "string") return null;
  const key = normalizeKey(value);
  return CLOUD_TYPE_MAP[key] ?? null;
}

export function normalizePlan(value: unknown): ManagedServicesPlan | null {
  if (typeof value !== "string") return null;
  return PLAN_MAP[normalizeKey(value)] ?? null;
}

export function normalizePaymentTerm(value: unknown): PaymentTerm | null {
  if (typeof value !== "string") return null;
  const key = normalizeKey(value);
  return PAYMENT_TERM_MAP[key] ?? null;
}

export function normalizeContractTermYears(
  value: unknown,
): ContractTermYears | null {
  const years = Number(value);
  if (years === 0 || years === 1 || years === 3) return years;
  return null;
}

export function parsePhase1Body(body: unknown): Phase1Input {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object");
  }

  const raw = body as Record<string, unknown>;
  const cloudType = normalizeCloudType(raw.cloudType);
  const plan = normalizePlan(raw.plan);
  const paymentTerm = normalizePaymentTerm(raw.paymentTerm);
  const contractTermYears = normalizeContractTermYears(raw.contractTermYears);

  if (!cloudType) throw new Error("cloudType must be yntraa, aws, or azure");
  if (!plan) throw new Error("plan must be foundation, prime, or priority");
  if (!paymentTerm) {
    throw new Error(
      "paymentTerm must be arrear, annual_advance, or full_upfront",
    );
  }
  if (contractTermYears === null) {
    throw new Error("contractTermYears must be 0, 1, or 3");
  }

  return {
    cloudType,
    monthlyCloudSpend:
      raw.monthlyCloudSpend === undefined
        ? undefined
        : Number(raw.monthlyCloudSpend),
    serviceSpends:
      raw.serviceSpends && typeof raw.serviceSpends === "object"
        ? (raw.serviceSpends as Phase1Input["serviceSpends"])
        : undefined,
    plan,
    doaApplicable: Boolean(raw.doaApplicable),
    securitySpend:
      raw.securitySpend === undefined ? undefined : Number(raw.securitySpend),
    advancedSpend:
      raw.advancedSpend === undefined ? undefined : Number(raw.advancedSpend),
    contractTermYears,
    paymentTerm,
    customerName:
      typeof raw.customerName === "string" ? raw.customerName : undefined,
    cloudCalculatorUrl:
      typeof raw.cloudCalculatorUrl === "string"
        ? raw.cloudCalculatorUrl
        : undefined,
  };
}
