import { GoogleTagManager } from "@next/third-parties/google";

import "@/styles/globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import {
  OrganizationSchema,
  WebsiteSchema,
} from "@/components/structured-data";

import { defaultMetadata, viewport } from "./metadata";

// Initialize font with subset for better performance
const inter = Inter({
  display: "swap",
  preload: true,
  subsets: ["latin"],
  variable: "--font-inter",
});

// Add a monospace font for code blocks
const jetbrainsMono = JetBrains_Mono({
  display: "swap",
  preload: true,
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = defaultMetadata;

export { viewport };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
      lang="en"
    >
      <body>
        <GoogleTagManager gtmId="GTM-KK56FB5V" />
        <OrganizationSchema />
        <WebsiteSchema />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}