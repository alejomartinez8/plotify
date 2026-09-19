import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import QuotaSummaryCard from "@/components/shared/QuotaSummaryCard";
import { SimpleLotBalance } from "@/types/quotas.types";

// toHaveTextContent normalizes the DOM's whitespace but not the matcher
// string, so formatCurrency's non-breaking space (between "$" and the
// amount) never matches a plain space — match loosely with a regex instead.
function currencyMatcher(amount: number) {
  const escaped = amount.toLocaleString("es-CO").replace(".", "\\.");
  return new RegExp(`\\$\\s*${escaped}`);
}

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

describe("QuotaSummaryCard", () => {
  it("sums each lot's debt into a per-category breakdown", () => {
    const lotBalances = [
      makeBalance({
        lotId: "1",
        outstandingBalance: 50000,
        debtByCategory: { maintenance: 50000, works: 0, others: 0 },
        status: "overdue",
      }),
      makeBalance({
        lotId: "2",
        outstandingBalance: 35000,
        debtByCategory: { maintenance: 0, works: 35000, others: 0 },
        status: "overdue",
      }),
    ];

    render(<QuotaSummaryCard lotBalances={lotBalances} />);

    expect(screen.getByTestId("debt-by-category-maintenance")).toHaveTextContent(
      currencyMatcher(50000)
    );
    expect(screen.getByTestId("debt-by-category-works")).toHaveTextContent(
      currencyMatcher(35000)
    );
    expect(screen.getByTestId("debt-by-category-others")).toHaveTextContent(
      currencyMatcher(0)
    );
  });
});
