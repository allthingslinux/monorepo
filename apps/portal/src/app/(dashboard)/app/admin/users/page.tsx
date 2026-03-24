import { getServerQueryClient } from "@portal/api/hydration";
import { fetchUsersServer } from "@portal/api/server-queries";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { verifyAdminOrStaffSession } from "@/auth/dal";
import { PageHeader } from "@/components/layout/page/page-header";
import { UnifiedUserManagement } from "@/features/admin/components/unified-user-management";
import { loadUsersListSearchParams } from "@/features/admin/lib/search-params";
import { usersListQueryOptions } from "@/features/admin/lib/users-query-options";
import { getServerRouteResolver } from "@/features/routing/lib";

const USERS_PATH = "/app/admin/users" as const;

export function generateMetadata(): Metadata {
  return {
    alternates: {
      canonical: USERS_PATH,
    },
    description:
      "Manage users and integration accounts (IRC, XMPP, Mailcow, MediaWiki)",
    title: "User Management",
  };
}

interface AdminUsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  await verifyAdminOrStaffSession();

  const queryClient = getServerQueryClient();
  const resolver = await getServerRouteResolver();

  const urlState = await loadUsersListSearchParams(searchParams);
  const filters = {
    banned:
      urlState.status === "all" ? undefined : urlState.status === "banned",
    expandIntegrations: true,
    limit: urlState.limit,
    offset: urlState.offset,
    role: urlState.role === "all" ? undefined : urlState.role,
    search: urlState.search || undefined,
  };

  await queryClient.prefetchQuery({
    ...usersListQueryOptions(filters),
    queryFn: () => fetchUsersServer(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <PageHeader pathname={USERS_PATH} resolver={resolver} />
        <UnifiedUserManagement />
      </div>
    </HydrationBoundary>
  );
}