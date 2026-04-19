import { describe, expect, it } from "vitest";

import {
  feedBodyToPlainText,
  normalizeMailingListPlainText,
} from "@/features/mailing-lists/lib/feed-body-plain";

describe("feedBodyToPlainText", () => {
  it("decodes entities in plain text", () => {
    expect(feedBodyToPlainText("a &gt; b &amp; c")).toBe("a > b & c");
  });

  it("strips XHTML wrapper and extracts pre (lore-style)", () => {
    const html = `<div type="xhtml"><div xmlns="http://www.w3.org/1999/xhtml"><pre style="white-space:pre-wrap">line1
line2</pre></div></div>`;
    expect(feedBodyToPlainText(html)).toBe("line1\nline2");
  });

  it("interleaves prose outside pre with pre blocks", () => {
    const html = `<p>Hello</p><pre>code &gt; x</pre><p>Bye</p>`;
    expect(feedBodyToPlainText(html)).toContain("Hello");
    expect(feedBodyToPlainText(html)).toContain("code > x");
    expect(feedBodyToPlainText(html)).toContain("Bye");
  });

  it("splits glued URLs and strips MIME bracket lines", () => {
    const raw = `See refs\nhttps://wiki.example.org/foohttps://github.com/bar/baz\n\n[-- Attachment #1: Type: text/plain, Size: 3690 bytes --]\n`;
    expect(normalizeMailingListPlainText(raw)).toBe(
      "See refs\nhttps://wiki.example.org/foo\nhttps://github.com/bar/baz"
    );
  });

  it("does not split (https://) markdown-style links", () => {
    expect(normalizeMailingListPlainText("x [t](https://a.com) y")).toBe(
      "x [t](https://a.com) y"
    );
  });

  it("strips public-inbox mirror chrome after the message body", () => {
    const raw = `Hello list.

Reply instructions:

You may reply publicly to this message via plain-text email

distributions.lists.linux.dev archive mirror
 help / color / mirror / Atom feed`;

    const out = normalizeMailingListPlainText(raw);
    expect(out).toBe("Hello list.");
    expect(out).not.toContain("Reply instructions");
    expect(out).not.toContain("distributions.lists");
  });

  it("strips reply/other threads nav line (not only next/…)", () => {
    const raw = `Announcement body.

                 reply	other threads:[~2026-02-16 14:20 UTC|newest]

Thread overview: [no followups] expand[flat|nested]  mbox.gz  Atom feed`;

    const out = normalizeMailingListPlainText(raw);
    expect(out.trim()).toBe("Announcement body.");
  });

  it("strips hyphenated *.lists.* archive mirror lines (freedesktop)", () => {
    const raw = `Hello.

dri-devel.lists.freedesktop.org archive mirror
 help / color / mirror / Atom feed`;

    expect(normalizeMailingListPlainText(raw).trim()).toBe("Hello.");
  });

  it("cuts multi-line thread index after Thread overview:", () => {
    const raw = `Linus reply text.

Thread overview: 3+ messages / expand[flat|nested]  mbox.gz  Atom feed  top
2026-04-17 22:07 [git pull] drm for v7.1-rc1 (part two) Dave Airlie
2026-04-18  1:06 \` Linus Torvalds [this message]`;

    const out = normalizeMailingListPlainText(raw).trim();
    expect(out).toBe("Linus reply text.");
    expect(out).not.toContain("Thread overview");
    expect(out).not.toContain("Dave Airlie");
  });

  it("strips OpenPGP armored signature after clearsigned body", () => {
    const raw = `Text before.

-----BEGIN PGP SIGNATURE-----

iVBORw0KGgo=
=gRNx
-----END PGP SIGNATURE-----

After should not appear if between markers only.`;

    const out = normalizeMailingListPlainText(raw);
    expect(out).toContain("Text before.");
    expect(out).not.toContain("BEGIN PGP SIGNATURE");
    expect(out).not.toContain("iVBORw0KGgo");
    expect(out).toContain("After should not appear");
  });

  it("strips span markup inside pre (lore wraps diff lines)", () => {
    const html = `<pre><span class="q">&gt; diff --git a/x b/x</span>\n<span class="add">+foo</span>\n<a href="https://x">link</a></pre>`;
    const out = feedBodyToPlainText(html);
    expect(out).not.toMatch(/<span/i);
    expect(out).not.toMatch(/<a/i);
    expect(out).toContain("diff --git");
    expect(out).toContain("+foo");
    expect(out).toContain("link");
  });

  it("keeps newline between lore link and following diff header span", () => {
    const html = `<pre>- Link to v1: <a href="https://lore.kernel.org/all/20260416093150.13853-1-rmxpzlb@gmail.com/">https://lore.kernel.org/all/20260416093150.13853-1-rmxpzlb@gmail.com/</a><span class="head">diff --git a/drivers/gpu/drm/bridge/synopsys/dw-hdmi-qp.c b/drivers/gpu/drm/bridge/synopsys/dw-hdmi-qp.c</span></pre>`;
    const out = feedBodyToPlainText(html);
    expect(out).toContain(
      "https://lore.kernel.org/all/20260416093150.13853-1-rmxpzlb@gmail.com/\ndiff --git a/drivers/gpu/drm/bridge/synopsys/dw-hdmi-qp.c b/drivers/gpu/drm/bridge/synopsys/dw-hdmi-qp.c"
    );
  });

  it("preserves signed-off-by angle-bracket email addresses", () => {
    const html =
      "<pre>Signed-off-by: Guangshuo Li &lt;lgs201920130244@gmail.com&gt;</pre>";
    const out = feedBodyToPlainText(html);
    expect(out).toContain(
      "Signed-off-by: Guangshuo Li <lgs201920130244@gmail.com>"
    );
  });

  it("does not insert synthetic blank lines between adjacent syntax spans", () => {
    const html =
      '<pre><span class="head">--- a/file.c</span><span class="head">+++ b/file.c</span></pre>';
    const out = feedBodyToPlainText(html);
    expect(out).toBe("--- a/file.c+++ b/file.c");
  });
});
