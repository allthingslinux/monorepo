import { KeyRound, Shield, Users } from "lucide-react";

import { Section } from "@/components/shell";

import { PortalActions } from "./portal-actions";

const HIGHLIGHTS = [
  { Icon: Shield, text: "Secure sign-in for ATL services" },
  { Icon: KeyRound, text: "One identity across tools" },
  { Icon: Users, text: "Linked to community programs" },
] as const;

export function PortalSection({
  signInUrl,
  signUpUrl,
}: {
  signInUrl: string;
  signUpUrl: string;
}) {
  return (
    <Section className="lg:py-16" size="compact" variant="muted">
      <div
        className="overflow-hidden rounded-2xl border border-border/55 bg-card shadow-sm"
        id="portal"
      >
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="border-border/40 border-b p-8 sm:p-10 lg:border-r lg:border-b-0 lg:p-12">
            <p className="mb-2 font-medium text-primary text-[10px] uppercase tracking-[0.2em]">
              Featured
            </p>
            <h2 className="font-bold font-display text-3xl tracking-tight sm:text-4xl">
              Portal
            </h2>
            <p className="mt-4 max-w-md text-pretty text-muted-foreground text-[15px] leading-relaxed sm:text-base">
              Single sign-on for All Things Linux — one account for identity,
              services, and the community as we ship new tools.
            </p>
            <div className="mt-8">
              <PortalActions signInUrl={signInUrl} signUpUrl={signUpUrl} />
            </div>
          </div>

          <div className="bg-muted/25 p-8 sm:p-10 lg:p-12">
            <p className="mb-5 font-medium text-foreground text-sm tracking-tight">
              What you get
            </p>
            <ul className="space-y-5">
              {HIGHLIGHTS.map(({ Icon, text }) => (
                <li
                  className="flex gap-3.5 text-[15px] text-foreground/90 leading-relaxed"
                  key={text}
                >
                  <Icon
                    aria-hidden
                    className="mt-1 size-4 shrink-0 text-primary"
                    strokeWidth={2}
                  />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}