import type { MetadataRoute } from "next";

import type {
  ProtectedRoute,
  PublicRoute,
  RouteChild,
  RouteConfig,
} from "@atl/types/routes";

function createSitemapEntry(
  path: string,
  baseUrl: string,
  sitemap?: {
    lastModified?: Date;
    changeFrequency?: string;
    priority?: number;
  }
): MetadataRoute.Sitemap[0] {
  return {
    changeFrequency: (sitemap?.changeFrequency ??
      "weekly") as MetadataRoute.Sitemap[0]["changeFrequency"],
    lastModified: sitemap?.lastModified ?? new Date(),
    priority: sitemap?.priority ?? 0.5,
    url: `${baseUrl}${path}`,
  };
}

function addPublicRoutes(
  routes: MetadataRoute.Sitemap,
  publicRoutes: PublicRoute[],
  baseUrl: string
): void {
  for (const route of publicRoutes) {
    if (route.sitemap) {
      routes.push(createSitemapEntry(route.path, baseUrl, route.sitemap));
    }
  }
}

function addChildRoutes(
  routes: MetadataRoute.Sitemap,
  children: RouteChild[],
  parentMetadata: ProtectedRoute["metadata"],
  baseUrl: string
): void {
  if (!children) {
    return;
  }

  for (const child of children) {
    const childMetadata = child.metadata ?? parentMetadata;
    if (childMetadata.robots?.index) {
      routes.push({
        changeFrequency: "monthly",
        lastModified: new Date(),
        priority: 0.4,
        url: `${baseUrl}${child.path}`,
      });
    }
  }
}

function addProtectedRoutes(
  routes: MetadataRoute.Sitemap,
  protectedRoutes: ProtectedRoute[],
  baseUrl: string
): void {
  for (const route of protectedRoutes) {
    if (route.metadata.robots?.index && route.sitemap) {
      routes.push(createSitemapEntry(route.path, baseUrl, route.sitemap));
    }

    if (route.navigation?.children) {
      addChildRoutes(
        routes,
        route.navigation.children,
        route.metadata,
        baseUrl
      );
    }
  }
}

/**
 * Generate sitemap from route configuration
 */
export function generateSitemap(
  config: RouteConfig,
  baseUrl: string
): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  addPublicRoutes(routes, config.public, baseUrl);
  addProtectedRoutes(routes, config.protected, baseUrl);

  return routes;
}
