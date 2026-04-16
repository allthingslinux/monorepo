import { GoogleTagManager } from "@next/third-parties/google";

import "@/styles/globals.css";
import Footer from "@/components/layouts/footer";
import Header from "@/components/layouts/header";
import {
  OrganizationSchema,
  WebsiteSchema,
} from "@/components/seo/structured-data";
import { ThemeProvider } from "@/components/theme-provider";

import { geistMono, inter, lora } from "./fonts";
import { defaultMetadata, viewport } from "./metadata";

export const metadata = defaultMetadata;

export { viewport };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${inter.variable} ${lora.variable} ${geistMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        <a
          className="bg-background text-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:ring-2 focus:outline-none"
          href="#main-content"
        >
          Skip to main content
        </a>
        {/* Runs before React hydrates — sets dark/light class to prevent FOUC */}
        <script
          // biome-ignore lint/security/noDangerouslyInnerHtmlWithChildren: intentional SSR theme init
          // oxlint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme')||'dark';if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}`,
          }}
        />
        <GoogleTagManager gtmId="GTM-KK56FB5V" />
        <ThemeProvider>
          <OrganizationSchema />
          <WebsiteSchema />
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
