type ViewerRole = "admin" | "treasurer" | "owner" | null;

/**
 * Admins and treasurers see community-wide data (every lot, expenses,
 * other income, fund balances). Owners only see data for their own lots.
 */
export function hasFullDataAccess(role: ViewerRole): boolean {
  return role === "admin" || role === "treasurer";
}

/**
 * Keep only the lots the user may see. `visibleLotIds === null` means
 * unrestricted access.
 */
export function filterVisibleLots<T extends { id: string }>(
  lots: T[],
  visibleLotIds: string[] | null
): T[] {
  if (visibleLotIds === null) return lots;
  return lots.filter((lot) => visibleLotIds.includes(lot.id));
}

/**
 * Keep only the contributions that belong to lots the user may see.
 * `visibleLotIds === null` means unrestricted access.
 */
export function filterVisibleContributions<
  T extends { lotId: string | number },
>(contributions: T[], visibleLotIds: string[] | null): T[] {
  if (visibleLotIds === null) return contributions;
  return contributions.filter((c) => visibleLotIds.includes(String(c.lotId)));
}

/**
 * Whether a single lot is visible. `visibleLotIds === null` means
 * unrestricted access.
 */
export function isLotVisible(
  lotId: string,
  visibleLotIds: string[] | null
): boolean {
  return visibleLotIds === null || visibleLotIds.includes(lotId);
}
