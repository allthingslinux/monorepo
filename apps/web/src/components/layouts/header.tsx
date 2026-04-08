"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ChevronRight,
  FileText,
  Globe,
  Heart,
  MenuIcon,
  MessageCircle,
  MoonIcon,
  Newspaper,
  Server,
  SunIcon,
  Terminal,
  Users,
  Wrench,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PiLinuxLogoBold } from "react-icons/pi";
import { TbBrandDiscord } from "react-icons/tb";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@atl/ui/components/accordion";
import { Button } from "@atl/ui/components/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@atl/ui/components/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@atl/ui/components/sheet";

/* ─── Menu data ─────────────────────────────────────────────────────────────── */

interface MenuLink {
  title: string;
  href: string;
  description: string;
  icon:
    | LucideIcon
    | React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  external?: boolean;
}

interface DropdownMenu {
  label: string;
  links: MenuLink[];
}

const DROPDOWN_MENUS: DropdownMenu[] = [
  {
    label: "Projects",
    links: [
      {
        title: ".gg/linux",
        href: "https://discord.gg/linux",
        description: "Our Discord community hub",
        icon: TbBrandDiscord,
        color: "#5865F2",
        external: true,
      },
      {
        title: "atl.wiki",
        href: "https://atl.wiki",
        description: "Guides & references",
        icon: BookOpen,
        color: "#10b981",
        external: true,
      },
      {
        title: "atl.tools",
        href: "https://atl.tools",
        description: "Curated Linux tools",
        icon: Wrench,
        color: "#f59e0b",
        external: true,
      },
      {
        title: "atl.chat",
        href: "https://atl.chat",
        description: "IRC & XMPP bridge",
        icon: MessageCircle,
        color: "#3b82f6",
        external: true,
      },
      {
        title: "tux",
        href: "https://github.com/allthingslinux/tux",
        description: "Our Discord bot",
        icon: PiLinuxLogoBold,
        color: "#f97316",
        external: true,
      },
      {
        title: "atl.sh",
        href: "https://atl.sh",
        description: "Community pubnix",
        icon: Terminal,
        color: "#8b5cf6",
        external: true,
      },
      {
        title: "Portal",
        href: "https://id.allthingslinux.org",
        description: "Identity & accounts",
        icon: Server,
        color: "#6366f1",
        external: true,
      },
    ],
  },
  {
    label: "Community",
    links: [
      {
        title: "About",
        href: "/about",
        description: "Our story & mission",
        icon: Globe,
        color: "#3b82f6",
      },
      {
        title: "Blog",
        href: "/blog",
        description: "News & updates",
        icon: Newspaper,
        color: "#f97316",
      },
      {
        title: "Contribute",
        href: "/contribute",
        description: "Support our mission",
        icon: Heart,
        color: "#ef4444",
      },
      {
        title: "Apply",
        href: "/apply",
        description: "Join the team",
        icon: Users,
        color: "#10b981",
      },
      {
        title: "Open",
        href: "/open",
        description: "Transparency dashboard",
        icon: FileText,
        color: "#f59e0b",
      },
      {
        title: "Code of Conduct",
        href: "/code-of-conduct",
        description: "Community guidelines",
        icon: BookOpen,
        color: "#8b5cf6",
      },
    ],
  },
];

const PLAIN_LINKS: { label: string; href: string }[] = [];

/* ─── Shared sub-link ───────────────────────────────────────────────────────── */

function MenuSubLink({
  link,
  onClick,
}: {
  link: MenuLink;
  onClick?: () => void;
}) {
  const isExternal = link.external;
  return (
    <Link
      className="hover:bg-muted flex w-full items-center gap-3 rounded-lg px-2.5 py-2 transition-colors"
      href={link.href as Route}
      onClick={onClick}
      rel={isExternal ? "noopener noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      <link.icon
        className="size-[18px] shrink-0"
        style={{ color: link.color }}
      />
      <div className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-[13px] leading-none font-medium">
          {link.title}
        </span>
        <span className="text-muted-foreground/80 mt-0.5 block truncate text-[11px] leading-tight">
          {link.description}
        </span>
      </div>
      <ChevronRight className="text-muted-foreground/50 ml-auto size-3.5 shrink-0" />
    </Link>
  );
}

/* ─── Components ────────────────────────────────────────────────────────────── */

function Logo() {
  return (
    <Link className="flex items-center gap-2" href="/">
      <span className="font-display text-foreground text-lg font-bold tracking-tight sm:text-xl">
        All Things Linux
      </span>
    </Link>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="size-8" />;
  }

  return (
    <Button
      className="text-muted-foreground hover:text-foreground size-8"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      size="sm"
      variant="ghost"
    >
      {resolvedTheme === "dark" ? (
        <SunIcon className="size-4" />
      ) : (
        <MoonIcon className="size-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

/* ─── Desktop Navigation ────────────────────────────────────────────────────── */

function DesktopNavigation() {
  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        {DROPDOWN_MENUS.map((menu) => (
          <NavigationMenuItem key={menu.label}>
            <NavigationMenuTrigger className="text-muted-foreground hover:bg-muted! hover:text-foreground! data-popup-open:bg-muted! data-open:bg-muted! bg-transparent px-3 py-1.5 text-sm font-normal">
              {menu.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent className="p-0!">
              <ul className="grid w-lg grid-cols-2 gap-1 p-2.5">
                {menu.links.map((link) => (
                  <li key={link.title}>
                    <MenuSubLink link={link} />
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}

        {PLAIN_LINKS.map((link) => (
          <NavigationMenuItem key={link.label}>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "text-muted-foreground bg-transparent px-3 py-1.5 text-sm font-normal"
              )}
              render={<Link href={link.href as Route} />}
            >
              {link.label}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

/* ─── Mobile Navigation ─────────────────────────────────────────────────────── */

function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger
        className="lg:hidden"
        render={<Button size="icon-sm" variant="ghost" />}
      >
        <MenuIcon className="size-5" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent
        className="border-border/40 bg-background w-[300px]"
        side="right"
      >
        <SheetHeader className="border-border/40 mb-4 border-b pb-4">
          <SheetTitle className="font-display text-left">
            All Things Linux
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4">
          <Accordion>
            {DROPDOWN_MENUS.map((menu) => (
              <AccordionItem key={menu.label} value={menu.label}>
                <AccordionTrigger className="text-muted-foreground py-3 text-sm font-medium hover:no-underline">
                  {menu.label}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-0.5 pb-2">
                    {menu.links.map((link) => (
                      <MenuSubLink
                        key={link.title}
                        link={link}
                        onClick={handleClose}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="border-border/40 mt-2 border-t pt-4">
            <Button
              className="w-full text-sm font-medium"
              onClick={handleClose}
              render={<Link href="/contribute" />}
              size="sm"
              variant="default"
            >
              Contribute
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Header ────────────────────────────────────────────────────────────────── */

export default function Header() {
  return (
    <header className="pointer-events-none fixed top-0 right-0 left-0 z-50 flex justify-center">
      <div className="border-border/20 bg-nav pointer-events-auto flex h-14 w-full max-w-4xl items-center justify-between rounded-b-2xl border-x border-b px-5 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <DesktopNavigation />
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <Button
              className="text-sm font-medium"
              render={<Link href="/contribute" />}
              size="sm"
              variant="default"
            >
              Contribute
            </Button>
          </div>
          <ThemeToggle />
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
