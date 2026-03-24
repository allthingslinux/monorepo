import {
  DollarSign,
  Globe,
  HelpCircle,
  History,
  LogOut,
  Mail,
  MessageSquare,
  Rss,
  Settings2,
  Shield,
  SquareTerminal,
} from "lucide-react";

import type { IntegrationPublicInfo } from "@/features/integrations/lib/core/types";

import type { ProtectedRoute, RouteConfig } from "./types";

/**
 * Single source of truth for all application routes
 * Used for: navigation, breadcrumbs, metadata, sitemap, permissions
 *
 * Note: Display strings (label, title, description) are stored in locale files.
 * This config only contains structure (paths, icons, permissions, etc.)
 */
export const routeConfig = {
  // Public routes (no auth required)
  public: [
    {
      id: "home",
      metadata: {
        robots: { index: true, follow: true },
      },
      path: "/",
      sitemap: {
        priority: 1,
        changeFrequency: "weekly",
      },
    },
    {
      id: "sign-in",
      metadata: {
        robots: { index: false, follow: false },
      },
      path: "/auth/sign-in",
      sitemap: {
        priority: 0.8,
        changeFrequency: "monthly",
      },
    },
    {
      id: "sign-up",
      metadata: {
        robots: { index: false, follow: false },
      },
      path: "/auth/sign-up",
      sitemap: {
        priority: 0.8,
        changeFrequency: "monthly",
      },
    },
  ],

  // Protected routes (require authentication)
  protected: [
    {
      breadcrumb: {
        exact: true,
      },
      icon: SquareTerminal,
      id: "dashboard",
      metadata: {
        robots: { index: false, follow: false },
      },
      navigation: {
        group: "platform",
        order: 1,
      },
      path: "/app",
    },
    {
      icon: Globe,
      id: "connect",
      metadata: {
        robots: { index: false, follow: false },
      },
      navigation: {
        group: "platform",
        order: 3,
      },
      path: "/app/connect",
    },
    {
      icon: Settings2,
      id: "settings",
      metadata: {
        robots: { index: false, follow: false },
      },
      path: "/app/settings",
    },
    {
      breadcrumb: {},
      icon: Mail,
      id: "mail",
      metadata: {
        robots: { index: false, follow: false },
      },
      navigation: {
        group: "platform",
        order: 5,
      },
      path: "/app/mail",
    },
    {
      breadcrumb: {},
      icon: Rss,
      id: "feed",
      metadata: {
        robots: { index: false, follow: false },
      },
      navigation: {
        group: "platform",
        order: 6,
      },
      path: "/app/feed",
    },
    {
      breadcrumb: {},
      icon: History,
      id: "changelog",
      metadata: {
        robots: { index: false, follow: false },
      },
      navigation: {
        group: "platform",
        order: 7,
      },
      path: "/app/changelog",
    },
    {
      icon: MessageSquare,
      id: "integrations",
      metadata: {
        robots: { index: false, follow: false },
      },
      navigation: {
        group: "platform",
        order: 8,
      },
      path: "/app/integrations",
    },
    {
      breadcrumb: {},
      icon: DollarSign,
      id: "donate",
      metadata: {
        robots: { index: true, follow: true },
      },
      navigation: {
        group: "platform",
        order: 9,
      },
      path: "/app/donate",
    },
    {
      icon: Shield,
      id: "admin",
      metadata: {
        robots: { index: false, follow: false },
      },
      navigation: {
        group: "platform",
        order: 10,
        permissions: ["canViewAdmin"],
        children: [
          { id: "admin-users", path: "/app/admin/users" },
          { id: "admin-sessions", path: "/app/admin/sessions" },
        ],
      },
      path: "/app/admin",
    },
  ],

  // Navigation groups configuration
  navigationGroups: [
    {
      id: "platform",
      order: 1,
    },
  ],

  // Footer actions (user actions in sidebar)
  footerActions: [
    {
      icon: Settings2,
      id: "settings",
      metadata: {
        robots: { index: false, follow: false },
      },
      path: "/app/settings",
    },
    {
      icon: HelpCircle,
      id: "support",
      metadata: {
        robots: { index: true, follow: true },
      },
      path: "/support",
    },
    {
      id: "logout",
      icon: LogOut,
      action: "logout", // Special action, not a route
      variant: "destructive",
    },
  ],
} as RouteConfig;

interface IntegrationRouteOptions {
  basePath?: string;
  pathOverrides?: Record<string, string>;
}

/**
 * Build integration routes for dynamic navigation.
 */
export function buildIntegrationRoutes(
  integrations: IntegrationPublicInfo[],
  options: IntegrationRouteOptions = {}
): ProtectedRoute[] {
  const basePath = options.basePath ?? "/app/integrations";
  const pathOverrides = options.pathOverrides ?? {};

  return integrations.map((integration) => ({
    icon: MessageSquare,
    id: `integration-${integration.id}`,
    metadata: {
      robots: { index: false, follow: false },
    },
    navigation: {
      group: "platform",
      order: 99,
    },
    path: pathOverrides[integration.id] ?? `${basePath}/${integration.id}`,
  }));
}

/**
 * Merge integration routes into the base route configuration.
 */
export function getRouteConfigWithIntegrations(
  integrations: IntegrationPublicInfo[],
  options?: IntegrationRouteOptions
): RouteConfig {
  return {
    ...routeConfig,
    protected: [
      ...routeConfig.protected,
      ...buildIntegrationRoutes(integrations, options),
    ],
  };
}