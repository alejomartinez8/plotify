import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuotaModal from "@/components/modals/QuotaModal";
import {
  createQuotaConfigAction,
  updateQuotaConfigAction,
  QuotaState,
} from "@/lib/actions/quota-actions";
import { translations } from "@/lib/translations";

vi.mock("@/lib/actions/quota-actions", () => ({
  createQuotaConfigAction: vi.fn(),
  updateQuotaConfigAction: vi.fn(),
}));

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(translations.labels.amount), "60000");
  await user.type(screen.getByLabelText(/Fecha de vencimiento/), "2026-01-15");
}

describe("QuotaModal", () => {
  beforeEach(() => {
    vi.mocked(createQuotaConfigAction).mockReset();
    vi.mocked(createQuotaConfigAction).mockResolvedValue({
      message: "Created successfully.",
      success: true,
      errors: {},
    } satisfies QuotaState);
  });

  it("submits the entered amount and due date", async () => {
    const user = userEvent.setup();
    render(<QuotaModal onClose={vi.fn()} onSuccess={vi.fn()} />);

    await fillRequiredFields(user);
    await user.click(
      screen.getByRole("button", { name: translations.actions.create })
    );

    await waitFor(() => {
      expect(createQuotaConfigAction).toHaveBeenCalledTimes(1);
    });
  });

  it("shows the processing state while the submission is in flight", async () => {
    let resolveAction: (value: QuotaState) => void;
    vi.mocked(createQuotaConfigAction).mockReturnValue(
      new Promise((resolve) => {
        resolveAction = resolve;
      })
    );

    const user = userEvent.setup();
    render(<QuotaModal onClose={vi.fn()} onSuccess={vi.fn()} />);

    await fillRequiredFields(user);
    await user.click(
      screen.getByRole("button", { name: translations.actions.create })
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

  it("shows a stage selector instead of a due date for works quotas, and submits the checked stages", async () => {
    vi.mocked(updateQuotaConfigAction).mockReset();
    vi.mocked(updateQuotaConfigAction).mockResolvedValue({
      message: "Updated successfully.",
      success: true,
      errors: {},
    } satisfies QuotaState);

    const user = userEvent.setup();
    const quota = {
      id: "quota-1",
      quotaType: "works",
      amount: 300000,
      description: "Portón",
      dueDate: null,
      stages: [1],
    };

    render(<QuotaModal quota={quota} onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(
      screen.queryByLabelText(/Fecha de vencimiento/)
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText(translations.titles.quotaStage1)
    ).toBeChecked();
    expect(
      screen.getByLabelText(translations.titles.quotaStage2)
    ).not.toBeChecked();

    await user.click(screen.getByLabelText(translations.titles.quotaStage2));
    await user.click(
      screen.getByRole("button", { name: translations.actions.update })
    );

    await waitFor(() => {
      expect(updateQuotaConfigAction).toHaveBeenCalledTimes(1);
    });
  });
});
