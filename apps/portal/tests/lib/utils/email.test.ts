import { afterEach, describe, expect, it, vi } from "vitest";

import { sendEmail } from "@atl/utils/email";

describe("sendEmail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should log email details in development", () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function -- mock
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
    // eslint-disable-next-line @typescript-eslint/no-empty-function -- mock
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
