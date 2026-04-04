import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  description:
    "Open source, privacy-focused self-hosted applications by All Things Linux.",
  icons: { icon: "/logo_only.png" },
  title: "atl.tools — Self-Hosted for Nerds",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} dark`}
      lang="en"
    >
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
