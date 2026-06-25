import { $ } from "./dom.js";

export function setView(mode) {
  const internalCard = $("internalCard");
  const customerCard = $("customerCard");
  const btnInternal = $("btnInternal");
  const btnCustomer = $("btnCustomer");

  if (mode === "internal") {
    internalCard.style.display = "block";
    customerCard.style.display = "none";
    btnInternal.classList.add("active");
    btnCustomer.classList.remove("active");
  } else {
    internalCard.style.display = "none";
    customerCard.style.display = "block";
    btnInternal.classList.remove("active");
    btnCustomer.classList.add("active");
  }
}

export function printCustomerView() {
  setView("customer");
  window.print();
}
