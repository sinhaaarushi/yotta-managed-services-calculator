import type {
  CloudType,
  ContractTermYears,
  ManagedServicesPlan,
  PaymentTerm,
  YntraaServiceSpends,
} from "./index.js";

/** Input for the Phase 1 managed-services calculator (current production UI). */
export interface Phase1Input {
  cloudType: CloudType;
  /** AWS / Azure: total monthly cloud spend. */
  monthlyCloudSpend?: number;
  /** Yntraa: per-category spends; total is derived when monthlyCloudSpend is omitted. */
  serviceSpends?: Partial<YntraaServiceSpends>;
  plan: ManagedServicesPlan;
  doaApplicable: boolean;
  securitySpend?: number;
  advancedSpend?: number;
  contractTermYears: ContractTermYears;
  paymentTerm: PaymentTerm;
  customerName?: string;
  cloudCalculatorUrl?: string;
}

/** Result shape consumed by the Phase 1 UI (internal + customer views). */
export interface Phase1Result {
  customerName: string;
  cloudType: CloudType;
  cloudTypeLabel: string;
  plan: ManagedServicesPlan;
  planLabel: string;
  doaApplicable: boolean;
  monthlyCloudSpend: number;
  serviceSpends?: YntraaServiceSpends;
  netCloudSpend: number;
  managedServicesPercent: number;
  planMrcList: number;
  advancedMrcList: number;
  totalMrcList: number;
  contractTermYears: ContractTermYears;
  contractTermLabel: string;
  paymentTerm: PaymentTerm;
  paymentTermLabel: string;
  contractTermDiscountPercent: number;
  paymentTermDiscountPercent: number;
  totalDiscountPercent: number;
  benefitAmount: number;
  planMrcNet: number;
  advancedMrcNet: number;
  finalMrc: number;
  totalContractValue: number;
  cloudCalculatorUrl: string;
}
