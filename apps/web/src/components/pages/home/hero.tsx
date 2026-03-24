import Image from "next/image";
import { memo } from "react";

import DiscordSkeleton from "./discord-skeleton";

const Hero = memo(() => (
  <section className="py-4 pb-4 md:py-6 md:pb-16">
    <div className="container flex flex-col items-center text-center">
      <h1 className="mb-6 text-center font-bold text-2xl sm:mb-8 sm:text-3xl md:mb-10 md:text-4xl lg:mb-12 lg:text-5xl xl:text-6xl">
        Let&apos;s build the future of Linux together
      </h1>
      <p className="max-w-4xl pb-4 text-base sm:text-lg md:text-lg lg:text-xl">
        All Things Linux is a 501(c)(3) non-profit organization with a mission
        to empower the Linux ecosystem through education, collaboration, and
        support.
      </p>
    </div>
    <div className="aspect-video text-clip sm:mt-8 md:mt-12 md:aspect-auto md:h-[420px] lg:mt-16">
      <div className="relative mx-auto flex max-w-3xl flex-col">
        {/* Left icons */}
        <div className="absolute top-0 right-[calc(100%+63px)] hidden size-[64px] rounded-2xl bg-[#4FAEC3] ring-1 ring-accent-foreground/10 ring-inset md:block">
          <Image
            alt="Arch Linux"
            className="size-full rounded-md object-cover object-center p-3"
            height={64}
            priority
            src="/images/hero/arch.webp"
            width={64}
          />
        </div>
        <div className="absolute top-[52px] right-[calc(100%+195px)] hidden size-[64px] rounded-2xl bg-[#605191] ring-1 ring-accent-foreground/10 ring-inset md:block">
          <Image
            alt="Gentoo Linux"
            className="size-full rounded-md object-cover object-center p-3"
            height={64}
            loading="lazy"
            src="/images/hero/gentoo.webp"
            width={64}
          />
        </div>
        <div className="absolute top-[144px] right-[calc(100%+34px)] hidden size-[64px] rounded-2xl bg-[#8862ab] ring-1 ring-accent-foreground/10 ring-inset md:block">
          <Image
            alt="Bazzite"
            className="size-full rounded-md object-cover object-center p-3"
            height={64}
            loading="lazy"
            src="/images/hero/bazzite.webp"
            width={64}
          />
        </div>
        <div className="absolute top-[164px] right-[calc(100%+268px)] hidden size-[64px] rounded-2xl bg-[#A82248] ring-1 ring-accent-foreground/10 ring-inset md:block">
          <Image
            alt="Debian"
            className="size-full rounded-md object-cover object-center p-3"
            height={64}
            loading="lazy"
            src="/images/hero/debian.webp"
            width={64}
          />
        </div>
        <div className="absolute top-[240px] right-[calc(100%+156px)] hidden size-[64px] rounded-2xl bg-[#2B816F] ring-1 ring-accent-foreground/10 ring-inset md:block">
          <Image
            alt="Cachy"
            className="size-full rounded-md object-cover object-center p-3"
            height={64}
            loading="lazy"
            src="/images/hero/cachy.webp"
            width={64}
          />
        </div>
        <div className="absolute top-[340px] right-[calc(100%+242px)] hidden size-[64px] rounded-2xl bg-[#2988CC] ring-1 ring-accent-foreground/10 ring-inset md:block">
          <Image
            alt="Fedora"
            className="size-full rounded-md object-cover object-center p-3"
            height={64}
            loading="lazy"
            src="/images/hero/fedora.webp"
            width={64}
          />
        </div>
        <div className="absolute top-[366px] right-[calc(100%+66px)] hidden size-[64px] rounded-2xl bg-[#82C73C] ring-1 ring-accent-foreground/10 ring-inset md:block">
          <Image
            alt="Mint"
            className="size-full rounded-md object-cover object-center p-3"
            height={64}
            loading="lazy"
            src="/images/hero/mint.webp"
            width={64}
          />
        </div>
        {/* Right icons */}
        <div className="absolute top-0 left-[calc(100%+53px)] hidden size-[64px] rounded-2xl bg-[#243742] ring-1 ring-accent-foreground/10 ring-inset md:block">
          <Image
            alt="Bedrock Linux"
            className="size-full rounded-md object-cover object-center p-3"
            height={64}
            priority
            src="/images/hero/bedrock.webp"
            width={64}
          />
        </div>
        <div className="absolute top-[34px] left-[calc(100%+202px)] hidden size-[64px] rounded-2xl bg-[#B27180] ring-1 ring-accent-foreground/10 ring-inset md:block">
          <Image
            alt="Asahi Linux"
            className="size-full rounded-md object-cover object-center p-3"
            height={64}
            loading="lazy"
            src="/images/hero/asahi.webp"
            width={64}
          />
        </div>
        <div className="absolute top-[141px] left-[calc(100%+97px)] hidden size-[64px] rounded-2xl bg-[#DD4814] ring-1 ring-accent-foreground/10 ring-inset md:block">
          <Image
            alt="Ubuntu"
            className="size-full rounded-md object-cover object-center p-3"
            height={64}
            loading="lazy"
            src="/images/hero/ubuntu.webp"
            width={64}
          />
        </div>
        <div className="absolute top-[138px] left-[calc(100%+282px)] hidden size-[64px] rounded-2xl bg-[#30BA78] ring-1 ring-accent-foreground/10 ring-inset md:block">
          <Image
            alt="openSUSE"
            className="size-full rounded-md object-cover object-center p-3"
            height={64}
            loading="lazy"
            src="/images/hero/opensuse.webp"
            width={64}
          />
        </div>
        <div className="absolute top-[262px] left-[calc(100%+42px)] hidden size-[64px] rounded-2xl bg-[#4F73BC] ring-1 ring-accent-foreground/10 ring-inset md:block">
          <Image
            alt="NixOS"
            className="size-full rounded-md object-cover object-center p-3"
            height={64}
            loading="lazy"
            src="/images/hero/nixos.webp"
            width={64}
          />
        </div>
        <div className="absolute top-[282px] left-[calc(100%+234px)] hidden size-[64px] rounded-2xl bg-[#E83341] ring-1 ring-accent-foreground/10 ring-inset md:block">
          <Image
            alt="Red Hat"
            className="size-full rounded-md object-cover object-center p-3"
            height={64}
            loading="lazy"
            src="/images/hero/redhat.webp"
            width={64}
          />
        </div>
        <div className="absolute top-[365px] left-[calc(100%+112px)] hidden size-[64px] rounded-2xl bg-[#4962AE] ring-1 ring-accent-foreground/10 ring-inset md:block">
          <Image
            alt="Slackware"
            className="size-full rounded-md object-cover object-center p-3"
            height={64}
            loading="lazy"
            src="/images/hero/slackware.webp"
            width={64}
          />
        </div>
        {/* Hero images */}
        <div className="container mx-auto mt-8 px-4 sm:mt-10 sm:px-6 md:mt-12 md:px-8">
          <DiscordSkeleton />
        </div>
      </div>
    </div>
  </section>
));

Hero.displayName = "Hero";

export default Hero;