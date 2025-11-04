import { getCollaborators } from "@/lib/database/collaborators";
import { getLots } from "@/lib/database/lots";
import CollaboratorsView from "@/components/shared/CollaboratorsView";
import ErrorLayout from "@/components/layout/ErrorLayout";
import { translations } from "@/lib/translations";
import { isAuthenticated } from "@/lib/auth";

export default async function CollaboratorsPage() {
  // Check authentication - only admins can add/edit/delete
  const isAdmin = await isAuthenticated();

  try {
    const [collaborators, lots] = await Promise.all([getCollaborators(), getLots()]);

    return (
      <CollaboratorsView
        collaborators={collaborators}
        lots={lots}
        isAuthenticated={isAdmin}
      />
    );
  } catch (error) {
    console.error("Error loading collaborators data:", error);
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
}
