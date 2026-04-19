/**
 * Atom/RSS feeds (e.g. lore.kernel.org) often ship XHTML in <content>: <div><pre>…</pre></div>.
 * We normalize to plain text for storage and rendering.
 */

function decodeHtmlEntities(input: string): string {
  return input.replaceAll(
    /&(#(?:x[0-9a-fA-F]+|\d+)|[a-zA-Z][a-zA-Z0-9]*);/g,
    (full) => {
      const inner = full.slice(1, -1);
      if (inner.startsWith("#")) {
        const code = inner.slice(1);
        const cp =
          code.startsWith("x") || code.startsWith("X")
            ? Number.parseInt(code.slice(1), 16)
            : Number.parseInt(code, 10);
        if (Number.isFinite(cp) && cp >= 0 && cp <= 1_114_111) {
          return String.fromCodePoint(cp);
        }
        return full;
      }
      const named: Record<string, string> = {
        amp: "&",
        apos: "'",
        gt: ">",
        lt: "<",
        nbsp: "\u00A0",
        quot: '"',
      };
      return named[inner] ?? full;
    }
  );
}

function stripHtmlToText(html: string): string {
  const withBoundaryBreaks = html
    // public-inbox/lore often emits `</a><span class="head">diff --git ...`;
    // preserve a line break so URLs and diff headers do not glue together.
    .replaceAll(/<\/a>\s*<span\b/gi, "</a>\n<span");

  const withoutTags = withBoundaryBreaks
    .replaceAll(/<br\s*\/?>/gi, "\n")
    .replaceAll(/<\/(p|div|tr|h[1-6]|li)\s*>/gi, "\n")
    .replaceAll("</table>", "\n\n")
    .replaceAll("</TABLE>", "\n\n")
    .replaceAll(/<[^>]+>/g, "");
  const decoded = decodeHtmlEntities(withoutTags);
  return decoded.replaceAll(/\n{3,}/g, "\n\n").trim();
}

/**
 * Interleave text outside <pre> blocks with decoded <pre> contents (lore often wraps diffs in <pre>).
 */
function htmlToPlainWithPres(html: string): string {
  const parts: string[] = [];
  let last = 0;
  const re = /<pre\b[^>]*>([\s\S]*?)<\/pre>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const before = html.slice(last, m.index);
    if (before.trim()) {
      parts.push(stripHtmlToText(before));
    }
    const inner = m[1];
    if (inner) {
      parts.push(stripHtmlToText(inner));
    }
    last = m.index + m[0].length;
  }
  const tail = html.slice(last);
  if (tail.trim()) {
    parts.push(stripHtmlToText(tail));
  }
  return parts
    .filter((p) => p.trim())
    .join("\n\n")
    .trim();
}

/** If any tag-like sequence remains (stale data / odd nesting), strip again. */
function stripResidualHtmlIfAny(text: string): string {
  // Require an actual tag boundary (`<tag ...>` / `</tag>`), not just angle-
  // bracket literals like `<name@example.com>` found in Signed-off-by lines.
  if (!/<\/?[a-zA-Z][a-zA-Z0-9:-]*(?:\s[^>]*)?>/.test(text)) {
    return text;
  }
  return stripHtmlToText(text);
}

/**
 * Remove OpenPGP clearsign armored signature block (base64 between BEGIN/END PGP SIGNATURE).
 * Keeps the signed cleartext; only strips the trailing ASCII-armor blob.
 */
function stripPgpArmoredSignatureBlock(text: string): string {
  return text.replaceAll(
    /\n-----BEGIN PGP SIGNATURE-----[\s\S]*?\n-----END PGP SIGNATURE-----/g,
    ""
  );
}

/**
 * Strip public-inbox HTML mirror chrome when it is concatenated into the body
 * (e.g. copy/paste or odd feed payloads). Safe: real mail rarely contains these
 * exact phrases as the start of a footer section.
 */
function stripPublicInboxArchiveChrome(text: string): string {
  let s = text;
  const cutAt = (re: RegExp): void => {
    const m = re.exec(s);
    if (m) {
      s = s.slice(0, m.index).trimEnd();
    }
  };
  cutAt(/\nReply instructions:\s*\n/m);
  cutAt(/\nThis is a public inbox, see mirroring instructions/m);
  /** Removes thread index lines (`2026-04-17 22:07 …`) and following chrome. */
  cutAt(/(^|\n)Thread overview:/m);
  s = s.replaceAll(/^\s*[\w.-]+\.lists\.[\w.-]+\s+archive mirror\s*$/gm, "");
  s = s.replaceAll(/^\s*help \/ color \/ mirror \/ Atom feed\s*$/gm, "");
  s = s.replaceAll(/^\s*[^\n]*other threads:\s*\[~[^\n]*\s*$/gm, "");
  s = s.replaceAll(/\n{3,}/g, "\n\n");
  return s.trimEnd();
}

/**
 * Light cleanup for mail-archive plain text: glued URLs, MIME/PGP bracket lines.
 * Keeps `>`-quoted lines intact (does not insert newlines after `>` before `http`).
 */
export function normalizeMailingListPlainText(text: string): string {
  let s = text.replaceAll("\r\n", "\n");
  s = s.replaceAll(/^\[--[^\n]+\]\s*$/gm, "");
  s = s.replaceAll(/(?<=[^>\s\n()])(https?:\/\/)/g, "\n$1");
  s = stripPgpArmoredSignatureBlock(s);
  s = stripPublicInboxArchiveChrome(s);
  s = s.replaceAll(/\n{3,}/g, "\n\n");
  return s.trimEnd();
}

/**
 * Turn feed HTML/XHTML into plain text (decode entities, preserve <pre> structure).
 * Safe to call on already-plain bodies (only decodes `&name;` / `&#…;` patterns).
 */
export function feedBodyToPlainText(raw: string): string {
  const rawTrim = raw.trim();
  if (!rawTrim) {
    return "";
  }

  if (!rawTrim.includes("<")) {
    return normalizeMailingListPlainText(decodeHtmlEntities(rawTrim));
  }

  return normalizeMailingListPlainText(
    stripResidualHtmlIfAny(htmlToPlainWithPres(rawTrim))
  );
}
