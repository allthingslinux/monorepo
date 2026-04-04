"use client";

import { Ban, Shield, UserCheck, Users } from "lucide-react";

import { useAdminStats } from "@/features/admin/hooks/use-admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@atl/ui/components/card";

export function AdminStats() {
  const { data: stats, isError, error } = useAdminStats();

  if (isError) {
    return (
      <div className="text-destructive text-center">
        Failed to load statistics: {error.message}
      </div>
    );
  }

  // Data is prefetched on the server, so it should be available immediately
  // Display 0 or empty if data isn't available yet (shouldn't happen with SSR prefetch)
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.users.total ?? 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          <Shield className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.users.admins ?? 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          <UserCheck className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.sessions.active ?? 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
          <Ban className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.users.banned ?? 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}
