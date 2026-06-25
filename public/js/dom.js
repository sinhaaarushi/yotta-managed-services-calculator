export function $(id) {
  return document.getElementById(id);
}

export function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

export function num(value) {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function isYntraaCloudType(cloudType) {
  return cloudType === "Yntraa";
}
