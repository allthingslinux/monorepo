import { Globe, KeyRound, Shield, Users } from "lucide-react";
import Image from "next/image";

import { Section } from "@/components/shell";

import { PortalActions } from "./portal-actions";

const HIGHLIGHTS = [
  {
    Icon: Shield,
    text: "Self-provision accounts and services",
  },
  {
    Icon: KeyRound,
    text: "Manage your community presence",
  },
  {
    Icon: Users,
    text: "Access unique resources and features",
  },
] as const;

function BrowserShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border/50 bg-card overflow-hidden rounded-xl border shadow-lg">
      {/* Title bar */}
      <div className="border-border/30 bg-muted/50 flex items-center gap-2 border-b px-3 py-2">
        <Globe className="text-muted-foreground/50 size-3.5 shrink-0" />
        <div className="flex-1">
          <div className="bg-background/60 text-muted-foreground mx-auto max-w-xs rounded-md px-3 py-0.5 text-center text-[10px]">
            portal.allthingslinux.org
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-red-400/80" />
          <div className="size-2 rounded-full bg-yellow-400/80" />
          <div className="size-2 rounded-full bg-green-400/80" />
        </div>
      </div>
      {/* Content */}
      {children}
    </div>
  );
}

export function PortalSection({
  signInUrl,
  signUpUrl,
}: {
  signInUrl: string;
  signUpUrl: string;
}) {
  return (
    <Section
      className="bg-card overflow-hidden pb-0!"
      containerClassName="max-w-7xl"
      size="spacious"
      variant="default"
    >
      <div id="portal">
        {/* Header */}
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-14">
          {/* Left — description + highlights + CTA */}
          <div className="flex flex-col justify-end">
            <p className="text-primary mb-3 text-xs font-medium tracking-[0.2em] uppercase">
              Portal
            </p>
            <h2 className="font-display mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Your portal for all things, All Things Linux.
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md leading-relaxed text-pretty">
              One account to access every ATL service — from the wiki and tools
              to chat and our pubnix.
            </p>

            <ul className="space-y-4">
              {HIGHLIGHTS.map(({ Icon, text }) => (
                <li className="flex items-center gap-3" key={text}>
                  <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <Icon
                      aria-hidden
                      className="text-primary size-4"
                      strokeWidth={2}
                    />
                  </div>
                  <p className="text-foreground text-sm font-medium">{text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 mb-12">
              <PortalActions signInUrl={signInUrl} signUpUrl={signUpUrl} />
            </div>
          </div>

          {/* Right — browser mockup */}
          <div className="-mb-12">
            <BrowserShell>
              <div className="bg-muted/30">
                <Image
                  alt="Portal dashboard preview"
                  className="w-full"
                  src="https://i.imgur.com/iEZMd8j.png"
                  width={1200}
                  height={800}
                  unoptimized
                />
              </div>
            </BrowserShell>
          </div>
        </div>
      </div>
    </Section>
  );
}
