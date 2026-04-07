import { db } from "@atl/db/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerNick } from "@/features/integrations/lib/irc/atheme/client";
import { ircIntegration } from "@/features/integrations/lib/irc/implementation";

// Mock keys and config
vi.mock("@/features/integrations/lib/irc/keys", () => ({ keys: () => ({}) }));
vi.mock("@/features/integrations/lib/mailcow/keys", () => ({
  keys: () => ({}),
}));
vi.mock("@/features/integrations/lib/xmpp/keys", () => ({ keys: () => ({}) }));
vi.mock("@atl/db/keys", () => ({ keys: () => ({}) }));
vi.mock("@/features/auth/lib/keys", () => ({ keys: () => ({}) }));
vi.mock("@/features/integrations/lib/irc/config", () => ({
  ircConfig: { port: 6697, server: "irc.mock.chat" },
  isAthemeOperConfigured: () => false,
  isIrcConfigured: () => true,
  isUnrealConfigured: () => true,
}));

// Mock DB with chainable methods
vi.mock("@atl/db/client", () => ({
  db: {
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => []),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => []),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => []),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => []),
        })),
      })),
    })),
  },
}));

// Mock Atheme
vi.mock("@/features/integrations/lib/irc/atheme/client", () => ({
  AthemeFaultError: class extends Error {
    code = 8;
    fault = { code: 8, message: "Fault" };
  },
  registerNick: vi.fn(),
}));

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  startSpan: vi.fn((_, cb) => cb()),
}));

describe("IrcIntegration Logic", () => {
  const userId = "user-123";
  const userEmail = "test@example.com";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAccount", () => {
    it("follows the registration state machine: pending -> register -> active", async () => {
      // Arrange
      const nick = "alice";
      (db.select as any)
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn(() => [{ email: userEmail, username: nick }]),
            })),
          })),
        })
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({ limit: vi.fn(() => []) })),
          })),
        })
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({ limit: vi.fn(() => []) })),
          })),
        })
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({ limit: vi.fn(() => []) })),
          })),
        });

      (db.insert as any).mockReturnValueOnce({
        values: vi.fn(() => ({
          returning: vi.fn(() => [
            { id: "acc-1", nick, status: "pending", userId },
          ]),
        })),
      });

      (db.update as any).mockReturnValueOnce({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => [
              { id: "acc-1", nick, status: "active", userId },
            ]),
          })),
        })),
      });

      // Act
      const result = await ircIntegration.createAccount(userId, {});

      // Assert
      expect(result.nick).toBe(nick);
      expect(result.status).toBe("active");
      expect(registerNick).toHaveBeenCalledWith(
        nick,
        expect.any(String),
        userEmail
      );
    });

    it("cleans up pending record if Atheme registration fails", async () => {
      // Arrange
      const nick = "alice";
      (db.select as any)
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn(() => [{ email: userEmail, username: nick }]),
            })),
          })),
        })
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({ limit: vi.fn(() => []) })),
          })),
        })
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({ limit: vi.fn(() => []) })),
          })),
        })
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({ limit: vi.fn(() => []) })),
          })),
        });

      (db.insert as any).mockReturnValueOnce({
        values: vi.fn(() => ({
          returning: vi.fn(() => [
            { id: "acc-1", nick, status: "pending", userId },
          ]),
        })),
      });

      (registerNick as any).mockRejectedValueOnce(new Error("Atheme down"));

      // Act & Assert
      await expect(ircIntegration.createAccount(userId, {})).rejects.toThrow(
        "Atheme down"
      );
      expect(db.delete).toHaveBeenCalled();
    });
  });
});
