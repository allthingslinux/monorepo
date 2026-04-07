import { Users } from "lucide-react";
import { Suspense } from "react";

import { env } from "@/env";
import { discord } from "@/features/integrations/lib/discord/client";
import { toSnowflake } from "@atl/discord";
import { Skeleton } from "@atl/ui/components/skeleton";

async function DiscordMemberStatContent() {
  if (!discord || !env.NEXT_PUBLIC_DISCORD_GUILD_ID) {
    return (
      <div className="border-border/60 bg-card/50 dark:border-border/40 dark:bg-card/30 rounded-xl border p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Users className="text-primary size-4" />
          </div>
          <span className="text-muted-foreground text-sm font-medium">
            Discord Members
          </span>
        </div>
        <div className="mt-3">
          <div className="text-foreground text-2xl font-bold tabular-nums">
            —
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">Not configured</p>
        </div>
      </div>
    );
  }

  const result = await discord.getGuild(
    toSnowflake(env.NEXT_PUBLIC_DISCORD_GUILD_ID),
    true
  );

  if (!result.ok) {
    return (
      <div className="border-border/60 bg-card/50 dark:border-border/40 dark:bg-card/30 rounded-xl border p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Users className="text-primary size-4" />
          </div>
          <span className="text-muted-foreground text-sm font-medium">
            Discord Members
          </span>
        </div>
        <div className="mt-3">
          <div className="text-foreground text-2xl font-bold tabular-nums">
            —
          </div>
          <p className="text-destructive mt-0.5 text-xs">Failed to load</p>
        </div>
      </div>
    );
  }

  const guild = result.value;
  const total = guild.approximate_member_count ?? 0;
  const online = guild.approximate_presence_count ?? 0;

  return (
    <div className="border-border/60 bg-card/50 dark:border-border/40 dark:bg-card/30 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Users className="text-primary size-4" />
        </div>
        <span className="text-muted-foreground text-sm font-medium">
          Discord Members
        </span>
      </div>
      <div className="mt-3">
        <div className="text-foreground text-2xl font-bold tabular-nums">
          {total.toLocaleString()}
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {online.toLocaleString()} online
        </p>
      </div>
    </div>
  );
}

export function DiscordMemberStat() {
  return (
    <Suspense
      fallback={
        <div className="border-border/60 bg-card/50 dark:border-border/40 dark:bg-card/30 rounded-xl border p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      }
    >
      <DiscordMemberStatContent />
    </Suspense>
  );
}
