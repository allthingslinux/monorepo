"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@atl/ui/components/alert-dialog";
import { Badge } from "@atl/ui/components/badge";
import { Button } from "@atl/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@atl/ui/components/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@atl/ui/components/select";
import type { User } from "@portal/api/types";
import type { UseMutationResult } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Ban,
  MoreHorizontal,
  UserCircle,
} from "lucide-react";
import { useState } from "react";

function getSortIcon(sorted: false | "asc" | "desc") {
  if (sorted === "asc") {
    return <ArrowUp className="ml-2 h-4 w-4" />;
  }
  if (sorted === "desc") {
    return <ArrowDown className="ml-2 h-4 w-4" />;
  }
  return <ArrowUpDown className="ml-2 h-4 w-4" />;
}

interface UserMutations {
  banUser: UseMutationResult<unknown, Error, { userId: string }, unknown>;
  onViewDetails?: (userId: string) => void;
  setRole: UseMutationResult<
    unknown,
    Error,
    { userId: string; role: "user" | "staff" | "admin" },
    unknown
  >;
  unbanUser: UseMutationResult<unknown, Error, string, unknown>;
}

function UserActionsCell({
  user,
  mutations,
}: {
  user: User;
  mutations: UserMutations;
}) {
  const [pendingBanUser, setPendingBanUser] = useState<User | null>(null);
  const isBanUnbanPending =
    mutations.banUser.isPending || mutations.unbanUser.isPending;

  const handleBanConfirm = () => {
    if (pendingBanUser) {
      mutations.banUser.mutate({ userId: pendingBanUser.id });
      setPendingBanUser(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="User actions"
          disabled={isBanUnbanPending}
          render={<Button size="sm" variant="ghost" />}
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {mutations.onViewDetails && (
            <>
              <DropdownMenuItem
                onClick={() => mutations.onViewDetails?.(user.id)}
              >
                <UserCircle className="h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {user.banned ? (
            <DropdownMenuItem
              disabled={mutations.unbanUser.isPending}
              onClick={() => mutations.unbanUser.mutate(user.id)}
            >
              Unban user
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={mutations.banUser.isPending}
              onClick={() => setPendingBanUser(user)}
              variant="destructive"
            >
              <Ban className="h-4 w-4" />
              Ban user
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        onOpenChange={(open) => !open && setPendingBanUser(null)}
        open={!!pendingBanUser}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="gap-3">
            <AlertDialogTitle>Ban user?</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] leading-relaxed">
              {pendingBanUser && (
                <span className="block">
                  This will ban{" "}
                  <span className="font-medium">
                    {pendingBanUser.name || pendingBanUser.email}
                  </span>
                  .
                </span>
              )}
              {pendingBanUser && (
                <span className="mt-2 block">
                  They will not be able to sign in until unbanned.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleBanConfirm}
            >
              Ban user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function createUserColumns(mutations: UserMutations): ColumnDef<User>[] {
  const columnHelper = createColumnHelper<User>();

  return [
    columnHelper.accessor("email", {
      cell: ({ row, getValue }) => {
        const email = getValue();
        const user = row.original;
        return (
          <div>
            <div className="font-medium">{user.name || "N/A"}</div>
            <div className="text-muted-foreground text-sm">{email}</div>
          </div>
        );
      },
      header: ({ column }) => {
        const sorted = column.getIsSorted();
        return (
          <Button onClick={column.getToggleSortingHandler()} variant="ghost">
            Email
            {getSortIcon(sorted)}
          </Button>
        );
      },
      minSize: 200,
      size: 250,
    }),
    columnHelper.accessor("role", {
      cell: ({ row, getValue }) => {
        const role = getValue() || "user";
        const user = row.original;

        return (
          <Select
            disabled={mutations.setRole.isPending}
            onValueChange={(newRole) =>
              mutations.setRole.mutate({
                userId: user.id,
                role: newRole as "user" | "staff" | "admin",
              })
            }
            value={role}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        );
      },
      header: ({ column }) => {
        const sorted = column.getIsSorted();
        return (
          <Button onClick={column.getToggleSortingHandler()} variant="ghost">
            Role
            {getSortIcon(sorted)}
          </Button>
        );
      },
      minSize: 120,
      size: 150,
    }),
    columnHelper.accessor("banned", {
      cell: ({ getValue }) => {
        const banned = getValue();
        return banned === true ? (
          <Badge variant="destructive">Banned</Badge>
        ) : (
          <Badge variant="secondary">Active</Badge>
        );
      },
      header: "Status",
      minSize: 100,
      size: 120,
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
    columnHelper.display({
      cell: ({ row }) => (
        <UserActionsCell mutations={mutations} user={row.original} />
      ),
      header: "Actions",
      id: "actions",
      meta: {
        align: "right",
      },
      minSize: 120,
      size: 150,
    }),
  ] as unknown as ColumnDef<User>[];
}