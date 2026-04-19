const SUBJECT_PREFIX_RE = /^(re|aw|fwd|fw)\s*:\s*/i;
const REPLY_SUBJECT_CHAIN_RE = /^((re|aw|fwd|fw)\s*:\s*)+/i;
const PATCH_STYLE_TAG_RE =
  /\[(?:[^\]]*?(?:patch|rfc|resend|v\d+|\d+\/\d+)[^\]]*)\]\s*/gi;

/**
 * Arch-style `epoch:version-pkgrel` (e.g. `1:3.0.3-2`). Replies often bump only pkgrel;
 * normalizing to a placeholder keeps those messages in one thread.
 */
const ARCH_EPOCH_VER_PKGREL_RE = /\b\d+:\d+(?:\.\d+)+-\d+\b/g;

/**
 * Collapse Re:/Fwd: chains and lowercase for stable thread grouping from RSS titles.
 */
export function normalizeSubjectKey(subject: string): string {
  let s = subject.trim();
  let prev = "";
  while (s !== prev) {
    prev = s;
    s = s.replace(SUBJECT_PREFIX_RE, "").trim();
  }
  return s.toLowerCase().slice(0, 512);
}

/**
 * Strip Re:/Fwd: chains for thread/message titles in the UI. Feeds keep the raw
 * email Subject (often "Re: …"); grouping already uses {@link normalizeThreadSubjectKey}.
 */
export function stripSubjectReplyPrefixesForDisplay(subject: string): string {
  let s = subject.trim();
  let prev = "";
  while (s !== prev) {
    prev = s;
    s = s.replace(SUBJECT_PREFIX_RE, "").trim();
  }
  return s;
}

/**
 * Subject key used for **thread** grouping: strips Re:/Fwd:, lowercases, then collapses
 * Arch package version tokens so `…-2` vs `…-3` in the subject still map to one thread.
 */
export function normalizeThreadSubjectKey(subject: string): string {
  let key = normalizeSubjectKey(subject);
  key = key.replace(ARCH_EPOCH_VER_PKGREL_RE, "__pkg__");
  return key.replaceAll(/\s+/g, " ").trim();
}

/**
 * Reply marker for subjects where feed metadata lacks explicit parent references.
 */
export function isReplyLikeSubject(subject: string): boolean {
  return REPLY_SUBJECT_CHAIN_RE.test(subject.trim());
}

/**
 * Looser thread key used as a fallback when explicit reply metadata is absent.
 * It removes common patch-series bracket tags so `Re: [PATCH v2 08/10] ...`
 * can still join `[PATCH 08/10] ...` in the same source.
 */
export function normalizeLooseThreadSubjectKey(subject: string): string {
  let key = normalizeThreadSubjectKey(subject);
  key = key.replace(PATCH_STYLE_TAG_RE, "");
  key = key.replaceAll(/\b(?:v\d+)\b/gi, "");
  return key.replaceAll(/\s+/g, " ").trim();
}

/** Strip angle brackets for Message-ID / In-Reply-To comparisons and storage. */
export function normalizeRfcMessageId(
  raw: string | null | undefined
): string | null {
  if (raw === undefined || raw === null) {
    return null;
  }
  const s = raw.trim();
  if (!s) {
    return null;
  }
  return s.replaceAll(/^<|>$/g, "");
}
