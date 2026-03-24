// ============================================================================
// Linux News Feed Configuration
// ============================================================================
// Configure RSS/Atom feed sources for the Feed page.
// Add or remove outlets here to control what appears in the feed reader.

export type FeedCategory =
  | "news"
  | "distro"
  | "security"
  | "development"
  | "community"
  | "enterprise";

export interface FeedSource {
  /** Categories this source covers */
  categories: FeedCategory[];
  /**
   * When true, extract the first path segment of the item link as a category
   * fallback (e.g. "news" or "review" from phoronix.com/news/…).
   * Only applied when no categories are found through other means.
   */
  categoryFromLinkPath?: boolean;
  /**
   * Optional regex to extract a category from the item description when the
   * feed provides none. The first capture group is used as the category value.
   */
  categoryPattern?: RegExp;
  /** Short description shown in the source filter */
  description: string;
  /** Whether to include this source by default */
  enabled: boolean;
  /** RSS/Atom feed URL */
  feedUrl: string;
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Link to the outlet's homepage */
  siteUrl: string;
}

/** Revalidate feeds every 10 minutes */
export const FEED_REVALIDATE_SECONDS = 600;

/** Maximum articles to fetch per source */
export const FEED_ITEMS_PER_SOURCE = 20;

/** Popular Linux/open-source news outlets */
export const LINUX_FEED_SOURCES: FeedSource[] = [
  {
    categories: ["news", "community"],
    description: "Linux Foundation's official news and tutorials",
    enabled: true,
    feedUrl: "https://www.linux.com/feed/",
    id: "linux-com",
    name: "Linux.com",
    siteUrl: "https://www.linux.com",
  },
  {
    categories: ["news", "development"],
    // Phoronix's RSS exposes no <category> elements from any endpoint.
    // Extract the first URL path segment (e.g. "news", "review") as a coarse fallback.
    categoryFromLinkPath: true,
    description: "Linux hardware news and benchmarks",
    enabled: true,
    feedUrl: "https://www.phoronix.com/rss.php",
    id: "phoronix",
    name: "Phoronix",
    siteUrl: "https://www.phoronix.com",
  },
  {
    categories: ["news", "development", "security"],
    description: "In-depth kernel and free software coverage",
    enabled: true,
    feedUrl: "https://lwn.net/headlines/rss",
    id: "lwn",
    name: "LWN.net",
    siteUrl: "https://lwn.net",
  },
  {
    categories: ["news", "community"],
    description: "Accessible Linux news and app reviews",
    // Last post was August 2025 — source appears to be inactive
    enabled: false,
    feedUrl: "https://www.omglinux.com/feed/",
    id: "omglinux",
    name: "OMG! Linux",
    siteUrl: "https://www.omglinux.com",
  },
  {
    categories: ["news", "community"],
    description: "Linux tutorials, news, and reviews",
    enabled: true,
    feedUrl: "https://itsfoss.com/feed/",
    id: "it-foss",
    name: "It's FOSS",
    siteUrl: "https://itsfoss.com",
  },
  {
    categories: ["news", "community"],
    description: "Free and open-source software advocacy and news",
    enabled: true,
    feedUrl: "https://fossforce.com/feed/",
    id: "fossforce",
    name: "FOSS Force",
    siteUrl: "https://fossforce.com",
  },
  {
    categories: ["news", "enterprise"],
    description: "Enterprise Linux and open-source technology news",
    // Feed is blocked by Cloudflare for automated clients
    enabled: false,
    feedUrl: "https://www.linuxinsider.com/rss-feed/",
    id: "linux-insider",
    name: "Linux Insider",
    siteUrl: "https://www.linuxinsider.com",
  },
  {
    categories: ["distro", "community"],
    description: "Tips, tutorials, and news from the Fedora Project",
    enabled: true,
    feedUrl: "https://fedoramagazine.org/feed/",
    id: "fedora-magazine",
    name: "Fedora Magazine",
    siteUrl: "https://fedoramagazine.org",
  },
  {
    categories: ["distro", "enterprise"],
    description: "Official Ubuntu and Canonical news",
    enabled: true,
    feedUrl: "https://ubuntu.com/blog/feed",
    id: "ubuntu-blog",
    name: "Ubuntu Blog",
    siteUrl: "https://ubuntu.com/blog",
  },
  {
    categories: ["enterprise", "development"],
    description: "Enterprise Linux and open-source from Red Hat",
    enabled: true,
    feedUrl: "https://www.redhat.com/en/rss/blog",
    id: "red-hat-blog",
    name: "Red Hat Blog",
    siteUrl: "https://www.redhat.com/en/blog",
  },
  {
    categories: ["development"],
    description: "Official Linux kernel project news",
    enabled: true,
    feedUrl: "https://www.kernel.org/feeds/kdist.xml",
    id: "kernel-org",
    name: "kernel.org",
    siteUrl: "https://www.kernel.org",
  },
  {
    categories: ["security"],
    description: "Security advisories and vulnerability news",
    enabled: true,
    feedUrl: "https://linuxsecurity.com/linuxsecurity_hybrid.xml",
    id: "linux-security",
    name: "LinuxSecurity.com",
    siteUrl: "https://linuxsecurity.com",
  },
  {
    categories: ["news", "development", "community"],
    description: "In-depth articles, tutorials, and community content",
    enabled: true,
    feedUrl: "https://www.linuxjournal.com/node/feed",
    id: "linux-journal",
    name: "Linux Journal",
    siteUrl: "https://www.linuxjournal.com",
  },
  {
    categories: ["news", "community"],
    description: "Linux gaming news, reviews, and game releases",
    enabled: true,
    feedUrl: "https://www.gamingonlinux.com/article_rss.php",
    id: "gaming-on-linux",
    name: "GamingOnLinux",
    siteUrl: "https://www.gamingonlinux.com",
  },
  {
    categories: ["news", "enterprise", "community"],
    description:
      "Open source strategy, research, and announcements from the Linux Foundation",
    enabled: true,
    feedUrl: "https://www.linuxfoundation.org/blog/rss.xml",
    id: "linux-foundation",
    name: "Linux Foundation",
    siteUrl: "https://www.linuxfoundation.org",
  },
  {
    categories: ["distro", "news"],
    description: "Official Arch Linux news and announcements",
    enabled: true,
    feedUrl: "https://archlinux.org/feeds/news/",
    id: "arch-linux",
    name: "Arch Linux",
    siteUrl: "https://archlinux.org",
  },
  {
    categories: ["development", "community"],
    description:
      "Official KDE community blog covering Plasma, apps, and development",
    enabled: true,
    feedUrl: "https://blogs.kde.org/index.xml",
    id: "kde-blog",
    name: "KDE Blog",
    siteUrl: "https://blogs.kde.org",
  },
  {
    categories: ["development", "community"],
    description:
      "Aggregated blog posts from GNOME contributors and community members",
    enabled: true,
    feedUrl: "https://planet.gnome.org/atom.xml",
    id: "planet-gnome",
    name: "Planet GNOME",
    siteUrl: "https://planet.gnome.org",
  },
];

export const FEED_CATEGORY_LABELS: Record<FeedCategory, string> = {
  community: "Community",
  development: "Development",
  distro: "Distros",
  enterprise: "Enterprise",
  news: "News",
  security: "Security",
};