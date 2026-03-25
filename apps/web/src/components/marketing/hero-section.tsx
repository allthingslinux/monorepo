import { Badge } from "@atl/ui/components/badge";
import Image from "next/image";

import { Container, Section } from "@/components/shell";

import { HomeActions } from "./home-actions";

const SHOWCASE = [
  { alt: "Arch Linux", src: "/images/hero/arch.webp" },
  { alt: "Debian", src: "/images/hero/debian.webp" },
  { alt: "Fedora", src: "/images/hero/fedora.webp" },
  { alt: "NixOS", src: "/images/hero/nixos.webp" },
  { alt: "Ubuntu", src: "/images/hero/ubuntu.webp" },
  { alt: "openSUSE", src: "/images/hero/opensuse.webp" },
] as const;

export function HeroSection() {
  return (
    <Section
      bleed
      className="overflow-hidden border-b border-border/25"
      size="hero"
      variant="brand"
    >
      <Container>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-28 size-[min(100vw,480px)] rounded-full bg-primary/12 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/3 size-[min(90vw,400px)] rounded-full bg-chart-2/8 blur-3xl"
        />

        <div className="relative grid gap-10 lg:grid-cols-[1fr_min(380px,38%)] lg:items-start lg:gap-14 xl:gap-20">
          <div className="text-center lg:text-left">
            <Badge
              className="mb-5 border-primary/30 bg-primary/8 px-2.5 py-0.5 font-medium text-[10px] text-primary uppercase tracking-[0.16em]"
              variant="outline"
            >
              501(c)(3) nonprofit
            </Badge>

            <h1 className="font-bold font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.08] tracking-tight">
              <span className="text-foreground">All Things </span>
              <span className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                Linux
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-balance text-lg text-foreground/90 sm:text-xl lg:max-w-none">
              Education, tools, and community for the Linux ecosystem.
            </p>
            <p className="mx-auto mt-4 max-w-prose text-balance text-center text-sm leading-relaxed text-muted-foreground sm:text-[15px] lg:mx-0 lg:text-left">
              We help people learn, build, and connect around Linux and free
              software — guides, chat, services, and projects you can use and
              contribute to.
            </p>

            <HomeActions className="justify-center lg:justify-start" />
          </div>

          <aside className="mx-auto w-full max-w-sm pt-2 lg:mx-0 lg:max-w-none lg:pt-1">
            <p className="mb-3 text-center font-medium text-[10px] text-muted-foreground uppercase tracking-[0.18em] lg:text-left">
              Distros &amp; desktops in our community
            </p>
            <div className="rounded-2xl border border-border/50 bg-card/60 p-4 shadow-sm ring-1 ring-border/20 backdrop-blur-sm sm:p-5">
              <ul
                aria-label="Linux distributions represented in our community"
                className="grid grid-cols-3 gap-3"
              >
                {SHOWCASE.map(({ alt, src }) => (
                  <li key={src}>
                    <div className="flex aspect-square items-center justify-center rounded-xl bg-background/80 ring-1 ring-border/40 transition-colors hover:bg-background hover:ring-border/60">
                      <Image
                        alt={alt}
                        className="size-[70%] max-h-10 object-contain"
                        height={40}
                        src={src}
                        width={40}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}