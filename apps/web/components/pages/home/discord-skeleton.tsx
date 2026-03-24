import { memo } from "react";
import { ChevronRight, Hash, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Channel list component
const ChannelList = memo(() => {
  const channels = [
    "announcements",
    "suggestions",
    "general",
    "forum",
    "support",
    "random",
    "programming",
    "projects",
  ];

  return (
    <div className="hidden w-56 bg-card p-4 sm:block">
      <div>
        <div className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
          Text Channels
        </div>
        <div className="space-y-1">
          {channels.map((channel) => (
            <ChannelItem key={channel} name={channel} />
          ))}
          <div className="mt-3 flex cursor-pointer items-center text-muted-foreground hover:text-foreground">
            <ChevronRight className="mr-1 h-4 w-4" />
            <span className="text-sm">plus many more!</span>
          </div>
        </div>
      </div>
    </div>
  );
});

// Individual channel item
const ChannelItem = memo(({ name }: { name: string }) => (
  <div className="flex items-center py-1 text-muted-foreground hover:text-foreground">
    <Hash className="mr-2 h-4 w-4 opacity-70" />
    <span className="text-sm">{name}</span>
  </div>
));

// Message skeleton component
const MessageSkeleton = memo(
  ({
    avatarSize = 10,
    contentConfig,
  }: {
    avatarSize?: number;
    contentConfig: Array<{ height: number; width: string }>;
  }) => (
    <div className="flex items-start space-x-4">
      <Skeleton
        className={`w-${avatarSize} h-${avatarSize} rounded-full bg-muted`}
      />
      <div className="flex-1 space-y-2">
        {contentConfig.map((config, index) => (
          <Skeleton
            className={`h-${config.height} ${config.width} bg-muted`}
            key={index}
          />
        ))}
      </div>
    </div>
  )
);

// Background messages component
const BackgroundMessages = memo(() => (
  <div className="absolute inset-0 space-y-4">
    {/* Section 1 - Short messages */}
    <div className="space-y-4">
      <MessageSkeleton
        contentConfig={[
          { height: 4, width: "w-[120px]" },
          { height: 4, width: "w-[180px]" },
        ]}
      />
      <MessageSkeleton
        contentConfig={[
          { height: 4, width: "w-[140px]" },
          { height: 4, width: "w-[160px]" },
        ]}
      />
    </div>

    {/* Section 2 - Code block-like message */}
    <div className="space-y-4">
      <MessageSkeleton
        contentConfig={[
          { height: 4, width: "w-[160px]" },
          { height: 24, width: "w-full" },
        ]}
      />
    </div>

    {/* Section 3 - Long message */}
    <div className="space-y-4">
      <MessageSkeleton
        contentConfig={[
          { height: 4, width: "w-[180px]" },
          { height: 4, width: "w-[320px]" },
          { height: 4, width: "w-[280px]" },
        ]}
      />
    </div>

    {/* Section 4 - Short message */}
    <div className="space-y-4">
      <MessageSkeleton
        contentConfig={[
          { height: 4, width: "w-[140px]" },
          { height: 4, width: "w-[200px]" },
        ]}
      />
    </div>

    {/* Section 5 - Image-like message */}
    <div className="space-y-4">
      <MessageSkeleton
        contentConfig={[
          { height: 4, width: "w-[160px]" },
          { height: 32, width: "w-48" },
        ]}
      />
    </div>
  </div>
));

// Server info component
const ServerInfo = memo(() => (
  <div className="mb-8 flex flex-col items-center space-y-4">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
      <Image
        alt="Tux the penguin"
        className="h-10 w-10"
        height={40}
        priority
        src="/images/tux.webp"
        width={40}
      />
    </div>

    <div>
      <h2 className="pb-4 font-bold text-2xl text-foreground">
        All Things Linux
      </h2>
      <p className="text-foreground">discord.gg/linux</p>
    </div>
  </div>
));

// Online status component
const OnlineStatus = memo(() => (
  <div className="mb-6 flex items-center justify-center space-x-2 text-foreground">
    <Users className="h-6 w-6 text-foreground" />
    <Badge
      className="rounded-full border-0 bg-[#43b581]/60 px-4 py-1.5 font-semibold text-foreground text-xs"
      variant="outline"
    >
      1337+ online
    </Badge>
  </div>
));

// Join button component
const JoinButton = memo(() => (
  <Link href="https://discord.gg/linux" passHref>
    <Button className="mt-3 w-full rounded-2xl bg-[#5865F2] py-5 font-bold text-white transition-all hover:scale-105 hover:bg-[#EB459E]">
      Join Server
    </Button>
  </Link>
));

// Main content component
const MainContent = memo(() => (
  <CardContent className="relative z-10 mx-auto w-full max-w-xs text-center">
    <ServerInfo />
    <OnlineStatus />
    <JoinButton />
  </CardContent>
));

// Central content area component
const CentralContent = memo(() => (
  <div className="grow p-4">
    <div className="relative">
      <BackgroundMessages />
      <MainContent />
    </div>
  </div>
));

// Description component
const Description = memo(() => (
  <p className="mx-auto max-w-3xl text-balance py-4 text-center text-lg text-muted-foreground sm:py-8 sm:text-xl">
    Make new friends, share your knowledge and learn from the biggest Linux
    community on Discord.
  </p>
));

// Main Discord skeleton component
const DiscordSkeleton = memo(() => {
  return (
    <>
      <Card className="mx-auto w-full max-w-3xl overflow-hidden bg-card text-foreground shadow-lg">
        <div className="relative z-10 flex">
          <ChannelList />
          <CentralContent />
        </div>
      </Card>
      <Description />
    </>
  );
});

// Add display names for all components
ChannelList.displayName = "ChannelList";
ChannelItem.displayName = "ChannelItem";
MessageSkeleton.displayName = "MessageSkeleton";
BackgroundMessages.displayName = "BackgroundMessages";
ServerInfo.displayName = "ServerInfo";
OnlineStatus.displayName = "OnlineStatus";
JoinButton.displayName = "JoinButton";
MainContent.displayName = "MainContent";
CentralContent.displayName = "CentralContent";
Description.displayName = "Description";
DiscordSkeleton.displayName = "DiscordSkeleton";

export default DiscordSkeleton;
