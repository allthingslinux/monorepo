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
import type { XmppAccountWithUser } from "@portal/api/types";
import { formatDate } from "@portal/utils/date";
import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo, useState } from "react";

import { useAdminXmppAccounts } from "@/features/admin/hooks/use-admin";
import { integrationStatusLabels } from "@/features/integrations/lib/core/constants";

import { DataTable } from "./data-table";

const columnHelper = createColumnHelper<XmppAccountWithUser>();

function createXmppAccountColumns() {
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
    columnHelper.accessor("jid", {
      cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
      header: "JID",
    }),
    columnHelper.accessor("username", {
      cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
      header: "Username",
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
  ] as ColumnDef<XmppAccountWithUser, unknown>[];
}

const XMPP_STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Deleted", value: "deleted" },
] as const;

function XmppAccountsManagementInner() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const filters = useMemo(
    () => ({ status: statusFilter === "all" ? undefined : statusFilter }),
    [statusFilter]
  );
  const { data, error, isPending } = useAdminXmppAccounts(filters);
  const columns = useMemo(() => createXmppAccountColumns(), []);
  const xmppAccounts = useMemo(() => data?.xmppAccounts ?? [], [data]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>XMPP Accounts</CardTitle>
          <CardDescription>
            All XMPP accounts provisioned via Portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            Failed to load XMPP accounts: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isPending && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>XMPP Accounts</CardTitle>
          <CardDescription>
            All XMPP accounts provisioned via Portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Loading XMPP accounts…
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>XMPP Accounts</CardTitle>
        <CardDescription>
          All XMPP accounts provisioned via Portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable<XmppAccountWithUser, unknown>
          columns={columns}
          data={xmppAccounts}
          toolbarContent={
            <Select
              onValueChange={(value) => setStatusFilter(value ?? "")}
              value={statusFilter}
            >
              <SelectTrigger className="max-w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {XMPP_STATUS_OPTIONS.map((opt) => (
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

export const XmppAccountsManagement = memo(XmppAccountsManagementInner);