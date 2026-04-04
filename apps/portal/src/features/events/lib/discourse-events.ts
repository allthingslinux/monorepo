import "server-only";
import { captureException } from "@sentry/nextjs";

import type { EventSource, ManualCalendarEvent } from "@/config/events";

import {
  CALENDAR_FETCH_REVALIDATE_SECONDS,
  CALENDAR_FETCH_TIMEOUT_MS,
  calendarUpstreamHeaders,
} from "./calendar-upstream";

/** Cap post.json fetches per calendar sync (bulk events JSON has no post body). */
const MAX_DISCOURSE_POST_BODY_FETCHES = 72;
const DISCOURSE_POST_FETCH_CONCURRENCY = 6;

const DESCRIPTION_MAX_CHARS = 2000;

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function discourseEventTitle(raw: Record<string, unknown>): string {
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const post = isRecord(raw.post) ? raw.post : undefined;
  const topic = post && isRecord(post.topic) ? post.topic : undefined;
  const topicTitle = typeof topic?.title === "string" ? topic.title.trim() : "";
  return name || topicTitle || "(Untitled event)";
}

function buildPostUrl(
  origin: string,
  raw: Record<string, unknown>
): string | undefined {
  const post = isRecord(raw.post) ? raw.post : undefined;
  const path = typeof post?.url === "string" ? post.url.trim() : "";
  if (!path) {
    return undefined;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const prefix = path.startsWith("/") ? "" : "/";
  return `${origin}${prefix}${path}`;
}

/** Remove all `[event]…[/event]` shortcodes (including stray blocks mid-post). */
function stripDiscourseEventShortcodes(text: string): string {
  let prev = "";
  let cur = text;
  while (cur !== prev) {
    prev = cur;
    cur = cur.replaceAll(/\[event\b[\s\S]*?\[\/event\]/giu, "");
  }
  // Self-closing / one-line `[event …]` without `[/event]` (seen in some topics)
  cur = cur.replaceAll(/\[event\b[^\]\n]+\]/giu, "");
  return cur;
}

/**
 * Pull a leading "Location:" section out of post raw so it can be shown separately.
 */
function extractLocationSectionFromRaw(text: string): {
  body: string;
  location: string;
} {
  const lines = text.replaceAll("\r\n", "\n").split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const inline = line.match(/^\s*Location:\s*(.+)$/iu);
    if (inline) {
      const location = inline[1].trim().slice(0, 200);
      const body = [...lines.slice(0, i), ...lines.slice(i + 1)]
        .join("\n")
        .replaceAll(/^\n+|\n+$/gu, "")
        .trim();
      return { body, location };
    }
    if (/^\s*Location:\s*$/iu.test(line)) {
      const locLines: string[] = [];
      let j = i + 1;
      for (; j < lines.length; j += 1) {
        const next = lines[j].trim();
        if (next === "") {
          break;
        }
        if (/^#{1,6}\s/u.test(next)) {
          break;
        }
        locLines.push(lines[j].trim());
      }
      const location = locLines.join(" · ").slice(0, 200);
      const body = [...lines.slice(0, i), ...lines.slice(j)]
        .join("\n")
        .replaceAll(/^\n+|\n+$/gu, "")
        .trim();
      return { body, location };
    }
  }
  return { body: text, location: "" };
}

/** Plain-text card blurb: no markdown, images, or shortcodes. */
function markdownishToPlainText(text: string): string {
  let s = text;
  s = s.replaceAll(/```[\s\S]*?```/gu, " ");
  s = s.replaceAll(/`([^`]+)`/gu, "$1");
  s = s.replaceAll(/!\[[^\]]*\]\([^)]*\)/gu, "");
  s = s.replaceAll(/\[([^\]]+)\]\([^)]*\)/gu, "$1");
  s = s.replaceAll(/^\s{0,3}#{1,6}\s+/gmu, "");
  for (let k = 0; k < 4; k += 1) {
    s = s.replaceAll(/\*\*([^*]+)\*\*/gu, "$1");
    s = s.replaceAll(/\*([^*]+)\*/gu, "$1");
    s = s.replaceAll(/__([^_]+)__/gu, "$1");
  }
  s = s.replaceAll(/<[^>\n]{1,300}>/gu, " ");
  s = s.replaceAll(/\n{3,}/gu, "\n\n");
  s = s.replaceAll(/[ \t]+/gu, " ");
  s = s.replaceAll("\n ", "\n");
  return s.trim();
}

function discourseRawToCardFields(raw: string): {
  description: string;
  location: string;
} {
  const stripped = stripDiscourseEventShortcodes(raw).trim();
  const { body, location: locFromRaw } =
    extractLocationSectionFromRaw(stripped);
  const description = markdownishToPlainText(body)
    .slice(0, DESCRIPTION_MAX_CHARS)
    .trim();
  return { description, location: locFromRaw };
}

/** When post.json is unavailable or over fetch cap — no timezone line (time is shown on the card). */
function buildFallbackDescription(
  raw: Record<string, unknown>,
  title: string,
  source: EventSource
): string {
  const post = isRecord(raw.post) ? raw.post : undefined;
  const topic = post && isRecord(post.topic) ? post.topic : undefined;
  const topicTitle = typeof topic?.title === "string" ? topic.title.trim() : "";
  if (topicTitle && topicTitle !== title) {
    return topicTitle;
  }
  return `Open the topic on ${source.name} for the full description.`;
}

interface DiscourseEventRow {
  event: ManualCalendarEvent;
  postId: number;
}

function postIdFromDiscourseItem(item: Record<string, unknown>): number | null {
  const post = isRecord(item.post) ? item.post : undefined;
  if (!post) {
    return null;
  }
  const id = post.id;
  if (typeof id === "number" && Number.isFinite(id)) {
    return id;
  }
  if (typeof id === "string") {
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function parseDiscourseEndsAt(
  item: Record<string, unknown>
): string | undefined {
  const endsRaw = item.ends_at;
  if (typeof endsRaw !== "string" || !endsRaw.trim()) {
    return undefined;
  }
  if (Number.isNaN(Date.parse(endsRaw))) {
    return undefined;
  }
  return endsRaw.trim();
}

function parseDiscourseItem(
  item: Record<string, unknown>,
  origin: string,
  source: EventSource
): DiscourseEventRow | null {
  const idNum = typeof item.id === "number" ? item.id : Number(item.id);
  const startsAt =
    typeof item.starts_at === "string" ? item.starts_at.trim() : "";
  if (
    !Number.isFinite(idNum) ||
    !startsAt ||
    Number.isNaN(Date.parse(startsAt))
  ) {
    return null;
  }
  const postId = postIdFromDiscourseItem(item);
  if (postId === null) {
    return null;
  }
  const title = discourseEventTitle(item);
  const endsAt = parseDiscourseEndsAt(item);
  const url = buildPostUrl(origin, item);
  const event: ManualCalendarEvent = {
    category: "Community",
    description: buildFallbackDescription(item, title, source),
    id: `${source.id}:discourse:${idNum}`,
    location: "—",
    sourceId: source.id,
    startsAt,
    title,
    ...(endsAt ? { endsAt } : {}),
    ...(url ? { url } : {}),
  };
  return { event, postId };
}

function parseDiscourseEventRows(
  data: unknown,
  origin: string,
  source: EventSource
): DiscourseEventRow[] {
  if (!isRecord(data) || !Array.isArray(data.events)) {
    return [];
  }

  const out: DiscourseEventRow[] = [];
  for (const item of data.events) {
    if (!isRecord(item)) {
      continue;
    }
    const row = parseDiscourseItem(item, origin, source);
    if (row) {
      out.push(row);
    }
  }
  return out;
}

function postIdsByEarliestStart(rows: DiscourseEventRow[]): number[] {
  const earliest = new Map<number, number>();
  for (const r of rows) {
    const start = r.event.startsAt;
    if (!start) {
      continue;
    }
    const t = Date.parse(start);
    if (Number.isNaN(t)) {
      continue;
    }
    const prev = earliest.get(r.postId);
    if (prev === undefined || t < prev) {
      earliest.set(r.postId, t);
    }
  }
  return [...earliest.entries()]
    .toSorted((a, b) => a[1] - b[1])
    .slice(0, MAX_DISCOURSE_POST_BODY_FETCHES)
    .map(([id]) => id);
}

interface DiscoursePostEnrichment {
  description: string;
  location: string;
}

async function fetchPostEnrichment(
  origin: string,
  postId: number
): Promise<DiscoursePostEnrichment | null> {
  const url = `${origin.replace(/\/$/u, "")}/posts/${postId}.json`;
  const res = await fetch(url, {
    headers: calendarUpstreamHeaders("application/json"),
    next: { revalidate: CALENDAR_FETCH_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(CALENDAR_FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    return null;
  }
  const data: unknown = await res.json();
  if (!isRecord(data)) {
    return null;
  }
  const eventMeta = isRecord(data.event) ? data.event : undefined;
  let apiLocation = "";
  if (typeof eventMeta?.location === "string") {
    apiLocation = markdownishToPlainText(eventMeta.location).slice(0, 200);
  }
  const raw = typeof data.raw === "string" ? data.raw : "";
  const fromRaw = discourseRawToCardFields(raw);
  const location = apiLocation || fromRaw.location;
  const description = fromRaw.description;
  if (!description && !location) {
    return null;
  }
  return { description, location };
}

async function runPool<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  if (items.length === 0) {
    return;
  }
  const n = Math.min(Math.max(1, concurrency), items.length);
  let next = 0;
  async function worker(): Promise<void> {
    for (;;) {
      const i = next;
      next += 1;
      if (i >= items.length) {
        return;
      }
      await fn(items[i]!);
    }
  }
  await Promise.all(Array.from({ length: n }, () => worker()));
}

async function enrichRowsWithPostBodies(
  origin: string,
  source: EventSource,
  rows: DiscourseEventRow[]
): Promise<void> {
  const targetIds = postIdsByEarliestStart(rows);
  const fetchSet = new Set(targetIds);
  const enrichments = new Map<number, DiscoursePostEnrichment>();

  await runPool(targetIds, DISCOURSE_POST_FETCH_CONCURRENCY, async (postId) => {
    try {
      const enriched = await fetchPostEnrichment(origin, postId);
      if (enriched) {
        enrichments.set(postId, enriched);
      }
    } catch (error) {
      captureException(error, {
        level: "warning",
        tags: {
          calendarSourceId: source.id,
          calendarTransport: "discourse-post",
        },
      });
    }
  });

  for (const row of rows) {
    if (!fetchSet.has(row.postId)) {
      continue;
    }
    const e = enrichments.get(row.postId);
    if (!e) {
      continue;
    }
    if (e.description) {
      row.event.description = e.description;
    }
    if (e.location) {
      row.event.location = e.location;
    }
  }
}

/**
 * Maps Discourse `discourse-post-event/events` JSON to portal events.
 * @see https://meta.discourse.org/t/re-add-full-ics-export/230713 — API may cap at ~200 rows per request.
 */
export function parseDiscourseEventsResponse(
  data: unknown,
  origin: string,
  source: EventSource
): ManualCalendarEvent[] {
  return parseDiscourseEventRows(data, origin, source).map((r) => r.event);
}

export async function fetchDiscourseEventsForSource(
  source: EventSource
): Promise<ManualCalendarEvent[]> {
  const url = source.discourseEventsUrl?.trim();
  if (!url || source.kind !== "discourse") {
    return [];
  }

  let origin: string;
  try {
    origin = new URL(url).origin;
  } catch {
    return [];
  }

  try {
    const res = await fetch(url, {
      headers: calendarUpstreamHeaders("application/json"),
      next: { revalidate: CALENDAR_FETCH_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(CALENDAR_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`Discourse events failed: HTTP ${res.status}`);
    }
    const data: unknown = await res.json();
    const rows = parseDiscourseEventRows(data, origin, source);
    await enrichRowsWithPostBodies(origin, source, rows);
    return rows.map((r) => r.event);
  } catch (error) {
    captureException(error, {
      level: "warning",
      tags: { calendarSourceId: source.id, calendarTransport: "discourse" },
    });
    return [];
  }
}
