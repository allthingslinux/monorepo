/**
 * Minimal RSS 2.0 parsing for KDE community calendar index.xml (Hugo).
 * No reliable event datetime in the feed — we omit `startsAt` so the UI sorts these last (TBD).
 */

import type { EventSource, ManualCalendarEvent } from "@/config/events";

const ITEM_RE = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;

function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  if (!m?.[1]) {
    return "";
  }
  let v = m[1].trim();
  if (v.startsWith("<![CDATA[")) {
    v = v
      .slice(9)
      .replace(/\]\]>\s*$/u, "")
      .trim();
  }
  return v;
}

function decodeBasicEntities(s: string): string {
  return s
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'");
}

/** Strip tags and collapse whitespace for card description. */
function htmlToPlainText(html: string): string {
  const decoded = decodeBasicEntities(html);
  const noTags = decoded.replaceAll(/<[^>]*>/gu, " ");
  return noTags.replaceAll(/\s+/gu, " ").trim();
}

interface RssItemFields {
  description: string;
  guid: string;
  link: string;
  title: string;
}

export function parseRssItems(xml: string): RssItemFields[] {
  const out: RssItemFields[] = [];
  for (const m of xml.matchAll(ITEM_RE)) {
    const block = m[1] ?? "";
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const guid = extractTag(block, "guid") || link;
    const rawDesc = extractTag(block, "description");
    if (!title.trim() || !link.trim()) {
      continue;
    }
    const description = htmlToPlainText(rawDesc);
    out.push({
      description,
      guid: guid.trim(),
      link: link.trim(),
      title: title.trim(),
    });
  }
  return out;
}

export function parseRssToEvents(
  xml: string,
  source: EventSource
): ManualCalendarEvent[] {
  const items = parseRssItems(xml);
  const results: ManualCalendarEvent[] = [];

  for (const item of items) {
    const id = `${source.id}:rss:${encodeURIComponent(item.guid || item.link)}`;
    results.push({
      category: "Community",
      description:
        item.description || `From ${source.name} community calendar feed.`,
      id,
      location: "—",
      sourceId: source.id,
      title: item.title,
      url: item.link,
    });
  }

  return results;
}
