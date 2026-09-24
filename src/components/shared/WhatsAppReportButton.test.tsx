import { describe, it, expect } from "vitest";
import { generateWhatsAppReport } from "@/components/shared/WhatsAppReportButton";
import { SimpleLotBalance } from "@/types/quotas.types";

function makeBalance(overrides: Partial<SimpleLotBalance>): SimpleLotBalance {
  return {
    lotId: "1",
    lotNumber: "101",
    owner: "Owner",
    totalContributions: 0,
    totalQuotas: 0,
    initialWorksDebt: 0,
    outstandingBalance: 0,
    debtByCategory: { maintenance: 0, works: 0, others: 0 },
    status: "current",
    ...overrides,
  };
}

describe("generateWhatsAppReport", () => {
  it("labels both overdue and current lot counts in the summary", () => {
    const report = generateWhatsAppReport(
      [
        makeBalance({ lotId: "1", status: "overdue", outstandingBalance: 60000 }),
        makeBalance({ lotId: "2", status: "current" }),
        makeBalance({ lotId: "3", status: "current" }),
      ],
      0
    );

    expect(report).toContain("Total lotes: 3 · En mora: 🔴 1 · Al día: ✅ 2");
  });
});
