/** Yntraa service categories (display order: container last). */
export const YNTRAA_SERVICE_FIELDS = [
  { id: "computeServices", label: "Compute Services" },
  { id: "storageServices", label: "Storage Services" },
  { id: "backupServices", label: "Backup Services" },
  { id: "networkServices", label: "Network Services" },
  { id: "databaseServices", label: "Database Services" },
  { id: "containerServices", label: "Container Services" },
];

export const CLOUD_TYPE_API = {
  Yntraa: "yntraa",
  AWS: "aws",
  Azure: "azure",
};

export const PLAN_API = {
  Foundation: "foundation",
  Prime: "prime",
  Priority: "priority",
};

export const PAYMENT_TERM_API = {
  Arrear: "arrear",
  "Annual Advance": "annual_advance",
  "Full Upfront": "full_upfront",
};
