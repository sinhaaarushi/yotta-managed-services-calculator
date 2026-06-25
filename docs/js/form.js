import {
  CLOUD_TYPE_API,
  PAYMENT_TERM_API,
  PLAN_API,
  YNTRAA_SERVICE_FIELDS,
} from "./constants.js";
import { $, isYntraaCloudType, num } from "./dom.js";
import { formatCurrency } from "./format.js";

export function renderServiceGrid() {
  const grid = $("serviceGrid");
  if (!grid) return;

  grid.innerHTML = YNTRAA_SERVICE_FIELDS.map(
    (field) => `
      <div class="service-line">
        <label for="${field.id}">${field.label}</label>
        <input type="number" id="${field.id}" min="0" step="1" value="0" />
      </div>
    `,
  ).join("");
}

function readServiceSpends() {
  return Object.fromEntries(
    YNTRAA_SERVICE_FIELDS.map((field) => [field.id, num($(field.id)?.value)]),
  );
}

function sumServiceSpends(spends) {
  return YNTRAA_SERVICE_FIELDS.reduce(
    (total, field) => total + spends[field.id],
    0,
  );
}

export function updateYntraaTotal() {
  const total = sumServiceSpends(readServiceSpends());
  const totalEl = $("yntraaSpendTotal");
  if (totalEl) totalEl.textContent = formatCurrency(total);

  const securityInput = $("securitySpend");
  if (securityInput && isYntraaCloudType($("cloudType")?.value)) {
    securityInput.value = total > 0 ? String(total) : "";
  }
}

export function populatePlanOptions() {
  const cloudType = $("cloudType")?.value ?? "Yntraa";
  const planSelect = $("plan");
  if (!planSelect) return;

  const current = planSelect.value;
  const options = isYntraaCloudType(cloudType)
    ? ["Foundation", "Prime", "Priority"]
    : ["Prime", "Priority"];

  planSelect.innerHTML = options
    .map((option) => `<option value="${option}">${option}</option>`)
    .join("");

  if (options.includes(current)) {
    planSelect.value = current;
  }
}

export function updateCloudTypeUi() {
  const cloudType = $("cloudType")?.value ?? "Yntraa";
  const isYntraa = isYntraaCloudType(cloudType);

  $("yntraaSpendSection")?.classList.toggle("hidden", !isYntraa);
  $("cloudSpendRow")?.classList.toggle("hidden", isYntraa);
  $("securityRow")?.classList.toggle("hidden", !isYntraa);
  $("advancedRow")?.classList.toggle("hidden", !isYntraa);
  $("cloudCalcRow")?.classList.toggle("hidden", isYntraa);

  populatePlanOptions();

  if (!isYntraa) {
    $("securitySpend").value = "";
    $("advancedSpend").value = "";
  } else {
    updateYntraaTotal();
  }
}

export function buildPhase1Payload() {
  const cloudTypeLabel = $("cloudType")?.value ?? "Yntraa";
  const cloudType = CLOUD_TYPE_API[cloudTypeLabel] ?? "yntraa";
  const planLabel = $("plan")?.value ?? "Priority";
  const paymentLabel = $("paymentTerm")?.value ?? "Arrear";
  const spends = readServiceSpends();

  const payload = {
    cloudType,
    plan: PLAN_API[planLabel] ?? "priority",
    doaApplicable: $("doaApplicable")?.checked ?? false,
    contractTermYears: Number($("termYears")?.value ?? 0),
    paymentTerm: PAYMENT_TERM_API[paymentLabel] ?? "arrear",
    customerName: $("customerName")?.value ?? "",
    securitySpend: num($("securitySpend")?.value),
    advancedSpend: num($("advancedSpend")?.value),
    cloudCalculatorUrl: $("cloudCalcUrl")?.value ?? "",
  };

  if (isYntraaCloudType(cloudTypeLabel)) {
    payload.serviceSpends = spends;
  } else {
    payload.monthlyCloudSpend = num($("cloudSpend")?.value);
  }

  return payload;
}
