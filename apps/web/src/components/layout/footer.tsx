import { Separator } from "@atl/ui/components/separator";
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

import { Cookies, Privacy, Security, Terms } from "@/components/consent";

// Define footer sections data
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

// Define social media links
const socialLinks = [
  {
    href: "https://discord.gg/linux",
    icon: FaDiscord,
    label: "Discord",
  },
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

// Legal section component
const LegalSection = () => (
  <div>
    <h3 className="mb-4 font-bold">Legal</h3>
    <ul className="space-y-4 text-muted-foreground">
      <li className="font-medium hover:text-primary">
        <Privacy />
      </li>
      <li className="font-medium hover:text-primary">
        <Cookies />
      </li>
      <li className="font-medium hover:text-primary">
        <Terms />
      </li>
      <li className="font-medium hover:text-primary">
        <Security />
      </li>
      <li className="font-medium hover:text-primary">
        {/* <PrivacyChoices /> */}
      </li>
    </ul>
  </div>
);

// // Logo component
// const Logo = () => (
//   <span className="text-2xl font-medium">All Things Linux</span>
// );

// Footer link component
const FooterLink = ({ name, href }: { name: string; href: string }) => {
  const isExternal = href.startsWith("http");
  return (
    <li className="font-medium hover:text-primary">
      {isExternal ? (
        <a href={href} rel="noopener noreferrer" target="_blank">
          {name}
        </a>
      ) : (
        <Link href={href}>{name}</Link>
      )}
    </li>
  );
};

// Section component
const FooterSection = ({
  title,
  links,
}: {
  title: string;
  links: { name: string; href: string }[];
}) => (
  <div>
    <h3 className="mb-4 font-bold">{title}</h3>
    <ul className="space-y-4 text-muted-foreground">
      {links.map((link) => (
        <FooterLink href={link.href} key={link.name} name={link.name} />
      ))}
    </ul>
  </div>
);

// Social icon component
const SocialIcon = ({
  Icon,
  href,
  label,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  href: string;
  label: string;
}) => (
  <li className="font-medium hover:text-primary">
    <a aria-label={label} href={href}>
      <Icon className="size-6" />
    </a>
  </li>
);

// Social section component
const SocialSection = () => (
  <div>
    <h3 className="mb-4 hidden font-bold md:block">Social</h3>
    <ul className="flex items-center justify-center space-x-6 text-muted-foreground md:justify-start">
      {socialLinks.map((social) => (
        <SocialIcon
          href={social.href}
          Icon={social.icon}
          key={social.label}
          label={social.label}
        />
      ))}
    </ul>
    <div className="mt-6 text-center md:text-left">
      <h4 className="mb-2 hidden font-bold text-sm md:block">Support</h4>
      <a
        className="text-muted-foreground text-sm transition-colors hover:text-primary"
        href="mailto:admin@allthingslinux.org"
      >
        admin@allthingslinux.org
      </a>
    </div>
    <div className="mt-5 text-center md:text-left">
      <Link
        className="font-bold text-muted-foreground text-xl transition-colors hover:text-primary"
        href="/open"
      >
        /open
      </Link>
    </div>
  </div>
);

// Main sections grid
const FooterSections = () => (
  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
    {sections.map((section) => (
      <FooterSection
        key={section.title}
        links={section.links}
        title={section.title}
      />
    ))}
    <LegalSection />
    <div className="hidden md:block">
      <SocialSection />
    </div>
  </div>
);

// Mobile Footer
const MobileFooter = () => (
  <div className="flex flex-col items-center space-y-4 md:hidden">
    <SocialSection />
    <p className="text-center text-muted-foreground text-sm">
      All Things Linux • Made with ☕ & 💛
    </p>
    <a
      className="flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-primary"
      href="https://github.com/allthingslinux/allthingslinux"
      rel="noopener noreferrer"
      target="_blank"
    >
      <FaGitAlt className="size-5" />
      <span>View Source</span>
    </a>
  </div>
);

// Desktop Copyright
const DesktopCopyright = () => (
  <div className="hidden items-center justify-between md:flex">
    <p className="text-muted-foreground text-sm">
      All Things Linux • Made with ☕ & 💛
    </p>
    <a
      className="flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-primary"
      href="https://github.com/allthingslinux/allthingslinux"
      rel="noopener noreferrer"
      target="_blank"
    >
      <FaGitAlt className="size-5" />
      <span>View Source</span>
    </a>
  </div>
);

export default function Footer() {
  return (
    <section className="py-12 md:py-20 lg:py-32">
      <div className="container">
        <footer className="w-full">
          <Separator className="my-8 md:my-14" />
          <FooterSections />
          <Separator className="my-8 md:my-14" />
          <DesktopCopyright />
          <MobileFooter />
        </footer>
      </div>
    </section>
  );
}