import Image from "next/image";
import { Suspense } from "react";

import { env } from "@/env";
import { discord } from "@/features/integrations/lib/discord/client";
import { toSnowflake } from "@atl/discord";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@atl/ui/components/card";
import { Skeleton } from "@atl/ui/components/skeleton";

async function DiscordStatsCardContent() {
  if (!discord || !env.NEXT_PUBLIC_DISCORD_GUILD_ID) {
    return (
      <CardContent>
        <div className="text-muted-foreground text-sm">
          Discord Guild ID not configured.
        </div>
      </CardContent>
    );
  }

  const result = await discord.getGuild(
    toSnowflake(env.NEXT_PUBLIC_DISCORD_GUILD_ID),
    true
  );

  if (!result.ok) {
    return (
      <CardContent>
        <div className="text-destructive text-sm">
          Failed to load Discord stats.
        </div>
      </CardContent>
    );
  }

  const guild = result.value;

  return (
    <CardContent>
      <div className="flex items-center gap-4">
        {guild.icon && (
          <Image
            alt={`${guild.name} icon`}
            className="h-12 w-12 rounded-full"
            height={48}
            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
            width={48}
          />
        )}
        <div>
          <div className="text-2xl font-bold">
            {guild.approximate_presence_count ?? 0}
          </div>
          <p className="text-muted-foreground text-xs">Members Online</p>
        </div>
        <div className="ml-auto">
          <div className="text-muted-foreground/50 text-2xl font-bold">
            {guild.approximate_member_count ?? 0}
          </div>
          <p className="text-muted-foreground text-right text-xs">Total</p>
        </div>
      </div>
    </CardContent>
  );
}

export function DiscordStatsCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Discord Server</CardTitle>
      </CardHeader>
      <Suspense
        fallback={
          <CardContent>
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardContent>
        }
      >
        <DiscordStatsCardContent />
      </Suspense>
    </Card>
  );
}
