import { afterEach, describe, expect, it, vi } from "vitest";

import { unrealRpcClient } from "@/features/integrations/lib/irc/unreal/client";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  startSpan: vi.fn((_, cb) => cb()),
}));

// Mock keys and config to avoid T3-Env validation errors
process.env.SKIP_ENV_VALIDATION = "true";

vi.mock("@/features/integrations/lib/irc/keys", () => ({
  keys: () => ({}),
}));

vi.mock("@/features/integrations/lib/irc/config", () => ({
  ircConfig: {
    unreal: {
      insecureSkipVerify: false,
      jsonrpcUrl: "http://mock-unreal/jsonrpc",
      rpcPassword: "rpcpassword",
      rpcUser: "rpcuser",
    },
  },
  isIrcConfigured: () => true,
  isUnrealConfigured: () => true,
}));

describe("UnrealIRCd Client", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("userList", () => {
    it("fetches user list with correct payload (UnrealIRCd returns { list: [...] })", async () => {
      // Arrange — UnrealIRCd list methods return { list: [...] }
      const mockUsers = [{ nick: "alice", realname: "Alice" }];
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          jsonrpc: "2.0",
          result: { list: mockUsers },
          id: 1,
        }),
        ok: true,
      });

      // Act
      const result = await unrealRpcClient.userList();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://mock-unreal/jsonrpc/api",
        expect.objectContaining({
          body: expect.stringContaining('"method":"user.list"'),
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Basic "),
          }),
          method: "POST",
        })
      );
    });

    it("handles errors and returns empty array", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ error: { message: "Internal Server Error" } }),
        ok: false,
        status: 500,
      });

      // Act
      const result = await unrealRpcClient.userList();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("channelList", () => {
    it("fetches channel list (UnrealIRCd returns { list: [...] })", async () => {
      // Arrange — UnrealIRCd list methods return { list: [...] }
      const mockChannels = [{ name: "#allthingslinux" }];
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          jsonrpc: "2.0",
          result: { list: mockChannels },
          id: 1,
        }),
        ok: true,
      });

      // Act
      const result = await unrealRpcClient.channelList();

      // Assert
      expect(result).toEqual(mockChannels);
    });

    it("handles channel list errors and returns empty array", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ error: { message: "Internal Server Error" } }),
        ok: false,
        status: 500,
      });

      // Act
      const result = await unrealRpcClient.channelList();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("userGet", () => {
    it("fetches a single user by nick (UnrealIRCd returns { client: {...} })", async () => {
      // Arrange — UnrealIRCd user.get returns { client: {...} }
      const mockUser = { nick: "alice", realname: "Alice" };
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          jsonrpc: "2.0",
          result: { client: mockUser },
          id: 1,
        }),
        ok: true,
      });

      // Act
      const result = await unrealRpcClient.userGet("alice");

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"method":"user.get"'),
        })
      );
    });

    it("returns null on error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ error: { message: "Not found" } }),
        ok: false,
        status: 404,
      });

      // Act
      const result = await unrealRpcClient.userGet("unknown");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("channelGet", () => {
    it("fetches a single channel by name (UnrealIRCd returns { channel: {...} })", async () => {
      // Arrange — UnrealIRCd channel.get returns { channel: {...} }
      const mockChannel = { name: "#test" };
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          jsonrpc: "2.0",
          result: { channel: mockChannel },
          id: 1,
        }),
        ok: true,
      });

      // Act
      const result = await unrealRpcClient.channelGet("#test");

      // Assert
      expect(result).toEqual(mockChannel);
    });

    it("returns null on error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        json: async () => ({ error: { message: "Not found" } }),
        ok: false,
        status: 404,
      });

      // Act
      const result = await unrealRpcClient.channelGet("#unknown");

      // Assert
      expect(result).toBeNull();
    });
  });
});