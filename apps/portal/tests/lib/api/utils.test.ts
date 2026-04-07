import { describe, expect, it, vi } from "vitest";

import { APIError, handleAPIError } from "@atl/api/utils";

// Mock database and auth before importing utils
vi.mock("@atl/db/client", () => ({
  db: {},
}));

vi.mock("@/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@atl/observability/utils", () => ({
  captureError: vi.fn(),
  log: {
    error: vi.fn(),
  },
  parseError: vi.fn((error: unknown) => ({
    message: error instanceof Error ? error.message : "Unknown error",
  })),
}));

describe("APIError", () => {
  it("should create error with message and status", () => {
    const error = new APIError("Not found", 404);
    expect(error.message).toBe("Not found");
    expect(error.status).toBe(404);
    expect(error.name).toBe("APIError");
  });

  it("should default to status 500", () => {
    const error = new APIError("Server error");
    expect(error.status).toBe(500);
  });
});

describe("handleAPIError", () => {
  it("should handle APIError correctly", async () => {
    const error = new APIError("Not found", 404);
    const response = handleAPIError(error);

    expect(response.status).toBe(404);
    const data = (await response.json()) as { ok: boolean; error: string };
    expect(data).toEqual({
      error: "Not found",
      ok: false,
    });
  });

  it("should handle generic errors", async () => {
    const error = new Error("Something went wrong");
    const response = handleAPIError(error);

    expect(response.status).toBe(500);
    const data = (await response.json()) as { ok: boolean; error: string };
    expect(data).toEqual({
      error: "Internal server error",
      ok: false,
    });
  });
});
