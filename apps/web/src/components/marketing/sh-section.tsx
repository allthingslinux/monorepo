import {
  Fingerprint,
  Gamepad2,
  Globe,
  MessageCircle,
  Terminal,
} from "lucide-react";

import { Section } from "@/components/shell";
import { cn } from "@/lib/utils";
import { Button } from "@atl/ui/components/button";

const TOP_FEATURES = [
  {
    title: "A shared server experience.",
    description: (
      <>
        30+ languages, 10+ shells, generous resource quotas — plus all the other
        bells and whistles, in the spirit of pubnix, through SSH/FTP.
      </>
    ),
    icon: Terminal,
    color: "#9ece6a",
  },
  {
    title: "Your corner of the internet.",
    description: (
      <>
        A personal homepage at{" "}
        <code className="bg-muted text-primary rounded-md px-1.5 py-0.5 font-mono text-[0.85em]">
          atl.sh/~you
        </code>{" "}
        — served over HTTP, Gemini, and Gopher; connected through a community
        webring.
      </>
    ),
    icon: Globe,
    color: "#7aa2f7",
  },
];

const BOTTOM_FEATURES = [
  {
    title: "Retro gaming revived.",
    description:
      "Climb the NetHack leaderboard, grow a botany garden, or dive into 40+ BSD classics.",
    icon: Gamepad2,
    color: "#bb9af7",
  },
  {
    title: "Chat from the shell.",
    description:
      "WeeChat, irssi, and profanity are pre-installed. Connect to our IRC and XMPP directly from the terminal.",
    icon: MessageCircle,
    color: "#73daca",
  },
  {
    title: "The original microblog since 1971.",
    description: (
      <>
        Share what you&apos;re working on and keep up to date with others,
        powered by{" "}
        <code className="bg-muted text-primary rounded-md px-1.5 py-0.5 font-mono text-[0.85em]">
          efingerd
        </code>
        .
      </>
    ),
    icon: Fingerprint,
    color: "#e0af68",
  },
];

function DashedLine({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const isH = orientation === "horizontal";
  return (
    <div
      className={cn(
        "text-muted-foreground/40 relative",
        isH ? "h-px w-full" : "h-full w-px",
        className
      )}
    >
      <div
        className={cn(
          isH
            ? "h-px w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,currentColor_4px,currentColor_10px)] mask-[linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]"
            : "h-full w-px bg-[repeating-linear-gradient(180deg,transparent,transparent_4px,currentColor_4px,currentColor_8px)] mask-[linear-gradient(180deg,transparent,black_15%,black_85%,transparent)]"
        )}
      />
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  color,
  isLast = false,
}: {
  title: string;
  description: React.ReactNode;
  icon: typeof Terminal;
  color: string;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex flex-col px-0 py-6 md:px-8 md:py-10">
      <div
        className="mb-4 flex size-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="size-5" style={{ color }} />
      </div>
      <div className="max-w-md">
        <h3 className="inline font-semibold">{title} </h3>
        <span className="text-muted-foreground font-medium">{description}</span>
      </div>
      {!isLast && (
        <>
          <DashedLine
            orientation="vertical"
            className="absolute top-0 right-0 max-md:hidden"
          />
          <DashedLine
            orientation="horizontal"
            className="absolute inset-x-0 bottom-0 md:hidden"
          />
        </>
      )}
    </div>
  );
}

export function ShSection() {
  return (
    <Section
      size="default"
      variant="muted"
      containerClassName="max-w-screen-xl"
      id="atl-sh"
      className="bg-card"
    >
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
        <div>
          <p className="text-primary mb-3 text-xs font-medium tracking-[0.2em] uppercase">
            atl.sh
          </p>
          <h2 className="font-display max-w-2xl text-2xl font-bold tracking-tight text-balance sm:text-3xl md:text-4xl">
            A modern take on the classic pubnix
          </h2>
        </div>
        <Button
          className="bg-muted text-muted-foreground rounded-full px-6 shadow-none"
          disabled
          size="lg"
          type="button"
          variant="secondary"
        >
          Coming soon
        </Button>
      </div>

      <DashedLine orientation="horizontal" />

      {/* Top row — 2 features */}
      <div className="relative grid max-md:grid-cols-1 md:grid-cols-2">
        {TOP_FEATURES.map((f, i) => (
          <FeatureCard
            key={f.title}
            {...f}
            isLast={i === TOP_FEATURES.length - 1}
          />
        ))}
      </div>

      <DashedLine orientation="horizontal" />

      {/* Bottom row — 3 features */}
      <div className="relative grid max-md:grid-cols-1 md:grid-cols-3">
        {BOTTOM_FEATURES.map((f, i) => (
          <FeatureCard
            key={f.title}
            {...f}
            isLast={i === BOTTOM_FEATURES.length - 1}
          />
        ))}
      </div>

      <DashedLine orientation="horizontal" />
    </Section>
  );
}
