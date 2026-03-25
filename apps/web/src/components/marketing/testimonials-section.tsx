import { Section } from "@/components/shell";

import { TestimonialsMarquee } from "./testimonials-marquee";

export function TestimonialsSection() {
  return (
    <Section bleed size="spacious" variant="muted">
      <TestimonialsMarquee />
    </Section>
  );
}