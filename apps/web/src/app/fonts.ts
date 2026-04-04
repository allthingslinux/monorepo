import { Geist_Mono, Inter, Lora } from "next/font/google";

/** Primary sans — used for sans, display, and text across all UI. */
export const inter = Inter({
  display: "swap",
  preload: true,
  subsets: ["latin"],
  variable: "--font-inter",
});

/** Serif — editorial headings, about page, quotes. */
export const lora = Lora({
  display: "swap",
  preload: true,
  subsets: ["latin"],
  variable: "--font-lora",
  style: ["normal", "italic"],
});

/** Monospace — code blocks, mono UI elements. */
export const geistMono = Geist_Mono({
  display: "swap",
  preload: true,
  subsets: ["latin"],
  variable: "--font-geist-mono",
});
