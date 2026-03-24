import { sendEmail } from "@portal/utils/email";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("sendEmail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should log email details in development", () => {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: Suppress console.log in tests
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    sendEmail({
      html: "<p>Test content</p>",
      subject: "Test Subject",
      to: "test@example.com",
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "📧 Email would be sent:",
      expect.objectContaining({
        content: "<p>Test content</p>",
        subject: "Test Subject",
        to: "test@example.com",
      })
    );
  });

  it("should handle text content", () => {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: Suppress console.log in tests
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    sendEmail({
      subject: "Test Subject",
      text: "Plain text content",
      to: "test@example.com",
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "📧 Email would be sent:",
      expect.objectContaining({
        content: "Plain text content",
        subject: "Test Subject",
        to: "test@example.com",
      })
    );
  });
});