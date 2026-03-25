import type { Metadata } from "next";

import { Badge } from "@atl/ui/components/badge";
import { Card } from "@atl/ui/components/card";
import {
  BookOpen,
  FileText,
  GitFork,
  GraduationCap,
  Heart,
  LifeBuoy,
  Lock,
  Server,
  Shield,
  Users,
  Users2,
} from "lucide-react";
import Link from "next/link";

import { Container, Section, SectionHeader } from "@/components/shell";

import { getPageMetadata } from "../metadata";

export const metadata: Metadata = getPageMetadata("about");

const PILLARS = [
  {
    description:
      "Knowledge should be free and accessible to everyone. Our wiki, guides, and resources exist so anyone can learn, wherever they are in their journey, through community-driven content, open archival of information, and lowering the barrier to entry for Linux adoption.",
    icon: GraduationCap,
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
      "Technology is at its most powerful when it's transparent, collaborative, and accessible. Everything we build is open source, because the future of Linux depends on self-hosted resources, community-driven innovation, and quality infrastructure.",
    icon: Server,
    title: "Technology",
  },
  {
    description:
      "Open source means nothing if the door feels closed. We make sure anyone who walks in gets the help and encouragement they need to keep going, through dedicated forums, a beginner-friendly culture, and staff trained to help.",
    icon: LifeBuoy,
    title: "Support",
  },
] as const;

const VALUES = [
  {
    description:
      "Treating everyone with kindness and consideration, free from discrimination — as outlined in our Code of Conduct.",
    icon: Heart,
    title: "Mutual respect",
  },
  {
    description:
      "Welcoming all members regardless of background or skill level. Every expert was once a beginner.",
    icon: Users2,
    title: "Inclusivity",
  },
  {
    description:
      "Fostering creative teamwork and open-source contributions — from our wiki and bot to self-hosted services.",
    icon: GitFork,
    title: "Collaboration",
  },
  {
    description:
      "Accountability and honesty in all operations. Staff and members alike learn from their mistakes.",
    icon: Shield,
    title: "Integrity",
  },
  {
    description:
      "Open moderation logs, transparent spending, public roadmap, and community decision voting.",
    icon: Lock,
    title: "Transparency",
  },
] as const;

const MILESTONES = [
  { event: "Server founded, acquired discord.gg/linux — 100K messages in 12 days", year: "Nov 2023" },
  { event: "501(c)(3) nonprofit status achieved", year: "Nov 2024" },
  {
    event: "Google, GitHub, Cloudflare & Okta partnerships secured",
    year: "Dec 2024",
  },
  {
    event: "Featured by Brodie Robertson — 25K+ views",
    year: "Apr 2025",
  },
  {
    event: "10,000 members — five months ahead of goal",
    year: "May 2025",
  },
  {
    event: "Survived multi-day DDoS attack with zero data loss",
    year: "Aug 2025",
  },
  { event: "atl.wiki 1.0 launched", year: "Aug 2025" },
  { event: "Tux v0.1.0 released — 110K+ LOC, 3.9K commits, 45 contributors", year: "Jan 2026" },
  { event: "20,000+ members and growing", year: "Feb 2026" },
] as const;

export default function About() {
  return (
    <main className="w-full">
      {/* ── Hero ── */}
      <Section size="hero" variant="brand">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              className="mb-5 border-primary/30 bg-primary/8 px-2.5 py-0.5 font-medium text-[10px] text-primary uppercase tracking-[0.16em]"
              variant="outline"
            >
              501(c)(3) nonprofit
            </Badge>
            <h1 className="font-bold font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.08] tracking-tight">
              About{" "}
              <span className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                All Things Linux
              </span>
            </h1>
            <p className="mt-4 text-balance text-lg text-foreground/90 sm:text-xl">
              A volunteer-powered nonprofit empowering people to explore, master,
              and shape Linux — through open education, community-built tools,
              and a welcoming social hub.
            </p>
          </div>
        </Container>
      </Section>

      {/* ── Origin story ── */}
      <Section size="default" variant="muted">
        <Container className="max-w-3xl">
          <p className="mb-3 text-center font-medium text-primary text-xs uppercase tracking-[0.2em]">
            Our story
          </p>
          <h2 className="mb-6 text-center font-bold font-display text-2xl tracking-tight sm:text-3xl md:text-4xl">
            From 200 members to 20,000+
          </h2>
          <div className="space-y-4 text-pretty text-[15px] text-foreground/85 leading-relaxed sm:text-base">
            <p>
              All Things Linux started in November 2023 after our founder got
              banned from another Linux community for calling out its problems.
              The first day, about 100 people showed up. A few weeks later, a
              random check on discord.gg/linux revealed someone had grabbed the
              handle — $100 in Bitcoin and a leap of faith later, it was ours.
              That changed everything: if we hold the Linux handle, we have to
              earn it.
            </p>
            <p>
              Within 12 days the server had exchanged 100,000 messages and hit
              the front page of Top.gg. Every member since has come through word
              of mouth — zero marketing, zero advertising, just people telling
              other people. Two years later we crossed 20,000 members and became
              a 501(c)(3) nonprofit.
            </p>
            <p>
              Today we operate with partners like Google, GitHub, Cloudflare,
              and Okta — securing over $50,000 per year in nonprofit benefits
              that keep our services free and our infrastructure
              community-owned, while running the entire operation on roughly
              $150/month in server costs. The first year was entirely
              self-funded.
            </p>
          </div>
        </Container>
      </Section>

      {/* ── Four pillars ── */}
      <Section size="default" variant="default">
        <SectionHeader
          description="Everything we do serves one goal: making Linux and free software more approachable, useful, and fun."
          eyebrow="What we do"
          title="Four pillars"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Education — top left */}
          <div className="overflow-hidden rounded-2xl border border-border/50 ">
            <div className="p-6 sm:p-8">
              <span className="font-mono text-[10px] text-primary/50 uppercase tracking-widest">01</span>
              <h3 className="mt-1 text-balance font-display text-lg font-bold tracking-tight">{PILLARS[0].title}</h3>
              <p className="mt-2 text-pretty text-sm text-muted-foreground leading-relaxed">
                {PILLARS[0].description}
              </p>
            </div>
          </div>

          {/* Community — top right */}
          <div className="overflow-hidden rounded-2xl border border-primary/20 ">
            <div className="p-6 sm:p-8">
              <span className="font-mono text-[10px] text-primary/50 uppercase tracking-widest">02</span>
              <h3 className="mt-1 text-balance font-display text-lg font-bold tracking-tight">{PILLARS[1].title}</h3>
              <p className="mt-2 text-pretty text-sm text-muted-foreground leading-relaxed">
                {PILLARS[1].description}
              </p>
            </div>
          </div>

          {/* Technology — bottom left */}
          <div className="overflow-hidden rounded-2xl border border-border/50 ">
            <div className="p-6 sm:p-8">
              <span className="font-mono text-[10px] text-primary/50 uppercase tracking-widest">03</span>
              <h3 className="mt-1 text-balance font-display text-lg font-bold tracking-tight">{PILLARS[2].title}</h3>
              <p className="mt-2 text-pretty text-sm text-muted-foreground leading-relaxed">
                {PILLARS[2].description}
              </p>
            </div>
          </div>

          {/* Support — bottom right */}
          <div className="overflow-hidden rounded-2xl border border-border/50 ">
            <div className="p-6 sm:p-8">
              <span className="font-mono text-[10px] text-primary/50 uppercase tracking-widest">04</span>
              <h3 className="mt-1 text-balance font-display text-lg font-bold tracking-tight">{PILLARS[3].title}</h3>
              <p className="mt-2 text-pretty text-sm text-muted-foreground leading-relaxed">
                {PILLARS[3].description}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Values ── */}
      <Section size="default" variant="muted">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 flex items-end justify-between md:mb-14">
            <div>
              <p className="mb-2 font-medium text-primary text-xs uppercase tracking-[0.2em]">
                How we operate
              </p>
              <h2 className="font-bold font-display text-2xl tracking-tight sm:text-3xl md:text-4xl">
                Our values
              </h2>
            </div>
            <Link
              className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-4 py-2.5 text-[13px] font-medium text-foreground/80 transition-colors hover:bg-muted/50 hover:text-foreground"
              href="/code-of-conduct"
            >
              <FileText aria-hidden className="size-4 text-primary" strokeWidth={2} />
              Code of Conduct
            </Link>
          </div>

          <div className="divide-y divide-border/40">
            {VALUES.map((v, i) => (
              <div
                className="grid grid-cols-[2rem_1fr] gap-4 py-5 sm:grid-cols-[2rem_1fr_2fr] sm:gap-8 sm:py-6"
                key={v.title}
              >
                <span className="font-mono text-xs text-primary/40 pt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-semibold text-[15px] tracking-tight sm:text-base">
                  {v.title}
                </p>
                <p className="col-start-2 text-pretty text-[13px] text-muted-foreground leading-relaxed sm:col-start-3 sm:text-sm">
                  {v.description}
                </p>
              </div>
            ))}
          </div>


        </div>
      </Section>

      {/* ── Timeline ── */}
      <Section size="default" variant="dots">
        <SectionHeader
          description="Key moments from two years of community-driven growth."
          eyebrow="Milestones"
          title="How we got here"
        />
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-x-8 md:grid-cols-4">
            {MILESTONES.map((m, i) => {
              const isEven = i % 2 === 0;
              return (
                <div
                  className={`relative flex flex-col ${isEven ? "mt-0" : "mt-16"} pb-8`}
                  key={m.event}
                >
                  {/* Node */}
                  <div className="mb-3 flex size-6 items-center justify-center rounded-full border-2 border-primary bg-background">
                    <div className="size-2 rounded-full bg-primary" />
                  </div>
                  <p className="mb-1 font-mono text-[10px] font-medium text-primary uppercase tracking-widest">
                    {m.year}
                  </p>
                  <p className="text-pretty text-[13px] text-foreground/80 leading-snug sm:text-sm">
                    {m.event}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section size="default" variant="default">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/8 via-background to-chart-2/6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-chart-2/8 blur-3xl"
          />
          <div className="relative z-10 px-6 py-12 text-center sm:px-12 sm:py-14">
            <p className="mx-auto mb-5 max-w-lg text-balance text-muted-foreground text-sm leading-relaxed sm:text-base">
              Fiscal sponsorship for FOSS projects. Free infrastructure for
              developers in need. Grant programs for open-source development.
              Community-driven. Radically transparent.
            </p>
            <h2 className="font-bold font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
              Join the movement
            </h2>
          </div>
        </div>
      </Section>
    </main>
  );
}
