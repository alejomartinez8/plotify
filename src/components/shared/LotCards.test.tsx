import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LotCards from "@/components/shared/LotCards";
import { Lot } from "@/types/lots.types";
import { SimpleLotBalance } from "@/types/quotas.types";
import { translations } from "@/lib/translations";

vi.mock("@/lib/actions/lot-actions", () => ({
  deleteLotAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

function makeLot(overrides: Partial<Lot>): Lot {
  return {
    id: overrides.id ?? "1",
    lotNumber: overrides.lotNumber ?? "101",
    owner: overrides.owner ?? "Owner",
    ownerEmail: null,
    whatsappPhone: null,
    initialWorksDebt: 0,
    isExempt: false,
    exemptionReason: null,
    exemptionEndDate: null,
    ...overrides,
  };
}

const lots: Lot[] = [
  makeLot({ id: "1", lotNumber: "101", owner: "Ana" }),
  makeLot({ id: "2", lotNumber: "102", owner: "Beto" }),
];

const lotBalances: SimpleLotBalance[] = [
  {
    lotId: "1",
    lotNumber: "101",
    owner: "Ana",
    totalContributions: 0,
    totalQuotas: 0,
    initialWorksDebt: 0,
    outstandingBalance: 50000,
    status: "overdue",
  },
  {
    lotId: "2",
    lotNumber: "102",
    owner: "Beto",
    totalContributions: 0,
    totalQuotas: 0,
    initialWorksDebt: 0,
    outstandingBalance: 0,
    status: "current",
  },
];

function renderLotCards(isAdmin = false) {
  return render(
    <LotCards
      lots={lots}
      contributions={[]}
      lotBalances={lotBalances}
      isAdmin={isAdmin}
    />
  );
}

describe("LotCards", () => {
  it("shows the sortable table view by default", () => {
    renderLotCards();

    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("switches to the cards view and back through the toggle buttons", async () => {
    const user = userEvent.setup();
    renderLotCards();

    await user.click(
      screen.getByTitle(translations.labels.viewAsCards)
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    await user.click(screen.getByTitle(translations.labels.viewAsList));
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("sorts rows by lot when the column header is clicked, toggling direction", async () => {
    const user = userEvent.setup();
    renderLotCards();

    const rowsAsc = screen.getAllByRole("row").slice(1);
    expect(rowsAsc[0]).toHaveTextContent("Ana");
    expect(rowsAsc[1]).toHaveTextContent("Beto");

    await user.click(
      screen.getByText(`${translations.labels.lot} / ${translations.labels.owner}`)
    );

    const rowsDesc = screen.getAllByRole("row").slice(1);
    expect(rowsDesc[0]).toHaveTextContent("Beto");
    expect(rowsDesc[1]).toHaveTextContent("Ana");
  });

  it("shows the admin-only new lot button only for admins", () => {
    const { unmount } = renderLotCards(false);
    expect(
      screen.queryByRole("button", {
        name: `${translations.actions.new} ${translations.labels.lot}`,
      })
    ).not.toBeInTheDocument();
    unmount();

    renderLotCards(true);
    expect(
      screen.getByRole("button", {
        name: `${translations.actions.new} ${translations.labels.lot}`,
      })
    ).toBeInTheDocument();
  });

  it("shows the empty state when there are no lots", () => {
    render(
      <LotCards lots={[]} contributions={[]} lotBalances={[]} isAdmin={false} />
    );

    expect(screen.getByText(translations.messages.noLots)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
