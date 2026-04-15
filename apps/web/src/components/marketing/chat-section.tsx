"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { RefObject } from "react";
import { useEffect, useId, useRef, useState } from "react";
import {
  TbArrowUpRight,
  TbBrandDiscord,
  TbHash,
  TbMessage2,
} from "react-icons/tb";

import { Section } from "@/components/shell";
import { Button } from "@atl/ui/components/button";

/* ─── Animated Beam ─────────────────────────────────────────────────────────── */

interface AnimatedBeamProps {
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  startYOffset?: number;
  endYOffset?: number;
  endXOffset?: number;
}

function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 4,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.15,
  gradientStartColor = "#7aa2f7",
  gradientStopColor = "#bb9af7",
  startYOffset = 0,
  endYOffset = 0,
  endXOffset = 0,
}: AnimatedBeamProps) {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  const gradientCoordinates = reverse
    ? {
        x1: ["90%", "-10%"],
        x2: ["100%", "0%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      }
    : {
        x1: ["10%", "110%"],
        x2: ["0%", "100%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      };

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();
        setSvgDimensions({
          width: containerRect.width,
          height: containerRect.height,
        });
        const startX = rectA.left - containerRect.left + rectA.width / 2;
        const startY =
          rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX =
          rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY =
          rectB.top - containerRect.top + rectB.height / 2 + endYOffset;
        const controlY = startY - curvature;
        setPathD(
          `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`
        );
      }
    };
    const observer = new ResizeObserver(() => updatePath());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    updatePath();
    return () => observer.disconnect();
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startYOffset,
    endYOffset,
    endXOffset,
  ]);

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      className="pointer-events-none absolute top-0 left-0 transform-gpu stroke-2"
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        strokeWidth={pathWidth}
        stroke={`url(#${id})`}
        strokeOpacity="1"
        strokeLinecap="round"
      />
      <defs>
        <motion.linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
          animate={gradientCoordinates}
          transition={{
            duration,
            ease: [0.16, 1, 0.3, 1],
            repeat: Infinity,
            repeatDelay: 0,
          }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Bridge Illustration ───────────────────────────────────────────────────── */

function BridgeIllustration() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ircRef = useRef<HTMLDivElement>(null);
  const xmppRef = useRef<HTMLDivElement>(null);
  const discordRef = useRef<HTMLDivElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative ml-20">
      {/* Decorative floating chat UI panels */}
      {/* Top-left: Server info pill */}
      <div
        aria-hidden
        className="border-border/25 bg-card pointer-events-none absolute -top-10 -left-4 z-20 flex items-center gap-2 rounded-lg border px-3 py-2 shadow-sm"
      >
        <div className="bg-primary/20 size-5 rounded-full" />
        <div className="space-y-0.5">
          <div className="bg-muted/40 h-1.5 w-16 rounded" />
          <div className="text-muted-foreground/50 text-[8px]">142 online</div>
        </div>
      </div>

      {/* Left: Channels sidebar */}
      <div
        aria-hidden
        className="border-border/25 bg-card pointer-events-none absolute top-4 bottom-4 -left-30 z-20 w-28 rounded-lg border p-3 shadow-sm"
      >
        <div className="text-muted-foreground/60 mb-3 text-[10px] font-medium">
          Channels
        </div>
        <div className="space-y-2">
          <div className="bg-muted/20 flex items-center gap-1.5 rounded-md px-1.5 py-1">
            <TbHash className="text-primary/60 size-2.5" />
            <div className="bg-muted/40 h-1.5 w-14 rounded" />
          </div>
          <div className="flex items-center gap-1.5 px-1.5">
            <TbHash className="text-muted-foreground/40 size-2.5" />
            <div className="bg-muted/25 h-1.5 w-20 rounded" />
          </div>
          <div className="flex items-center gap-1.5 px-1.5">
            <TbHash className="text-muted-foreground/40 size-2.5" />
            <div className="bg-muted/25 h-1.5 w-10 rounded" />
          </div>
          <div className="flex items-center gap-1.5 px-1.5">
            <TbHash className="text-muted-foreground/40 size-2.5" />
            <div className="bg-muted/25 h-1.5 w-16 rounded" />
          </div>
          <div className="text-muted-foreground/40 mt-3 mb-1 text-[9px] font-medium tracking-wider uppercase">
            Voice
          </div>
          <div className="flex items-center gap-1.5 px-1.5">
            <TbHash className="text-muted-foreground/40 size-2.5" />
            <div className="bg-muted/25 h-1.5 w-12 rounded" />
          </div>
          <div className="flex items-center gap-1.5 px-1.5">
            <TbHash className="text-muted-foreground/40 size-2.5" />
            <div className="bg-muted/25 h-1.5 w-18 rounded" />
          </div>
        </div>
      </div>

      {/* Top-right: Users */}
      <div
        aria-hidden
        className="border-border/25 bg-card pointer-events-none absolute -top-14 -right-8 z-20 w-36 rounded-lg border p-3 shadow-sm"
      >
        <div className="text-muted-foreground/60 mb-2 text-[10px] font-medium">
          Users
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-green-500/40" />
            <div className="bg-muted/30 h-1.5 w-16 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-green-500/40" />
            <div className="bg-muted/30 h-1.5 w-12 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-yellow-500/40" />
            <div className="bg-muted/30 h-1.5 w-20 rounded" />
          </div>
        </div>
      </div>

      {/* Bottom-left: #support */}
      <div
        aria-hidden
        className="border-border/25 bg-card pointer-events-none absolute -bottom-18 left-[5%] z-20 w-52 rounded-lg border p-3 shadow-sm"
      >
        <div className="mb-2 flex items-center gap-2">
          <TbMessage2 className="text-muted-foreground/60 size-3" />
          <span className="text-muted-foreground/70 text-[10px] font-medium">
            #support
          </span>
        </div>
        <div className="flex items-start gap-1.5">
          <div className="bg-primary/20 mt-0.5 size-4 shrink-0 rounded-full" />
          <div className="bg-muted/20 rounded-md px-2 py-1">
            <div className="bg-muted/30 h-1 w-32 rounded" />
            <div className="bg-muted/20 mt-0.5 h-1 w-20 rounded" />
          </div>
        </div>
      </div>

      {/* Bottom-right: #general */}
      <div
        aria-hidden
        className="border-border/25 bg-card pointer-events-none absolute right-[5%] -bottom-12 z-20 w-48 rounded-lg border p-3 shadow-sm"
      >
        <div className="mb-2 flex items-center gap-2">
          <TbHash className="text-muted-foreground/60 size-3" />
          <span className="text-muted-foreground/70 text-[10px] font-medium">
            #general
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-1.5">
            <div className="bg-muted/40 mt-0.5 size-4 shrink-0 rounded-full" />
            <div className="space-y-0.5">
              <div className="bg-muted/30 h-1.5 w-12 rounded" />
              <div className="bg-muted/20 h-1 w-28 rounded" />
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <div className="bg-muted/40 mt-0.5 size-4 shrink-0 rounded-full" />
            <div className="space-y-0.5">
              <div className="bg-muted/30 h-1.5 w-16 rounded" />
              <div className="bg-muted/20 h-1 w-20 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="border-border/30 bg-card/50 relative overflow-hidden rounded-2xl border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-size-[24px_24px] opacity-15"
        />
        <div ref={containerRef} className="relative h-[280px] w-full p-6">
          {/* Protocol nodes on the left — same X, spread vertically */}
          <div
            ref={ircRef}
            className="absolute top-[8%] left-[8%] z-10 flex flex-col items-center gap-1.5"
          >
            <div className="border-border bg-card flex size-12 items-center justify-center rounded-xl border shadow-sm">
              <TbHash className="size-5" />
            </div>
            <span className="text-muted-foreground text-[10px] font-medium">
              IRC
            </span>
          </div>

          <div
            ref={discordRef}
            className="absolute top-1/2 left-[8%] z-10 flex -translate-y-1/2 flex-col items-center gap-1.5"
          >
            <div className="border-border bg-card flex size-12 items-center justify-center rounded-xl border shadow-sm">
              <TbBrandDiscord className="size-5" />
            </div>
            <span className="text-muted-foreground text-[10px] font-medium">
              Discord
            </span>
          </div>

          <div
            ref={xmppRef}
            className="absolute bottom-[8%] left-[8%] z-10 flex flex-col items-center gap-1.5"
          >
            <div className="border-border bg-card flex size-12 items-center justify-center rounded-xl border shadow-sm">
              <TbMessage2 className="size-5" />
            </div>
            <span className="text-muted-foreground text-[10px] font-medium">
              XMPP
            </span>
          </div>

          {/* Center — bridge */}
          <div
            ref={bridgeRef}
            className="border-border bg-card absolute top-1/2 left-1/2 z-10 flex h-14 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border shadow-sm"
          >
            <span className="text-muted-foreground font-mono text-[10px]">
              bridge
            </span>
          </div>

          {/* Right — atl hub */}
          <div
            ref={hubRef}
            className="border-border bg-card absolute top-1/2 right-[5%] z-10 flex size-20 -translate-y-1/2 items-center justify-center rounded-2xl border shadow-lg"
          >
            <span className="font-display text-secondary text-lg font-bold">
              atl
            </span>
          </div>

          {/* Beams: protocols → bridge */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={ircRef}
            toRef={bridgeRef}
            endXOffset={-28}
            endYOffset={-10}
            curvature={-15}
            duration={3.5}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={discordRef}
            toRef={bridgeRef}
            endXOffset={-28}
            endYOffset={0}
            curvature={0}
            duration={4}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={xmppRef}
            toRef={bridgeRef}
            endXOffset={-28}
            endYOffset={10}
            curvature={15}
            duration={3}
          />

          {/* Beam: bridge → atl */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={bridgeRef}
            toRef={hubRef}
            endXOffset={-40}
            curvature={0}
            duration={3}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Chat Section ──────────────────────────────────────────────────────────── */

export function ChatSection() {
  return (
    <Section
      size="spacious"
      variant="default"
      containerClassName="max-w-7xl"
      id="atl-chat"
      className="py-28 md:py-36 lg:py-44"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-x-24 lg:gap-y-12 xl:gap-x-32">
        {/* Left — illustration */}
        <BridgeIllustration />

        {/* Right — text */}
        <div className="flex flex-col items-start">
          <p className="text-primary mb-3 text-xs font-medium tracking-[0.2em] uppercase">
            atl.chat
          </p>
          <h2 className="font-display mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Use the messaging apps you already prefer
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md leading-relaxed text-pretty">
            Chat via our Discord, IRC, and XMPP bridge. Same conversations, same
            channels — your choice of client. Fully IRCv3/XMPP compliant.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              render={
                <Link
                  href="https://atl.chat"
                  rel="noopener noreferrer"
                  target="_blank"
                />
              }
              size="lg"
            >
              Connect
              <TbArrowUpRight className="ml-1.5 size-4" />
            </Button>
            <Button
              render={
                <Link
                  href="https://github.com/allthingslinux/monorepo"
                  rel="noopener noreferrer"
                  target="_blank"
                />
              }
              size="lg"
              variant="outline"
            >
              View on GitHub
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
