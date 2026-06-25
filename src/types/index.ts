export type CloudType = "yntraa" | "aws" | "azure";

export type ManagedServicesPlan = "foundation" | "prime" | "priority";

export type ContractTermYears = 0 | 1 | 3;

export type PaymentTerm = "arrear" | "annual_advance" | "full_upfront";

export type EngagementType = "quarterly" | "half_yearly" | "annual";

export type YntraaServiceCategory =
  | "container_services"
  | "compute_services"
  | "storage_services"
  | "backup_services"
  | "network_services"
  | "database_services";

export type NewEdgeServiceType =
  | "container_services"
  | "compute_services"
  | "storage_services"
  | "backup_services"
  | "network_services"
  | "database_services"
  | "container"
  | "database";

export interface YntraaServiceSpends {
  containerServices: number;
  computeServices: number;
  storageServices: number;
  backupServices: number;
  networkServices: number;
  databaseServices: number;
}

export interface BillingManagementInput {
  enabled: boolean;
}

export interface ManagedServicesInput {
  enabled: boolean;
  plan: ManagedServicesPlan;
  /** Phase 1: Deal of Approval reduced slabs */
  doaApplicable?: boolean;
}

export interface NewEdgeInput {
  enabled: boolean;
  serviceType: NewEdgeServiceType;
  /** Override consumption; if omitted, derived from spends */
  monthlyConsumption?: number;
}

export interface MonitoringInput {
  enabled: boolean;
  workloadCount: number;
}

export interface ValueAddedOptimizationInput {
  enabled: boolean;
  engagementType: EngagementType;
  cloudSpend?: number;
}

export interface ValueAddedServicesInput {
  cloudOptimization?: ValueAddedOptimizationInput;
  cloudSecurityCompliance?: ValueAddedOptimizationInput;
  cloudAdvisoryAssessment?: {
    enabled: boolean;
    requirementDetail?: string;
  };
  cloudMigration?: {
    serviceType?: string;
  };
  cloudProfessionalService?: {
    enabled: boolean;
  };
}

export interface Phase1CommercialInput {
  customerName?: string;
  contractTermYears?: ContractTermYears;
  paymentTerm?: PaymentTerm;
  /** Phase 1 Yntraa: excluded from managed services base when set */
  securitySpend?: number;
  /** Phase 1 Yntraa: advanced services spend (7% if not using NewEdge block) */
  advancedSpend?: number;
  cloudCalculatorUrl?: string;
}

export interface CalculatorInput {
  cloudType: CloudType;
  /** Third-party (AWS/Azure): total monthly cloud spend */
  monthlyCloudSpend?: number;
  /** Yntraa: per-category spends; total is derived if monthlyCloudSpend omitted */
  serviceSpends?: Partial<YntraaServiceSpends>;
  billingManagement?: BillingManagementInput;
  managedServices?: ManagedServicesInput;
  newEdge?: NewEdgeInput;
  monitoring?: MonitoringInput;
  valueAddedServices?: ValueAddedServicesInput;
  phase1?: Phase1CommercialInput;
}

export interface SlabRateResult {
  percent: number;
  slabLabel: string;
}

export interface BillingManagementResult {
  enabled: boolean;
  monthlyConsumption: number;
  concessionPercent: number;
  concessionSlabLabel: string;
  optimizedMonthlyConsumption: number;
  monthlySavings: number;
}

export interface ManagedServicesResult {
  enabled: boolean;
  plan: ManagedServicesPlan;
  doaApplicable: boolean;
  basisSpend: number;
  chargePercent: number;
  chargeSlabLabel: string;
  listAmount: number;
  contractTermDiscountPercent: number;
  paymentTermDiscountPercent: number;
  totalDiscountPercent: number;
  discountAmount: number;
  netAmount: number;
}

export interface NewEdgeResult {
  enabled: boolean;
  serviceType: NewEdgeServiceType;
  monthlyConsumption: number;
  chargePercent: number;
  amount: number;
}

export interface MonitoringResult {
  enabled: boolean;
  workloadCount: number;
  pricePerWorkload: number;
  amount: number;
}

export interface ValueAddedLineResult {
  enabled: boolean;
  engagementType?: EngagementType;
  engagementPercent?: number;
  cloudSpend: number;
  amount: number;
}

export interface ValueAddedServicesResult {
  cloudOptimization: ValueAddedLineResult;
  cloudSecurityCompliance: ValueAddedLineResult;
  cloudAdvisoryAssessment: {
    enabled: boolean;
    requirementDetail?: string;
    amount: number;
  };
  cloudMigration: {
    serviceType?: string;
    amount: number;
  };
  cloudProfessionalService: {
    enabled: boolean;
    amount: number;
  };
  totalAmount: number;
}

export interface ManagedServicesBundleResult {
  managedServices: ManagedServicesResult;
  newEdge: NewEdgeResult;
  monitoring: MonitoringResult;
  totalEstimatedPrice: number;
}

export interface CalculatorResult {
  cloudType: CloudType;
  customerName: string;
  monthlyCloudSpend: number;
  serviceSpends?: YntraaServiceSpends;
  billingManagement: BillingManagementResult;
  managedServicesBundle: ManagedServicesBundleResult;
  valueAddedServices: ValueAddedServicesResult;
  /** Workbook-style final monthly bill */
  finalMonthlyBill: number;
  /** Phase 1 total contract value on managed services net amount */
  totalContractValue: number;
  contractTermLabel: string;
  paymentTerm: PaymentTerm;
  cloudCalculatorUrl: string;
}

export interface RateCardSnapshot {
  billingManagementSlabs: Array<{ maxSpend: number | null; label: string; discount: number }>;
  managedServicesSlabs: Array<{ maxSpend: number | null; label: string; prime: number; priority: number }>;
  doaManagedServicesSlabs: Array<{ maxSpend: number | null; label: string; prime: number; priority: number }>;
  newEdgeChargePercent: number;
  monitoringPricePerWorkload: number;
  engagementRates: Record<EngagementType, number>;
  contractTermDiscounts: Record<ContractTermYears, number>;
  paymentTermDiscounts: Record<PaymentTerm, number>;
  migrationServiceOptions: string[];
  newEdgeServiceMinimums: Partial<Record<NewEdgeServiceType, number>>;
}

export type * from "./phase1.js";
