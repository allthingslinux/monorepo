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
    <PageContent className="h-0 flex-1 space-y-0 overflow-hidden p-0 sm:space-y-0 sm:p-0 md:p-0">
      <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden px-3 pt-3 sm:gap-4 sm:px-4 sm:pt-4 md:px-6 md:pt-6">
        <PageHeader pathname="/app/changelog" resolver={resolver} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-3 sm:pb-4 md:pb-6">
          <ChangelogContent entries={entries} errors={errors} repos={repos} />
        </div>
      </div>
    </PageContent>
  );
}
