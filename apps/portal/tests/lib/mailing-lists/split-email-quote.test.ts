import { describe, expect, it } from "vitest";

import { splitEmailQuotedBody } from "@/features/mailing-lists/lib/split-email-quote";

describe("splitEmailQuotedBody", () => {
  it("treats [ ... ] with spaces as a truncation line inside a >-quoted block", () => {
    const body = `Top reply.

On Mon wrote:

> line one
> [ ... ]
> line two`;

    const { main, quoted } = splitEmailQuotedBody(body);
    expect(main).toBe("Top reply.");
    expect(quoted).toContain("[ ... ]");
    expect(quoted).toContain("> line two");
  });

  it("splits Name <email> writes: (public-inbox style)", () => {
    const body = `Hi,

Michał Górny <mgorny@gentoo.org> writes:

> Hello, everyone.

My reply.`;

    const { main, quoted } = splitEmailQuotedBody(body);
    expect(main).toContain("Hi,");
    expect(main).toContain("My reply.");
    expect(quoted).toContain("Michał Górny <mgorny@gentoo.org> writes:");
    expect(quoted).toContain("> Hello");
  });

  it("splits Name writes: like On … wrote: for nested English replies", () => {
    const body = `Thanks for the thread.

Morten Linderud writes:

> Original mail body
> line two

Hi,
one more thing.`;

    const { main, quoted } = splitEmailQuotedBody(body);
    expect(main).toContain("Thanks for the thread.");
    expect(main).toContain("one more thing");
    expect(quoted).toContain("Morten Linderud writes:");
    expect(quoted).toContain("> Original mail");
    expect(quoted).not.toContain("one more thing");
  });

  it("splits On … wrote: so quoted is only attribution and > lines", () => {
    const body = `Thanks for the draft.

On 4/5/26 10:14 AM, Robin Candau wrote:

> Kea text here
> more`;

    const { main, quoted } = splitEmailQuotedBody(body);
    expect(main).toBe("Thanks for the draft.");
    expect(quoted).toContain("On 4/5/26 10:14 AM, Robin Candau wrote:");
    expect(quoted).toContain("> Kea text here");
    expect(quoted).not.toContain("Thanks for the draft.");
  });

  it("when body starts with On and leading > was stripped, lines before first > are still quoted", () => {
    const body = `On Sat, 18 Apr 2026 at 19:45, <sashiko-bot@kernel.org> wrote:

Sashiko AI review found 1 potential issue(s):

> commit deadbeef
> Author: Someone

Perhaps, I will check and adjust if necessary.
`;

    const { main, quoted } = splitEmailQuotedBody(body);
    expect(quoted).toContain("On Sat, 18 Apr 2026 at 19:45");
    expect(quoted).toContain("Sashiko AI review");
    expect(quoted).toContain("commit deadbeef");
    expect(quoted).not.toContain("Perhaps");
    expect(main).toContain("Perhaps, I will check");
  });

  it("when main exists above On and the body after On is not >-quoted, all of that tail is quoted", () => {
    const body = `Programs not using BTF are legacy.

On Sat, 18 Apr 2026 at 19:06, wrote:

Sashiko AI review found 1 potential issue(s):

commit deadbeef
Author: Someone

diff --git a/x b/x
--- a/x
+++ b/x
`;

    const { main, quoted } = splitEmailQuotedBody(body);
    expect(main.trim()).toBe("Programs not using BTF are legacy.");
    expect(quoted).toContain("On Sat, 18 Apr 2026 at 19:06, wrote:");
    expect(quoted).toContain("Sashiko AI review");
    expect(quoted).toContain("diff --git");
    expect(main).not.toContain("Sashiko");
  });

  it("keeps new reply after quoted block in main (not inside quoted)", () => {
    const body = `On 20.03.26 at 10:47 (UTC+0100), Antonio Rojas wrote:

> Original mail body
> line two

Hi,
let me also add packages.

- pkg-a
- pkg-b`;

    const { main, quoted } = splitEmailQuotedBody(body);
    expect(quoted).toContain("Antonio Rojas wrote");
    expect(quoted).toContain("> Original mail");
    expect(quoted).not.toContain("let me also add");
    expect(quoted).not.toContain("pkg-a");
    expect(main).toContain("Hi,");
    expect(main).toContain("let me also add");
    expect(main).toContain("pkg-a");
  });

  it("splits leading > block after blank line when main exists above", () => {
    const body = `My reply here.

> quoted line one
> quoted line two`;

    const { main, quoted } = splitEmailQuotedBody(body);
    expect(main).toBe("My reply here.");
    expect(quoted).toContain("> quoted line one");
  });

  it("does not split when entire body is >-quoted (no main)", () => {
    const body = `> only quoted
> lines here`;
    const { main, quoted } = splitEmailQuotedBody(body);
    expect(quoted).toBeNull();
    expect(main).toBe(body);
  });

  it("merges URL-only mainAfter into quoted when the last line lost its > prefix", () => {
    const body = `On Mon wrote:

> quoted body
> Sashiko AI review · https://sashiko.dev/x?part=4
https://sashiko.dev/x?part=4
`;

    const { main, quoted } = splitEmailQuotedBody(body);
    expect(main).toBe("");
    expect(quoted).toContain("> quoted body");
    expect(quoted).toContain("Sashiko AI review");
    expect(quoted).toContain("https://sashiko.dev/x?part=4");
  });

  it("drops duplicate bare URL from main when the same URL is already in quoted", () => {
    const body = `On Mon wrote:

> See https://sashiko.dev/x
https://sashiko.dev/x
`;

    const { main, quoted } = splitEmailQuotedBody(body);
    expect(main).toBe("");
    expect(quoted).toContain("https://sashiko.dev/x");
  });

  it("keeps URL+tag continuation in quoted when archive dropped leading >", () => {
    const body = `On Fri, 17 Apr 2026 at 15:08, Dave Airlie wrote:

>
https://gitlab.freedesktop.org/drm/kernel.git tags/drm-fixes-2026-04-18

The reason pr-tracker-bot immediately told you it was merged is that
this tag seems to just point to the v7.0 release.
`;

    const { main, quoted } = splitEmailQuotedBody(body);
    expect(quoted).toContain(
      "On Fri, 17 Apr 2026 at 15:08, Dave Airlie wrote:"
    );
    expect(quoted).toContain(
      "https://gitlab.freedesktop.org/drm/kernel.git tags/drm-fixes-2026-04-18"
    );
    expect(main).toContain("The reason pr-tracker-bot");
    expect(main).not.toContain("tags/drm-fixes-2026-04-18");
  });

  it("when body starts with On and there is no > anywhere, entire tail is quoted", () => {
    const body = `On Mon wrote:

Plain forward only.
No angle quote markers at all.`;

    const { main, quoted } = splitEmailQuotedBody(body);
    expect(main).toBe("");
    expect(quoted).toContain("On Mon wrote");
    expect(quoted).toContain("Plain forward only");
  });

  it("returns no split when no quote pattern", () => {
    const body = "Just a single paragraph.\n\nNo attribution.";
    const { main, quoted } = splitEmailQuotedBody(body);
    expect(quoted).toBeNull();
    expect(main).toBe(body);
  });
});
