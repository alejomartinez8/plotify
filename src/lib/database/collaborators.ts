import prisma from "@/lib/prisma";
import { Collaborator, CollaboratorWithLots } from "@/types/collaborators.types";
import { logger } from "@/lib/logger";

/**
 * Retrieves all collaborators with their assigned lots.
 *
 * @returns Array of collaborators with lot assignment details, ordered by name
 * @example
 * const collaborators = await getCollaborators();
 * // Returns: [{ id: "1", name: "John Doe", lotAssignments: [...] }]
 */
export async function getCollaborators(): Promise<CollaboratorWithLots[]> {
  try {
    const collaborators = await prisma.collaborator.findMany({
      include: {
        lotAssignments: {
          include: {
            lot: {
              select: {
                id: true,
                lotNumber: true,
                owner: true,
              },
            },
          },
          orderBy: {
            assignedAt: "desc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return collaborators.map((collaborator) => ({
      ...collaborator,
      lotAssignments: collaborator.lotAssignments.map((assignment) => ({
        lotId: assignment.lotId,
        lotNumber: assignment.lot.lotNumber,
        owner: assignment.lot.owner,
        assignedAt: assignment.assignedAt,
      })),
    }));
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Error fetching collaborators", errorInstance, {
      component: "getCollaborators",
    });
    return [];
  }
}

/**
 * Retrieves a single collaborator by ID with their assigned lots.
 *
 * @param id - The unique identifier of the collaborator
 * @returns Collaborator with lot assignments or null if not found
 * @example
 * const collaborator = await getCollaboratorById("abc123");
 */
export async function getCollaboratorById(id: string): Promise<CollaboratorWithLots | null> {
  try {
    const collaborator = await prisma.collaborator.findUnique({
      where: { id },
      include: {
        lotAssignments: {
          include: {
            lot: {
              select: {
                id: true,
                lotNumber: true,
                owner: true,
              },
            },
          },
          orderBy: {
            assignedAt: "desc",
          },
        },
      },
    });

    if (!collaborator) return null;

    return {
      ...collaborator,
      lotAssignments: collaborator.lotAssignments.map((assignment) => ({
        lotId: assignment.lotId,
        lotNumber: assignment.lot.lotNumber,
        owner: assignment.lot.owner,
        assignedAt: assignment.assignedAt,
      })),
    };
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Error fetching collaborator by ID", errorInstance, {
      component: "getCollaboratorById",
      collaboratorId: id,
    });
    return null;
  }
}

/**
 * Retrieves all collaborators assigned to a specific lot.
 *
 * @param lotId - The unique identifier of the lot
 * @returns Array of collaborators assigned to the lot, ordered by name
 * @example
 * const collaborators = await getCollaboratorsByLotId("LOT-001");
 */
export async function getCollaboratorsByLotId(lotId: string): Promise<CollaboratorWithLots[]> {
  try {
    const collaborators = await prisma.collaborator.findMany({
      where: {
        lotAssignments: {
          some: {
            lotId: lotId,
          },
        },
      },
      include: {
        lotAssignments: {
          include: {
            lot: {
              select: {
                id: true,
                lotNumber: true,
                owner: true,
              },
            },
          },
          orderBy: {
            assignedAt: "desc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return collaborators.map((collaborator) => ({
      ...collaborator,
      lotAssignments: collaborator.lotAssignments.map((assignment) => ({
        lotId: assignment.lotId,
        lotNumber: assignment.lot.lotNumber,
        owner: assignment.lot.owner,
        assignedAt: assignment.assignedAt,
      })),
    }));
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Error fetching collaborators by lot ID", errorInstance, {
      component: "getCollaboratorsByLotId",
      lotId,
    });
    return [];
  }
}

/**
 * Creates a new collaborator with optional lot assignments and photo.
 *
 * @param data - Collaborator data including name, optional photo details, and lot assignments
 * @returns Created collaborator or null on error
 * @example
 * const collaborator = await createCollaborator({
 *   name: "John Doe",
 *   photoFileUrl: "https://...",
 *   lotIds: ["LOT-001", "LOT-002"]
 * });
 */
export async function createCollaborator(data: {
  name: string;
  photoFileId?: string | null;
  photoFileName?: string | null;
  photoFileUrl?: string | null;
  lotIds?: string[];
}): Promise<Collaborator | null> {
  try {
    const collaborator = await prisma.collaborator.create({
      data: {
        name: data.name,
        photoFileId: data.photoFileId || null,
        photoFileName: data.photoFileName || null,
        photoFileUrl: data.photoFileUrl || null,
        ...(data.lotIds &&
          data.lotIds.length > 0 && {
            lotAssignments: {
              create: data.lotIds.map((lotId) => ({
                lotId,
              })),
            },
          }),
      },
    });
    return collaborator;
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Error creating collaborator", errorInstance, {
      component: "createCollaborator",
      name: data.name,
    });
    return null;
  }
}

/**
 * Updates a collaborator's information.
 *
 * @param id - The unique identifier of the collaborator
 * @param data - Updated collaborator data (name and/or photo details)
 * @returns Updated collaborator or null on error
 * @example
 * const updated = await updateCollaborator("abc123", { name: "Jane Doe" });
 */
export async function updateCollaborator(
  id: string,
  data: {
    name?: string;
    photoFileId?: string | null;
    photoFileName?: string | null;
    photoFileUrl?: string | null;
  }
): Promise<Collaborator | null> {
  try {
    const collaborator = await prisma.collaborator.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.photoFileId !== undefined && { photoFileId: data.photoFileId }),
        ...(data.photoFileName !== undefined && { photoFileName: data.photoFileName }),
        ...(data.photoFileUrl !== undefined && { photoFileUrl: data.photoFileUrl }),
      },
    });
    return collaborator;
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Error updating collaborator", errorInstance, {
      component: "updateCollaborator",
      collaboratorId: id,
    });
    return null;
  }
}

/**
 * Deletes a collaborator and all their lot assignments.
 *
 * @param id - The unique identifier of the collaborator to delete
 * @returns true if successful, false on error
 * @example
 * const success = await deleteCollaborator("abc123");
 */
export async function deleteCollaborator(id: string): Promise<boolean> {
  try {
    await prisma.collaborator.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Error deleting collaborator", errorInstance, {
      component: "deleteCollaborator",
      collaboratorId: id,
    });
    return false;
  }
}

/**
 * Assigns a collaborator to a specific lot.
 *
 * @param collaboratorId - The unique identifier of the collaborator
 * @param lotId - The unique identifier of the lot
 * @returns true if successful, false on error
 * @example
 * const success = await assignCollaboratorToLot("abc123", "LOT-001");
 */
export async function assignCollaboratorToLot(
  collaboratorId: string,
  lotId: string
): Promise<boolean> {
  try {
    await prisma.collaboratorAssignment.create({
      data: {
        collaboratorId,
        lotId,
      },
    });
    return true;
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Error assigning collaborator to lot", errorInstance, {
      component: "assignCollaboratorToLot",
      collaboratorId,
      lotId,
    });
    return false;
  }
}

/**
 * Removes a collaborator's assignment from a specific lot.
 *
 * @param collaboratorId - The unique identifier of the collaborator
 * @param lotId - The unique identifier of the lot
 * @returns true if successful, false on error
 * @example
 * const success = await removeCollaboratorFromLot("abc123", "LOT-001");
 */
export async function removeCollaboratorFromLot(
  collaboratorId: string,
  lotId: string
): Promise<boolean> {
  try {
    await prisma.collaboratorAssignment.delete({
      where: {
        collaboratorId_lotId: {
          collaboratorId,
          lotId,
        },
      },
    });
    return true;
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Error removing collaborator from lot", errorInstance, {
      component: "removeCollaboratorFromLot",
      collaboratorId,
      lotId,
    });
    return false;
  }
}

/**
 * Updates all lot assignments for a collaborator.
 * Removes all existing assignments and creates new ones based on provided lot IDs.
 *
 * @param collaboratorId - The unique identifier of the collaborator
 * @param lotIds - Array of lot IDs to assign to the collaborator
 * @returns true if successful, false on error
 * @example
 * const success = await updateCollaboratorLotAssignments("abc123", ["LOT-001", "LOT-003"]);
 */
export async function updateCollaboratorLotAssignments(
  collaboratorId: string,
  lotIds: string[]
): Promise<boolean> {
  try {
    await prisma.collaboratorAssignment.deleteMany({
      where: { collaboratorId },
    });

    if (lotIds.length > 0) {
      await prisma.collaboratorAssignment.createMany({
        data: lotIds.map((lotId) => ({
          collaboratorId,
          lotId,
        })),
      });
    }

    return true;
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Error updating collaborator lot assignments", errorInstance, {
      component: "updateCollaboratorLotAssignments",
      collaboratorId,
    });
    return false;
  }
}
