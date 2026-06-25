import { calculatePhase1 } from "./api-client.js";
import { $ } from "./dom.js";
import {
  buildPhase1Payload,
  renderServiceGrid,
  updateCloudTypeUi,
  updateYntraaTotal,
} from "./form.js";
import { bindPhase1Results } from "./results.js";
import { printCustomerView, setView } from "./views.js";

function runCalculation() {
  updateYntraaTotal();
  const result = calculatePhase1(buildPhase1Payload());
  bindPhase1Results(result);
}

function onCloudTypeChange() {
  updateCloudTypeUi();
  runCalculation();
}

function bindEvents() {
  $("cloudType")?.addEventListener("change", onCloudTypeChange);
  $("btnCalculate")?.addEventListener("click", runCalculation);
  $("btnInternal")?.addEventListener("click", () => setView("internal"));
  $("btnCustomer")?.addEventListener("click", () => setView("customer"));
  $("btnPrint")?.addEventListener("click", printCustomerView);
  $("serviceGrid")?.addEventListener("input", updateYntraaTotal);
}

function init() {
  renderServiceGrid();
  bindEvents();
  updateCloudTypeUi();
  runCalculation();
}

init();
