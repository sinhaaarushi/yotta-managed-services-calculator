import { describe, expect, it } from "vitest";
import { calculate } from "../src/engine/calculator.js";

/** Workbook Yntraa sheet sample values */
const YNTRAA_SAMPLE = {
  serviceSpends: {
    containerServices: 5000,
    computeServices: 5000,
    storageServices: 2000,
    backupServices: 200000,
    networkServices: 50000,
    databaseServices: 12000,
  },
};

describe("Yntraa workbook sample", () => {
  it("sums service categories to monthly cloud spend", () => {
    const result = calculate({
      cloudType: "yntraa",
      serviceSpends: YNTRAA_SAMPLE.serviceSpends,
    });
    expect(result.monthlyCloudSpend).toBe(274000);
  });

  it("calculates managed services, newedge, monitoring bundle", () => {
    const result = calculate({
      cloudType: "yntraa",
      serviceSpends: YNTRAA_SAMPLE.serviceSpends,
      billingManagement: { enabled: true },
      managedServices: { enabled: true, plan: "priority" },
      newEdge: { enabled: true, serviceType: "database_services" },
      monitoring: { enabled: true, workloadCount: 5 },
      valueAddedServices: {
        cloudOptimization: {
          enabled: true,
          engagementType: "quarterly",
        },
        cloudSecurityCompliance: {
          enabled: true,
          engagementType: "half_yearly",
        },
      },
    });

    expect(result.billingManagement.concessionPercent).toBe(0.05);
    expect(result.billingManagement.optimizedMonthlyConsumption).toBe(260300);
    expect(result.managedServicesBundle.managedServices.chargePercent).toBe(0.2);
    expect(result.managedServicesBundle.managedServices.listAmount).toBe(54800);
    expect(result.managedServicesBundle.newEdge.amount).toBe(840);
    expect(result.managedServicesBundle.monitoring.amount).toBe(1500);
    expect(result.managedServicesBundle.totalEstimatedPrice).toBe(57140);
    expect(result.valueAddedServices.cloudOptimization.amount).toBe(13700);
    expect(result.valueAddedServices.cloudSecurityCompliance.amount).toBe(8220);
    expect(result.valueAddedServices.totalAmount).toBe(21920);
    expect(result.finalMonthlyBill).toBe(339360);
  });
});

describe("Third-party workbook sample", () => {
  it("applies billing concession and managed services at scale", () => {
    const result = calculate({
      cloudType: "aws",
      monthlyCloudSpend: 40_000_000,
      billingManagement: { enabled: true },
      managedServices: { enabled: true, plan: "priority" },
      newEdge: { enabled: true, serviceType: "container", monthlyConsumption: 40000 },
      monitoring: { enabled: true, workloadCount: 5 },
      valueAddedServices: {
        cloudOptimization: {
          enabled: true,
          engagementType: "half_yearly",
        },
        cloudSecurityCompliance: {
          enabled: true,
          engagementType: "half_yearly",
        },
      },
    });

    expect(result.billingManagement.concessionPercent).toBe(0.11);
    expect(result.billingManagement.optimizedMonthlyConsumption).toBe(35_600_000);
    expect(result.managedServicesBundle.managedServices.chargePercent).toBe(0.17);
    expect(result.managedServicesBundle.managedServices.listAmount).toBe(6_800_000);
    expect(result.managedServicesBundle.newEdge.amount).toBe(2800);
    expect(result.managedServicesBundle.monitoring.amount).toBe(1500);
    expect(result.valueAddedServices.totalAmount).toBe(2_400_000);
  });
});

describe("Phase 1 commercial terms", () => {
  it("applies DOA reduced slabs and term/payment discounts", () => {
    const result = calculate({
      cloudType: "yntraa",
      monthlyCloudSpend: 274000,
      managedServices: {
        enabled: true,
        plan: "priority",
        doaApplicable: true,
      },
      phase1: {
        customerName: "Acme Corp",
        contractTermYears: 3,
        paymentTerm: "full_upfront",
        securitySpend: 50000,
      },
    });

    expect(result.managedServicesBundle.managedServices.basisSpend).toBe(224000);
    expect(result.managedServicesBundle.managedServices.chargePercent).toBe(0.15);
    expect(result.managedServicesBundle.managedServices.listAmount).toBe(33600);
    expect(result.managedServicesBundle.managedServices.totalDiscountPercent).toBe(0.06);
    expect(result.managedServicesBundle.managedServices.netAmount).toBe(31584);
    expect(result.customerName).toBe("Acme Corp");
    expect(result.totalContractValue).toBe(31584 * 36);
  });

  it("uses advanced spend fallback when newedge is disabled", () => {
    const result = calculate({
      cloudType: "yntraa",
      monthlyCloudSpend: 274000,
      phase1: { advancedSpend: 12000 },
    });
    expect(result.managedServicesBundle.newEdge.amount).toBe(840);
  });
});

describe("Foundation plan", () => {
  it("charges zero managed services percent", () => {
    const result = calculate({
      cloudType: "yntraa",
      monthlyCloudSpend: 274000,
      managedServices: { enabled: true, plan: "foundation" },
    });
    expect(result.managedServicesBundle.managedServices.chargePercent).toBe(0);
    expect(result.managedServicesBundle.managedServices.listAmount).toBe(0);
  });
});
