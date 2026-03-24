/**
 * Shared constants
 * Centralized location for all application-wide constants
 */

// ============================================================================
// User & Permissions
// ============================================================================

/**
 * User roles
 */
export const USER_ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  USER: "user",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Permission scopes
 */
export const PERMISSIONS = {
  ADMIN_VIEW: "admin:view",
  USER_CREATE: "user:create",
  USER_DELETE: "user:delete",
  USER_LIST: "user:list",
  USER_UPDATE: "user:update",
  USER_VIEW: "user:view",
} as const;

// ============================================================================
// API & HTTP
// ============================================================================

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  CONFLICT: 409,
  CREATED: 201,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
  NO_CONTENT: 204,
  OK: 200,
  SERVICE_UNAVAILABLE: 503,
  UNAUTHORIZED: 401,
} as const;

/**
 * Common API error codes
 */
export const API_ERROR_CODES = {
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  UNAUTHORIZED: "UNAUTHORIZED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type APIErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

// ============================================================================
// Query & Cache
// ============================================================================

/**
 * TanStack Query cache time constants (in milliseconds)
 */
export const QUERY_CACHE = {
  /** Short cache time: 30 seconds - for frequently changing data */
  STALE_TIME_SHORT: 30 * 1000,
  /** Default cache time: 1 minute - for most queries */
  STALE_TIME_DEFAULT: 60 * 1000,
  /** Long cache time: 5 minutes - for stable data */
  STALE_TIME_LONG: 5 * 60 * 1000,
  /** Default garbage collection time: 5 minutes */
  GC_TIME_DEFAULT: 5 * 60 * 1000,
} as const;

// ============================================================================
// Rate Limits
// ============================================================================

/**
 * API rate limit defaults
 */
export const RATE_LIMIT = {
  /** Default rate limit time window: 1 day in milliseconds */
  DEFAULT_TIME_WINDOW_MS: 86_400_000,
  /** Default maximum requests per time window */
  DEFAULT_MAX_REQUESTS: 10,
} as const;

// ============================================================================
// Integration Status
// ============================================================================

/**
 * Integration account status values
 */
export const INTEGRATION_STATUSES = [
  "active",
  "pending",
  "suspended",
  "deleted",
] as const;

export type IntegrationStatus = (typeof INTEGRATION_STATUSES)[number];

// ============================================================================
// Pagination
// ============================================================================

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ============================================================================
// Validation
// ============================================================================

/**
 * Common validation patterns (regex)
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  URL: /^https?:\/\/.+/,
} as const;

// ============================================================================
// UI/Display
// ============================================================================

/**
 * Mobile breakpoint (matches Tailwind's `md` breakpoint)
 */
export const MOBILE_BREAKPOINT = 768;

/**
 * Common date formats
 */
export const DATE_FORMATS = {
  ISO: "yyyy-MM-dd",
  DISPLAY: "PPp", // e.g., "Apr 29th, 2021"
  SHORT: "PP", // e.g., "Apr 29, 2021"
  TIME: "p", // e.g., "4:30 PM"
} as const;