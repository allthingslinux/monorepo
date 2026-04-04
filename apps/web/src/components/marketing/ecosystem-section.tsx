import { Section } from "@/components/shell";
import { Badge } from "@atl/ui/components/badge";
import { Card, CardContent, CardHeader } from "@atl/ui/components/card";

export function EcosystemSection() {
  return (
    <Section id="more-projects" size="compact" variant="default">
      <div className="flex flex-col items-center gap-6">
        <p className="text-primary mb-3 text-xs font-medium tracking-[0.2em] uppercase">
          Coming soon
        </p>
        <h2 className="font-display mb-2 text-center text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          What we&apos;re building next
        </h2>
        <p className="text-muted-foreground text-center">
          New initiatives in the works — stay tuned.
        </p>

        <div className="mt-6 flex w-full flex-col gap-6 lg:flex-row">
          {/* atl.dev */}
          <Card className="flex flex-col justify-between gap-5 border-dashed lg:w-1/2">
            <CardHeader className="flex-row items-center gap-3">
              <Badge
                className="border-border/50 bg-muted/40 text-muted-foreground text-[10px]"
                variant="outline"
              >
                In development
              </Badge>
            </CardHeader>
            <CardContent>
              <h3 className="font-display mb-2 text-lg font-bold tracking-tight">
                atl.dev
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Hosting and tooling for developers and FOSS projects. Git repos,
                CI pipelines, and dev environments.
              </p>
            </CardContent>
          </Card>

          {/* ISO Archive */}
          <Card className="flex flex-col justify-between gap-5 border-dashed lg:w-1/2">
            <CardHeader className="flex-row items-center gap-3">
              <Badge
                className="border-border/50 bg-muted/40 text-muted-foreground text-[10px]"
                variant="outline"
              >
                In development
              </Badge>
            </CardHeader>
            <CardContent>
              <h3 className="font-display mb-2 text-lg font-bold tracking-tight">
                ISO Archive
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Long-term archival of Linux ISOs and metadata. Preserving distro
                history so nothing gets lost to time.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}
