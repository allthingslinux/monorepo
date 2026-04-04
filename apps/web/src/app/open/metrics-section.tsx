import { Card, CardContent } from "@atl/ui/components/card";

interface MetricCardProps {
  comingSoon?: boolean;
  description?: string;
  highlight?: "primary" | "success" | "warning";
  label: string;
  value: string | number | null;
}

function MetricCard({
  label,
  value,
  description,
  highlight,
  comingSoon = false,
}: MetricCardProps) {
  const highlightClasses = {
    primary: "bg-primary/10 border-primary/20",
    success: "bg-green-500/10 border-green-500/20",
    warning: "bg-orange-500/10 border-orange-500/20",
  };

  const valueClasses = {
    primary: "text-primary",
    success: "text-green-600 dark:text-green-400",
    warning: "text-orange-600 dark:text-orange-400",
  };

  const isComingSoon = comingSoon || value === null || value === 0;

  return (
    <Card
      className={`${
        highlight ? highlightClasses[highlight] : ""
      } transition-all hover:shadow-md ${isComingSoon ? "opacity-75" : ""}`}
    >
      <CardContent className="p-6">
        <div className="text-muted-foreground mb-1 text-sm font-medium">
          {label}
        </div>
        {isComingSoon ? (
          <div className="text-muted-foreground/60 text-2xl font-semibold">
            Coming soon
          </div>
        ) : (
          <div
            className={`text-3xl font-bold ${
              highlight ? valueClasses[highlight] : ""
            }`}
          >
            {value}
          </div>
        )}
        {description && (
          <div className="text-muted-foreground mt-2 text-xs">
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MetricsSection() {
  // Community and organization metrics - coming soon
  const metrics = [
    {
      comingSoon: true,
      description: "Website traffic",
      highlight: "primary" as const,
      label: "Monthly Visitors",
      value: null,
    },
    {
      comingSoon: true,
      description: "Community members",
      highlight: "success" as const,
      label: "Active Contributors",
      value: null,
    },
    {
      comingSoon: true,
      description: "Active initiatives",
      label: "Open Projects",
      value: null,
    },
    {
      comingSoon: true,
      description: "Discord & GitHub",
      highlight: "primary" as const,
      label: "Community Members",
      value: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}
