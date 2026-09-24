import { describe, it, expect } from "vitest";
import { filterReportByYear } from "@/components/shared/WhatsAppLotReportButton";
import { Contribution } from "@/types/contributions.types";
import { QuotaLineStatus } from "@/lib/utils";

function makeQuota(overrides: Partial<QuotaLineStatus>): QuotaLineStatus {
  return {
    id: "q",
    label: "Quota",
    quotaType: "maintenance",
    amount: 100,
    paidAmount: 100,
    status: "paid",
    ...overrides,
  };
}

function makeContribution(overrides: Partial<Contribution>): Contribution {
  return {
    id: 1,
    lotId: "1",
    type: "maintenance",
    amount: 100,
    date: "2026-01-01",
    description: "Payment",
    ...overrides,
  } as Contribution;
}

describe("filterReportByYear", () => {
  it("keeps works quotas and payments from previous years", () => {
    const quotas = [
      makeQuota({ id: "m-2025", quotaType: "maintenance", year: 2025 }),
      makeQuota({ id: "m-2026", quotaType: "maintenance", year: 2026 }),
      makeQuota({ id: "gate", quotaType: "works", year: 2025 }),
      makeQuota({ id: "initial", quotaType: "initial" }),
    ];
    const contributions = [
      makeContribution({ id: 1, type: "maintenance", date: "2025-06-01" }),
      makeContribution({ id: 2, type: "maintenance", date: "2026-09-18" }),
      makeContribution({ id: 3, type: "works", date: "2025-01-31" }),
      makeContribution({ id: 4, type: "others", date: "2025-03-01" }),
    ];

    const result = filterReportByYear(quotas, contributions, 2026);

    expect(result.quotaBreakdown.map((q) => q.id)).toEqual([
      "m-2026",
      "gate",
      "initial",
    ]);
    expect(result.contributions.map((c) => c.id)).toEqual([2, 3]);
  });
});
