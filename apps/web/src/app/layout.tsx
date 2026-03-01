import type { Metadata } from "next";
import {
	Bricolage_Grotesque,
	IBM_Plex_Sans,
	JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

// Display font — headings only
const bricolage = Bricolage_Grotesque({
	subsets: ["latin"],
	variable: "--font-bricolage",
	display: "swap",
});

// Body font — all prose and UI text
const ibmPlex = IBM_Plex_Sans({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600"],
	variable: "--font-ibm-plex",
	display: "swap",
});

// Mono — accents, tags, badges
const jetbrains = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains",
	display: "swap",
});

export const metadata: Metadata = {
	title: "atl.tools — Self-Hosted for Nerds",
	description:
		"Open source, privacy-focused self-hosted applications by All Things Linux.",
	icons: { icon: "/logo_only.png" },
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			className={`${bricolage.variable} ${ibmPlex.variable} ${jetbrains.variable}`}
			lang="en"
			style={{ colorScheme: "dark" }}
		>
			<head>
				<meta content="#181924" name="theme-color" />
			</head>
			<body>{children}</body>
		</html>
	);
}
