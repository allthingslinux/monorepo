"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useRef } from "react";

import { Section } from "@/components/shell";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@atl/ui/components/carousel";

const STATS = [
  { value: "20K+", label: "Members" },
  { value: "10M+", label: "Messages" },
  { value: "70K+", label: "Voice hours" },
  { value: "2K+", label: "Issues solved" },
  { value: "10+", label: "Initiatives" },
  { value: "40+", label: "Volunteers" },
] as const;

const SUPPORTERS = [
  { logo: "/images/supporters/canva.webp", name: "Canva" },
  { logo: "/images/supporters/cloudflare.webp", name: "Cloudflare" },
  { logo: "/images/supporters/techsoup.webp", name: "TechSoup" },
  { logo: "/images/supporters/fibery.webp", name: "Fibery" },
  { logo: "/images/supporters/monday.webp", name: "Monday" },
  { logo: "/images/supporters/okta.webp", name: "Okta" },
  { logo: "/images/supporters/github.webp", name: "GitHub" },
  { logo: "/images/supporters/mintlify.svg", name: "Mintlify" },
  { logo: "/images/supporters/sentry.webp", name: "Sentry" },
] as const;

const SUPPORTERS_LANES = (["a", "b", "c"] as const).flatMap((lane) =>
  SUPPORTERS.map((s) => ({ ...s, lane }))
);

function logoStyle(_name: string): CSSProperties {
  return {};
}

function logoClass(name: string): string {
  const base =
    "object-contain transition-all duration-300 opacity-70 hover:opacity-100";
  const themeFilter =
    name === "TechSoup" || name === "Monday" || name === "Mintlify"
      ? "grayscale-100 hover:grayscale-0"
      : "brightness-0 saturate-100 dark:invert";
  if (name === "Monday" || name === "GitHub" || name === "Mintlify") {
    return `h-8 w-auto max-w-[140px] ${themeFilter} ${base}`;
  }
  if (name === "TechSoup") {
    return `h-9 w-auto max-w-[160px] ${themeFilter} ${base}`;
  }
  return `h-7 w-auto ${themeFilter} ${base}`;
}

export function StatsSection() {
  const plugin = useRef(
    AutoScroll({ speed: 1.15, startDelay: 500, stopOnMouseEnter: true })
  );

  return (
    <Section bleed size="default" variant="default">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="border-secondary/15 bg-secondary/5 relative rounded-3xl border">
          {/* Gradient sweep */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_top_left,oklch(0.35_0.14_250)_0%,transparent_50%),radial-gradient(ellipse_at_bottom_right,oklch(0.30_0.12_280)_0%,transparent_50%)] opacity-40"
          />

          <div className="relative p-10 sm:p-14 lg:p-16">
            <p className="text-primary mb-2 text-xs font-medium tracking-[0.2em] uppercase">
              By the numbers
            </p>
            <h2 className="font-display mb-10 max-w-lg text-2xl font-bold tracking-tight sm:text-3xl">
              What we&apos;ve accomplished so far
            </h2>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs tracking-wider uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Supporters strip */}
          <div className="border-border relative overflow-hidden rounded-b-3xl border-t py-6">
            <p className="text-muted-foreground/60 mb-4 text-center text-[10px] font-medium tracking-widest uppercase">
              A special thanks to those who support us
            </p>
            <div className="mask-[linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
              <Carousel
                opts={{ loop: true }}
                onMouseEnter={() => plugin.current.stop()}
                onMouseLeave={() => plugin.current.play()}
                plugins={[plugin.current]}
              >
                <CarouselContent className="-ml-4">
                  {SUPPORTERS_LANES.map((s) => (
                    <CarouselItem
                      className="basis-auto py-1 pl-4"
                      key={`${s.lane}-${s.name}`}
                    >
                      <div className="flex items-center justify-center px-5 py-2 md:px-8">
                        <Image
                          alt={`${s.name} logo`}
                          className={logoClass(s.name)}
                          height={48}
                          src={s.logo}
                          style={logoStyle(s.name)}
                          width={140}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
