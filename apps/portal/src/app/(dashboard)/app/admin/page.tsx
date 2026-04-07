import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { portalDefaultMetadata } from "@/app/metadata";
import { AdminDashboardOverview } from "@/features/admin/components/admin-dashboard-overview";
import { routeConfig } from "@/features/routing/lib";
import { getServerQueryClient } from "@atl/api/hydration";
import { queryKeys } from "@atl/api/query-keys";
import { fetchAdminStatsServer } from "@atl/api/server-queries";
import { verifyAdminOrStaffSession } from "@atl/auth/dal";
import { getRouteMetadata } from "@atl/seo/metadata";

const ADMIN_PATH = "/app/admin" as const;

// Metadata is automatically generated from route config.
// Canonical URL omits query params so crawlers index the base path (nuqs “local-only state”).
export async function generateMetadata(): Promise<Metadata> {
  const base = getRouteMetadata(
    ADMIN_PATH,
    [...routeConfig.protected, ...routeConfig.public],
    portalDefaultMetadata
  );
  return {
    ...base,
    alternates: {
      ...base.alternates,
      canonical: ADMIN_PATH,
    },
  };
}

export default async function AdminPage() {
  await verifyAdminOrStaffSession();

  const queryClient = getServerQueryClient();

  await queryClient.prefetchQuery({
    queryFn: fetchAdminStatsServer,
    queryKey: queryKeys.admin.stats(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboardOverview />
    </HydrationBoundary>
  );
}
