import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContributionModal from "@/components/modals/ContributionModal";
import { Lot } from "@/types/lots.types";
import {
  createContributionAction,
  ContributionState,
} from "@/lib/actions/contribution-actions";
import { translations } from "@/lib/translations";

vi.mock("@/lib/actions/contribution-actions", () => ({
  createContributionAction: vi.fn(),
  updateContributionAction: vi.fn(),
}));

const lots: Lot[] = [
  {
    id: "lot-1",
    lotNumber: "A1",
    owner: "Jane Doe",
    ownerEmail: null,
    whatsappPhone: null,
    initialWorksDebt: 0,
    stage: 1,
    isExempt: false,
    exemptionReason: null,
    exemptionEndDate: null,
  },
];

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(translations.labels.amount), "100");
  await user.type(
    screen.getByLabelText(translations.labels.date),
    "2026-01-01"
  );
}

describe("ContributionModal", () => {
  beforeEach(() => {
    vi.mocked(createContributionAction).mockReset();
    vi.mocked(createContributionAction).mockResolvedValue({
      message: "Created successfully.",
      success: true,
      errors: {},
    } satisfies ContributionState);
  });

  it("only submits once when the save button is double-clicked", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(
      <ContributionModal
        onClose={vi.fn()}
        onSuccess={onSuccess}
        lots={lots}
        defaultLotId="lot-1"
      />
    );

    await fillRequiredFields(user);

    const submitButton = screen.getByRole("button", {
      name: translations.actions.save,
    });

    await user.dblClick(submitButton);

    await waitFor(() => {
      expect(createContributionAction).toHaveBeenCalledTimes(1);
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows the processing state while the submission is in flight", async () => {
    let resolveAction: (value: ContributionState) => void;
    vi.mocked(createContributionAction).mockReturnValue(
      new Promise((resolve) => {
        resolveAction = resolve;
      })
    );

    const user = userEvent.setup();
    render(
      <ContributionModal
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        lots={lots}
        defaultLotId="lot-1"
      />
    );

    await fillRequiredFields(user);

    await user.click(
      screen.getByRole("button", { name: translations.actions.save })
    );

    expect(
      await screen.findByRole("button", {
        name: translations.status.processing,
      })
    ).toBeDisabled();

    resolveAction!({
      message: "Created successfully.",
      success: true,
      errors: {},
    });
  });
});
