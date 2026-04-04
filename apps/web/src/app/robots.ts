import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    host: "https://allthingslinux.org",
    rules: {
      allow: "/",
      disallow: ["/admin", "/private"],
      userAgent: "*",
    },
    sitemap: "https://allthingslinux.org/sitemap.xml",
  };
}
