"use client";

import { Avatar, AvatarImage } from "@atl/ui/components/avatar";
import { Card } from "@atl/ui/components/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@atl/ui/components/carousel";
import AutoScroll from "embla-carousel-auto-scroll";
import { memo, useRef } from "react";

import testimonalsData from "@/data/testimonials.json";

const reviews = testimonalsData.testimonials;
const avatars = Array.from({ length: 15 }, (_, i) => i + 1);

export const ReviewCard = memo(
  ({
    avatar,
    name,
    content,
    onMouseEnter,
    onMouseLeave,
  }: {
    avatar: string;
    name: string;
    content: string;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  }) => (
    <Card
      className="max-w-[500px] select-none border border-muted-foreground/10 border-dashed bg-card p-6"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mb-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-12 rounded-full ring-1 ring-input">
            <AvatarImage alt={name} loading="lazy" src={avatar} />
          </Avatar>
          <div>
            <p className="font-medium text-foreground text-sm">{name}</p>
          </div>
        </div>
      </div>
      <q className="text-balance text-card-foreground text-sm leading-6">
        {content}
      </q>
    </Card>
  )
);

ReviewCard.displayName = "ReviewCard";

export default function Testimonials() {
  const plugin = useRef(
    AutoScroll({
      speed: 1,
      startDelay: 0,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  return (
    <section className="py-4 md:py-6">
      <div className="container mb-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-semibold text-2xl md:text-3xl">
            See what our members are saying
          </h2>
          <p className="text-base text-muted-foreground">
            Join our growing community of Linux enthusiasts and discover why
            they love being part of our network.
          </p>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <Carousel
          opts={{
            align: "start",
            containScroll: false,
            loop: true,
          }}
          plugins={[plugin.current]}
        >
          <CarouselContent className="-ml-4 px-4">
            {[...reviews, ...reviews].map((review, index) => (
              <CarouselItem className="pl-4 md:basis-[520px]" key={index}>
                <ReviewCard
                  avatar={`/images/penguins/${avatars[index % avatars.length]}.webp`}
                  {...review}
                  onMouseEnter={() => plugin.current.stop()}
                  onMouseLeave={() => plugin.current.play()}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}