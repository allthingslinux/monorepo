import { describe, expect, it } from "vitest";

import {
  deriveThreadTags,
  emailDomainTag,
} from "@/features/mailing-lists/lib/derive-thread-tags";

describe("deriveThreadTags", () => {
  it("detects patch and RFC", () => {
    expect(deriveThreadTags("[PATCH] foo")).toContain("patch");
    expect(deriveThreadTags("RFC: something")).toContain("RFC");
  });

  it("returns email domain", () => {
    expect(emailDomainTag("a@kernel.org")).toBe("kernel.org");
    expect(emailDomainTag(null)).toBeNull();
  });
});
