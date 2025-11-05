"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  createCollaborator,
  updateCollaborator,
  deleteCollaborator,
  updateCollaboratorLotAssignments,
  getCollaboratorById,
} from "@/lib/database/collaborators";
import { translations } from "@/lib/translations";
import { logger } from "@/lib/logger";
import { requireAllLotsAccess, requireAnyLotAccess } from "@/lib/auth";

const CollaboratorSchema = z.object({
  name: z.string().min(1, translations.errors.required),
  photoFileId: z.string().nullable().optional(),
  photoFileUrl: z.string().nullable().optional(),
  photoFileName: z.string().nullable().optional(),
  lotIds: z.string().optional().transform((val) => {
    if (!val) return [];
    try {
      return JSON.parse(val) as string[];
    } catch {
      return [];
    }
  }),
});

const CreateCollaborator = CollaboratorSchema;
const UpdateCollaborator = CollaboratorSchema.extend({
  id: z.string().min(1, translations.errors.required),
});

export type CollaboratorState = {
  errors?: {
    name?: string[];
    photoFileId?: string[];
    lotIds?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function createCollaboratorAction(
  _prevState: CollaboratorState,
  formData: FormData
): Promise<CollaboratorState> {
  const actionTimer = logger.timer("Create Collaborator Action");

  const rawData = {
    name: formData.get("name"),
    photoFileId: formData.get("photoFileId"),
    photoFileUrl: formData.get("photoFileUrl"),
    photoFileName: formData.get("photoFileName"),
    lotIds: formData.get("lotIds"),
  };

  const validatedFields = CreateCollaborator.safeParse(rawData);

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    logger.error("Collaborator validation failed", new Error("Validation error"), {
      component: "createCollaboratorAction",
      errors: fieldErrors,
    });

    actionTimer.end();
    return {
      errors: fieldErrors,
      message: `${translations.errors.missingFields}. Failed to create collaborator.`,
      success: false,
    };
  }

  const { name, photoFileId, photoFileUrl, photoFileName, lotIds } =
    validatedFields.data;

  // Check lot access - must own all lots being assigned
  try {
    if (lotIds.length > 0) {
      await requireAllLotsAccess(lotIds);
    }
  } catch (error) {
    actionTimer.end();
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "You don't have permission to assign collaborators to these lots",
    };
  }

  try {
    const result = await createCollaborator({
      name,
      photoFileId: photoFileId || null,
      photoFileUrl: photoFileUrl || null,
      photoFileName: photoFileName || null,
      lotIds,
    });

    if (!result) {
      logger.error(
        "Database operation failed",
        new Error("Create collaborator returned null"),
        {
          component: "createCollaboratorAction",
        }
      );
      actionTimer.end();
      return {
        success: false,
        message: "Database Error: Failed to create collaborator.",
      };
    }
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during collaborator creation", errorInstance, {
      component: "createCollaboratorAction",
    });
    actionTimer.end();
    return {
      success: false,
      message: `${translations.errors.database}: Failed to create collaborator.`,
    };
  }

  revalidatePath("/collaborators");
  revalidatePath("/");
  actionTimer.end();

  return { success: true, message: `${translations.messages.created}.` };
}

export async function updateCollaboratorAction(
  _prevState: CollaboratorState,
  formData: FormData
): Promise<CollaboratorState> {
  const actionTimer = logger.timer("Update Collaborator Action");

  const rawData = {
    id: formData.get("id"),
    name: formData.get("name"),
    photoFileId: formData.get("photoFileId"),
    photoFileUrl: formData.get("photoFileUrl"),
    photoFileName: formData.get("photoFileName"),
    lotIds: formData.get("lotIds"),
  };

  const validatedFields = UpdateCollaborator.safeParse(rawData);

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    logger.error("Collaborator validation failed", new Error("Validation error"), {
      component: "updateCollaboratorAction",
      errors: fieldErrors,
    });
    actionTimer.end();
    return {
      errors: fieldErrors,
      message: `${translations.errors.missingFields}. Failed to update collaborator.`,
      success: false,
    };
  }

  const { id, name, photoFileId, photoFileUrl, photoFileName, lotIds } =
    validatedFields.data;

  // Check lot access - must own all lots being assigned
  try {
    if (lotIds.length > 0) {
      await requireAllLotsAccess(lotIds);
    }
  } catch (error) {
    actionTimer.end();
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "You don't have permission to assign collaborators to these lots",
    };
  }

  try {
    const result = await updateCollaborator(id, {
      name,
      photoFileId: photoFileId || null,
      photoFileUrl: photoFileUrl || null,
      photoFileName: photoFileName || null,
    });

    if (!result) {
      logger.error(
        "Database operation failed",
        new Error("Update collaborator returned null"),
        {
          component: "updateCollaboratorAction",
        }
      );
      actionTimer.end();
      return {
        success: false,
        message: "Database Error: Failed to update collaborator.",
      };
    }

    const assignmentResult = await updateCollaboratorLotAssignments(id, lotIds);

    if (!assignmentResult) {
      logger.error(
        "Database operation failed",
        new Error("Update collaborator lot assignments returned false"),
        {
          component: "updateCollaboratorAction",
        }
      );
      actionTimer.end();
      return {
        success: false,
        message: "Database Error: Failed to update collaborator lot assignments.",
      };
    }
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during collaborator update", errorInstance, {
      component: "updateCollaboratorAction",
    });
    actionTimer.end();
    return {
      success: false,
      message: `${translations.errors.database}: Failed to update collaborator.`,
    };
  }

  revalidatePath("/collaborators");
  revalidatePath("/");
  actionTimer.end();

  return { success: true, message: `${translations.messages.updated}.` };
}

export async function deleteCollaboratorAction(id: string): Promise<CollaboratorState> {
  const actionTimer = logger.timer("Delete Collaborator Action");

  // First, fetch the collaborator to get their lot assignments
  let collaborator;
  try {
    collaborator = await getCollaboratorById(id);
    if (!collaborator) {
      actionTimer.end();
      return {
        success: false,
        message: "Collaborator not found",
      };
    }
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Error fetching collaborator for deletion", errorInstance, {
      component: "deleteCollaboratorAction",
      collaboratorId: id,
    });
    actionTimer.end();
    return {
      success: false,
      message: "Failed to fetch collaborator details",
    };
  }

  // Check lot access - must own at least one of the assigned lots
  try {
    const lotIds = collaborator.lotAssignments.map((assignment) => assignment.lotId);
    if (lotIds.length > 0) {
      await requireAnyLotAccess(lotIds);
    }
  } catch (error) {
    actionTimer.end();
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "You don't have permission to delete this collaborator",
    };
  }

  try {
    const result = await deleteCollaborator(id);

    if (!result) {
      logger.error(
        "Database operation failed",
        new Error("Delete collaborator returned false"),
        {
          component: "deleteCollaboratorAction",
        }
      );
      actionTimer.end();
      return {
        success: false,
        message: `${translations.errors.database}: Failed to delete collaborator.`,
      };
    }

    revalidatePath("/collaborators");
    revalidatePath("/");
    actionTimer.end();
    return { success: true, message: `${translations.messages.deleted}.` };
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.error("Database error during collaborator deletion", errorInstance, {
      component: "deleteCollaboratorAction",
    });
    actionTimer.end();
    return {
      success: false,
      message: `${translations.errors.database}: Failed to delete collaborator.`,
    };
  }
}
