"use client";

import { Card } from "@atl/ui/ui/card";
import { memo } from "react";

// Stats data with minimal information
const statsData = [
  { id: 1, value: "10M+", description: "messages" },
  { id: 2, value: "20K+", description: "members" },
  { id: 3, value: "70K+", description: "voice hours" },
  { id: 4, value: "40+", description: "volunteers and staff" },
  { id: 5, value: "2K+", description: "solved support posts" },
  { id: 6, value: "10+", description: "projects in development" },
];

// Stat card component
const StatCard = ({ stat }: { stat: (typeof statsData)[0] }) => {
  return (
    <Card className="border border-border/40 p-8 hover:border-primary/20">
      <div className="text-center">
        <p className="mb-2 font-bold text-3xl">{stat.value}</p>
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          {stat.description}
        </p>
      </div>
    </Card>
  );
};

const Stats = memo(() => {
  return (
    <section className="py-4 md:py-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-12 text-center font-semibold text-xl md:text-2xl lg:text-3xl">
          Our community by the numbers
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statsData.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
});

Stats.displayName = "Stats";

export default Stats;