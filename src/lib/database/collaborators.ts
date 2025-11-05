import prisma from "@/lib/prisma";
import { Collaborator, CollaboratorWithLots } from "@/types/collaborators.types";
import { logger } from "@/lib/logger";

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
