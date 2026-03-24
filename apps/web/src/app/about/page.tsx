import type { Metadata } from "next";

import Values from "@/components/pages/about/values";

import { getPageMetadata } from "../metadata";

export const metadata: Metadata = getPageMetadata("about");

export default function About() {
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Hero Section with terminal-inspired design */}
      <section className="relative pt-10 pb-8 sm:pt-12 sm:pb-12 md:pt-16 md:pb-16 lg:pt-20 lg:pb-20">
        {/* Terminal window container */}
        <div className="relative mx-auto mb-12 max-w-5xl overflow-hidden rounded-lg border border-primary/20 bg-card/10 shadow-lg">
          {/* Terminal header */}
          <div className="flex items-center bg-muted/30 px-4 py-2">
            <div className="mr-auto flex space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 font-mono text-xs opacity-70">
              tux@atl ~
            </div>
          </div>

          {/* Terminal content */}
          <div className="p-6 font-mono sm:p-8 md:p-10">
            <div
              className="mb-8 animate-type-once overflow-hidden whitespace-nowrap border-primary/70 border-r-4 pr-1 text-primary/90 text-sm sm:text-base"
              style={{ maxWidth: "240px", width: "240px" }}
            >
              <span className="text-green-400">$</span>{" "}
              <span className="text-yellow-300">cat</span> allthingslinux.md
            </div>

            {/* Content blocks */}
            <div className="mx-auto mb-6 max-w-3xl text-left font-sans sm:mb-8">
              <h1 className="mb-3 font-bold text-2xl text-foreground tracking-tight sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl">
                About Our Organization
              </h1>
              <p className="text-base text-foreground/80 sm:text-md md:text-lg lg:text-xl">
                Fostering a vibrant community of Linux enthusiasts through
                education, collaboration, and support.
              </p>
            </div>
          </div>
        </div>

        {/* Content blocks */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 md:gap-10">
          <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
            <div className="rounded-lg border border-primary/5 bg-card/30 p-4 sm:p-5 md:p-6">
              <h3 className="mb-2 flex items-center font-medium font-mono text-base text-primary/90 sm:text-lg">
                <span className="mr-2 text-green-500">~/</span>Our Community
              </h3>
              <p className="text-balance text-sm leading-relaxed sm:text-base md:text-lg">
                We are a diverse community of over 20,000 Linux enthusiasts,
                passionate about advancing technology and sharing knowledge. Our
                organization is dedicated to promoting the spirit and growth of
                Linux through collaboration and innovation.
              </p>
            </div>

            <div className="rounded-lg border border-primary/5 bg-card/30 p-4 sm:p-5 md:p-6">
              <h3 className="mb-2 flex items-center font-medium font-mono text-base text-primary/90 sm:text-lg">
                <span className="mr-2 text-green-500">~/</span>Our Mission
              </h3>
              <p className="text-balance text-sm leading-relaxed sm:text-base md:text-lg">
                We develop tools, create self-hosted projects, and curate
                educational resources that enrich the Linux ecosystem. Through
                these efforts, we aim to enhance user experiences and make Linux
                more accessible to newcomers.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:gap-5 md:mt-0 md:gap-6">
            <div className="rounded-lg border border-primary/5 bg-card/30 p-4 sm:p-5 md:p-6">
              <h3 className="mb-2 flex items-center font-medium font-mono text-base text-primary/90 sm:text-lg">
                <span className="mr-2 text-green-500">~/</span>Our Values
              </h3>
              <p className="text-balance text-sm leading-relaxed sm:text-base md:text-lg">
                At the core of All Things Linux is our commitment to inclusivity
                and diversity. Our code of conduct ensures everyone feels
                welcome, regardless of background or skill level. We value
                different perspectives and foster a supportive environment for
                learning and growth.
              </p>
            </div>

            <div className="rounded-lg border border-primary/5 bg-card/30 p-4 sm:p-5 md:p-6">
              <h3 className="mb-2 flex items-center font-medium font-mono text-base text-primary/90 sm:text-lg">
                <span className="mr-2 text-green-500">~/</span>Our Future
              </h3>
              <p className="text-balance text-sm leading-relaxed sm:text-base md:text-lg">
                As a 501(c)(3) nonprofit, we prioritize transparency and
                community-driven decisions. Our ongoing development includes
                Discord bots, wikis, and self-hosted tools. Join us as we
                explore possibilities and contribute to the future of
                open-source technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Values />
    </div>
  );
}