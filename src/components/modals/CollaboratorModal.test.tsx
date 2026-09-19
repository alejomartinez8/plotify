import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CollaboratorModal from "@/components/modals/CollaboratorModal";
import { Lot } from "@/types/lots.types";
import {
  createCollaboratorAction,
  CollaboratorState,
} from "@/lib/actions/collaborator-actions";
import { translations } from "@/lib/translations";

vi.mock("@/lib/actions/collaborator-actions", () => ({
  createCollaboratorAction: vi.fn(),
  updateCollaboratorAction: vi.fn(),
}));

const lots: Lot[] = [
  {
    id: "lot-1",
    lotNumber: "A1",
    owner: "Jane Doe",
    ownerEmail: null,
    whatsappPhone: null,
    initialWorksDebt: 0,
    isExempt: false,
    exemptionReason: null,
    exemptionEndDate: null,
  },
];

describe("CollaboratorModal", () => {
  beforeEach(() => {
    vi.mocked(createCollaboratorAction).mockReset();
    vi.mocked(createCollaboratorAction).mockResolvedValue({
      message: "Created successfully.",
      success: true,
      errors: {},
    } satisfies CollaboratorState);
  });

  it("submits the name and selected lots without requiring a photo", async () => {
    const user = userEvent.setup();
    render(<CollaboratorModal onClose={vi.fn()} lots={lots} />);

    await user.type(
      screen.getByLabelText(translations.labels.name),
      "John Doe"
    );
    await user.click(screen.getByLabelText(/A1 - Jane Doe/));
    await user.click(
      screen.getByRole("button", { name: translations.actions.save })
    );

    await waitFor(() => {
      expect(createCollaboratorAction).toHaveBeenCalledTimes(1);
    });

    const submittedFormData = vi.mocked(createCollaboratorAction).mock
      .calls[0][1] as FormData;
    expect(submittedFormData.get("name")).toBe("John Doe");
    expect(JSON.parse(submittedFormData.get("lotIds") as string)).toEqual([
      "lot-1",
    ]);
  });

  it("shows the processing state while the submission is in flight", async () => {
    let resolveAction: (value: CollaboratorState) => void;
    vi.mocked(createCollaboratorAction).mockReturnValue(
      new Promise((resolve) => {
        resolveAction = resolve;
      })
    );

    const user = userEvent.setup();
    render(<CollaboratorModal onClose={vi.fn()} lots={lots} />);

    await user.type(
      screen.getByLabelText(translations.labels.name),
      "John Doe"
    );
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
