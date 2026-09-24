import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import WhatsAppReportButton, {
  generateWhatsAppReport,
} from "@/components/shared/WhatsAppReportButton";
import { SimpleLotBalance } from "@/types/quotas.types";
import { translations } from "@/lib/translations";

const t = translations.whatsapp;

// formatCurrency separates "$" and the amount with a non-breaking space, so
// match loosely with a regex instead of a plain string.
function currencyMatcher(amount: number) {
  const escaped = amount.toLocaleString("es-CO").replace(/\./g, "\\.");
  return `\\$\\s*${escaped}`;
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

const balances = [
  makeBalance({ lotId: "a", lotNumber: "10", owner: "TEN", status: "overdue", outstandingBalance: 180000 }),
  makeBalance({ lotId: "b", lotNumber: "2", owner: "TWO", status: "overdue", outstandingBalance: 60000 }),
  makeBalance({ lotId: "c", lotNumber: "5", owner: "FIVE", status: "current" }),
];

describe("generateWhatsAppReport", () => {
  it("labels both overdue and current lot counts in the summary", () => {
    const report = generateWhatsAppReport(balances, 0);

    expect(report).toContain("Total lotes: 3 · En mora: 🔴 2 · Al día: ✅ 1");
  });

  it("includes the total debt and the cash balance", () => {
    const report = generateWhatsAppReport(balances, 8150899);

    expect(report).toMatch(
      new RegExp(`${t.summaryDebt} ${currencyMatcher(240000)}`)
    );
    expect(report).toMatch(
      new RegExp(`${t.summaryCashBalance} ${currencyMatcher(8150899)}`)
    );
  });

  it("lists only lots with debt, sorted by lot number numerically", () => {
    const report = generateWhatsAppReport(balances, 0);
    const debtorLines = report.split("\n").filter((l) => l.startsWith("🔴 "));

    expect(debtorLines).toHaveLength(2);
    expect(debtorLines[0]).toMatch(
      new RegExp(`^🔴 🏡 \\*Lote 2\\* — TWO — ${currencyMatcher(60000)}$`)
    );
    expect(debtorLines[1]).toMatch(
      new RegExp(`^🔴 🏡 \\*Lote 10\\* — TEN — ${currencyMatcher(180000)}$`)
    );
    expect(report).not.toContain("FIVE");
  });

  it("includes title, sections and footer even without debtors", () => {
    const report = generateWhatsAppReport(
      [makeBalance({ status: "current" })],
      0
    );
    const lines = report.split("\n");

    expect(lines[0]).toMatch(new RegExp(`^${t.reportTitle.replace(/\*/g, "\\*")} — \\d{2}/\\d{2}/\\d{4}$`));
    expect(report).toContain(t.reportDebtorsList);
    expect(report).toContain(t.reportDebtorsMotivation);
    expect(lines.filter((l) => l.startsWith("🔴 "))).toHaveLength(0);
    expect(lines[lines.length - 1]).toBe(t.summaryFooter);
  });

  it("does not mutate the input order", () => {
    const input = [...balances];
    generateWhatsAppReport(input, 0);

    expect(input.map((l) => l.lotNumber)).toEqual(["10", "2", "5"]);
  });
});

describe("WhatsAppReportButton", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockReset();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function clickButton() {
    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });
  }

  it("renders the copy label initially", () => {
    render(<WhatsAppReportButton lotBalances={balances} consolidatedBalance={0} />);

    expect(screen.getByRole("button")).toHaveTextContent(t.copyReport);
  });

  it("copies the generated report and shows the copied state", async () => {
    writeText.mockResolvedValue(undefined);
    render(<WhatsAppReportButton lotBalances={balances} consolidatedBalance={1000} />);

    await clickButton();

    expect(writeText).toHaveBeenCalledWith(generateWhatsAppReport(balances, 1000));
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent(t.copied);
    expect(button).toHaveClass("border-green-500");
  });

  it("shows the error state when the clipboard write fails", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    render(<WhatsAppReportButton lotBalances={balances} consolidatedBalance={0} />);

    await clickButton();

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent(t.copyError);
    expect(button).toHaveClass("border-red-500");
  });

  it("resets to the idle label after 2 seconds", async () => {
    writeText.mockResolvedValue(undefined);
    render(<WhatsAppReportButton lotBalances={balances} consolidatedBalance={0} />);

    await clickButton();
    expect(screen.getByRole("button")).toHaveTextContent(t.copied);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("button")).toHaveTextContent(t.copyReport);
  });

  it("restarts the reset timer on repeated clicks", async () => {
    writeText.mockResolvedValue(undefined);
    render(<WhatsAppReportButton lotBalances={balances} consolidatedBalance={0} />);

    await clickButton();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    await clickButton();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByRole("button")).toHaveTextContent(t.copied);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole("button")).toHaveTextContent(t.copyReport);
  });

  it("restarts the reset timer when a failed copy follows a successful one", async () => {
    writeText.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("denied"));
    render(<WhatsAppReportButton lotBalances={balances} consolidatedBalance={0} />);

    await clickButton();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    await clickButton();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByRole("button")).toHaveTextContent(t.copyError);
  });
});
