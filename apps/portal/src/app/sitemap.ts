import type { MetadataRoute } from "next";

import { routeConfig } from "@/features/routing/lib";
import { BASE_URL } from "@atl/config";
import { generateSitemap } from "@atl/seo/sitemap";

export default function sitemap(): MetadataRoute.Sitemap {
  return generateSitemap(routeConfig, BASE_URL);
}
