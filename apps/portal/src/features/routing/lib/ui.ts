import type { RouteTranslationResolver } from "./i18n";
import { getTranslatedRouteConfig } from "./i18n";
import type { RouteConfig } from "./types";

/**
 * Get UI display values for a route
 * Falls back to metadata if UI display not provided
 *
 * @param pathname - The pathname to look up
 * @param config - The route configuration
 * @param resolver - Optional translation resolver for i18n support
 */
export function getUIDisplay(
  pathname: string,
  config: RouteConfig,
  resolver?: RouteTranslationResolver
): { title?: string; description?: string } {
  const cleanPath = pathname.split("?")[0].split("#")[0];

  // Resolve translations if resolver provided
  const resolvedConfig = resolver
    ? getTranslatedRouteConfig(config, resolver)
    : config;

  // Find route in config (include navigation children for sub-routes)
  const allRoutes = [...resolvedConfig.public, ...resolvedConfig.protected];
  const route = allRoutes.find((r) => r.path === cleanPath);

  if (!route) {
    const protectedRoutes = resolvedConfig.protected;
    for (const r of protectedRoutes) {
      const child = r.navigation?.children?.find((c) => c.path === cleanPath);
      if (child) {
        return {
          description: child.metadata?.description,
          title: child.label ?? child.id,
        };
      }
    }
    return { description: undefined, title: undefined };
  }

  // Use UI display if provided, otherwise fall back to metadata
  return {
    description: route.ui?.description ?? route.metadata.description,
    title: route.ui?.title ?? route.metadata.title,
  };
}
