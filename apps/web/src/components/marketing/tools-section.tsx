"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import {
  ArrowLeftRight,
  Braces,
  ClipboardPaste,
  FileText,
  FlaskConical,
  Newspaper,
  Search,
  Terminal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { TbArrowUpRight } from "react-icons/tb";

import { Section } from "@/components/shell";
import { Button } from "@atl/ui/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@atl/ui/components/carousel";

const ICON_MAP: Record<string, LucideIcon> = {
  ArrowLeftRight,
  Braces,
  ClipboardPaste,
  FileText,
  FlaskConical,
  Newspaper,
  Search,
  Terminal,
};

const TOOLS = [
  {
    name: "PrivateBin",
    description: "Zero-knowledge encrypted paste",
    icon: "ClipboardPaste",
    url: "https://paste.atl.tools",
    color: "#e0af68",
  },
  {
    name: "CyberChef",
    description: "300+ data wrangling operations",
    icon: "FlaskConical",
    url: "https://cyberchef.atl.tools",
    color: "#9ece6a",
  },
  {
    name: "ConvertX",
    description: "Self-hosted file converter",
    icon: "ArrowLeftRight",
    url: "https://convert.atl.tools",
    color: "#7aa2f7",
  },
  {
    name: "SearXNG",
    description: "Private metasearch engine",
    icon: "Search",
    url: "https://search.atl.tools",
    color: "#2ac3de",
  },
  {
    name: "IT-Tools",
    description: "Developer & sysadmin toolbox",
    icon: "Terminal",
    url: "https://it.atl.tools",
    color: "#bb9af7",
  },
  {
    name: "JSON Crack",
    description: "Visualize structured data",
    icon: "Braces",
    url: "https://json.atl.tools",
    color: "#ff9e64",
  },
  {
    name: "hckrnws",
    description: "Clean HackerNews reader",
    icon: "Newspaper",
    url: "https://hn.atl.tools",
    color: "#73daca",
  },
  {
    name: "Stirling PDF",
    description: "PDF Swiss Army Knife",
    icon: "FileText",
    url: "https://pdf.atl.tools",
    color: "#f7768e",
  },
] as const;

const col1 = TOOLS.slice(0, 4);
const col2 = TOOLS.slice(4);

function ToolCard({ tool }: { tool: (typeof TOOLS)[number] }) {
  const Icon = ICON_MAP[tool.icon];
  return (
    <a
      className="border-border/50 bg-card hover:border-border flex flex-col rounded-xl border p-5 transition-colors md:p-6"
      href={tool.url}
      rel="noopener noreferrer"
      target="_blank"
    >
      {Icon && (
        <Icon className="mb-4 size-7 md:size-9" style={{ color: tool.color }} />
      )}
      <h3 className="mb-1 text-sm font-semibold md:text-base">{tool.name}</h3>
      <p className="text-muted-foreground text-xs md:text-sm">
        {tool.description}
      </p>
    </a>
  );
}

function ScrollColumn({
  tools,
  speed,
  reverse = false,
  startIndex = 0,
}: {
  tools: readonly (typeof TOOLS)[number][];
  speed: number;
  reverse?: boolean;
  startIndex?: number;
}) {
  const plugin = useRef(
    AutoScroll({
      speed,
      startDelay: 0,
      direction: reverse ? "backward" : "forward",
    })
  );
  // Triple for seamless loop
  const items = [...tools, ...tools, ...tools].map((tool, i) => ({
    ...tool,
    _key: `${tool.name}-${i}`,
  }));

  return (
    <Carousel
      opts={{ loop: true, align: "start", startIndex }}
      plugins={[plugin.current]}
      orientation="vertical"
      className="pointer-events-none"
    >
      <CarouselContent className="max-h-[500px]">
        {items.map((tool) => (
          <CarouselItem key={tool._key} className="pointer-events-auto">
            <ToolCard tool={tool} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

export function ToolsSection() {
  return (
    <Section size="spacious" variant="default" id="atl-tools">
      <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-20">
        {/* Left — text */}
        <div className="flex flex-col items-start">
          <p className="text-primary mb-3 text-xs font-medium tracking-[0.2em] uppercase">
            atl.tools
          </p>
          <h2 className="font-display mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Self-hosted tools, free for everyone
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md leading-relaxed text-pretty">
            No ads, no tracking, no data harvesting. Open-source tools that
            respect your privacy — hosted by the community, for the community.
          </p>
          <Button
            render={
              <Link
                href="https://atl.tools"
                rel="noopener noreferrer"
                target="_blank"
              />
            }
            size="lg"
          >
            Explore atl.tools
            <TbArrowUpRight className="ml-1.5 size-4" />
          </Button>
        </div>

        {/* Right — scrolling tool cards */}
        <div className="relative">
          <div className="grid gap-4 lg:grid-cols-2">
            <ScrollColumn tools={col1} speed={0.6} />
            <ScrollColumn tools={col2} speed={0.6} reverse startIndex={2} />
          </div>
          {/* Top/bottom fade */}
          <div className="from-background pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b to-transparent" />
          <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t to-transparent" />
        </div>
      </div>
    </Section>
  );
}
