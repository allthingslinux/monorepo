import type { Route } from "next";
import Link from "next/link";
import { BsOpencollective } from "react-icons/bs";
import {
  FaDiscord,
  FaFacebook,
  FaGitAlt,
  FaGithub,
  FaInstagram,
  FaRss,
} from "react-icons/fa";

import {
  Cookies,
  Privacy,
  Security,
  Terms,
} from "@/components/layouts/consent";

const sections = [
  {
    links: [
      { href: "/about", name: "About" },
      { href: "/code-of-conduct", name: "Code of Conduct" },
      { href: "/blog", name: "Blog" },
      { href: "/apply", name: "Apply" },
      { href: "/contribute", name: "Contribute" },
    ],
    title: "Information",
  },
  {
    links: [
      { href: "https://github.com/allthingslinux/tux", name: "tux" },
      { href: "https://atl.wiki", name: "atl.wiki" },
      { href: "https://atl.tools", name: "atl.tools" },
      { href: "https://atl.chat", name: "atl.chat" },
    ],
    title: "Projects",
  },
];

const socialLinks = [
  { href: "https://discord.gg/linux", icon: FaDiscord, label: "Discord" },
  {
    href: "https://opencollective.com/allthingslinux",
    icon: BsOpencollective,
    label: "Open Collective",
  },
  {
    href: "https://github.com/allthingslinux",
    icon: FaGithub,
    label: "GitHub",
  },
  {
    href: "https://instagram.com/allthingslinux",
    icon: FaInstagram,
    label: "Instagram",
  },
  {
    href: "https://facebook.com/allthingslinux.org",
    icon: FaFacebook,
    label: "Facebook",
  },
  {
    href: "https://allthingslinux.org/feed",
    icon: FaRss,
    label: "Atom Feed",
  },
];

function FooterLink({ name, href }: { name: string; href: string }) {
  const isExternal = href.startsWith("http");
  return (
    <li>
      {isExternal ? (
        <a
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          href={href as Route}
          rel="noopener noreferrer"
          target="_blank"
        >
          {name}
        </a>
      ) : (
        <Link
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          href={href as Route}
        >
          {name}
        </Link>
      )}
    </li>
  );
}

function FooterSection({
  title,
  links,
}: {
  title: string;
  links: { name: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="font-display text-foreground mb-3 text-sm font-medium">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <FooterLink href={link.href} key={link.name} name={link.name} />
        ))}
      </ul>
    </div>
  );
}

function LegalSection() {
  return (
    <div>
      <h3 className="font-display text-foreground mb-3 text-sm font-medium">
        Legal
      </h3>
      <ul className="space-y-2.5">
        <li>
          <Privacy />
        </li>
        <li>
          <Cookies />
        </li>
        <li>
          <Terms />
        </li>
        <li>
          <Security />
        </li>
      </ul>
    </div>
  );
}

function SocialIcons() {
  return (
    <div className="flex items-center gap-4">
      {socialLinks.map((social) => (
        <a
          aria-label={social.label}
          className="text-muted-foreground hover:text-foreground transition-colors"
          href={social.href}
          key={social.label}
          rel="noopener noreferrer"
          target="_blank"
        >
          <social.icon className="size-4" />
        </a>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-border/20 bg-card border-t">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        {/* Top: columns */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => (
            <FooterSection
              key={section.title}
              links={section.links}
              title={section.title}
            />
          ))}
          <LegalSection />
          <div className="space-y-4">
            <h3 className="font-display text-foreground mb-3 text-sm font-medium">
              Connect
            </h3>
            <SocialIcons />
            <a
              className="text-muted-foreground hover:text-foreground block text-sm transition-colors"
              href="mailto:admin@allthingslinux.org"
            >
              admin@allthingslinux.org
            </a>
            <Link
              className="font-display text-muted-foreground hover:text-foreground block font-medium transition-colors"
              href="/open"
            >
              /open
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-border/20 mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            All Things Linux · Made with ☕ &amp; 💛
          </p>
          <a
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
            href="https://github.com/allthingslinux/allthingslinux"
            rel="noopener noreferrer"
            target="_blank"
          >
            <FaGitAlt className="size-3.5" />
            <span>View Source</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
