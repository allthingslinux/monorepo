import {
  BookOpen,
  Code2,
  FileText,
  Heart,
  MessageCircle,
  Shield,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { TbArrowUpRight, TbBrandDiscord } from "react-icons/tb";

import { Container, Section } from "@/components/shell";
import { Button } from "@atl/ui/components/button";

import { getPageMetadata } from "../metadata";

export const metadata: Metadata = getPageMetadata("about");

const PILLARS = [
  {
    description:
      "Knowledge should be free and accessible to everyone. Our wiki, guides, and resources exist so anyone can learn — through community-driven content, open archival, and lowering the barrier to Linux adoption.",
    icon: BookOpen,
    title: "Education",
  },
  {
    description:
      "Linux wouldn't be what it is without the heart of its people. We grow by sharing knowledge, contributing back, and keeping that spirit alive through a bridged multi-platform presence and a culture rooted in belonging.",
    icon: Users,
    title: "Community",
  },
  {
    description:
      "Everything we build is open source, because the future of Linux depends on self-hosted resources, community-driven innovation, and quality infrastructure that nobody can take away.",
    icon: Code2,
    title: "Technology",
  },
  {
    description:
      "Open source means nothing if the door feels closed. We make sure anyone who walks in gets the help they need — through dedicated forums, a beginner-friendly culture, and staff trained to help.",
    icon: MessageCircle,
    title: "Support",
  },
] as const;

const VALUES = [
  {
    icon: Heart,
    title: "Mutual respect",
    description:
      "Treating everyone with kindness, free from discrimination. We assume positive intent and resolve disputes with empathy.",
  },
  {
    icon: Users,
    title: "Inclusivity",
    description:
      "Every expert was once a beginner. We reject gatekeeping — if you can use a fork, you're technical enough.",
  },
  {
    icon: Code2,
    title: "Collaboration",
    description:
      "We value multipliers over dividers. Open-source contributions, creative teamwork, and shared success over individual glory.",
  },
  {
    icon: Shield,
    title: "Integrity",
    description:
      "Accountability and honesty in all operations. When mistakes happen, we fix the system — not blame the person.",
  },
  {
    icon: BookOpen,
    title: "Transparency",
    description:
      "Open finances, public roadmap, community governance. Our default stance is make it public.",
  },
] as const;

const MILESTONES = [
  {
    event:
      "Server founded by Kaizen, acquired discord.gg/linux — 100K messages in 12 days",
    year: "Nov 2023",
  },
  { event: "1,000 members; IRC and XMPP servers launched", year: "Jan 2024" },
  {
    event: "atl.wiki domain acquired, MediaWiki server launched",
    year: "Jun 2024",
  },
  { event: "501(c)(3) nonprofit status achieved", year: "Nov 2024" },
  {
    event:
      "Google, GitHub, Cloudflare, Canva & Okta partnerships secured — $50K+/yr in donated services",
    year: "Dec 2024",
  },
  { event: "Featured by Brodie Robertson — 25K+ views", year: "Apr 2025" },
  { event: "10,000 members — five months ahead of goal", year: "May 2025" },
  {
    event: "atl.wiki 1.0 launched — 326 pages, 265 contributors",
    year: "Aug 2025",
  },
  {
    event: "Survived multi-day DDoS attack with zero data loss",
    year: "Aug 2025",
  },
  {
    event: "Organizational transformation — public roadmap launched on Fibery",
    year: "Oct 2025",
  },
  {
    event: "Tux v0.1.0 released — 110K+ LOC, 3.9K commits, 45 contributors",
    year: "Jan 2026",
  },
  {
    event: "20,000+ members — 10,000% growth in just over two years",
    year: "Feb 2026",
  },
] as const;

export default function About() {
  return (
    <main className="w-full">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <Section size="spacious" variant="muted">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
            <div>
              <p className="text-primary mb-3 text-xs font-medium tracking-[0.2em] uppercase">
                About
              </p>
              <h1 className="font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                All Things Linux
              </h1>
            </div>
            <div className="flex flex-col justify-end">
              <p className="text-muted-foreground max-w-xl text-lg leading-relaxed sm:text-xl">
                A 501(c)(3) nonprofit building Linux education, open-source
                tools, and a community for people at every stage of their
                journey. Entirely volunteer-run, zero paid advertising, and
                growing every month.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Origin story ────────────────────────────────────────────────── */}
      <Section size="default" variant="default">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[2fr_5fr]">
            <p className="text-muted-foreground text-sm font-medium">
              Our background
            </p>
            <div className="max-w-2xl space-y-6">
              <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">
                Founded in November 2023 as a Discord community for Linux
                enthusiasts. Within two weeks — 100,000 messages and the front
                page of Top.gg.
              </h2>
              <p className="text-muted-foreground/70 text-lg">
                Growth has been entirely organic. In November 2024 the
                organization received 501(c)(3) nonprofit status, and
                partnerships with Google, GitHub, Cloudflare, and Okta followed
                shortly after — securing over $50,000 per year in donated
                services that keep infrastructure free and community-owned.
              </p>
              <p className="text-muted-foreground/70 text-lg">
                The organization is run entirely by volunteers and operates on
                roughly $150 per month in direct server costs. All software we
                produce is open source and publicly available on GitHub.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Pillars ─────────────────────────────────────────────────────── */}
      <Section size="default" variant="muted">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[2fr_5fr]">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                What drives us
              </p>
            </div>
            <div>
              <h2 className="mb-10 max-w-lg font-serif text-2xl tracking-tight sm:text-3xl">
                Four areas that guide our work and priorities.
              </h2>
              <div className="grid gap-8 sm:grid-cols-2">
                {PILLARS.map((pillar) => (
                  <div key={pillar.title}>
                    <div className="bg-primary/10 text-primary mb-4 flex size-10 items-center justify-center rounded-lg">
                      <pillar.icon className="size-5" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold tracking-tight">
                      {pillar.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Beliefs ────────────────────────────────────────────────────── */}
      <Section size="default" variant="default">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[2fr_5fr]">
            <p className="text-muted-foreground text-sm font-medium">
              What we believe
            </p>
            <div className="max-w-2xl space-y-6">
              <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">
                Open source is a human right, not a privilege.
              </h2>
              <p className="text-muted-foreground/70 text-lg">
                Knowledge should be free and accessible. Communities are
                stronger when diverse and inclusive. Transparency builds trust.
                Infrastructure should be community-owned, not
                corporate-controlled. The best solutions come from
                collaboration. Everyone has something to teach and something to
                learn.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Values ──────────────────────────────────────────────────────── */}
      <Section size="default" variant="default">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[2fr_5fr]">
            <p className="text-muted-foreground text-sm font-medium">
              Our values
            </p>
            <div>
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <h2 className="max-w-sm font-serif text-2xl tracking-tight sm:text-3xl">
                  What we stand for
                </h2>
                <Link
                  className="border-border/50 bg-card text-foreground/80 hover:bg-muted/50 hover:text-foreground inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-colors"
                  href="/code-of-conduct"
                >
                  <FileText
                    aria-hidden
                    className="text-primary size-4"
                    strokeWidth={2}
                  />
                  Code of Conduct
                </Link>
              </div>
              <div className="space-y-6">
                {VALUES.map((v) => (
                  <div className="flex gap-4" key={v.title}>
                    <div className="bg-primary/10 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                      <v.icon className="text-primary size-4" />
                    </div>
                    <div>
                      <p className="mb-1 text-[15px] font-semibold tracking-tight">
                        {v.title}
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {v.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Timeline ────────────────────────────────────────────────────── */}
      <Section size="default" variant="muted">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[2fr_5fr]">
            <p className="text-muted-foreground text-sm font-medium">History</p>
            <div>
              <h2 className="mb-10 font-serif text-2xl tracking-tight sm:text-3xl">
                Timeline
              </h2>
              <div className="space-y-0">
                {MILESTONES.map((m) => (
                  <div
                    className="border-border/40 relative flex gap-5 border-l py-4 pl-8"
                    key={m.event}
                  >
                    <div className="border-primary bg-background absolute top-5 -left-[5px] size-2.5 rounded-full border-2" />
                    <div>
                      <p className="text-primary mb-0.5 font-mono text-[11px] font-medium tracking-widest uppercase">
                        {m.year}
                      </p>
                      <p className="text-foreground/85 text-[15px] leading-snug">
                        {m.event}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Get involved ────────────────────────────────────────────────── */}
      <Section size="spacious" variant="default">
        <Container>
          <div className="bg-muted/30 flex flex-col items-center justify-between gap-8 rounded-2xl p-10 text-center sm:p-14 md:flex-row md:text-left">
            <div>
              <h2 className="mb-2 font-serif text-2xl tracking-tight sm:text-3xl">
                Get involved
              </h2>
              <p className="text-muted-foreground max-w-md">
                The community is open to everyone. All software is publicly
                available under open-source licenses.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button
                render={
                  <Link
                    href="https://discord.gg/linux"
                    rel="noopener noreferrer"
                    target="_blank"
                  />
                }
                size="lg"
              >
                Join on Discord
                <TbBrandDiscord className="ml-1.5 size-4" />
              </Button>
              <Button
                render={
                  <Link
                    href="https://github.com/allthingslinux"
                    rel="noopener noreferrer"
                    target="_blank"
                  />
                }
                size="lg"
                variant="outline"
              >
                GitHub
                <TbArrowUpRight className="ml-1.5 size-4" />
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
