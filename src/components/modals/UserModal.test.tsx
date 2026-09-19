import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserModal from "@/components/modals/UserModal";
import { updateUserAction, UserState } from "@/lib/actions/user-actions";
import { translations } from "@/lib/translations";
import { User } from "@/types/users.types";

vi.mock("@/lib/actions/user-actions", () => ({
  updateUserAction: vi.fn(),
}));

const user: User = {
  id: "user-1",
  email: "treasurer@example.com",
  name: "Treasurer",
  role: "treasurer",
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("UserModal", () => {
  beforeEach(() => {
    vi.mocked(updateUserAction).mockReset();
    vi.mocked(updateUserAction).mockResolvedValue({
      message: "Updated successfully.",
      success: true,
      errors: {},
    } satisfies UserState);
  });

  it("submits the update for another user", async () => {
    const userEventInstance = userEvent.setup();
    const onSuccess = vi.fn();
    render(
      <UserModal
        user={user}
        isSelf={false}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />
    );

    await userEventInstance.click(
      screen.getByRole("button", { name: translations.actions.update })
    );

    await waitFor(() => {
      expect(updateUserAction).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("locks the role field and shows an explanation when editing your own user", () => {
    render(
      <UserModal
        user={user}
        isSelf={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(
      screen.getByText(translations.errors.cannotChangeOwnRole)
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(translations.labels.role)
    ).not.toBeInTheDocument();
  });

  it("shows the processing state while the submission is in flight", async () => {
    let resolveAction: (value: UserState) => void;
    vi.mocked(updateUserAction).mockReturnValue(
      new Promise((resolve) => {
        resolveAction = resolve;
      })
    );

    const userEventInstance = userEvent.setup();
    render(
      <UserModal
        user={user}
        isSelf={false}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    await userEventInstance.click(
      screen.getByRole("button", { name: translations.actions.update })
    );

    expect(
      await screen.findByRole("button", {
        name: translations.status.processing,
      })
    ).toBeDisabled();

    resolveAction!({
      message: "Updated successfully.",
      success: true,
      errors: {},
    });
  });
});
