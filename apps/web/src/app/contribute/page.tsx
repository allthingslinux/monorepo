import {
  BookOpen,
  Code2,
  DollarSign,
  Heart,
  MessageCircle,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  SiBitcoin,
  SiCashapp,
  SiOpencollective,
  SiPaypal,
  SiStripe,
} from "react-icons/si";
import { TbArrowUpRight } from "react-icons/tb";

import { FinancialSupportDialog } from "@/components/marketing/contribute/financial-support-dialog";
import { Container, Section } from "@/components/shell";
import { Button } from "@atl/ui/components/button";
import { Card } from "@atl/ui/components/card";

import { getPageMetadata } from "../metadata";

export const metadata: Metadata = getPageMetadata("contribute");

interface DonateLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  primary?: boolean;
  note?: string;
}

const DONATE_LINKS: DonateLink[] = [
  {
    label: "Open Collective",
    href: "https://opencollective.com/allthingslinux",
    icon: SiOpencollective,
    primary: true,
    note: "Lowest fees, most options",
  },
  {
    label: "PayPal",
    href: "https://paypal.com/donate/?hosted_button_id=9R5Y3RDAMF6D8",
    icon: SiPaypal,
    note: "One-time or recurring",
  },
  {
    label: "Stripe (Monthly)",
    href: "https://donate.stripe.com/bJe8wQf5O2ZccHW06u1wY07",
    icon: SiStripe,
    note: "Recurring monthly donation",
  },
  {
    label: "Stripe (One-Time)",
    href: "https://donate.stripe.com/28EbJ27Dm9nAcHWdXk1wY06",
    icon: SiStripe,
    note: "Single contribution",
  },
  {
    label: "Crypto via Every.org",
    href: "https://every.org/allthingslinux/donate/crypto",
    icon: SiBitcoin,
    note: "Bitcoin, Ethereum, and more",
  },
  {
    label: "Cash App",
    href: "https://cash.app/$allthingslinux",
    icon: SiCashapp,
    note: "US only",
  },
];

interface WayToHelp {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  cta: string;
  href: string;
  external?: boolean;
}

const WAYS_TO_HELP: WayToHelp[] = [
  {
    title: "Volunteer your time",
    description:
      "Join our team — moderate, create content, organize events, or help with operations.",
    icon: Users,
    color: "#bb9af7",
    cta: "Browse open roles",
    href: "/apply",
  },
  {
    title: "Write for the wiki",
    description:
      "Share your knowledge by writing, editing, or reviewing articles and guides.",
    icon: BookOpen,
    color: "#2ac3de",
    cta: "Visit atl.wiki",
    href: "https://atl.wiki",
    external: true,
  },
  {
    title: "Contribute code",
    description:
      "Help build and improve our open-source projects — from tux to this website.",
    icon: Code2,
    color: "#7aa2f7",
    cta: "View on GitHub",
    href: "https://github.com/allthingslinux",
    external: true,
  },
  {
    title: "Help others learn",
    description:
      "Answer questions, share tips, and support newcomers in our Discord community.",
    icon: MessageCircle,
    color: "#e0af68",
    cta: "Join Discord",
    href: "https://discord.gg/linux",
    external: true,
  },
];

export default function ContributePage() {
  return (
    <main className="w-full">
      {/* Hero */}
      <Section size="hero" variant="muted">
        <Container className="max-w-3xl">
          <div className="pt-10 md:pt-16">
            <p className="text-primary mb-3 text-xs font-medium tracking-[0.2em] uppercase">
              Contribute
            </p>
            <h1 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.06] font-bold tracking-tight">
              Help us build something meaningful
            </h1>
            <p className="text-muted-foreground mt-5 max-w-xl text-lg leading-relaxed text-pretty">
              Whether through donations, code, knowledge, or your time — every
              contribution strengthens the community.
            </p>
          </div>
        </Container>
      </Section>

      {/* Donate */}
      <Section size="default" variant="default">
        <Container>
          <div className="mb-10 md:mb-14">
            <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-green-500/10">
              <DollarSign className="size-5 text-green-500" />
            </div>
            <h2 className="font-display mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Donate financially
            </h2>
            <p className="text-muted-foreground max-w-lg text-lg leading-relaxed text-pretty">
              Your generous donations help us maintain infrastructure, run
              services, and keep everything free for all.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {DONATE_LINKS.map((link) => (
              <a
                className="border-border/50 bg-card hover:border-primary/30 flex items-center gap-4 rounded-lg border p-4 transition-colors"
                href={link.href}
                key={link.label}
                rel="noopener noreferrer"
                target="_blank"
              >
                <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <link.icon className="text-muted-foreground size-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{link.label}</p>
                  {link.note && (
                    <p className="text-muted-foreground text-xs">{link.note}</p>
                  )}
                </div>
                {link.primary && (
                  <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-[10px] font-medium">
                    Recommended
                  </span>
                )}
                <TbArrowUpRight className="text-muted-foreground size-4 shrink-0" />
              </a>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <FinancialSupportDialog />
          </div>
        </Container>
      </Section>

      {/* Ways to help */}
      <Section size="default" variant="muted">
        <Container>
          <div className="mb-10 md:mb-14">
            <p className="text-primary mb-3 text-xs font-medium tracking-[0.2em] uppercase">
              Get involved
            </p>
            <h2 className="font-display max-w-md text-2xl font-bold tracking-tight sm:text-3xl">
              More ways to contribute
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {WAYS_TO_HELP.map((way) => (
              <Card
                className="border-border/50 bg-card hover:border-primary/30 flex flex-col justify-between rounded-xl p-6 transition-colors"
                key={way.title}
              >
                <div>
                  <div
                    className="mb-4 flex size-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${way.color}15` }}
                  >
                    <way.icon className="size-5" style={{ color: way.color }} />
                  </div>
                  <h3 className="font-display mb-2 text-lg font-bold tracking-tight">
                    {way.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {way.description}
                  </p>
                </div>
                <div className="mt-6">
                  <Button
                    render={
                      <Link
                        href={way.href}
                        rel={way.external ? "noopener noreferrer" : undefined}
                        target={way.external ? "_blank" : undefined}
                      />
                    }
                    size="default"
                    variant="outline"
                  >
                    {way.cta}
                    {way.external && (
                      <TbArrowUpRight className="ml-1.5 size-4" />
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Transparency */}
      <Section size="default" variant="default">
        <Container className="max-w-3xl">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 mb-4 flex size-11 items-center justify-center rounded-lg">
              <Heart className="text-primary size-5" />
            </div>
            <h2 className="font-display mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Radical transparency
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg leading-relaxed text-pretty">
              As a 501(c)(3) nonprofit, we publish all financials in real-time
              and share every decision openly with the community.
            </p>
            <Button render={<Link href="/open" />} size="lg" variant="outline">
              View our finances
              <TbArrowUpRight className="ml-1.5 size-4" />
            </Button>
          </div>
        </Container>
      </Section>
    </main>
  );
}
