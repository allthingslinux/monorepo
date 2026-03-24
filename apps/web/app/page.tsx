import type { Metadata } from "next";

import DonateCta from "@/components/pages/home/donate-cta";
import Hero from "@/components/pages/home/hero";
import Projects from "@/components/pages/home/projects";
import Stats from "@/components/pages/home/stats";
import Supporters from "@/components/pages/home/supporters";
import Testimonials from "@/components/pages/home/testimonials";
import { getPageMetadata } from "./metadata";

export const metadata: Metadata = getPageMetadata("home");

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="w-full">
        {/* Hero - regular background */}
        <section className="py-8 md:py-20">
          <div className="container mx-auto px-4">
            <Hero />
          </div>
        </section>

        {/* Testimonials - dot grid pattern */}
        <section className="relative py-16 md:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] opacity-20 [background-size:20px_20px]" />
          <div className="container relative z-10 mx-auto px-4">
            <Testimonials />
          </div>
        </section>

        {/* Projects - regular background */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <Projects />
          </div>
        </section>

        {/* Stats - grid line pattern */}
        <section className="relative py-16 md:py-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] opacity-10 [background-size:40px_40px]" />
          <div className="container relative z-10 mx-auto px-4">
            <Stats />
          </div>
        </section>

        {/* Supporters - regular background */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <Supporters />
          </div>
        </section>

        {/* Donate CTA - regular background */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <DonateCta />
          </div>
        </section>
      </main>
    </div>
  );
}
