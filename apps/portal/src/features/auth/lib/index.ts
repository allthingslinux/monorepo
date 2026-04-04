// ============================================================================
// Auth Module Exports
// ============================================================================
// Central export point for Better Auth configuration and client
// This barrel file enables the @/auth path alias (configured in tsconfig.json)

export type { AuthClient } from "./client";
export { authClient } from "./client";
export type { AuthGetSessionReturn, Session } from "./config";
export { auth } from "./config";
export {
  getUser,
  verifyAdminOrStaffSession,
  verifyAdminSession,
  verifySession,
} from "./dal";
export { serverClient } from "./server-client";
export { SessionProvider, usePermissions, useSession } from "./session-context";
