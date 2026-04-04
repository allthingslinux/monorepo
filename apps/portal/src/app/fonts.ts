import { Geist_Mono, Inter } from "next/font/google";

/** Primary sans — used for sans, display, and text across all UI. */
export const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

/** Monospace — code blocks, mono UI elements. */
export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});
