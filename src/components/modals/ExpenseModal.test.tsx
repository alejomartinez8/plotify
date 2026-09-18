import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExpenseModal from "@/components/modals/ExpenseModal";
import {
  createExpenseAction,
  ExpenseState,
} from "@/lib/actions/expense-actions";
import { translations } from "@/lib/translations";

vi.mock("@/lib/actions/expense-actions", () => ({
  createExpenseAction: vi.fn(),
  updateExpenseAction: vi.fn(),
}));

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(translations.labels.amount), "100");
  await user.type(screen.getByLabelText(translations.labels.date), "2026-01-01");
}

describe("ExpenseModal", () => {
  beforeEach(() => {
    vi.mocked(createExpenseAction).mockReset();
    vi.mocked(createExpenseAction).mockResolvedValue({
      message: "Created successfully.",
      success: true,
      errors: {},
    } satisfies ExpenseState);
  });

  it("only submits once when the save button is double-clicked", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<ExpenseModal onClose={vi.fn()} onSuccess={onSuccess} />);

    await fillRequiredFields(user);

    const submitButton = screen.getByRole("button", {
      name: translations.actions.save,
    });

    await user.dblClick(submitButton);

    await waitFor(() => {
      expect(createExpenseAction).toHaveBeenCalledTimes(1);
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows the processing state while the submission is in flight", async () => {
    let resolveAction: (value: ExpenseState) => void;
    vi.mocked(createExpenseAction).mockReturnValue(
      new Promise((resolve) => {
        resolveAction = resolve;
      })
    );

    const user = userEvent.setup();
    render(<ExpenseModal onClose={vi.fn()} onSuccess={vi.fn()} />);

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
