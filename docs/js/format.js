export function formatCurrency(value) {
  return `₹${Math.round(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
}
