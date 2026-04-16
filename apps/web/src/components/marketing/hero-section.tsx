"use client";

import Image from "next/image";

import { Container, Section } from "@/components/shell";
import { OrbitingCircles } from "@atl/ui/components/orbiting-circles";

import { HomeActions } from "./home-actions";

/** Tightest orbit — fills the open space inside the Arch/Fedora ring in the hero arc */
const core = [
  { alt: "Void", src: "/images/hero/void.webp" },
  { alt: "Artix", src: "/images/hero/artix.webp" },
  { alt: "Asahi", src: "/images/hero/asahi.webp" },
];

const inner = [
  { alt: "Arch Linux", src: "/images/hero/arch.webp" },
  { alt: "Fedora", src: "/images/hero/fedora.webp" },
  { alt: "Debian", src: "/images/hero/debian.webp" },
  { alt: "NixOS", src: "/images/hero/nixos.webp" },
];

const midInner = [
  { alt: "Ubuntu", src: "/images/hero/ubuntu.webp" },
  { alt: "Gentoo", src: "/images/hero/gentoo.webp" },
  { alt: "Mint", src: "/images/hero/mint.webp" },
  { alt: "openSUSE", src: "/images/hero/opensuse.webp" },
  { alt: "Void", src: "/images/hero/void.webp" },
];

const midOuter = [
  { alt: "Pop!_OS", src: "/images/hero/popos.webp" },
  { alt: "Red Hat", src: "/images/hero/redhat.webp" },
  { alt: "Slackware", src: "/images/hero/slackware.webp" },
  { alt: "CachyOS", src: "/images/hero/cachy.webp" },
  { alt: "Artix", src: "/images/hero/artix.webp" },
  { alt: "Asahi", src: "/images/hero/asahi.webp" },
];

export function HeroSection() {
  return (
    <Section
      bleed
      className="bg-card min-h-screen overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:z-1 before:bg-[url('/images/noise.png')] before:opacity-50 before:content-['']"
      size="spacious"
      variant="grid"
    >
      <Container>
        {/* Text content */}
        <div className="flex flex-col items-center pt-6 text-center md:pt-10">
          <h1 className="font-display max-w-3xl text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.05] font-bold tracking-tight">
            <span className="text-foreground">
              Let&apos;s build the future of Linux together
            </span>
          </h1>

          <p className="text-muted-foreground mt-5 max-w-2xl text-lg text-balance sm:text-xl">
            All Things Linux is a non-profit organization with a mission to
            empower the Linux ecosystem through education, collaboration, and
            support.
          </p>

          <HomeActions className="justify-center" />
        </div>
      </Container>

      {/* Orbiting circles below text — only top half visible */}
      <div className="relative -mt-5 h-[200px] md:-mt-7 md:h-[260px]">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <div className="relative flex size-[1200px] items-center justify-center">
            <OrbitingCircles iconSize={56} radius={240} speed={1.8}>
              {inner.map((d) => (
                <div className="size-14 rounded-full p-1" key={d.alt}>
                  <Image
                    alt={d.alt}
                    className="size-full object-contain"
                    src={d.src}
                    width={56}
                    height={56}
                  />
                </div>
              ))}
            </OrbitingCircles>
            <OrbitingCircles iconSize={52} radius={340} reverse speed={1.4}>
              {midInner.map((d) => (
                <div className="size-13 rounded-full p-1" key={d.alt}>
                  <Image
                    alt={d.alt}
                    className="size-full object-contain"
                    src={d.src}
                    width={52}
                    height={52}
                  />
                </div>
              ))}
            </OrbitingCircles>
            <OrbitingCircles iconSize={48} radius={440} speed={1}>
              {midOuter.map((d) => (
                <div className="size-12 rounded-full p-1" key={d.alt}>
                  <Image
                    alt={d.alt}
                    className="size-full object-contain"
                    src={d.src}
                    width={48}
                    height={48}
                  />
                </div>
              ))}
            </OrbitingCircles>
            <OrbitingCircles iconSize={40} radius={150} reverse speed={2.1}>
              {core.map((d) => (
                <div className="size-10 rounded-full p-1" key={d.alt}>
                  <Image
                    alt={d.alt}
                    className="size-full object-contain"
                    src={d.src}
                    width={40}
                    height={40}
                  />
                </div>
              ))}
            </OrbitingCircles>
          </div>
        </div>
      </div>
    </Section>
  );
}
