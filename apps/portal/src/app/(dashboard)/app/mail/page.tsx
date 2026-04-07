import type { Metadata } from "next";

import { portalDefaultMetadata } from "@/app/metadata";
import { verifySession } from "@/auth/dal";
import { PageContent, PageHeader } from "@/components/layout/page";
import { env } from "@/env";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { getRouteMetadata } from "@atl/seo/metadata";

import { MailContent } from "./mail-content";

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata(
    "/app/mail",
    [...routeConfig.protected, ...routeConfig.public],
    portalDefaultMetadata
  );
}

export default async function MailPage() {
  await verifySession();

  const resolver = await getServerRouteResolver();

  return (
    <PageContent>
      <PageHeader pathname="/app/mail" resolver={resolver} />
      <MailContent webmailUrl={env.NEXT_PUBLIC_MAILCOW_WEB_URL} />
    </PageContent>
  );
}
