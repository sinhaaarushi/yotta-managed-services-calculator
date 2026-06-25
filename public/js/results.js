import { $, setText } from "./dom.js";
import { formatCurrency, formatPercent } from "./format.js";

export function bindPhase1Results(result) {
  setText("outCustomer", result.customerName);
  setText("outCloudType", result.cloudTypeLabel);
  setText("outPlan", result.planLabel);
  setText("outTerm", result.contractTermLabel);
  setText("outCloudCalcUrl", result.cloudCalculatorUrl);
  setText("outCloudSpend", formatCurrency(result.monthlyCloudSpend));
  setText("outPlanMrcNet", formatCurrency(result.planMrcNet));
  setText("outAdvMrcNet", formatCurrency(result.advancedMrcNet));
  setText("outFinalMrc", formatCurrency(result.finalMrc));
  setText("outTcv", formatCurrency(result.totalContractValue));
  setText("outNetCloud", formatCurrency(result.netCloudSpend));
  setText("outMsPct", formatPercent(result.managedServicesPercent));
  setText("outBaseMrc", formatCurrency(result.planMrcList));
  setText("outAdvMrc", formatCurrency(result.advancedMrcList));
  setText("outTotalMrcList", formatCurrency(result.totalMrcList));
  setText("outTermDisc", formatPercent(result.contractTermDiscountPercent));
  setText("outPayDisc", formatPercent(result.paymentTermDiscountPercent));
  setText("outTotalDisc", formatPercent(result.totalDiscountPercent));
  setText("outBenefitAmt", formatCurrency(result.benefitAmount));

  setText("cCustomer", result.customerName);
  setText("cCloudType", result.cloudTypeLabel);
  setText("cPlan", result.planLabel);
  setText("cTerm", result.contractTermLabel);
  setText("cPaymentTerm", result.paymentTermLabel);
  setText("cCloudCalcUrl", result.cloudCalculatorUrl);
  setText("cCloudSpend", formatCurrency(result.monthlyCloudSpend));
  setText("cPlanMrcNet", formatCurrency(result.planMrcNet));
  setText("cAdvMrcNet", formatCurrency(result.advancedMrcNet));
  setText("cFinalMrc", formatCurrency(result.finalMrc));
  setText("cTcv", formatCurrency(result.totalContractValue));
  setText("cNetCloud", formatCurrency(result.netCloudSpend));
  setText("cBaseMrc", formatCurrency(result.planMrcList));
  setText("cAdvMrc", formatCurrency(result.advancedMrcList));
  setText("cTotalMrcList", formatCurrency(result.totalMrcList));
  setText("cBenefitAmt", formatCurrency(result.benefitAmount));

  const pill = $("doaStatusPill");
  if (!pill) return;

  if (result.doaApplicable) {
    pill.textContent = "DOA Rate";
    pill.className = "pill warning";
  } else {
    pill.textContent = "Standard Rate";
    pill.className = "pill secondary";
  }
}
