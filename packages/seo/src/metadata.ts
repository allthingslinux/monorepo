import merge from "lodash/merge";
import type { Metadata } from "next";

import type { ProtectedRoute, PublicRoute } from "@atl/types/routes";

// ============================================================================
// Default Metadata Configuration Builder
// ============================================================================

export interface AppMetadataConfig {
  author: string;
  creator: string;
  description: string;
  keywords: string[];
  publisher: string;
  title: string;
  baseUrl: string;
}

/**
 * Build default metadata for the application
 */
export function buildDefaultMetadata(config: AppMetadataConfig): Metadata {
  return {
    authors: [{ name: config.author }],
    creator: config.creator,
    description: config.description,
    formatDetection: {
      address: false,
      email: false,
      telephone: false,
    },
    icons: {
      apple: "/favicon.ico",
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
    },
    keywords: config.keywords,
    metadataBase: new URL(config.baseUrl),
    openGraph: {
      description: config.description,
      locale: "en_US",
      siteName: config.title,
      title: config.title,
      type: "website",
      url: config.baseUrl,
    },
    publisher: config.publisher,
    robots: {
      follow: true,
      googleBot: {
        follow: true,
        index: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
      index: true,
    },
    title: {
      default: config.title,
      template: `%s | ${config.title}`,
    },
    twitter: {
      card: "summary_large_image",
      description: config.description,
      title: config.title,
    },
  };
}

/**
 * Helper function to create page-specific metadata
 * Merges overrides with default metadata, preserving nested objects
 */
export function createPageMetadata(
  defaultMetadata: Metadata,
  overrides: Metadata
): Metadata {
  return merge({}, defaultMetadata, overrides);
}

/**
 * Get metadata for a route (for SEO, Open Graph, etc.)
 */
export function getRouteMetadata(
  pathname: string,
  routes: (PublicRoute | ProtectedRoute)[],
  defaultMetadata: Metadata
): Metadata {
  const cleanPath = pathname.split("?")[0].split("#")[0];

  const route = routes.find((r) => r.path === cleanPath);

  if (!route) {
    return defaultMetadata;
  }

  return createPageMetadata(defaultMetadata, {
    description: route.metadata.description,
    keywords: route.metadata.keywords,
    openGraph: route.metadata.openGraph,
    robots: route.metadata.robots,
    title: route.metadata.title,
    twitter: route.metadata.twitter,
  });
}
