"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@atl/ui/components/carousel";
import AutoScroll from "embla-carousel-auto-scroll";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useRef } from "react";

import { Container } from "@/components/shell";

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

function logoStyle(name: string): CSSProperties {
  if (name === "TechSoup" || name === "Monday" || name === "Mintlify") {
    return {};
  }
  return { filter: "brightness(0) saturate(100%) invert(1)" };
}

function logoClass(name: string): string {
  const base = "object-contain opacity-90 transition-opacity hover:opacity-100";
  if (name === "Monday" || name === "GitHub" || name === "Mintlify") {
    return `h-12 w-auto max-w-[200px] ${base}`;
  }
  if (name === "TechSoup") {
    return `h-[52px] w-auto max-w-[220px] ${base}`;
  }
  return `h-11 w-auto ${base}`;
}

/** Repeated sets so the loop + auto-scroll has enough width (same idea as the old triple strip). */
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
                className="basis-auto py-1.5 pl-4"
                key={`${s.lane}-${s.name}`}
              >
                <div className="flex items-center justify-center px-4 py-4 md:px-8">
                  <Image
                    alt={`${s.name} logo`}
                    className={logoClass(s.name)}
                    height={72}
                    src={s.logo}
                    style={logoStyle(s.name)}
                    width={220}
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