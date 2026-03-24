"use client";

import Image from "next/image";
import { memo, useEffect, useRef, useState } from "react";

const SUPPORTERS = [
  {
    logo: "/images/supporters/canva.webp",
    name: "Canva",
  },
  {
    logo: "/images/supporters/cloudflare.webp",
    name: "Cloudflare",
  },
  {
    logo: "/images/supporters/techsoup.webp",
    name: "TechSoup",
  },
  {
    logo: "/images/supporters/fibery.webp",
    name: "Fibery",
  },
  {
    logo: "/images/supporters/monday.webp",
    name: "Monday",
  },
  {
    logo: "/images/supporters/okta.webp",
    name: "Okta",
  },
  {
    logo: "/images/supporters/github.webp",
    name: "GitHub",
  },
  {
    logo: "/images/supporters/sentry.webp",
    name: "Sentry",
  },
] as const;

const SupporterLogo = memo(({ name, logo }: { name: string; logo: string }) => {
  const isMonday = name === "Monday";
  const isGitHub = name === "GitHub";
  const isTechSoup = name === "TechSoup";

  let logoClassName =
    "h-12 w-auto object-contain transition-all duration-300 opacity-95 hover:opacity-100 hover:scale-105";

  // Apply invert filter to make logos visible on dark background, except TechSoup and Monday which have their own colors
  const logoStyle: React.CSSProperties = {
    filter:
      isTechSoup || isMonday
        ? "none"
        : "brightness(0) saturate(100%) invert(1)",
  };

  if (isMonday) {
    logoClassName =
      "h-[48px] w-auto max-w-[180px] object-contain transition-all duration-300 opacity-95 hover:opacity-100 hover:scale-105";
  } else if (isGitHub) {
    logoClassName =
      "h-[48px] w-auto max-w-[180px] object-contain transition-all duration-300 opacity-95 hover:opacity-100 hover:scale-105";
  } else if (isTechSoup) {
    logoClassName =
      "h-[60px] w-auto max-w-[240px] object-contain transition-all duration-300 opacity-95 hover:opacity-100 hover:scale-105";
  }

  return (
    <div
      className="flex items-center justify-center px-6 py-6 md:px-12"
      role="presentation"
    >
      <Image
        alt={`${name} logo`}
        className={logoClassName}
        height={80}
        onError={(e) => {
          console.error(`Failed to load logo: ${logo}`, e);
        }}
        src={logo}
        style={logoStyle}
        width={240}
      />
    </div>
  );
});

SupporterLogo.displayName = "SupporterLogo";

const Supporters = memo(() => {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>();
  const positionRef = useRef(0);
  const speedRef = useRef(0.5); // pixels per frame
  const setWidthRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Calculate set width once
    const firstSet = container.firstElementChild as HTMLElement;
    if (firstSet) {
      setWidthRef.current = firstSet.offsetWidth;
    }

    const animate = () => {
      if (isVisible && !document.hidden) {
        positionRef.current -= speedRef.current;

        // Reset position when we've scrolled one full set (seamless loop)
        if (
          setWidthRef.current > 0 &&
          Math.abs(positionRef.current) >= setWidthRef.current
        ) {
          positionRef.current = 0;
        }

        container.style.transform = `translateX(${positionRef.current}px)`;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <>
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="mb-4 font-semibold text-2xl md:text-3xl">
          Thank you to our supporters
        </h2>
        <p className="text-base text-muted-foreground">
          We&apos;re grateful to these companies for their generous support
          through discounted rates, donations, and special plans that help us
          serve our community.
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-linear-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-linear-to-l from-background to-transparent" />

        <div
          className="flex gap-4 md:gap-8"
          ref={containerRef}
          style={{ willChange: "transform" }}
        >
          {/* Render multiple sets for seamless loop */}
          {(["set-a", "set-b", "set-c"] as const).map((setKey) => (
            <div className="flex shrink-0 gap-4 md:gap-8" key={setKey}>
              {SUPPORTERS.map((supporter) => (
                <SupporterLogo
                  key={`${setKey}-${supporter.name}`}
                  {...supporter}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
});

Supporters.displayName = "Supporters";

export default Supporters;