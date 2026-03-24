"use client";

import { Button } from "@atl/ui/components/button";
import type { Session } from "@portal/api/types";
import type { UseMutationResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Trash2 } from "lucide-react";
import { toast } from "sonner";

function getSortIcon(sorted: false | "asc" | "desc") {
  if (sorted === "asc") {
    return <ArrowUp className="ml-2 h-4 w-4" />;
  }
  if (sorted === "desc") {
    return <ArrowDown className="ml-2 h-4 w-4" />;
  }
  return <ArrowUpDown className="ml-2 h-4 w-4" />;
}

interface SessionMutations {
  deleteSession: UseMutationResult<unknown, Error, string, unknown>;
}

export function createSessionColumns(
  mutations: SessionMutations
): ColumnDef<Session>[] {
  const columnHelper = createColumnHelper<Session>();

  return [
    columnHelper.accessor("userId", {
      cell: ({ row, getValue }) => {
        const userId = getValue();
        const session = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-mono text-sm">{userId.slice(0, 8)}...</span>
            <span className="text-muted-foreground text-xs">
              {session.user?.email || session.user?.name || "Unknown"}
            </span>
          </div>
        );
      },
      header: ({ column }) => {
        const sorted = column.getIsSorted();
        return (
          <Button onClick={column.getToggleSortingHandler()} variant="ghost">
            User
            {getSortIcon(sorted)}
          </Button>
        );
      },
      minSize: 220,
      size: 280,
    }),
    columnHelper.accessor("ipAddress", {
      cell: ({ getValue }) => {
        const ipAddress = getValue();
        return ipAddress || "Unknown";
      },
      header: "IP Address",
      minSize: 120,
      size: 150,
    }),
    columnHelper.accessor("userAgent", {
      cell: ({ getValue }) => {
        const userAgent = getValue();
        return (
          <div className="wrap-break-word min-w-0">
            {userAgent || "Unknown"}
          </div>
        );
      },
      header: "User Agent",
      maxSize: 600,
      meta: {
        align: "left",
        wrap: true,
      },
      minSize: 200,
      size: 400,
    }),
    columnHelper.accessor("createdAt", {
      cell: ({ getValue }) => {
        const date = getValue();
        return new Date(date).toLocaleDateString();
      },
      header: ({ column }) => {
        const sorted = column.getIsSorted();
        return (
          <Button
            className="ml-auto"
            onClick={column.getToggleSortingHandler()}
            variant="ghost"
          >
            Created
            {getSortIcon(sorted)}
          </Button>
        );
      },
      meta: {
        align: "right",
      },
      minSize: 100,
      size: 120,
      sortingFn: "datetime",
    }),
    columnHelper.accessor("expiresAt", {
      cell: ({ getValue }) => {
        const date = getValue();
        return new Date(date).toLocaleDateString();
      },
      header: ({ column }) => {
        const sorted = column.getIsSorted();
        return (
          <Button
            className="ml-auto"
            onClick={column.getToggleSortingHandler()}
            variant="ghost"
          >
            Expires
            {getSortIcon(sorted)}
          </Button>
        );
      },
      meta: {
        align: "right",
      },
      minSize: 100,
      size: 120,
      sortingFn: "datetime",
    }),
    columnHelper.display({
      cell: ({ row }) => {
        const session = row.original;

        const handleRevokeSession = async () => {
          try {
            await mutations.deleteSession.mutateAsync(session.id);
            toast.success("Session revoked");
          } catch {
            toast.error("Failed to revoke session");
          }
        };

        return (
          <Button
            disabled={mutations.deleteSession.isPending}
            onClick={handleRevokeSession}
            size="sm"
            variant="outline"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      },
      header: "Actions",
      id: "actions",
      meta: {
        align: "right",
      },
      minSize: 80,
      size: 100,
    }),
  ] as ColumnDef<Session>[];
}