"use client";

import { Badge } from "@atl/ui/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@atl/ui/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@atl/ui/ui/select";
import type { IrcAccountWithUser } from "@portal/api/types";
import { formatDate } from "@portal/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo, useState } from "react";

import { useAdminIrcAccounts } from "@/features/admin/hooks/use-admin";
import { integrationStatusLabels } from "@/features/integrations/lib/core/constants";

import { DataTable } from "./data-table";

const columnHelper = createColumnHelper<IrcAccountWithUser>();

function createIrcAccountColumns() {
  return [
    columnHelper.accessor((row) => row.user?.email ?? row.userId, {
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) {
          return (
            <span className="font-mono text-muted-foreground text-sm">
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
    columnHelper.accessor("nick", {
      cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
      header: "Nick",
    }),
    columnHelper.accessor("server", {
      cell: ({ row }) => `${row.original.server}:${row.original.port}`,
      header: "Server",
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
  ] as ColumnDef<IrcAccountWithUser, unknown>[];
}

const IRC_STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Suspended", value: "suspended" },
  { label: "Deleted", value: "deleted" },
] as const;

function IrcAccountsManagementInner() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const filters = useMemo(
    () => ({ status: statusFilter === "all" ? undefined : statusFilter }),
    [statusFilter]
  );
  const { data, error, isPending } = useAdminIrcAccounts(filters);
  const columns = useMemo(() => createIrcAccountColumns(), []);
  const ircAccounts = useMemo(() => data?.ircAccounts ?? [], [data]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>IRC Accounts</CardTitle>
          <CardDescription>
            All IRC (NickServ) accounts provisioned via Portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            Failed to load IRC accounts: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPending && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>IRC Accounts</CardTitle>
          <CardDescription>
            All IRC (NickServ) accounts provisioned via Portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Loading IRC accounts…
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>IRC Accounts</CardTitle>
        <CardDescription>
          All IRC (NickServ) accounts provisioned via Portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable<IrcAccountWithUser, unknown>
          columns={columns}
          data={ircAccounts}
          toolbarContent={
            <Select
              onValueChange={(value) => setStatusFilter(value ?? "")}
              value={statusFilter}
            >
              <SelectTrigger className="max-w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {IRC_STATUS_OPTIONS.map((opt) => (
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

export const IrcAccountsManagement = memo(IrcAccountsManagementInner);