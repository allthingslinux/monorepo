import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "atl.chat | Linux community chat",
  description:
    "Join All Things Linux across Discord, IRC, and XMPP with shared bridge connectivity and web clients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${inter.variable} ${geistMono.variable} dark`} lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
