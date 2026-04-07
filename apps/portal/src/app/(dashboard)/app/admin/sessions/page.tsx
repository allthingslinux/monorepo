import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page/page-header";
import { SessionManagement } from "@/features/admin/components/session-management";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { getServerQueryClient } from "@atl/api/hydration";
import { queryKeys } from "@atl/api/query-keys";
import { fetchSessionsServer } from "@atl/api/server-queries";
import { verifyAdminOrStaffSession } from "@atl/auth/dal";

const SESSIONS_PATH = "/app/admin/sessions" as const;

export function generateMetadata(): Metadata {
  const adminRoute = routeConfig.protected.find((r) => r.id === "admin");
  const child = adminRoute?.navigation?.children?.find(
    (c) => c.id === "admin-sessions"
  );
  const base = child
    ? {
        description:
          child.metadata?.description ?? "View and manage active user sessions",
        title: child.metadata?.title ?? "Session Management",
      }
    : {};
  return {
    ...base,
    alternates: {
      canonical: SESSIONS_PATH,
    },
  };
}

export default async function AdminSessionsPage() {
  await verifyAdminOrStaffSession();

  const queryClient = getServerQueryClient();
  const resolver = await getServerRouteResolver();

  await queryClient.prefetchQuery({
    queryFn: () => fetchSessionsServer({ limit: 100 }),
    queryKey: queryKeys.sessions.list({ limit: 100 }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <PageHeader pathname={SESSIONS_PATH} resolver={resolver} />
        <SessionManagement />
      </div>
    </HydrationBoundary>
  );
}
