import type { Metadata } from "next";

import { portalDefaultMetadata } from "@/app/metadata";
import { verifySession } from "@/auth/dal";
import { PageContent, PageHeader } from "@/components/layout/page";
import { LINUX_FEED_SOURCES } from "@/config/feed";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { fetchAllLinuxFeeds } from "@/shared/feed";
import { getRouteMetadata } from "@atl/seo/metadata";

import { FeedContent } from "./feed-content";

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata(
    "/app/feed",
    [...routeConfig.protected, ...routeConfig.public],
    portalDefaultMetadata
  );
}

export default async function FeedPage() {
  await verifySession();

  const resolver = await getServerRouteResolver();
  const { articles, results } = await fetchAllLinuxFeeds(LINUX_FEED_SOURCES);

  // Strip non-serializable fields (RegExp) before passing to the Client Component
  const sources = LINUX_FEED_SOURCES.map(
    ({ categoryPattern: _, ...rest }) => rest
  );

  return (
    <PageContent>
      <PageHeader pathname="/app/feed" resolver={resolver} />
      <FeedContent articles={articles} results={results} sources={sources} />
    </PageContent>
  );
}
