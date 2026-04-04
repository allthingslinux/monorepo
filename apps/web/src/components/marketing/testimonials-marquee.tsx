"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import { useRef } from "react";

import { Container } from "@/components/shell";
import testimonalsData from "@/data/testimonials.json";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@atl/ui/components/carousel";

type Review = (typeof testimonalsData.testimonials)[number];

function displayName(name: string): string {
  return name === "Unused" ? "Community member" : name;
}

function getInitials(name: string): string {
  const display = displayName(name);
  return display
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Cycle through subtle accent tints for avatar backgrounds. */
const AVATAR_COLORS = [
  "bg-primary/15 text-primary",
  "bg-accent/15 text-accent",
  "bg-success/15 text-success",
  "bg-warning/15 text-warning",
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
] as const;

const allReviews: (Review & { index: number })[] =
  testimonalsData.testimonials.map((t, i) => ({ ...t, index: i }));

const testimonialsRow1 = allReviews.filter((_, i) => i % 2 === 0);
const testimonialsRow2 = allReviews.filter((_, i) => i % 2 === 1);

function TestimonialCard({
  testimonial,
}: {
  testimonial: Review & { index: number };
}) {
  const name = displayName(testimonial.name);
  const initials = getInitials(testimonial.name);
  const colorClass = AVATAR_COLORS[testimonial.index % AVATAR_COLORS.length];

  return (
    <article className="border-border bg-muted/30 max-w-md rounded-xl border p-5 shadow-sm select-none">
      <div className="flex items-start gap-3.5">
        {/* Avatar with initials */}
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-medium",
            colorClass
          )}
          aria-hidden
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="text-foreground text-sm font-semibold tracking-tight">
              {name}
            </p>
            <p className="text-muted-foreground text-xs">Member</p>
          </div>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
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
      <Container className="flex max-w-3xl flex-col items-center gap-5 text-center">
        <p className="text-primary text-xs font-medium tracking-[0.2em] uppercase">
          Community
        </p>
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          What people say
        </h2>
        <p className="text-muted-foreground max-w-2xl text-balance sm:text-lg">
          Join our growing community of Linux enthusiasts and discover why they
          love being part of it.
        </p>
      </Container>

      <Container className="mt-16 max-w-screen-2xl lg:mt-18">
        <div className="space-y-4 mask-[linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <Carousel
            opts={{ loop: true }}
            plugins={[plugin1.current]}
            onMouseEnter={() => plugin1.current.stop()}
            onMouseLeave={() => plugin1.current.play()}
          >
            <CarouselContent className="-ml-4">
              {testimonialsRow1.map((testimonial) => (
                <CarouselItem
                  className="basis-auto py-1 pl-4"
                  key={`r1-${testimonial.name}-${testimonial.index}`}
                >
                  <TestimonialCard testimonial={testimonial} />
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
                  className="basis-auto py-1 pl-4"
                  key={`r2-${testimonial.name}-${testimonial.index}`}
                >
                  <TestimonialCard testimonial={testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </Container>
    </div>
  );
}
