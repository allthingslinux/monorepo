"use client";

import type { MediawikiAccountWithUser } from "@atl/api/types";
import { formatDate } from "@atl/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo, useState } from "react";

import { useAdminMediawikiAccounts } from "@/features/admin/hooks/use-admin";
import { integrationStatusLabels } from "@/features/integrations/lib/core/constants";
import { Badge } from "@atl/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@atl/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@atl/ui/components/select";

import { DataTable } from "./data-table";

const columnHelper = createColumnHelper<MediawikiAccountWithUser>();

function createMediawikiAccountColumns() {
  return [
    columnHelper.accessor((row) => row.user?.email ?? row.userId, {
      cell: ({ row }) => {
        const { user } = row.original;
        if (!user) {
          return (
            <span className="text-muted-foreground font-mono text-sm">
              {row.original.userId.slice(0, 8)}…
            </span>
          );
        }
        return (
          <div>
            <div className="font-medium">{user.name ?? "—"}</div>
            <div className="text-muted-foreground text-sm">{user.email}</div>
          </div>
        );
      },
      header: "User",
      id: "user",
    }),
    columnHelper.accessor("wikiUsername", {
      cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
      header: "Wiki Username",
    }),
    columnHelper.accessor("status", {
      cell: ({ getValue }) => (
        <Badge variant="outline">
          {integrationStatusLabels[
            getValue() as keyof typeof integrationStatusLabels
          ] ?? getValue()}
        </Badge>
      ),
      header: "Status",
    }),
    columnHelper.accessor("createdAt", {
      cell: ({ getValue }) => formatDate(getValue() as string),
      header: "Created",
      sortingFn: "datetime",
    }),
  ] as ColumnDef<MediawikiAccountWithUser, unknown>[];
}

const MEDIAWIKI_STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Suspended", value: "suspended" },
  { label: "Deleted", value: "deleted" },
] as const;

function MediawikiAccountsManagementInner() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const filters = useMemo(
    () => ({ status: statusFilter === "all" ? undefined : statusFilter }),
    [statusFilter]
  );
  const { data, error, isPending } = useAdminMediawikiAccounts(filters);
  const columns = useMemo(() => createMediawikiAccountColumns(), []);
  const mediawikiAccounts = useMemo(
    () => data?.mediawikiAccounts ?? [],
    [data]
  );

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MediaWiki Accounts</CardTitle>
          <CardDescription>
            All MediaWiki accounts provisioned via Portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive text-center">
            Failed to load MediaWiki accounts: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPending && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MediaWiki Accounts</CardTitle>
          <CardDescription>
            All MediaWiki accounts provisioned via Portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center">
            Loading MediaWiki accounts…
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MediaWiki Accounts</CardTitle>
        <CardDescription>
          All MediaWiki accounts provisioned via Portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable<MediawikiAccountWithUser, unknown>
          columns={columns}
          data={mediawikiAccounts}
          toolbarContent={
            <Select
              onValueChange={(value) => setStatusFilter(value ?? "")}
              value={statusFilter}
            >
              <SelectTrigger className="max-w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {MEDIAWIKI_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
      </CardContent>
    </Card>
  );
}

export const MediawikiAccountsManagement = memo(
  MediawikiAccountsManagementInner
);
