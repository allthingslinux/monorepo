import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AthemeFaultError,
  registerNick,
} from "@/features/integrations/lib/irc/atheme/client";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  startSpan: vi.fn((_, cb) => cb()),
}));

// Mock keys and config to avoid T3-Env validation errors
vi.mock("@/features/integrations/lib/irc/keys", () => ({
  keys: () => ({}),
}));

vi.mock("@/features/integrations/lib/irc/config", () => ({
  ircConfig: {
    atheme: {
      insecureSkipVerify: false,
      jsonrpcUrl: "http://mock-atheme/jsonrpc",
    },
    port: 6697,
    server: "irc.mock.chat",
  },
  isIrcConfigured: () => true,
  isUnrealConfigured: () => true,
}));

describe("Atheme Client", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("registerNick", () => {
    it("sends correct JSON-RPC payload for registration", async () => {
      // Arrange
      const nick = "alice";
      const password = "password123";
      const email = "alice@example.com";
      const ip = "1.2.3.4";
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({ id: "1", jsonrpc: "2.0", result: "Success" }),
        ok: true,
      });

      // Act
      await registerNick(nick, password, email, ip);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        "http://mock-atheme/jsonrpc",
        expect.objectContaining({
          body: JSON.stringify({
            id: "1",
            jsonrpc: "2.0",
            method: "atheme.command",
            params: [
              ".",
              ".",
              ip,
              "NickServ",
              "REGISTER",
              nick,
              password,
              email,
            ],
          }),
          method: "POST",
        })
      );
    });

    it("throws AthemeFaultError when Atheme returns a fault", async () => {
      // Arrange
      const nick = "alice";
      const email = "alice@example.com";
      const ip = "1.2.3.4";
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            error: { code: 8, message: "Nick already registered" },
            id: "1",
            jsonrpc: "2.0",
          }),
        ok: false,
        status: 400,
      });

      // Act & Assert
      await expect(registerNick(nick, "pwd", email, ip)).rejects.toSatisfy(
        (err: unknown) =>
          err instanceof AthemeFaultError &&
          err.code === 8 &&
          err.message === "Nick already registered"
      );
    });

    it("handles generic fetch errors", async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error("Network Error"));

      // Act
      const act = registerNick("alice", "pwd", "alice@example.com", "1.2.3.4");

      // Assert
      await expect(act).rejects.toThrow("Network Error");
    });

    it("uses undici dispatcher when insecureSkipVerify is true", async () => {
      // Arrange
      const { ircConfig } =
        await import("@/features/integrations/lib/irc/config");
      const originalValue = ircConfig.atheme.insecureSkipVerify;
      (ircConfig.atheme as any).insecureSkipVerify = true;

      try {
        mockFetch.mockResolvedValueOnce({
          json: () =>
            Promise.resolve({ id: "1", jsonrpc: "2.0", result: "Success" }),
          ok: true,
        });

        // Act
        await registerNick("alice", "password123", "alice@example.com");

        // Assert
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            dispatcher: expect.any(Object),
          })
        );
      } finally {
        // Reset config for other tests
        (ircConfig.atheme as any).insecureSkipVerify = originalValue;
      }
    });
  });
});
