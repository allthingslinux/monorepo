"use client";

import {
  ChevronLeft,
  ChevronRight,
  Copy,
  KeyRound,
  Plus,
  RotateCw,
  Share,
  Shield,
  Users,
} from "lucide-react";
import Image from "next/image";

import { Container, Section } from "@/components/shell";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@atl/ui/components/avatar";
import { Badge } from "@atl/ui/components/badge";

import { PortalActions } from "./portal-actions";

const HIGHLIGHTS = [
  { Icon: Shield, text: "Self-provision accounts and services" },
  { Icon: KeyRound, text: "Manage your community presence" },
  { Icon: Users, text: "Access unique resources and features" },
] as const;

const AVATARS = [
  { src: "/images/avatars/avatar-1.webp", fallback: "U1" },
  { src: "/images/avatars/avatar-2.webp", fallback: "U2" },
  { src: "/images/avatars/avatar-3.webp", fallback: "U3" },
] as const;

export function PortalSection({
  signInUrl,
  signUpUrl,
}: {
  signInUrl: string;
  signUpUrl: string;
}) {
  return (
    <Section
      size="spacious"
      variant="default"
      className="bg-card border-b-0 !pb-0"
    >
      <Container>
        <div className="flex flex-col items-center text-center" id="portal">
          <p className="text-primary mb-3 text-xs font-medium tracking-[0.2em] uppercase">
            Portal
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Your portal for all things, All Things Linux.
          </h1>
          <p className="text-muted-foreground mt-7 max-w-xl text-lg leading-relaxed text-pretty md:text-xl">
            One account to access every ATL service — from the wiki and tools to
            chat and our pubnix.
          </p>

          <Badge
            variant="outline"
            className="mt-10 flex h-auto cursor-default gap-3 p-1.5 pr-4 text-base font-normal"
          >
            <AvatarGroup>
              {AVATARS.map((a) => (
                <Avatar className="size-8 md:size-10" key={a.fallback}>
                  <AvatarImage src={a.src} alt="" />
                  <AvatarFallback>{a.fallback}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            <p className="tracking-tight capitalize md:text-lg">
              Trusted by <span className="text-foreground font-bold">20K+</span>{" "}
              members.
            </p>
          </Badge>

          <ul className="mt-10 flex flex-wrap justify-center gap-6">
            {HIGHLIGHTS.map(({ Icon, text }) => (
              <li className="flex items-center gap-2.5" key={text}>
                <div className="bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-lg">
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

          <div className="mt-10">
            <PortalActions signInUrl={signInUrl} signUpUrl={signUpUrl} />
          </div>

          <div className="relative mt-14 flex w-full flex-col items-center justify-center">
            <BrowserMockup url="portal.allthingslinux.org" />
            <div className="from-background absolute bottom-0 h-2/3 w-full bg-linear-to-t to-transparent" />
          </div>
        </div>
      </Container>
    </Section>
  );
}

function BrowserMockup({
  url = "portal.allthingslinux.org",
}: {
  url?: string;
}) {
  return (
    <div
      className={cn(
        "border-border/50 relative w-full overflow-hidden rounded-2xl border shadow-lg md:rounded-3xl"
      )}
    >
      {/* Title bar */}
      <div className="bg-muted/50 flex items-center justify-between gap-6 px-4 py-2 md:gap-16 md:px-6 md:py-2.5 lg:gap-24">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="size-2 rounded-full bg-red-500 md:size-2.5" />
          <div className="size-2 rounded-full bg-yellow-500 md:size-2.5" />
          <div className="size-2 rounded-full bg-green-500 md:size-2.5" />
          <div className="ml-2 hidden items-center gap-1 opacity-40 lg:ml-3 lg:flex lg:gap-1.5">
            <ChevronLeft className="size-3.5" />
            <ChevronRight className="size-3.5" />
          </div>
        </div>
        <div className="flex w-full items-center justify-center">
          <p className="bg-background/60 text-muted-foreground relative hidden w-full max-w-xs rounded-full px-3 py-0.5 text-center text-xs tracking-tight md:block md:text-sm">
            {url}
            <RotateCw className="absolute top-1/2 right-2.5 size-3 -translate-y-1/2 md:right-3 md:size-3.5" />
          </p>
        </div>
        <div className="flex items-center gap-2 opacity-40 md:gap-3">
          <Share className="size-3 md:size-3.5" />
          <Plus className="size-3 md:size-3.5" />
          <Copy className="size-3 md:size-3.5" />
        </div>
      </div>
      {/* Dashboard image */}
      <div className="relative w-full">
        <Image
          alt="Portal dashboard preview"
          className="hidden aspect-video h-full w-full object-cover object-top md:block"
          src="https://i.imgur.com/iEZMd8j.png"
          width={1200}
          height={800}
          unoptimized
        />
        <Image
          alt="Portal dashboard preview"
          className="block h-full w-full object-cover md:hidden"
          src="https://i.imgur.com/iEZMd8j.png"
          width={600}
          height={800}
          unoptimized
        />
      </div>
      {/* Mobile URL bar */}
      <div className="bg-muted absolute bottom-0 z-10 flex w-full items-center justify-center py-3 md:hidden">
        <p className="text-muted-foreground text-sm tracking-tight">{url}</p>
      </div>
    </div>
  );
}
