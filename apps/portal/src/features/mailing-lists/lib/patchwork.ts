/**
 * Patchwork REST enrichment (optional).
 * Future: populate `ml_patch_meta` during sync from patchwork.kernel.org REST.
 */
export interface PatchworkPatchSummary {
  id: number;
  project: string;
  state: string | null;
}

export async function fetchPatchworkPatchesForSubject(
  _subject: string
): Promise<PatchworkPatchSummary | null> {
  return null;
}
