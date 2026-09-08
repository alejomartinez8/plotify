import { getCollaborators } from "@/lib/database/collaborators";
import { getLots } from "@/lib/database/lots";
import CollaboratorsView from "@/components/shared/CollaboratorsView";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";
import { getUserRole, getUserLotIds } from "@/lib/auth";
import { checkLotAccess } from "@/lib/check-lot-access";

export default async function CollaboratorsPage() {
  await checkLotAccess();

  let userRole: Awaited<ReturnType<typeof getUserRole>>;
  let userLotIds: Awaited<ReturnType<typeof getUserLotIds>>;
  let collaborators: Awaited<ReturnType<typeof getCollaborators>>;
  let lots: Awaited<ReturnType<typeof getLots>>;

  try {
    let allLots: Awaited<ReturnType<typeof getLots>>;
    [userRole, userLotIds, collaborators, allLots] = await Promise.all([
      getUserRole(),
      getUserLotIds(),
      getCollaborators(),
      getLots(),
    ]);

    lots =
      userRole === "owner"
        ? allLots.filter((lot) => userLotIds.includes(lot.id))
        : allLots;
  } catch (error) {
    return (
      <ErrorLayout
        title={translations.navigation.collaborators}
        message="Error loading collaborators data"
        error={
          error instanceof Error ? error.message : translations.errors.unknown
        }
      />
    );
  }

  return (
    <CollaboratorsView
      collaborators={collaborators}
      lots={lots}
      userRole={userRole}
      userLotIds={userLotIds}
    />
  );
}
