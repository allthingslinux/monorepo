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
	red: "#f7768e",
	green: "#9ece6a",
	blue: "#7aa2f7",
	yellow: "#e0af68",
	mauve: "#bb9af7",
	teal: "#73daca",
	peach: "#ff9e64",
	pink: "#ff007c",
	flamingo: "#f7768e",
	lavender: "#9d7cd8",
	sapphire: "#2ac3de",
	sky: "#7dcfff",
	maroon: "#db4b4b",
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
	privacy: "Privacy",
	utilities: "Utilities",
	search: "Search",
	development: "Development",
	conversion: "Conversion",
	visualization: "Visualization",
	documents: "Documents",
	frontends: "Frontends",
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
		id: "privatebin",
		name: "PrivateBin",
		description:
			"Zero-knowledge encrypted paste. The server never sees your data — everything is encrypted and decrypted in the browser.",
		url: "https://paste.atl.tools",
		icon: "ClipboardPaste",
		color: "yellow",
		category: "privacy",
		status: "active",
		tags: ["paste", "encrypted", "zero-knowledge"],
	},
	{
		id: "cyberchef",
		name: "CyberChef",
		description:
			"The Cyber Swiss Army Knife. Encode, decode, encrypt, compress — 300+ operations for data wrangling and analysis.",
		url: "https://cyberchef.atl.tools",
		icon: "FlaskConical",
		color: "yellow",
		category: "utilities",
		status: "active",
		tags: ["encryption", "encoding", "analysis"],
	},
	{
		id: "convertx",
		name: "ConvertX",
		description:
			"Self-hosted file converter. Audio, video, images, documents — convert between formats without uploading to third-party services.",
		url: "https://convert.atl.tools",
		icon: "ArrowLeftRight",
		color: "yellow",
		category: "conversion",
		status: "active",
		tags: ["files", "media", "conversion"],
	},
	{
		id: "searxng",
		name: "SearXNG",
		description:
			"Privacy-respecting metasearch engine. Aggregates results from 70+ sources with no tracking, no ads, no profiles.",
		url: "https://search.atl.tools",
		icon: "Search",
		color: "yellow",
		category: "search",
		status: "active",
		tags: ["search", "privacy", "metasearch"],
	},
	{
		id: "it-tools",
		name: "IT-Tools",
		description:
			"A curated toolbox for developers and sysadmins. Token generators, formatters, converters, network tools and more.",
		url: "https://it.atl.tools",
		icon: "Terminal",
		color: "yellow",
		category: "development",
		status: "active",
		tags: ["dev-tools", "sysadmin", "utilities"],
	},
	{
		id: "jsoncrack",
		name: "JSON Crack",
		description:
			"Visualize JSON, YAML, XML and CSV as interactive graphs. Format, validate, convert and explore structured data in the browser.",
		url: "https://json.atl.tools",
		icon: "Braces",
		color: "yellow",
		category: "visualization",
		status: "active",
		tags: ["json", "yaml", "visualization", "graphs"],
	},
	{
		id: "hckrnws",
		name: "hckrnws",
		description:
			"A cleaner reading experience for HackerNews. Dark mode, nested comment lines, quote highlighting and starred stories.",
		url: "https://hn.atl.tools",
		icon: "Newspaper",
		color: "yellow",
		category: "frontends",
		status: "active",
		tags: ["hackernews", "reader", "frontend"],
	},
	{
		id: "stirling-pdf",
		name: "Stirling PDF",
		description:
			"Self-hosted PDF Swiss Army Knife. Merge, split, compress, convert, OCR, sign and watermark — all in the browser.",
		url: "https://pdf.atl.tools",
		icon: "FileText",
		color: "yellow",
		category: "documents",
		status: "active",
		tags: ["pdf", "merge", "convert", "ocr"],
	},
];

export const servicesByCategory = services.reduce<
	Partial<Record<ServiceCategory, ServiceDefinition[]>>
>((acc, service) => {
	const existing = acc[service.category] ?? [];
	existing.push(service);
	acc[service.category] = existing;
	return acc;
}, {});
