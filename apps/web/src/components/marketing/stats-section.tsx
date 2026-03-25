import { Card } from "@atl/ui/components/card";

import { Section, SectionHeader } from "@/components/shell";

const STATS = [
  { label: "Discord messages", value: "10M+" },
  { label: "Community members", value: "20K+" },
  { label: "Voice hours", value: "70K+" },
  { label: "Volunteers & staff", value: "40+" },
  { label: "Solved support threads", value: "2K+" },
  { label: "Active initiatives", value: "10+" },
] as const;

export function StatsSection() {
  return (
    <Section size="default" variant="grid">
      <SectionHeader
        description="Rough figures from our Discord and programs — growing every month."
        title="Community scale"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((row) => (
          <Card
            className="border-border/50 bg-card/60 p-8 text-center backdrop-blur-sm"
            key={row.label}
          >
            <p className="font-bold font-display text-3xl tracking-tight sm:text-4xl">
              {row.value}
            </p>
            <p className="mt-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
              {row.label}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}