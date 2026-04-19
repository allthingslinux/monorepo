import { describe, expect, it } from "vitest";

import {
  isReplyLikeSubject,
  normalizeLooseThreadSubjectKey,
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

describe("normalizeLooseThreadSubjectKey", () => {
  it("normalizes patch-series bracket variants to one fallback key", () => {
    const a = normalizeLooseThreadSubjectKey(
      "Re: [PATCH v2 08/10] ARM: dts: qcom: msm8960: add SMSM & SPS"
    );
    const b = normalizeLooseThreadSubjectKey(
      "[PATCH 08/10] ARM: dts: qcom: msm8960: add SMSM & SPS"
    );
    expect(a).toBe(b);
    expect(a).toBe("arm: dts: qcom: msm8960: add smsm & sps");
  });
});

describe("isReplyLikeSubject", () => {
  it("detects reply-prefix chains", () => {
    expect(isReplyLikeSubject("Re: Re: patch discussion")).toBe(true);
    expect(isReplyLikeSubject("Fwd: topic")).toBe(true);
    expect(isReplyLikeSubject("[PATCH] topic")).toBe(false);
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
