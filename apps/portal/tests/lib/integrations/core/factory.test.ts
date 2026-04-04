import { beforeEach, describe, expect, it, vi } from "vitest";

import { getIntegrationOrThrow } from "@/features/integrations/lib/core/factory";
import { getIntegrationRegistry } from "@/features/integrations/lib/core/registry";
import type { Integration } from "@/features/integrations/lib/core/types";

// Mock the registry
vi.mock("@/features/integrations/lib/core/registry", () => {
  const mockRegistry = {
    get: vi.fn(),
  };

  return {
    IntegrationRegistry: class {
      get = mockRegistry.get;
    },
    getIntegrationRegistry: () => mockRegistry,
  };
});

describe("getIntegrationOrThrow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return integration when found", () => {
    const mockIntegration: Integration = {
      createAccount: vi.fn(),
      deleteAccount: vi.fn(),
      description: "Test description",
      enabled: true,
      getAccount: vi.fn(),
      id: "test-integration",
      name: "Test Integration",
      updateAccount: vi.fn(),
    };

    vi.mocked(getIntegrationRegistry().get).mockReturnValue(mockIntegration);

    const result = getIntegrationOrThrow("test-integration");

    expect(result).toBe(mockIntegration);
    expect(getIntegrationRegistry().get).toHaveBeenCalledWith(
      "test-integration"
    );
  });

  it("should throw error when integration not found", () => {
    vi.mocked(getIntegrationRegistry().get).mockReturnValue(null);

    expect(() => {
      getIntegrationOrThrow("non-existent");
    }).toThrow("Unknown integration: non-existent");

    expect(getIntegrationRegistry().get).toHaveBeenCalledWith("non-existent");
  });
});
