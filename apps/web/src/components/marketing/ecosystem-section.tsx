import { Badge } from "@atl/ui/components/badge";
import { Card } from "@atl/ui/components/card";
import Link from "next/link";
import type { ReactNode } from "react";
import { PiLinuxLogoBold, PiNetworkBold } from "react-icons/pi";
import {
  TbBrandDiscord,
  TbCode,
  TbFiles,
  TbMessage2,
  TbStack2,
  TbUserCircle,
  TbWritingSign,
} from "react-icons/tb";

import { Section, SectionHeader } from "@/components/shell";
import { cn } from "@/lib/utils";

type Item = {
  description: string;
  href: string;
  icon: ReactNode;
  status: string | null;
  title: string;
};

const ITEMS: Item[] = [
  {
    description:
      "Guides and references for Linux and the wider FOSS ecosystem.",
    href: "https://atl.wiki",
    icon: <TbWritingSign className="size-5" />,
    status: "v1.1",
    title: "atl.wiki",
  },
  {
    description: "Our Discord — the hub of the community.",
    href: "https://discord.gg/linux",
    icon: <TbBrandDiscord className="size-5" />,
    status: "active",
    title: ".gg/linux",
  },
  {
    description: "Self-hosted apps, mail, and more — free to use.",
    href: "https://atl.tools",
    icon: <TbStack2 className="size-5" />,
    status: "beta",
    title: "atl.tools",
  },
  {
    description: "Bridged IRC and XMPP chat with the community.",
    href: "https://github.com/allthingslinux/atl.chat",
    icon: <TbMessage2 className="size-5" />,
    status: "soon",
    title: "atl.chat",
  },
  {
    description: "The open-source Discord bot that powers our server.",
    href: "https://github.com/allthingslinux/tux",
    icon: <PiLinuxLogoBold className="size-5" />,
    status: "v0.1",
    title: "tux",
  },
  {
    description: "Pubnix / tilde space for experimentation and learning.",
    href: "#",
    icon: <PiNetworkBold className="size-5" />,
    status: "dev",
    title: "atl.sh",
  },
  {
    description: "Identity and access for ATL services.",
    href: "https://portal.allthingslinux.org/auth/sign-up",
    icon: <TbUserCircle className="size-5" />,
    status: "beta",
    title: "portal",
  },
  {
    description: "Hosting and tooling for developers and FOSS projects.",
    href: "#",
    icon: <TbCode className="size-5" />,
    status: "dev",
    title: "atl.dev",
  },
  {
    description: "Archiving ISOs and metadata for the long term.",
    href: "https://github.com/allthingslinux/iso.atl.dev",
    icon: <TbFiles className="size-5" />,
    status: "dev",
    title: "iso archive",
  },
];

function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return null;
  }
  const isVersion = /^v\d/i.test(status);
  if (isVersion) {
    return (
      <Badge
        className="shrink-0 border-border/80 bg-muted/80 px-2 py-0 font-mono text-[10px] text-muted-foreground"
        variant="outline"
      >
        {status}
      </Badge>
    );
  }
  const labels: Record<string, string> = {
    active: "Live",
    beta: "Beta",
    dev: "Dev",
    soon: "Soon",
  };
  const label = labels[status] ?? status;
  const tone =
    status === "active"
      ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : status === "beta"
        ? "border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-400"
        : "border-border/70 bg-muted/60 text-muted-foreground";

  return (
    <Badge
      className={cn("shrink-0 px-2 py-0 text-[10px] font-medium", tone)}
      variant="outline"
    >
      {label}
    </Badge>
  );
}

function EcosystemCard({ item }: { item: Item }) {
  const external = item.href.startsWith("http");
  const disabled = item.href === "#";

  const body = (
    <div className="flex gap-4">
      <div
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-primary ring-1 ring-border/50"
      >
        {item.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
          <h3 className="font-semibold text-[15px] text-foreground leading-snug tracking-tight">
            {item.title}
          </h3>
          <StatusBadge status={item.status} />
        </div>
        <p className="mt-2 text-pretty text-[13px] text-muted-foreground leading-relaxed sm:text-sm">
          {item.description}
        </p>
      </div>
    </div>
  );

  const cardClass = cn(
    "group relative h-full rounded-xl border p-4 transition-colors sm:p-5",
    disabled
      ? "cursor-not-allowed border-dashed border-border/50 bg-muted/20 opacity-70"
      : "border-border/60 bg-card/90 shadow-sm hover:border-primary/35 hover:bg-card hover:shadow-md"
  );

  if (disabled) {
    return <Card className={cardClass}>{body}</Card>;
  }

  return (
    <Link
      className={cn(
        "block h-full rounded-xl outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
      href={item.href}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      <Card className={cardClass}>{body}</Card>
    </Link>
  );
}

export function EcosystemSection({
  portalSignUpUrl,
}: {
  portalSignUpUrl: string;
}) {
  const items = ITEMS.map((item) =>
    item.title === "portal" ? { ...item, href: portalSignUpUrl } : item
  );

  return (
    <Section
      containerClassName="max-w-[1400px]"
      id="ecosystem"
      size="default"
      variant="default"
    >
      <SectionHeader
        description="Initiatives we run and ship with contributors — jump in anywhere."
        title="Projects & services"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {items.map((item) => (
          <EcosystemCard item={item} key={item.title} />
        ))}
      </div>
    </Section>
  );
}