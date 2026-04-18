import Parser from "rss-parser";

import {
  MAILING_LIST_FETCH_REVALIDATE_SECONDS,
  MAILING_LIST_ITEMS_PER_SYNC,
} from "@atl/config/mailing-lists";

import { feedBodyToPlainText } from "../feed-body-plain";
import type { NormalizedFeedItem } from "../types";

const parser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["dc:creator", "dcCreator"],
      ["in-reply-to", "inReplyTo"],
      ["summary", "summary"],
      ["thr:in-reply-to", "thrInReplyTo"],
    ],
  },
});

function decodeBasicXmlEntities(text: string): string {
  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

/**
 * rss-parser can reorder chunks inside Atom XHTML `content` for public-inbox feeds.
 * Build a fallback map from raw XML entry link -> raw content inner XML to preserve
 * source order for downstream plain-text normalization.
 */
function extractRawAtomContentByLink(xml: string): Map<string, string> {
  const out = new Map<string, string>();
  const entries = xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi);

  for (const match of entries) {
    const entry = match[0];
    const linkMatch = /<link\b[^>]*\bhref=(["'])(.*?)\1[^>]*>/i.exec(entry);
    if (!linkMatch?.[2]) {
      continue;
    }

    const contentMatch = /<content\b[^>]*>([\s\S]*?)<\/content>/i.exec(entry);
    const summaryMatch = /<summary\b[^>]*>([\s\S]*?)<\/summary>/i.exec(entry);
    const raw = contentMatch?.[1] ?? summaryMatch?.[1] ?? "";
    if (!raw.trim()) {
      continue;
    }

    out.set(decodeBasicXmlEntities(linkMatch[2].trim()), raw);
  }

  return out;
}

function resolveLink(item: Parser.Item): string {
  const raw = item.link ?? item.guid;
  if (typeof raw === "string") {
    return raw || "#";
  }
  if (typeof raw === "object" && raw !== null && "href" in raw) {
    return String((raw as { href?: string }).href) || "#";
  }
  return "#";
}

/**
 * Parse common RSS/Atom author string shapes into name and email.
 * Exported for unit tests.
 */
export function parseFeedAuthorString(raw: string): {
  authorEmail: string | null;
  authorName: string | null;
} {
  const s = raw.trim();
  if (!s) {
    return { authorEmail: null, authorName: null };
  }

  const angle = s.match(/^(.+?)\s*<([^>\s]+@[^>\s]+)>\s*$/);
  if (angle) {
    const name = angle[1]?.trim().replaceAll(/^["']|["']$/g, "") ?? null;
    const email = angle[2]?.trim() ?? null;
    return { authorEmail: email, authorName: name };
  }

  const paren = s.match(/^([^\s<>]+@[^\s<>]+)\s*\((.+)\)\s*$/);
  if (paren) {
    return {
      authorEmail: paren[1]?.trim() ?? null,
      authorName: paren[2]?.trim() ?? null,
    };
  }

  if (/^[^\s@]+@[^\s@]+$/.test(s)) {
    return { authorEmail: s, authorName: null };
  }

  return { authorEmail: null, authorName: s };
}

function extractAuthor(item: Parser.Item): {
  authorEmail: string | null;
  authorName: string | null;
} {
  const extended = item as Parser.Item & {
    creator?: string;
    dcCreator?: string;
  };

  const candidates: string[] = [];
  if (typeof extended.creator === "string" && extended.creator.trim()) {
    candidates.push(extended.creator);
  }
  if (typeof extended.dcCreator === "string" && extended.dcCreator.trim()) {
    candidates.push(extended.dcCreator);
  }

  for (const c of candidates) {
    const p = parseFeedAuthorString(c);
    if (p.authorName || p.authorEmail) {
      return p;
    }
  }

  const extendedItem = item as Parser.Item & {
    author?: string | { email?: string; name?: string };
  };
  const author = extendedItem.author;
  if (typeof author === "string" && author.trim()) {
    return parseFeedAuthorString(author);
  }
  if (author && typeof author === "object") {
    const a = author as { email?: string; name?: string };
    const name = typeof a.name === "string" ? a.name.trim() : null;
    const email = typeof a.email === "string" ? a.email.trim() : null;
    if (name || email) {
      return { authorEmail: email, authorName: name };
    }
  }

  return { authorEmail: null, authorName: null };
}

/**
 * Atom threading extension (`thr:in-reply-to ref="...") or plain RSS `in-reply-to`.
 */
function extractInReplyTo(item: Parser.Item): string | null {
  const ext = item as Record<string, unknown>;
  const thr = ext.thrInReplyTo;
  if (thr && typeof thr === "object" && thr !== null && "$" in thr) {
    const ref = (thr as { $?: { ref?: string } }).$?.ref;
    if (typeof ref === "string" && ref.trim()) {
      return ref.trim();
    }
  }
  const ir = ext.inReplyTo;
  if (typeof ir === "string" && ir.trim()) {
    return ir.trim();
  }
  return null;
}

function extractBody(item: Parser.Item, rawBodyFromXml?: string): string {
  if (typeof rawBodyFromXml === "string" && rawBodyFromXml.trim()) {
    return feedBodyToPlainText(rawBodyFromXml);
  }

  const extended = item as Parser.Item & {
    content?: string;
    contentEncoded?: string;
    summary?: string;
  };
  const raw =
    extended.contentEncoded ??
    extended.content ??
    extended.summary ??
    extended.contentSnippet ??
    "";
  if (typeof raw === "string") {
    return feedBodyToPlainText(raw);
  }
  return "";
}

/**
 * Fetch and parse an RSS or Atom feed into normalized items.
 */
export async function fetchRssAtomItems(
  feedUrl: string,
  options?: { bypassNextDataCache?: boolean }
): Promise<NormalizedFeedItem[]> {
  const cacheInit =
    options?.bypassNextDataCache === true
      ? { cache: "no-store" as const }
      : { next: { revalidate: MAILING_LIST_FETCH_REVALIDATE_SECONDS } };

  const res = await fetch(feedUrl, {
    headers: {
      Accept:
        "application/atom+xml, application/rss+xml, application/xml, text/xml, */*",
      // Browser-like UA: lore.kernel.org returns 403 for minimal/bot-like agents.
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ATL-Portal-MailingLists/1.0 (+https://atl.tools)",
    },
    ...cacheInit,
  });

  if (!res.ok) {
    throw new Error(`Feed fetch failed: ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  const parsed = await parser.parseString(xml);
  const items = parsed.items ?? [];
  const rawBodyByLink = extractRawAtomContentByLink(xml);

  const out: NormalizedFeedItem[] = [];
  for (const item of items.slice(0, MAILING_LIST_ITEMS_PER_SYNC)) {
    const title = (item.title ?? "(no subject)").trim();
    const link = resolveLink(item);
    const bodyText = extractBody(item, rawBodyByLink.get(link));
    let publishedAt: Date | null = null;
    if (item.isoDate) {
      publishedAt = new Date(item.isoDate);
    } else if (item.pubDate) {
      publishedAt = new Date(item.pubDate);
    }
    let guid: string | null = null;
    if (typeof item.guid === "string") {
      guid = item.guid;
    } else if (
      typeof item.guid === "object" &&
      item.guid !== null &&
      "_" in item.guid
    ) {
      guid = String((item.guid as { _: string })._);
    } else {
      guid = item.link ?? null;
    }

    let safePublished: Date | null = publishedAt;
    if (safePublished && Number.isNaN(safePublished.getTime())) {
      safePublished = null;
    }

    const { authorEmail, authorName } = extractAuthor(item);
    const inReplyTo = extractInReplyTo(item);

    out.push({
      authorEmail,
      authorName,
      bodyText,
      guid: guid?.length ? guid : null,
      inReplyTo,
      link,
      publishedAt: safePublished,
      title,
    });
  }

  return out;
}
