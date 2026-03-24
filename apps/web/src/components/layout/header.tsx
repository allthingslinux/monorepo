"use client";

import { Button } from "@atl/ui/components/button";
import { buttonVariants } from "@atl/ui/components/button-variants";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@atl/ui/components/sheet";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

// Define navigation items
const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "CoC", href: "/code-of-conduct" },
  { name: "Blog", href: "/blog" },
  { name: "Wiki", href: "https://atl.wiki" },
  { name: "Tools", href: "https://atl.tools" },
  { name: "Open", href: "/open" },
  { name: "Apply", href: "/apply" },
];

// Logo component
const Logo = () => (
  <Link className="mr-6 flex items-center" href="/">
    <span className="font-bold text-foreground text-lg tracking-tight sm:text-xl md:text-2xl lg:text-3xl">
      All Things Linux
    </span>
  </Link>
);

// Desktop NavLink component
const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname?.startsWith(href));
  const isExternal = href.startsWith("http");

  return (
    <Link
      className={cn(
        "relative rounded-full px-4 py-2 text-sm transition-all",
        isActive
          ? "bg-primary/10 font-medium text-primary"
          : "font-normal text-foreground/90 hover:bg-background/80 hover:text-foreground"
      )}
      href={href}
      rel={isExternal ? "noopener noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      {children}
    </Link>
  );
};

// Desktop navigation component
const DesktopNavigation = () => (
  <div className="hidden items-center rounded-full border border-border/30 bg-card/40 px-1.5 py-1.5 backdrop-blur-sm md:flex">
    {navItems.map((item) => (
      <NavLink href={item.href} key={item.name}>
        {item.name}
      </NavLink>
    ))}
  </div>
);

// CTA button component
const CTAButton = ({ className }: { className?: string }) => (
  <Link href="/contribute">
    <Button
      className={cn(
        "rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground",
        "transition-all duration-300 hover:scale-105 hover:bg-primary/90",
        className
      )}
      size="default"
      variant="default"
    >
      Contribute & Donate
    </Button>
  </Link>
);

// Mobile navigation links
const MobileNavLinks = ({ onNavigate }: { onNavigate: () => void }) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col space-y-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname?.startsWith(item.href));

        return (
          <Link
            className={cn(
              "rounded-lg px-4 py-2.5 font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-foreground/90 hover:bg-card/60"
            )}
            href={item.href}
            key={item.name}
            onClick={onNavigate}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};

// Mobile navigation component
const MobileNavigation = () => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger
        className={cn(
          buttonVariants({ size: "sm", variant: "outline" }),
          "ml-2 rounded-full border-border/50 md:hidden"
        )}
      >
        <MenuIcon className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent className="w-[280px]" side="right">
        <SheetHeader className="mb-8 border-b pb-4">
          <SheetTitle className="text-left">
            <span className="font-bold text-foreground">All Things Linux</span>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-8">
          <MobileNavLinks onNavigate={handleClose} />
          <div onClick={handleClose}>
            <CTAButton className="w-full" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Main Header component
export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 py-3 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-x-4">
            <DesktopNavigation />
            <div className="ml-4 hidden md:block">
              <CTAButton />
            </div>
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  );
}