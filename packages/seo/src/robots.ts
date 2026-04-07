import type { MetadataRoute } from "next";

export function generateRobots(baseUrl: string): MetadataRoute.Robots {
  const disallowedPaths: string[] = [];

  if (typeof process !== "undefined" && process.env) {
    disallowedPaths.push("/metrics");
    disallowedPaths.push("/health");
    disallowedPaths.push("/ready");
  }

  disallowedPaths.push("/api/");
  disallowedPaths.push("/auth/consent");

  return {
    rules: [
      {
        allow: "/",
        disallow: disallowedPaths,
        userAgent: "*",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
