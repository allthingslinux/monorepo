import { describe, expect, it } from "vitest";

import { parseFeedAuthorString } from "@/features/mailing-lists/lib/adapters/rss-atom";

describe("parseFeedAuthorString", () => {
  it("parses Name <email>", () => {
    expect(parseFeedAuthorString(`Jane <jane@example.com>`)).toEqual({
      authorEmail: "jane@example.com",
      authorName: "Jane",
    });
  });

  it("parses RSS-style email (Display Name)", () => {
    expect(parseFeedAuthorString("bob@example.com (Bob Smith)")).toEqual({
      authorEmail: "bob@example.com",
      authorName: "Bob Smith",
    });
  });

  it("parses bare email", () => {
    expect(parseFeedAuthorString("solo@example.org")).toEqual({
      authorEmail: "solo@example.org",
      authorName: null,
    });
  });

  it("treats non-email text as display name", () => {
    expect(parseFeedAuthorString("Alice")).toEqual({
      authorEmail: null,
      authorName: "Alice",
    });
  });
});
