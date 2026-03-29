export type CatppuccinColor =
  | "red"
  | "green"
  | "blue"
  | "yellow"
  | "mauve"
  | "teal"
  | "peach"
  | "pink"
  | "flamingo"
  | "lavender"
  | "sapphire"
  | "sky"
  | "maroon";

export const tokyoNightHex: Record<CatppuccinColor, string> = {
  blue: "#7aa2f7",
  flamingo: "#f7768e",
  green: "#9ece6a",
  lavender: "#9d7cd8",
  maroon: "#db4b4b",
  mauve: "#bb9af7",
  peach: "#ff9e64",
  pink: "#ff007c",
  red: "#f7768e",
  sapphire: "#2ac3de",
  sky: "#7dcfff",
  teal: "#73daca",
  yellow: "#e0af68",
};

export type ServiceStatus = "active" | "planned" | "maintenance";

export type ServiceCategory =
  | "privacy"
  | "utilities"
  | "search"
  | "development"
  | "conversion"
  | "visualization"
  | "documents"
  | "frontends";

export const categoryLabels: Record<ServiceCategory, string> = {
  conversion: "Conversion",
  development: "Development",
  documents: "Documents",
  frontends: "Frontends",
  privacy: "Privacy",
  search: "Search",
  utilities: "Utilities",
  visualization: "Visualization",
};

export interface ServiceDefinition {
  category: ServiceCategory;
  color: CatppuccinColor;
  description: string;
  /** Lucide icon name (PascalCase) */
  icon: string;
  id: string;
  name: string;
  status: ServiceStatus;
  tags: string[];
  url: string;
}

export const services: ServiceDefinition[] = [
  {
    category: "privacy",
    color: "yellow",
    description:
      "Zero-knowledge encrypted paste. The server never sees your data — everything is encrypted and decrypted in the browser.",
    icon: "ClipboardPaste",
    id: "privatebin",
    name: "PrivateBin",
    status: "active",
    tags: ["paste", "encrypted", "zero-knowledge"],
    url: "https://paste.atl.tools",
  },
  {
    category: "utilities",
    color: "yellow",
    description:
      "The Cyber Swiss Army Knife. Encode, decode, encrypt, compress — 300+ operations for data wrangling and analysis.",
    icon: "FlaskConical",
    id: "cyberchef",
    name: "CyberChef",
    status: "active",
    tags: ["encryption", "encoding", "analysis"],
    url: "https://cyberchef.atl.tools",
  },
  {
    category: "conversion",
    color: "yellow",
    description:
      "Self-hosted file converter. Audio, video, images, documents — convert between formats without uploading to third-party services.",
    icon: "ArrowLeftRight",
    id: "convertx",
    name: "ConvertX",
    status: "active",
    tags: ["files", "media", "conversion"],
    url: "https://convert.atl.tools",
  },
  {
    category: "search",
    color: "yellow",
    description:
      "Privacy-respecting metasearch engine. Aggregates results from 70+ sources with no tracking, no ads, no profiles.",
    icon: "Search",
    id: "searxng",
    name: "SearXNG",
    status: "active",
    tags: ["search", "privacy", "metasearch"],
    url: "https://search.atl.tools",
  },
  {
    category: "development",
    color: "yellow",
    description:
      "A curated toolbox for developers and sysadmins. Token generators, formatters, converters, network tools and more.",
    icon: "Terminal",
    id: "it-tools",
    name: "IT-Tools",
    status: "active",
    tags: ["dev-tools", "sysadmin", "utilities"],
    url: "https://it.atl.tools",
  },
  {
    category: "visualization",
    color: "yellow",
    description:
      "Visualize JSON, YAML, XML and CSV as interactive graphs. Format, validate, convert and explore structured data in the browser.",
    icon: "Braces",
    id: "jsoncrack",
    name: "JSON Crack",
    status: "active",
    tags: ["json", "yaml", "visualization", "graphs"],
    url: "https://json.atl.tools",
  },
  {
    category: "frontends",
    color: "yellow",
    description:
      "A cleaner reading experience for HackerNews. Dark mode, nested comment lines, quote highlighting and starred stories.",
    icon: "Newspaper",
    id: "hckrnws",
    name: "hckrnws",
    status: "active",
    tags: ["hackernews", "reader", "frontend"],
    url: "https://hn.atl.tools",
  },
  {
    category: "documents",
    color: "yellow",
    description:
      "Self-hosted PDF Swiss Army Knife. Merge, split, compress, convert, OCR, sign and watermark — all in the browser.",
    icon: "FileText",
    id: "stirling-pdf",
    name: "Stirling PDF",
    status: "active",
    tags: ["pdf", "merge", "convert", "ocr"],
    url: "https://pdf.atl.tools",
  },
];

const categoryMap: Partial<Record<ServiceCategory, ServiceDefinition[]>> = {};
for (const service of services) {
  const existing = categoryMap[service.category] ?? [];
  existing.push(service);
  categoryMap[service.category] = existing;
}
export const servicesByCategory = categoryMap;
