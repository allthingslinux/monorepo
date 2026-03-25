import { Geist, Geist_Mono, Inter } from "next/font/google";

/** Primary sans — matches portal and `@atl/ui` design tokens (`--font-inter`). */
export const inter = Inter({
  display: "swap",
  preload: true,
  subsets: ["latin"],
  variable: "--font-inter",
});

/** Display / alternate sans — `--font-geist-sans` in tokens. */
export const geistSans = Geist({
  display: "swap",
  preload: true,
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

/** Monospace — `--font-geist-mono` in tokens. */
export const geistMono = Geist_Mono({
  display: "swap",
  preload: true,
  subsets: ["latin"],
  variable: "--font-geist-mono",
});