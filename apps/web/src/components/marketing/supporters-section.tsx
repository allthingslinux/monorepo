import { Section, SectionHeader } from "@/components/shell";

import { SupportersStrip } from "./supporters-strip";

export function SupportersSection() {
  return (
    <Section bleed size="spacious" variant="muted">
      <SectionHeader
        description="Discounts, donations, and programs that help us host services and support contributors."
        title="Supporters"
      />
      <SupportersStrip />
    </Section>
  );
}