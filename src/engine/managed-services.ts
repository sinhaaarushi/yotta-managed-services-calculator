import type {
  ContractTermYears,
  ManagedServicesInput,
  ManagedServicesResult,
  PaymentTerm,
} from "../types/index.js";
import { RATE_CARD } from "../config/rate-cards.js";
import {
  resolveManagedServicesPercent,
  roundCurrency,
} from "./utils.js";

export function calculateManagedServices(
  basisSpend: number,
  input: ManagedServicesInput,
  contractTermYears: ContractTermYears = 0,
  paymentTerm: PaymentTerm = "arrear",
): ManagedServicesResult {
  const plan = input.plan ?? "priority";
  const doaApplicable = input.doaApplicable ?? false;
  const enabled = input.enabled ?? true;

  const { percent, slabLabel } = resolveManagedServicesPercent(
    basisSpend,
    plan,
    doaApplicable,
  );

  const listAmount = enabled ? roundCurrency(basisSpend * percent) : 0;

  const contractTermDiscountPercent =
    RATE_CARD.contractTermDiscounts[contractTermYears];
  const paymentTermDiscountPercent =
    RATE_CARD.paymentTermDiscounts[paymentTerm];
  const totalDiscountPercent =
    contractTermDiscountPercent + paymentTermDiscountPercent;
  const discountAmount = roundCurrency(listAmount * totalDiscountPercent);
  const netAmount = roundCurrency(listAmount - discountAmount);

  return {
    enabled,
    plan,
    doaApplicable,
    basisSpend,
    chargePercent: percent,
    chargeSlabLabel: slabLabel,
    listAmount,
    contractTermDiscountPercent,
    paymentTermDiscountPercent,
    totalDiscountPercent,
    discountAmount,
    netAmount,
  };
}
