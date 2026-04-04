import {
  Accessibility,
  GitBranch,
  Handshake,
  Layers,
  Monitor,
  Package,
  Ruler,
  Scale,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { TbArrowUpRight } from "react-icons/tb";

import { Section } from "@/components/shell";
import { Badge } from "@atl/ui/components/badge";
import { Button } from "@atl/ui/components/button";
import { Card } from "@atl/ui/components/card";

interface WikiArticle {
  title: string;
  description: string;
  href: string;
  category: string;
  icon: LucideIcon;
  color: string;
  linkText?: string;
}

const ARTICLES: WikiArticle[] = [
  {
    title: "Linux Distributions",
    description:
      "High-level overviews across Arch, Fedora, Debian, NixOS, and more to help you find the right fit.",
    href: "https://atl.wiki/Linux_Distributions",
    category: "Category",
    icon: Layers,
    color: "#bb9af7",
  },
  {
    title: "Desktop Environments",
    description: "GNOME, KDE, XFCE, and beyond — compare and choose.",
    href: "https://atl.wiki/Desktop_Environments",
    category: "Category",
    icon: Monitor,
    color: "#7aa2f7",
  },
  {
    title: "Git",
    description:
      "Version control essentials — branches, merges, and workflows.",
    href: "https://atl.wiki/Git",
    category: "Article",
    icon: GitBranch,
    color: "#f7768e",
    linkText: "Read",
  },
  {
    title: "Package Managers",
    description: "apt, pacman, dnf, nix — how they work and differ.",
    href: "https://atl.wiki/Package_Manager",
    category: "Category",
    icon: Package,
    color: "#e0af68",
  },
];

const STATS = [
  { value: "327", label: "Pages" },
  { value: "4,354", label: "Edits" },
  { value: "273", label: "Authors" },
];

export function WikiSection() {
  return (
    <Section size="default" variant="muted" id="atl-wiki">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
        <div>
          <p className="text-primary mb-3 text-xs font-medium tracking-[0.2em] uppercase">
            atl.wiki
          </p>
          <h2 className="font-display max-w-lg text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Articles, guides & resources for all skill levels
          </h2>
        </div>
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-semibold">
            {STATS[0].value}
          </span>{" "}
          pages ·{" "}
          <span className="text-foreground font-semibold">
            {STATS[1].value}
          </span>{" "}
          edits ·{" "}
          <span className="text-foreground font-semibold">
            {STATS[2].value}
          </span>{" "}
          authors
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* About card — not a link */}
        <Card className="border-border/50 bg-card flex flex-col justify-between rounded-xl p-5 lg:col-span-2 lg:p-6">
          <div>
            <h3 className="font-display mb-2 text-xl font-bold tracking-tight sm:text-2xl">
              Learn, contribute, grow
            </h3>
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed text-pretty">
              A centralized, easy-to-use reference for the Linux and FOSS
              ecosystem. Clear overviews, practical guides, and community-driven
              content — complementing existing docs by connecting concepts
              across distributions and tools. Anyone can edit, and everything is
              licensed under CC BY-SA 4.0.
            </p>
          </div>
          <div className="mt-5">
            <p className="text-muted-foreground/50 mb-2 text-[9px] font-medium tracking-widest uppercase">
              Key Values
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <Target className="size-3" /> Accuracy
                </span>
                <span className="flex items-center gap-1.5">
                  <Scale className="size-3" /> Impartiality
                </span>
                <span className="flex items-center gap-1.5">
                  <Ruler className="size-3" /> Consistency
                </span>
                <span className="flex items-center gap-1.5">
                  <Handshake className="size-3" /> Courtesy
                </span>
                <span className="flex items-center gap-1.5">
                  <Accessibility className="size-3" /> Accessibility
                </span>
              </div>
              <Button
                render={
                  <Link
                    href="https://atl.wiki"
                    rel="noopener noreferrer"
                    target="_blank"
                  />
                }
                size="default"
              >
                Visit atl.wiki
                <TbArrowUpRight className="ml-1.5 size-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Smaller article cards */}
        {ARTICLES.slice(0, 2).map((article) => (
          <a
            className="group"
            href={article.href}
            key={article.title}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Card className="border-border/50 bg-card hover:border-primary/30 flex h-full flex-col justify-between rounded-xl p-4 transition-colors">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className="flex size-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${article.color}15` }}
                  >
                    <article.icon
                      className="size-4"
                      style={{ color: article.color }}
                    />
                  </div>
                  <Badge
                    className="border-border/50 bg-muted/50 text-muted-foreground text-[10px]"
                    variant="outline"
                  >
                    {article.category}
                  </Badge>
                </div>
                <h3 className="mb-1.5 text-[15px] font-semibold tracking-tight">
                  {article.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {article.description}
                </p>
              </div>
              <p className="text-foreground mt-4 text-xs font-medium group-hover:underline">
                {article.linkText ?? "Browse"} →
              </p>
            </Card>
          </a>
        ))}

        {/* Bottom row — remaining cards */}
        {ARTICLES.slice(2).map((article) => (
          <a
            className="group"
            href={article.href}
            key={article.title}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Card className="border-border/50 bg-card hover:border-primary/30 flex h-full flex-col justify-between rounded-xl p-4 transition-colors">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className="flex size-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${article.color}15` }}
                  >
                    <article.icon
                      className="size-4"
                      style={{ color: article.color }}
                    />
                  </div>
                  <Badge
                    className="border-border/50 bg-muted/50 text-muted-foreground text-[10px]"
                    variant="outline"
                  >
                    {article.category}
                  </Badge>
                </div>
                <h3 className="mb-1.5 text-[15px] font-semibold tracking-tight">
                  {article.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {article.description}
                </p>
              </div>
              <p className="text-foreground mt-4 text-xs font-medium group-hover:underline">
                {article.linkText ?? "Browse"} →
              </p>
            </Card>
          </a>
        ))}
      </div>
    </Section>
  );
}
