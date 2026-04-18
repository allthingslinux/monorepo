import type { Metadata } from "next";
import { Suspense } from "react";

import { portalDefaultMetadata } from "@/app/metadata";
import { PageContent, PageHeader } from "@/components/layout/page";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { verifySession } from "@atl/auth/dal";
import { getRouteMetadata } from "@atl/seo/metadata";

import { MailingListsContent } from "./mailing-lists-content";
import { ThreadDetailModal } from "./thread-detail-modal";

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata(
    "/app/mailing-lists",
    [...routeConfig.protected, ...routeConfig.public],
    portalDefaultMetadata
  );
}

export default async function MailingListsPage() {
  await verifySession();
  const resolver = await getServerRouteResolver();

  return (
    <PageContent className="overflow-hidden">
      <div className="shrink-0">
        <PageHeader pathname="/app/mailing-lists" resolver={resolver} />
      </div>
      <MailingListsContent />
      <Suspense fallback={null}>
        <ThreadDetailModal />
      </Suspense>
    </PageContent>
  );
}
