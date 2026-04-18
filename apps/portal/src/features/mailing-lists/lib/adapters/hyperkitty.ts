/**
 * HyperKitty / Mailman 3 list archives — optional JSON discovery.
 * Full thread ingestion can extend this adapter later.
 */
export async function discoverHyperkittyListFeed(
  _archiveBaseUrl: string
): Promise<string | null> {
  return null;
}
