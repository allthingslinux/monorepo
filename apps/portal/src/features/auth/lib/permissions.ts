import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

// ============================================================================
// Access Control Configuration
// ============================================================================
// Define available permissions for admin operations
// Merge default admin statements with any custom resources

const statement = {
  ...defaultStatements, // Includes: user, session permissions
  // Add custom resources here if needed
  // project: ["create", "update", "delete"],
} as const;

// Create the access controller
export const ac = createAccessControl(statement);

// ============================================================================
// Role Definitions
// ============================================================================
// Define roles with specific permissions

// User role: No admin permissions (default role for regular users)
export const user = ac.newRole({
  session: [], // No session permissions
  user: [], // No user permissions
});

// Staff role: Limited admin permissions (can manage users and sessions, but not create users)
export const staff = ac.newRole({
  session: ["list", "revoke"], // Can list sessions and revoke them
  user: ["list", "ban"], // Can list users and ban them
  // Cannot: create users, set roles, delete users, set passwords
});

// Admin role: Full admin permissions (all user and session operations)
export const admin = ac.newRole({
  ...adminAc.statements, // Full admin permissions (all user and session operations)
});
