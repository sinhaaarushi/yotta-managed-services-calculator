import { describe, expect, it } from "vitest";
import { calculatePhase1 } from "../src/engine/phase1.js";

const YNTRAA_SPENDS = {
  computeServices: 5000,
  storageServices: 2000,
  backupServices: 200000,
  networkServices: 50000,
  databaseServices: 12000,
  containerServices: 5000,
};

describe("calculatePhase1", () => {
  it("derives monthly cloud spend from Yntraa categories", () => {
    const result = calculatePhase1({
      cloudType: "yntraa",
      serviceSpends: YNTRAA_SPENDS,
      plan: "priority",
      doaApplicable: false,
      contractTermYears: 0,
      paymentTerm: "arrear",
    });

    expect(result.monthlyCloudSpend).toBe(274000);
  });

  it("applies security exclusion and advanced services for Yntraa", () => {
    const result = calculatePhase1({
      cloudType: "yntraa",
      monthlyCloudSpend: 274000,
      plan: "priority",
      doaApplicable: false,
      securitySpend: 50000,
      advancedSpend: 12000,
      contractTermYears: 0,
      paymentTerm: "arrear",
    });

    expect(result.netCloudSpend).toBe(224000);
    expect(result.planMrcList).toBe(44800);
    expect(result.advancedMrcList).toBe(840);
    expect(result.finalMrc).toBe(45640);
  });

  it("applies combined term and payment discounts proportionally", () => {
    const result = calculatePhase1({
      cloudType: "yntraa",
      monthlyCloudSpend: 274000,
      plan: "priority",
      doaApplicable: true,
      securitySpend: 50000,
      contractTermYears: 3,
      paymentTerm: "full_upfront",
      customerName: "Acme Corp",
    });

    expect(result.managedServicesPercent).toBe(0.15);
    expect(result.planMrcList).toBe(33600);
    expect(result.totalDiscountPercent).toBe(0.06);
    expect(result.planMrcNet).toBe(31584);
    expect(result.totalContractValue).toBe(31584 * 36);
    expect(result.customerName).toBe("Acme Corp");
  });

  it("calculates third-party cloud without advanced component", () => {
    const result = calculatePhase1({
      cloudType: "aws",
      monthlyCloudSpend: 2_000_000,
      plan: "prime",
      doaApplicable: false,
      contractTermYears: 1,
      paymentTerm: "annual_advance",
      cloudCalculatorUrl: "https://calculator.aws/",
    });

    expect(result.netCloudSpend).toBe(2_000_000);
    expect(result.advancedMrcList).toBe(0);
    expect(result.cloudCalculatorUrl).toBe("https://calculator.aws/");
    expect(result.totalDiscountPercent).toBe(0.02);
  });

  it("returns zero managed services for Foundation plan", () => {
    const result = calculatePhase1({
      cloudType: "yntraa",
      monthlyCloudSpend: 274000,
      plan: "foundation",
      doaApplicable: false,
      contractTermYears: 0,
      paymentTerm: "arrear",
    });

    expect(result.managedServicesPercent).toBe(0);
    expect(result.planMrcList).toBe(0);
  });
});
