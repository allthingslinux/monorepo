import type { Metadata } from "next";

import { portalDefaultMetadata } from "@/app/metadata";
import { PageContent, PageHeader } from "@/components/layout/page";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { verifySession } from "@atl/auth/dal";
import { getRouteMetadata } from "@atl/seo/metadata";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@atl/ui/components/card";

import { DonateCtaSections } from "./donate-cta-sections";

export async function generateMetadata(): Promise<Metadata> {
  return getRouteMetadata(
    "/app/donate",
    [...routeConfig.protected, ...routeConfig.public],
    portalDefaultMetadata
  );
}

export default async function DonatePage() {
  await verifySession();
  const resolver = await getServerRouteResolver();

  return (
    <PageContent>
      <PageHeader pathname="/app/donate" resolver={resolver} />

      <div className="space-y-8">
        {/* Hero */}
        <div className="border-primary/10 relative overflow-hidden rounded-xl border">
          <div
            className="absolute inset-0 opacity-20 dark:opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-foreground mb-3 text-xl font-semibold sm:text-2xl">
                Support All Things Linux
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Your donations help us maintain infrastructure, run events, and
                grow our community. Every contribution makes a difference.
              </p>
            </div>
          </div>
        </div>

        <DonateCtaSections />

        {/* Transparency */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              We practice radical transparency
            </CardTitle>
            <CardDescription className="text-center text-base">
              As a non-profit, we&apos;re committed to complete transparency. We
              publish financials and share decisions openly with the community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="text-center">
                <div className="text-primary text-2xl font-bold">20+</div>
                <p className="text-muted-foreground text-sm">
                  Dedicated volunteers
                </p>
              </div>
              <div className="text-center">
                <div className="text-primary text-2xl font-bold">100%</div>
                <p className="text-muted-foreground text-sm">
                  Open source and non-profit
                </p>
              </div>
              <div className="text-center">
                <div className="text-primary text-2xl font-bold">24/7</div>
                <p className="text-muted-foreground text-sm">
                  Community support
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
}
