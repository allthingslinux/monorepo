import { GoogleTagManager } from "@next/third-parties/google";

import "@/styles/globals.css";
import Footer from "@/components/layouts/footer";
import Header from "@/components/layouts/header";
import {
  OrganizationSchema,
  WebsiteSchema,
} from "@/components/seo/structured-data";

import { geistMono, geistSans, inter } from "./fonts";
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
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} dark`}
      lang="en"
    >
      <body className="min-h-screen font-sans antialiased">
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