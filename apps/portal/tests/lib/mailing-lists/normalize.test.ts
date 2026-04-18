import { describe, expect, it } from "vitest";

import {
  normalizeRfcMessageId,
  normalizeSubjectKey,
  normalizeThreadSubjectKey,
  stripSubjectReplyPrefixesForDisplay,
} from "@/features/mailing-lists/lib/normalize";

describe("normalizeSubjectKey", () => {
  it("strips Re: chains", () => {
    expect(normalizeSubjectKey("Re: Re: Hello world")).toBe("hello world");
  });

  it("trims and lowercases", () => {
    expect(normalizeSubjectKey("  Patch: fix thing  ")).toBe(
      "patch: fix thing"
    );
  });
});

describe("normalizeThreadSubjectKey", () => {
  it("merges Arch epoch:ver-pkgrel variants into one thread key", () => {
    const a = normalizeThreadSubjectKey(
      "News draft: kea >= 1:3.0.3-2 update requires manual intervention"
    );
    const b = normalizeThreadSubjectKey(
      "Re: News draft: kea >= 1:3.0.3-3 update requires manual intervention"
    );
    expect(a).toBe(b);
    expect(a).toContain("__pkg__");
  });
});

describe("normalizeRfcMessageId", () => {
  it("strips angle brackets", () => {
    expect(normalizeRfcMessageId("<foo@bar.example>")).toBe("foo@bar.example");
  });
});

describe("stripSubjectReplyPrefixesForDisplay", () => {
  it("strips Re: for display without lowercasing", () => {
    expect(stripSubjectReplyPrefixesForDisplay("Re: Spring cleanup '26")).toBe(
      "Spring cleanup '26"
    );
  });

  it("strips nested Re:", () => {
    expect(stripSubjectReplyPrefixesForDisplay("Re: Re: Hello")).toBe("Hello");
  });
});
