import {
  ArrowRight,
  DiscIcon as Discord,
  Globe,
  HeartHandshake,
  Link2,
  MessageCircle,
  MessagesSquare,
  Network,
  Share2,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Status = "live" | "managed" | "planned";

const STATUS_CLASS: Record<Status, string> = {
  live: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
  managed: "border-sky-500/35 bg-sky-500/10 text-sky-300",
  planned: "border-amber-500/35 bg-amber-500/10 text-amber-300",
};

const webClients = [
  {
    description:
      "Quick browser IRC with ATL defaults preloaded. No client setup needed.",
    href: "https://irc.atl.chat",
    name: "ObsidianIRC",
    status: "live" as const,
  },
  {
    description:
      "Always-on web IRC with backlog and persistent sessions for regular users.",
    href: "https://webirc.atl.chat",
    name: "The Lounge",
    status: "managed" as const,
  },
  {
    description:
      "Browser XMPP chat for ATL rooms when you prefer web over native clients.",
    href: "https://webxmpp.atl.chat",
    name: "Fluux Messenger",
    status: "live" as const,
  },
];

const usageHighlights = [
  {
    detail:
      "Pick Discord, IRC, XMPP, or a web client and still stay in the same ATL conversation flow.",
    name: "Choose your chat style",
    stack: "Use what you already like",
  },
  {
    detail:
      "Use your own client, or join directly from the browser with ObsidianIRC, The Lounge, or Fluux.",
    name: "Get in fast",
    stack: "No lock-in required",
  },
  {
    detail:
      "New users can start on Discord instantly, then move to IRC/XMPP later without leaving the community.",
    name: "Grow at your pace",
    stack: "Beginner-friendly onboarding",
  },
  {
    detail:
      "Web clients make it easy to chat from shared computers, mobile browsers, or constrained environments.",
    name: "Chat from anywhere",
    stack: "Browser-first options",
  },
];

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <header className="border-border/60 border-b">
        <div className="mx-auto flex h-16 w-full max-w-[1320px] items-center justify-between px-4 sm:px-6">
          <Link className="flex items-center gap-2 font-semibold" href="/">
            <MessageCircle className="text-primary h-5 w-5" />
            atl.chat
          </Link>
          <Button asChild size="sm" variant="outline">
            <Link href="https://github.com/allthingslinux/atl.chat">
              View stack repo
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1320px] px-4 py-10 sm:px-6 sm:py-14">
        <section className="border-border/70 bg-card/40 rounded-2xl border p-6 sm:p-10">
          <Badge
            className="border-primary/35 bg-primary/15 text-primary-foreground"
            variant="outline"
          >
            Chat your way
          </Badge>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Join ATL chat on Discord, IRC, XMPP, or the web.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-base sm:text-lg">
            Use the platform you already prefer. atl.chat connects multiple chat
            systems so you can participate in the same community conversations
            without changing your entire workflow.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="https://discord.gg/linux">
                Join Discord
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="https://github.com/allthingslinux/atl.chat">
                Status + project docs
              </Link>
            </Button>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Network className="text-primary h-4 w-4" />
            <h2 className="text-2xl font-semibold">Integrations</h2>
          </div>
          <Card className="border-border/70 bg-card/70 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl">
                One community across three chat protocols
              </CardTitle>
              <CardDescription>
                Pick your preferred client and platform. Core rooms are mapped
                so members can meet in one shared conversation space.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-12">
                <Card className="border-emerald-500/30 bg-emerald-500/8 md:col-span-4">
                  <CardContent className="p-4">
                    <div className="border-border/60 relative h-36 overflow-hidden rounded-xl border bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.22),rgba(5,10,18,0.98)_60%)]">
                      <div className="absolute top-5 left-4 h-16 w-16 rounded-full border border-emerald-300/40 bg-emerald-300/15 blur-[1px]" />
                      <div className="bg-background/70 absolute right-5 bottom-4 h-10 w-24 rounded-full border border-emerald-300/35" />
                    </div>
                    <p className="text-muted-foreground mt-4 text-xs">01</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <MessagesSquare className="h-4 w-4 text-emerald-300" />
                        IRC
                      </CardTitle>
                      <Badge className={STATUS_CLASS.live} variant="outline">
                        live
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                      A classic experience with modern IRCv3 support, powered by
                      UnrealIRCd and Atheme Services.
                    </p>
                    <p className="border-border/60 bg-background/70 mt-3 rounded-md border px-3 py-2 font-mono text-xs">
                      irc.atl.chat:6697
                    </p>
                    <Button asChild className="mt-3 w-full" variant="secondary">
                      <Link href="ircs://irc.atl.chat:6697">Open IRC</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-violet-500/30 bg-violet-500/8 md:col-span-4">
                  <CardContent className="p-4">
                    <div className="border-border/60 relative h-36 overflow-hidden rounded-xl border bg-[radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.24),rgba(8,10,22,0.98)_62%)]">
                      <div className="absolute top-4 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full border border-violet-300/40 bg-violet-300/20" />
                      <div className="absolute right-8 bottom-5 h-2 w-16 rounded-full bg-violet-300/40" />
                      <div className="absolute bottom-5 left-8 h-2 w-20 rounded-full bg-violet-300/25" />
                    </div>
                    <p className="text-muted-foreground mt-4 text-xs">02</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Discord className="h-4 w-4 text-violet-300" />
                        Discord
                      </CardTitle>
                      <Badge className={STATUS_CLASS.live} variant="outline">
                        live
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                      Our current home of 20K+ Linux enthusiasts - moderated,
                      bridged and first in line for support.
                    </p>
                    <p className="border-border/60 bg-background/70 mt-3 rounded-md border px-3 py-2 font-mono text-xs">
                      discord.gg/linux
                    </p>
                    <Button asChild className="mt-3 w-full" variant="secondary">
                      <Link href="https://discord.gg/linux">Join Discord</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-sky-500/30 bg-sky-500/8 md:col-span-4">
                  <CardContent className="p-4">
                    <div className="border-border/60 relative h-36 overflow-hidden rounded-xl border bg-[radial-gradient(circle_at_65%_35%,rgba(14,165,233,0.22),rgba(6,10,20,0.98)_62%)]">
                      <div className="absolute top-6 right-6 h-14 w-14 rounded-full border border-sky-300/40 bg-sky-300/15" />
                      <div className="bg-background/70 absolute bottom-4 left-4 h-9 w-20 rounded-full border border-sky-300/35" />
                    </div>
                    <p className="text-muted-foreground mt-4 text-xs">03</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Share2 className="h-4 w-4 text-sky-300" />
                        XMPP
                      </CardTitle>
                      <Badge className={STATUS_CLASS.live} variant="outline">
                        live
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                      100% compliant XMPP and MUC, powered by Prosody with all
                      the bells and whistles.
                    </p>
                    <p className="border-border/60 bg-background/70 mt-3 rounded-md border px-3 py-2 font-mono text-xs">
                      general@muc.atl.chat
                    </p>
                    <Button asChild className="mt-3 w-full" variant="secondary">
                      <Link href="xmpp:general@muc.atl.chat">Open XMPP</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <div className="border-primary/25 bg-card/60 mt-4 rounded-lg border p-4 text-sm">
                <p className="text-muted-foreground flex flex-wrap items-center gap-2">
                  <span className="text-foreground font-medium">Bridge:</span>
                  <Badge variant="outline">IRC</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="outline">Discord</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="outline">XMPP</Badge>
                  <span className="ml-1">mapped rooms stay in sync.</span>
                </p>
              </div>
              <div className="border-border/70 bg-card/60 mt-4 rounded-lg border p-4 text-sm">
                <p className="text-muted-foreground">
                  <span className="text-foreground font-medium">
                    Portal account required for IRC/XMPP:
                  </span>{" "}
                  IRC and XMPP identities are provisioned through ATL Portal. If
                  you want IRC or XMPP access, create an account first at{" "}
                  <Link
                    className="hover:text-foreground underline underline-offset-4"
                    href="https://portal.allthingslinux.org/auth/sign-up"
                  >
                    portal.allthingslinux.org
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="text-primary h-4 w-4" />
            <h2 className="text-2xl font-semibold">Web clients</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {webClients.map((client) => (
              <Card className="border-border/70 bg-card/70" key={client.name}>
                <CardHeader>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <Badge
                      className={STATUS_CLASS[client.status]}
                      variant="outline"
                    >
                      {client.status}
                    </Badge>
                  </div>
                  <CardDescription>{client.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="secondary">
                    <Link href={client.href}>Open {client.name}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <HeartHandshake className="text-primary h-4 w-4" />
            <h2 className="text-2xl font-semibold">Why users like atl.chat</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {usageHighlights.map((service) => (
              <Card className="border-border/70 bg-card/70" key={service.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription>{service.stack}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {service.detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-border/60 border-t">
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-4 py-4 sm:px-6">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} All Things Linux
          </p>
          <Link
            className="text-muted-foreground text-sm underline-offset-4 hover:underline"
            href="https://github.com/allthingslinux/atl.chat"
          >
            Source
          </Link>
        </div>
      </footer>
    </div>
  );
}
