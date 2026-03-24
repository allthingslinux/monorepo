import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authClient } from "@/auth/client";
import { SessionProvider } from "@/auth/session-context";
import { useAuthSession } from "@/features/auth/lib/auth-hooks";
import { usePermissions } from "@/hooks/use-permissions";

vi.mock("@/auth/client", () => ({
  authClient: {
    admin: {
      checkRolePermission: vi.fn(),
    },
  },
}));

vi.mock("@/features/auth/lib/auth-hooks", () => ({
  useAuthSession: vi.fn(),
}));

function TestWrapper({ children }: { children: ReactNode }) {
  return createElement(SessionProvider, null, children);
}

describe("usePermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return loading state when session is pending", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      data: null,
      error: null,
      isPending: true,
    } as never);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: TestWrapper,
    });

    expect(result.current).toEqual({
      canManageUsers: false,
      canViewAdmin: false,
      loading: true,
    });
  });

  it("should return loading state when session is null", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      data: null,
      error: null,
      isPending: false,
    } as never);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: TestWrapper,
    });

    expect(result.current).toEqual({
      canManageUsers: false,
      canViewAdmin: false,
      loading: true,
    });
  });

  it("should return permissions for admin user", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      data: {
        user: {
          id: "1",
          role: "admin",
        },
      },
      error: null,
      isPending: false,
    } as never);

    vi.mocked(authClient.admin.checkRolePermission).mockReturnValue(true);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: TestWrapper,
    });

    expect(result.current).toEqual({
      canManageUsers: true,
      canViewAdmin: true,
      loading: false,
    });

    expect(authClient.admin.checkRolePermission).toHaveBeenCalledWith({
      permissions: {
        user: ["list"],
      },
      role: "admin",
    });
  });

  it("should return permissions for regular user", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      data: {
        user: {
          id: "1",
          role: "user",
        },
      },
      error: null,
      isPending: false,
    } as never);

    vi.mocked(authClient.admin.checkRolePermission).mockReturnValue(false);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: TestWrapper,
    });

    expect(result.current).toEqual({
      canManageUsers: false,
      canViewAdmin: false,
      loading: false,
    });
  });

  it("should handle errors gracefully", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      data: {
        user: {
          id: "1",
          role: "user",
        },
      },
      error: null,
      isPending: false,
    } as never);

    vi.mocked(authClient.admin.checkRolePermission).mockImplementation(() => {
      throw new Error("Permission check failed");
    });

    // biome-ignore lint/suspicious/noEmptyBlockStatements: Suppress console.error in tests
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: TestWrapper,
      });

      expect(result.current).toEqual({
        canManageUsers: false,
        canViewAdmin: false,
        loading: false,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to check permissions:",
        expect.any(Error)
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it("should default to user role when role is undefined", () => {
    vi.mocked(useAuthSession).mockReturnValue({
      data: {
        user: {
          id: "1",
          role: undefined,
        },
      },
      error: null,
      isPending: false,
    } as never);

    vi.mocked(authClient.admin.checkRolePermission).mockReturnValue(false);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: TestWrapper,
    });

    expect(authClient.admin.checkRolePermission).toHaveBeenCalledWith({
      permissions: {
        user: ["list"],
      },
      role: "user",
    });

    expect(result.current.loading).toBe(false);
  });
});