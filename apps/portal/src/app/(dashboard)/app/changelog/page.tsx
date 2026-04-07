import type { Metadata } from "next";

import { portalDefaultMetadata } from "@/app/metadata";
import { PageContent, PageHeader } from "@/components/layout/page";
import { fetchChangelog } from "@/features/changelog/lib/service";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { verifySession } from "@atl/auth/dal";
import { CHANGELOG_REPOS } from "@atl/config/changelog";
import { getRouteMetadata } from "@atl/seo/metadata";

import { ChangelogContent } from "./changelog-content";

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata(
    "/app/changelog",
    [...routeConfig.protected, ...routeConfig.public],
    portalDefaultMetadata
  );
}

export default async function ChangelogPage() {
  await verifySession();

  const resolver = await getServerRouteResolver();
  const { entries, repos, errors } = await fetchChangelog(CHANGELOG_REPOS);

  return (
    <PageContent>
      <PageHeader pathname="/app/changelog" resolver={resolver} />
      <ChangelogContent entries={entries} errors={errors} repos={repos} />
    </PageContent>
  );
}
