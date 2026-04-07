// ============================================================================
// Community & Social Links Configuration
// ============================================================================
// Links to ATL community platforms. Used by the Connect page.
// Discord invite can be overridden via NEXT_PUBLIC_DISCORD_INVITE.

export interface CommunityLink {
  description: string;
  external?: boolean;
  href: string;
  icon: "discord" | "irc" | "xmpp" | "web" | "github" | "wiki";
  id: string;
  name: string;
}

const discordInvite =
  typeof process === "undefined"
    ? undefined
    : process.env.NEXT_PUBLIC_DISCORD_INVITE;

export const COMMUNITY_LINKS: CommunityLink[] = [
  {
    description: "Chat, voice, and community on Discord",
    external: true,
    href: discordInvite ?? "https://discord.gg/allthingslinux",
    icon: "discord",
    id: "discord",
    name: "Discord",
  },
  {
    description: "Connect to irc.atl.chat (TLS port 6697)",
    external: true,
    href: "ircs://irc.atl.chat:6697",
    icon: "irc",
    id: "irc",
    name: "IRC",
  },
  {
    description: "Jabber / XMPP at xmpp.atl.chat",
    external: true,
    href: "xmpp:conference.xmpp.atl.chat",
    icon: "xmpp",
    id: "xmpp",
    name: "XMPP",
  },
  {
    description: "Main ATL website",
    external: true,
    href: "https://atl.dev",
    icon: "web",
    id: "atl-dev",
    name: "atl.dev",
  },
  {
    description: "Chat hub and services",
    external: true,
    href: "https://atl.chat",
    icon: "web",
    id: "atl-chat",
    name: "atl.chat",
  },
  {
    description: "Portal and developer tools",
    external: true,
    href: "https://atl.tools",
    icon: "web",
    id: "atl-tools",
    name: "atl.tools",
  },
  {
    description: "Shell and pubnix access",
    external: true,
    href: "https://atl.sh",
    icon: "web",
    id: "atl-sh",
    name: "atl.sh",
  },
  {
    description: "Community wiki and documentation",
    external: true,
    href: "https://wiki.atl.dev",
    icon: "wiki",
    id: "wiki",
    name: "Wiki",
  },
  {
    description: "All Things Linux on GitHub",
    external: true,
    href: "https://github.com/allthingslinux",
    icon: "github",
    id: "github",
    name: "GitHub",
  },
];

// ============================================================================
// Social Media Links
// ============================================================================
// Override via env: NEXT_PUBLIC_X_URL, NEXT_PUBLIC_YOUTUBE_URL, etc.

export interface SocialMediaLink {
  description: string;
  external?: boolean;
  href: string;
  icon:
    | "x"
    | "youtube"
    | "mastodon"
    | "bluesky"
    | "linkedin"
    | "facebook"
    | "instagram"
    | "tiktok"
    | "tumblr";
  id: string;
  name: string;
}

const getEnv = (key: string, fallback: string) =>
  typeof process === "undefined" ? fallback : (process.env[key] ?? fallback);

export const SOCIAL_MEDIA_LINKS: SocialMediaLink[] = [
  {
    description: "Follow us on X (Twitter)",
    external: true,
    href: getEnv("NEXT_PUBLIC_X_URL", "https://x.com/allthingslinux"),
    icon: "x",
    id: "x",
    name: "X",
  },
  {
    description: "Videos, tutorials, and livestreams",
    external: true,
    href: getEnv(
      "NEXT_PUBLIC_YOUTUBE_URL",
      "https://youtube.com/@allthingslinux"
    ),
    icon: "youtube",
    id: "youtube",
    name: "YouTube",
  },
  {
    description: "Fediverse / Mastodon",
    external: true,
    href: getEnv(
      "NEXT_PUBLIC_MASTODON_URL",
      "https://mastodon.social/@allthingslinux"
    ),
    icon: "mastodon",
    id: "mastodon",
    name: "Mastodon",
  },
  {
    description: "Decentralized social",
    external: true,
    href: getEnv(
      "NEXT_PUBLIC_BLUESKY_URL",
      "https://bsky.app/profile/allthingslinux.bsky.social"
    ),
    icon: "bluesky",
    id: "bluesky",
    name: "Bluesky",
  },
  {
    description: "Professional network",
    external: true,
    href: getEnv(
      "NEXT_PUBLIC_LINKEDIN_URL",
      "https://linkedin.com/company/allthingslinux"
    ),
    icon: "linkedin",
    id: "linkedin",
    name: "LinkedIn",
  },
  {
    description: "Connect on Facebook",
    external: true,
    href: getEnv(
      "NEXT_PUBLIC_FACEBOOK_URL",
      "https://facebook.com/allthingslinux"
    ),
    icon: "facebook",
    id: "facebook",
    name: "Facebook",
  },
  {
    description: "Photos and stories",
    external: true,
    href: getEnv(
      "NEXT_PUBLIC_INSTAGRAM_URL",
      "https://instagram.com/allthingslinux"
    ),
    icon: "instagram",
    id: "instagram",
    name: "Instagram",
  },
  {
    description: "Short-form videos",
    external: true,
    href: getEnv(
      "NEXT_PUBLIC_TIKTOK_URL",
      "https://tiktok.com/@allthingslinux"
    ),
    icon: "tiktok",
    id: "tiktok",
    name: "TikTok",
  },
  {
    description: "Blogs and posts",
    external: true,
    href: getEnv("NEXT_PUBLIC_TUMBLR_URL", "https://allthingslinux.tumblr.com"),
    icon: "tumblr",
    id: "tumblr",
    name: "Tumblr",
  },
];
