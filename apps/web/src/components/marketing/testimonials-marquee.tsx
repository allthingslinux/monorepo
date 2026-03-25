"use client";

import { Avatar, AvatarImage } from "@atl/ui/components/avatar";
import { Badge } from "@atl/ui/components/badge";
import { buttonVariants } from "@atl/ui/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@atl/ui/components/carousel";
import AutoScroll from "embla-carousel-auto-scroll";
import Link from "next/link";
import { useRef } from "react";
import { TbBrandDiscord } from "react-icons/tb";

import { Container } from "@/components/shell";
import testimonalsData from "@/data/testimonials.json";
import { cn } from "@/lib/utils";

const PENGUIN_COUNT = 15;

function displayName(name: string): string {
  return name === "Unused" ? "Community member" : name;
}

function penguinSrc(index: number): string {
  return `/images/penguins/${(index % PENGUIN_COUNT) + 1}.webp`;
}

type Review = (typeof testimonalsData.testimonials)[number];

const allReviews: (Review & { avatarIndex: number })[] =
  testimonalsData.testimonials.map((t, i) => ({
    ...t,
    avatarIndex: i,
  }));

const testimonialsRow1 = allReviews.filter((_, i) => i % 2 === 0);
const testimonialsRow2 = allReviews.filter((_, i) => i % 2 === 1);

/** Subtle chat-bubble style tilt — not every card, so it stays readable. */
function bubbleTiltClass(avatarIndex: number): string {
  const m = avatarIndex % 6;
  if (m === 0 || m === 1) {
    return "-rotate-[1.1deg]";
  }
  if (m === 2 || m === 3) {
    return "rotate-[1.1deg]";
  }
  return "";
}

/**
 * Saturated fills behind penguin art — `mix-blend-multiply` tints flat white.
 * Six hues in a fixed order so **consecutive** cards aren’t analogous (yellow↔green, blue↔purple,
 * etc.); orange sits between cyan and magenta so that pair never touches. Repeats every 6 cards.
 */
const AVATAR_TINT_CYCLE = [
  "bg-[#e11d48]",
  "bg-[#06b6d4]",
  "bg-[#ea580c]",
  "bg-[#84cc16]",
  "bg-[#c026d3]",
  "bg-[#2563eb]",
] as const;

function avatarTintClass(avatarIndex: number): string {
  return AVATAR_TINT_CYCLE[avatarIndex % AVATAR_TINT_CYCLE.length];
}

/** Discord-style presence dot colors (online / idle / dnd / offline). */
function discordPresenceClass(i: number): string {
  const m = i % 4;
  if (m === 0) {
    return "bg-[#23a559]";
  }
  if (m === 1) {
    return "bg-[#f0b232]";
  }
  if (m === 2) {
    return "bg-[#f23f43]";
  }
  return "bg-[#82838e]";
}

/** Message-row avatar: 40px circle + presence dot like the Discord client. */
function DiscordLikeAvatar({
  alt,
  avatarIndex,
  presenceIndex,
  src,
}: {
  alt: string;
  avatarIndex: number;
  presenceIndex: number;
  src: string;
}) {
  return (
    <div className="relative shrink-0 self-start">
      <Avatar
        className={cn(
          "isolate size-10 overflow-hidden ring-[3px] ring-card after:hidden",
          avatarTintClass(avatarIndex)
        )}
      >
        <AvatarImage
          alt={alt}
          className="mix-blend-multiply"
          loading="lazy"
          src={src}
        />
      </Avatar>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-0.5 -bottom-0.5 z-10 box-border size-3.5 rounded-full ring-[3px] ring-card",
          discordPresenceClass(presenceIndex)
        )}
      />
    </div>
  );
}

/**
 * Product-style UI panel: layered depth, tight rhythm, contained layout — the kind
 * of “floating interface” look used in marketing hero shots, not a literal device frame.
 */
function TestimonialPanel({
  testimonial,
}: {
  testimonial: Review & { avatarIndex: number };
}) {
  const name = displayName(testimonial.name);
  const tilt = bubbleTiltClass(testimonial.avatarIndex);
  return (
    <article
      className={cn(
        "relative max-w-lg origin-center select-none rounded-2xl border border-border bg-card p-5",
        "shadow-md transition-transform duration-300 ease-out",
        "hover:rotate-0",
        tilt
      )}
    >
      <div className="flex items-start gap-4">
        <DiscordLikeAvatar
          alt={name}
          avatarIndex={testimonial.avatarIndex}
          presenceIndex={testimonial.avatarIndex}
          src={penguinSrc(testimonial.avatarIndex)}
        />
        <div className="min-w-0 flex-1 space-y-3">
          <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground text-sm tracking-tight">
                {name}
              </p>
              <p className="text-muted-foreground text-xs">Member</p>
            </div>
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/70 text-muted-foreground"
              title="Discord"
            >
              <TbBrandDiscord aria-hidden className="size-3.5" />
              <span className="sr-only">Discord</span>
            </span>
          </header>
          <p className="text-pretty text-muted-foreground text-[0.9375rem] leading-relaxed tracking-[0.01em]">
            {testimonial.content}
          </p>
        </div>
      </div>
    </article>
  );
}

export interface TestimonialsMarqueeProps {
  className?: string;
}

/** Two auto-scrolling rows; quotes use a floating product-panel treatment. */
export function TestimonialsMarquee({ className }: TestimonialsMarqueeProps) {
  const plugin1 = useRef(
    AutoScroll({
      speed: 1.15,
      startDelay: 500,
      stopOnMouseEnter: true,
    })
  );

  const plugin2 = useRef(
    AutoScroll({
      direction: "backward",
      speed: 1.15,
      startDelay: 500,
      stopOnMouseEnter: true,
    })
  );

  return (
    <div className={cn("w-full", className)}>
      <Container className="flex max-w-7xl flex-col items-center gap-8 text-center">
        <Badge variant="outline">Community</Badge>
        <h2 className="text-center font-bold font-display text-3xl tracking-tight lg:text-5xl">
          What people say
        </h2>
        <p className="max-w-3xl text-balance text-muted-foreground text-lg leading-relaxed lg:text-xl">
          Voices from our Discord — welcoming, moderated, and obsessed with
          Linux. Stick around long enough and you&apos;ll find help with
          distros, tooling, career questions, and the occasional penguin meme.
        </p>
        <Link
          className={buttonVariants({ size: "default" })}
          href="https://discord.gg/linux"
          rel="noopener noreferrer"
          target="_blank"
        >
          Join Discord
        </Link>
      </Container>

      <Container className="mt-20 max-w-screen-2xl lg:mt-24">
        <div className="space-y-4 mask-[linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] lg:space-y-5">
          <Carousel
            opts={{ loop: true }}
            plugins={[plugin1.current]}
            onMouseEnter={() => plugin1.current.stop()}
            onMouseLeave={() => plugin1.current.play()}
          >
            <CarouselContent className="-ml-4">
              {testimonialsRow1.map((testimonial) => (
                <CarouselItem
                  className="basis-auto py-1.5 pl-4"
                  key={`r1-${testimonial.name}-${testimonial.avatarIndex}`}
                >
                  <TestimonialPanel testimonial={testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <Carousel
            opts={{ loop: true }}
            plugins={[plugin2.current]}
            onMouseEnter={() => plugin2.current.stop()}
            onMouseLeave={() => plugin2.current.play()}
          >
            <CarouselContent className="-ml-4">
              {testimonialsRow2.map((testimonial) => (
                <CarouselItem
                  className="basis-auto py-1.5 pl-4"
                  key={`r2-${testimonial.name}-${testimonial.avatarIndex}`}
                >
                  <TestimonialPanel testimonial={testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </Container>
    </div>
  );
}