import { getRouteMetadata } from "@portal/seo/metadata";
import type { Metadata } from "next";

import { verifySession } from "@/auth/dal";
import { PageContent, PageHeader } from "@/components/layout/page";
import { enrichEventsWithSources, getManualEvents } from "@/config/events";
import { getIcsCalendarEvents } from "@/features/events/lib/ics-events";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";

import { EventsContent } from "./events-content";

export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app/events", routeConfig, resolver);
}

export default async function EventsPage() {
  await verifySession();
  const resolver = await getServerRouteResolver();

  const [manual, icsEvents] = await Promise.all([
    Promise.resolve(getManualEvents()),
    getIcsCalendarEvents(),
  ]);
  const events = enrichEventsWithSources([...manual, ...icsEvents]);

  return (
    <PageContent className="h-0 flex-1 space-y-0 overflow-hidden p-0 sm:space-y-0 sm:p-0 md:p-0">
      <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden px-3 pt-3 sm:gap-4 sm:px-4 sm:pt-4 md:px-6 md:pt-6">
        <PageHeader pathname="/app/events" resolver={resolver} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-3 sm:pb-4 md:pb-6">
          <EventsContent events={events} />
        </div>
      </div>
    </PageContent>
  );
}
