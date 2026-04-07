/**
 * Re-export route types from centralized types directory
 * This file maintains backward compatibility for existing imports
 */

// Re-export Permission from auth types for convenience
export type { Permission } from "@atl/types/auth";
export type {
  BaseRoute,
  BreadcrumbConfig,
  BreadcrumbItem,
  FooterAction,
  NavigationConfig,
  NavigationGroup,
  ProtectedRoute,
  PublicRoute,
  RouteChild,
  RouteConfig,
  RouteMetadata,
  SitemapConfig,
  UIDisplay,
} from "@atl/types/routes";
