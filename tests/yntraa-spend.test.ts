import { describe, expect, it } from "vitest";

const SERVICE_FIELDS = [
  "containerServices",
  "computeServices",
  "storageServices",
  "backupServices",
  "networkServices",
  "databaseServices",
] as const;

function sumServiceSpends(spends: Record<string, number>): number {
  return SERVICE_FIELDS.reduce((total, key) => total + (spends[key] ?? 0), 0);
}

describe("yntraa live spend sum", () => {
  it("matches workbook sample total", () => {
    const spends = {
      containerServices: 5000,
      computeServices: 5000,
      storageServices: 2000,
      backupServices: 200000,
      networkServices: 50000,
      databaseServices: 12000,
    };
    expect(sumServiceSpends(spends)).toBe(274000);
  });

  it("treats empty values as zero", () => {
    expect(sumServiceSpends({})).toBe(0);
  });
});
