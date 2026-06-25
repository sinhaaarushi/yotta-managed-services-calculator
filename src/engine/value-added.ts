import type {
  ValueAddedOptimizationInput,
  ValueAddedServicesInput,
  ValueAddedServicesResult,
} from "../types/index.js";
import { getEngagementRate } from "../config/rate-cards.js";
import { roundCurrency } from "./utils.js";

function calculatePricedLine(
  input: ValueAddedOptimizationInput | undefined,
  defaultCloudSpend: number,
): {
  enabled: boolean;
  engagementType?: ValueAddedOptimizationInput["engagementType"];
  engagementPercent?: number;
  cloudSpend: number;
  amount: number;
} {
  const enabled = input?.enabled ?? false;
  if (!enabled || !input?.engagementType) {
    return { enabled, cloudSpend: defaultCloudSpend, amount: 0 };
  }

  const cloudSpend = input.cloudSpend ?? defaultCloudSpend;
  const engagementPercent = getEngagementRate(input.engagementType);
  const amount = roundCurrency(cloudSpend * engagementPercent);

  return {
    enabled,
    engagementType: input.engagementType,
    engagementPercent,
    cloudSpend,
    amount,
  };
}

export function calculateValueAddedServices(
  monthlyCloudSpend: number,
  input: ValueAddedServicesInput = {},
): ValueAddedServicesResult {
  const cloudOptimization = calculatePricedLine(
    input.cloudOptimization,
    monthlyCloudSpend,
  );
  const cloudSecurityCompliance = calculatePricedLine(
    input.cloudSecurityCompliance,
    monthlyCloudSpend,
  );

  const cloudAdvisoryAssessment = {
    enabled: input.cloudAdvisoryAssessment?.enabled ?? false,
    requirementDetail: input.cloudAdvisoryAssessment?.requirementDetail,
    amount: 0,
  };

  const cloudMigration = {
    serviceType: input.cloudMigration?.serviceType,
    amount: 0,
  };

  const cloudProfessionalService = {
    enabled: input.cloudProfessionalService?.enabled ?? false,
    amount: 0,
  };

  const totalAmount = roundCurrency(
    cloudOptimization.amount +
      cloudSecurityCompliance.amount +
      cloudAdvisoryAssessment.amount +
      cloudMigration.amount +
      cloudProfessionalService.amount,
  );

  return {
    cloudOptimization,
    cloudSecurityCompliance,
    cloudAdvisoryAssessment,
    cloudMigration,
    cloudProfessionalService,
    totalAmount,
  };
}
