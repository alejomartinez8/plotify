import { describe, it, expect, afterEach, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    collaborator: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    collaboratorAssignment: {
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import {
  getCollaborators,
  createCollaborator,
  deleteCollaborator,
  updateCollaboratorLotAssignments,
} from "./collaborators";

const mockedFindMany = vi.mocked(prisma.collaborator.findMany);
const mockedCreate = vi.mocked(prisma.collaborator.create);
const mockedDelete = vi.mocked(prisma.collaborator.delete);
const mockedDeleteMany = vi.mocked(prisma.collaboratorAssignment.deleteMany);
const mockedCreateMany = vi.mocked(prisma.collaboratorAssignment.createMany);

describe("getCollaborators", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("flattens lot assignments into lotId/lotNumber/owner", async () => {
    mockedFindMany.mockResolvedValue([
      {
        id: "collab-1",
        name: "John Doe",
        lotAssignments: [
          {
            lotId: "lot-1",
            assignedAt: new Date("2026-01-01"),
            lot: { id: "lot-1", lotNumber: "001", owner: "Jane Doe" },
          },
        ],
      },
    ] as never);

    const result = await getCollaborators();

    expect(result[0].lotAssignments).toEqual([
      {
        lotId: "lot-1",
        lotNumber: "001",
        owner: "Jane Doe",
        assignedAt: new Date("2026-01-01"),
      },
    ]);
  });

  it("returns an empty array instead of throwing when the query fails", async () => {
    mockedFindMany.mockRejectedValue(new Error("db down"));

    expect(await getCollaborators()).toEqual([]);
  });
});

describe("createCollaborator", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates lot assignments when lotIds are provided", async () => {
    mockedCreate.mockResolvedValue({ id: "collab-1" } as never);

    await createCollaborator({ name: "John Doe", lotIds: ["lot-1", "lot-2"] });

    expect(mockedCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        lotAssignments: {
          create: [{ lotId: "lot-1" }, { lotId: "lot-2" }],
        },
      }),
    });
  });

  it("omits lotAssignments entirely when no lotIds are given", async () => {
    mockedCreate.mockResolvedValue({ id: "collab-1" } as never);

    await createCollaborator({ name: "John Doe" });

    expect(mockedCreate.mock.calls[0][0].data).not.toHaveProperty(
      "lotAssignments"
    );
  });

  it("returns null instead of throwing when the database call fails", async () => {
    mockedCreate.mockRejectedValue(new Error("db down"));

    expect(await createCollaborator({ name: "John Doe" })).toBeNull();
  });
});

describe("deleteCollaborator", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns true on success and false on failure", async () => {
    mockedDelete.mockResolvedValueOnce({} as never);
    expect(await deleteCollaborator("collab-1")).toBe(true);

    mockedDelete.mockRejectedValueOnce(new Error("db down"));
    expect(await deleteCollaborator("collab-1")).toBe(false);
  });
});

describe("updateCollaboratorLotAssignments", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("replaces assignments: clears existing ones, then creates the new set", async () => {
    mockedDeleteMany.mockResolvedValue({ count: 2 } as never);
    mockedCreateMany.mockResolvedValue({ count: 2 } as never);

    const result = await updateCollaboratorLotAssignments("collab-1", [
      "lot-1",
      "lot-2",
    ]);

    expect(result).toBe(true);
    expect(mockedDeleteMany).toHaveBeenCalledWith({
      where: { collaboratorId: "collab-1" },
    });
    expect(mockedCreateMany).toHaveBeenCalledWith({
      data: [
        { collaboratorId: "collab-1", lotId: "lot-1" },
        { collaboratorId: "collab-1", lotId: "lot-2" },
      ],
    });
  });

  it("skips createMany when the new assignment list is empty", async () => {
    mockedDeleteMany.mockResolvedValue({ count: 1 } as never);

    const result = await updateCollaboratorLotAssignments("collab-1", []);

    expect(result).toBe(true);
    expect(mockedCreateMany).not.toHaveBeenCalled();
  });

  it("returns false instead of throwing when the database call fails", async () => {
    mockedDeleteMany.mockRejectedValue(new Error("db down"));

    expect(await updateCollaboratorLotAssignments("collab-1", ["lot-1"])).toBe(
      false
    );
  });
});
