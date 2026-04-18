/**
 * Lightweight subject-line tags for UI chips (no DB).
 */
export function deriveThreadTags(subject: string): string[] {
  const tags: string[] = [];
  const upper = subject.toUpperCase();

  if (/\[PATCH\]/i.test(subject) || /^patch:/i.test(subject.trim())) {
    tags.push("patch");
  }
  if (/\bRFC\b/i.test(subject)) {
    tags.push("RFC");
  }
  if (/\bRESEND\b/i.test(upper)) {
    tags.push("resend");
  }
  if (/\bANNOUNCE\b/i.test(upper) || /\[ANNOUNCE/i.test(subject)) {
    tags.push("announce");
  }

  return tags;
}

export function emailDomainTag(authorEmail: string | null): string | null {
  if (!authorEmail?.includes("@")) {
    return null;
  }
  const domain = authorEmail.split("@")[1]?.trim().toLowerCase();
  if (!domain) {
    return null;
  }
  return domain;
}
