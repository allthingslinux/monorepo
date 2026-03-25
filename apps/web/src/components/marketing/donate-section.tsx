import { Section, SectionHeader } from "@/components/shell";

import { DonateButton } from "./donate-button";
import { DonateShaderBackdrop } from "./donate-shader-backdrop";

export function DonateSection() {
  return (
    <Section className="pb-20 md:pb-28" size="default" variant="default">
      <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
        <DonateShaderBackdrop />
        <div
          aria-hidden
          className="absolute inset-0 z-1 bg-linear-to-r from-background/93 via-background/82 to-background/72"
        />
        <div className="relative z-2 px-6 py-12 sm:px-10 sm:py-14 md:px-14 md:py-16 [&_h2]:drop-shadow-sm">
          <SectionHeader
            align="start"
            className="mb-8 max-w-xl text-left!"
            description="We fund infrastructure, programs, and volunteer time through donations and in-kind support. Every contribution keeps services online and education accessible."
            descriptionClassName="text-foreground/95"
            title="Keep ATL sustainable"
          />
          <DonateButton />
        </div>
      </div>
    </Section>
  );
}