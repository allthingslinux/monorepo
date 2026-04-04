"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useRef } from "react";

import { Container } from "@/components/shell";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@atl/ui/components/carousel";

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

function logoStyle(_name: string): CSSProperties {
  // Filter is handled via className for theme-awareness
  return {};
}

function logoClass(name: string): string {
  const base =
    "object-contain transition-all duration-300 opacity-70 hover:opacity-100 hover:!filter-none";
  const themeFilter =
    name === "TechSoup" || name === "Monday" || name === "Mintlify"
      ? "grayscale-100"
      : "brightness-0 saturate-100 dark:invert";
  if (name === "Monday" || name === "GitHub" || name === "Mintlify") {
    return `h-10 w-auto max-w-[180px] ${themeFilter} ${base}`;
  }
  if (name === "TechSoup") {
    return `h-11 w-auto max-w-[200px] ${themeFilter} ${base}`;
  }
  return `h-9 w-auto ${themeFilter} ${base}`;
}

const SUPPORTERS_LANES = (["a", "b", "c"] as const).flatMap((lane) =>
  SUPPORTERS.map((s) => ({ ...s, lane }))
);

export function SupportersStrip() {
  const plugin = useRef(
    AutoScroll({
      speed: 1.15,
      startDelay: 500,
      stopOnMouseEnter: true,
    })
  );

  return (
    <Container className="max-w-screen-2xl">
      <div className="mask-[linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] py-2">
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
                <div className="flex items-center justify-center px-6 py-4 md:px-10">
                  <Image
                    alt={`${s.name} logo`}
                    className={logoClass(s.name)}
                    height={56}
                    src={s.logo}
                    style={logoStyle(s.name)}
                    width={180}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </Container>
  );
}
