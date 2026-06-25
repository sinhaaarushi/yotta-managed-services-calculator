import type { EngagementType, RateCardSnapshot } from "../types/index.js";

/** Rate cards from workbook V1.0 + Phase 1 DOA / term discounts */
export const RATE_CARD: RateCardSnapshot = {
  billingManagementSlabs: [
    { maxSpend: 2_500_000, label: "<= 0.25 Cr.", discount: 0.05 },
    { maxSpend: 10_000_000, label: "Up to 1 Cr.", discount: 0.08 },
    { maxSpend: 50_000_000, label: "Up to 5 Cr.", discount: 0.11 },
    { maxSpend: null, label: "> 5 Cr.", discount: 0.15 },
  ],

  managedServicesSlabs: [
    { maxSpend: 10_000_000, label: "Up to 1 Cr.", prime: 0.15, priority: 0.2 },
    { maxSpend: 50_000_000, label: "Up to 5 Cr.", prime: 0.12, priority: 0.17 },
    { maxSpend: null, label: "> 5 Cr.", prime: 0.1, priority: 0.15 },
  ],

  doaManagedServicesSlabs: [
    { maxSpend: 10_000_000, label: "Up to 1 Cr.", prime: 0.12, priority: 0.15 },
    { maxSpend: 50_000_000, label: "Up to 5 Cr.", prime: 0.09, priority: 0.12 },
    { maxSpend: null, label: "> 5 Cr.", prime: 0.07, priority: 0.1 },
  ],

  newEdgeChargePercent: 0.07,
  monitoringPricePerWorkload: 300,

  engagementRates: {
    quarterly: 0.05,
    half_yearly: 0.03,
    annual: 0.01,
  },

  contractTermDiscounts: {
    0: 0,
    1: 0.01,
    3: 0.03,
  },

  paymentTermDiscounts: {
    arrear: 0,
    annual_advance: 0.01,
    full_upfront: 0.03,
  },

  migrationServiceOptions: [
    "Cloud or Infrastructure",
    "Application",
    "Lift and Shift",
    "Offline Data Movement with customer's Owned Device",
    "Offline Data Movement with Provider Device",
    "Online Data Movement",
    "Online Data Transfer with Data Mover",
    "Database Migration across Homogenous DB",
    "Database Migration across Hetrogenous DB",
    "Platform Migration",
    "Data Centre Migration",
  ],

  newEdgeServiceMinimums: {
    container_services: 5_000,
    compute_services: 1_000,
    storage_services: 2_000,
    backup_services: 3_000,
    network_services: 50_000,
    database_services: 12_000,
    database: 5_000,
    container: 40_000,
  },
};

export function getEngagementRate(type: EngagementType): number {
  return RATE_CARD.engagementRates[type];
}
