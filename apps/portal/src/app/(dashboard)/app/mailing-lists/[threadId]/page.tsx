import type { Metadata } from "next";

import { portalDefaultMetadata } from "@/app/metadata";
import { PageContent, PageHeader } from "@/components/layout/page";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { verifySession } from "@atl/auth/dal";
import { getRouteMetadata } from "@atl/seo/metadata";

import { ThreadDetailContent } from "./thread-detail-content";

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata(
    "/app/mailing-lists",
    [...routeConfig.protected, ...routeConfig.public],
    portalDefaultMetadata
  );
}

export default async function MailingListThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  await verifySession();
  const resolver = await getServerRouteResolver();
  const { threadId } = await params;

  return (
    <PageContent>
      <PageHeader pathname="/app/mailing-lists" resolver={resolver} />
      <ThreadDetailContent threadId={threadId} />
    </PageContent>
  );
}
