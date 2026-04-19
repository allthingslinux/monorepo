import {
  MAILING_LIST_FETCH_REVALIDATE_SECONDS,
  MAILING_LIST_ITEMS_PER_SYNC,
} from "@atl/config/mailing-lists";

import type { NormalizedFeedItem } from "../types";
import { parseFeedAuthorString } from "./rss-atom";

const FETCH_HEADERS = {
  Accept: "text/html, text/plain, application/xhtml+xml, */*",
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ATL-Portal-MailingLists/1.0 (+https://allthingslinux.org; admin@allthingslinux.org)",
};

function stripMimeAttachmentPayloads(rawBody: string): string {
  const lines = rawBody.replaceAll("\r\n", "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    const boundaryMatch = /^--([A-Za-z0-9'()+_,./:=?-]+)(--)?$/.exec(
      line.trim()
    );
    if (!boundaryMatch) {
      out.push(line);
      i += 1;
      continue;
    }

    const boundaryToken = boundaryMatch[1];
    const boundaryLine = `--${boundaryToken}`;
    const partHeaderLines: string[] = [];
    let j = i + 1;
    while (j < lines.length && (lines[j] ?? "") !== "") {
      partHeaderLines.push(lines[j] ?? "");
      j += 1;
    }

    const partHeaders = partHeaderLines.join("\n").toLowerCase();
    const isAttachmentPart =
      partHeaders.includes("content-disposition: attachment") ||
      partHeaders.includes(" filename=") ||
      partHeaders.includes("name=") ||
      partHeaders.includes("content-type: application/") ||
      partHeaders.includes("content-transfer-encoding: base64");

    out.push(line);
    out.push(...partHeaderLines);

    if (j < lines.length) {
      out.push("");
    }

    if (!isAttachmentPart) {
      i = j + 1;
      continue;
    }

    let k = j + 1;
    while (k < lines.length) {
      const payloadLine = lines[k] ?? "";
      if (payloadLine.startsWith(boundaryLine)) {
        break;
      }
      k += 1;
    }

    out.push("[attachment payload omitted]");
    i = k;
  }

  return out
    .join("\n")
    .replaceAll(/\n{3,}/g, "\n\n")
    .trim();
}

function parseHeaders(raw: string): {
  bodyText: string;
  headers: Map<string, string>;
} {
  const normalized = raw.replaceAll("\r\n", "\n");
  const lines = normalized.split("\n");
  const headers = new Map<string, string>();
  let i = 0;
  let currentKey: string | null = null;
  let currentValue = "";

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line === "") {
      break;
    }
    if ((line.startsWith(" ") || line.startsWith("\t")) && currentKey) {
      currentValue += ` ${line.trim()}`;
      i += 1;
      continue;
    }
    if (currentKey) {
      headers.set(currentKey.toLowerCase(), currentValue.trim());
    }
    const idx = line.indexOf(":");
    if (idx <= 0) {
      currentKey = null;
      currentValue = "";
      i += 1;
      continue;
    }
    currentKey = line.slice(0, idx).trim();
    currentValue = line.slice(idx + 1).trim();
    i += 1;
  }
  if (currentKey) {
    headers.set(currentKey.toLowerCase(), currentValue.trim());
  }

  const bodyText = stripMimeAttachmentPayloads(lines.slice(i + 1).join("\n"));
  return { bodyText, headers };
}

function normalizeMbox(raw: string): string {
  if (raw.startsWith("From ")) {
    const firstNewline = raw.indexOf("\n");
    if (firstNewline !== -1) {
      return raw.slice(firstNewline + 1);
    }
  }
  return raw;
}

async function fetchText(url: string, bypassNextDataCache?: boolean) {
  const cacheInit =
    bypassNextDataCache === true
      ? { cache: "no-store" as const }
      : { next: { revalidate: MAILING_LIST_FETCH_REVALIDATE_SECONDS } };
  const res = await fetch(url, {
    headers: FETCH_HEADERS,
    ...cacheInit,
  });
  if (!res.ok) {
    throw new Error(`Feed fetch failed: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

// eslint-disable-next-line complexity -- HTML archive scrape: nested month/message loops
async function fetchFreeBsdArchiveItems(
  archiveUrl: string,
  options?: { bypassNextDataCache?: boolean }
): Promise<NormalizedFeedItem[]> {
  const indexHtml = await fetchText(archiveUrl, options?.bypassNextDataCache);
  const monthLinks = [
    ...indexHtml.matchAll(/href="([0-9]{4}-[A-Za-z]+\/date\.html)"/g),
  ]
    .map((m) => m[1])
    .filter((v): v is string => typeof v === "string")
    .slice(0, 2);

  const out: NormalizedFeedItem[] = [];
  for (const monthRelative of monthLinks) {
    const monthUrl = new URL(monthRelative, archiveUrl).toString();
    const monthHtml = await fetchText(monthUrl, options?.bypassNextDataCache);
    const messageLinks = [
      ...monthHtml.matchAll(/href="([0-9]{6}\.html)">([^<]*)<\/a>/g),
    ];
    for (const m of messageLinks) {
      if (out.length >= MAILING_LIST_ITEMS_PER_SYNC) {
        return out;
      }
      const htmlRelative = m[1];
      const title = (m[2] ?? "(no subject)").trim() || "(no subject)";
      if (!htmlRelative) {
        continue;
      }
      const htmlUrl = new URL(htmlRelative, monthUrl).toString();
      const txtUrl = htmlUrl.replace(/\.html$/, ".txt");
      let rawMessage = "";
      try {
        rawMessage = await fetchText(txtUrl, options?.bypassNextDataCache);
      } catch {
        continue;
      }
      const { bodyText, headers } = parseHeaders(normalizeMbox(rawMessage));
      const subject = headers.get("subject")?.trim() || title;
      const fromRaw = headers.get("from")?.trim() ?? "";
      const { authorEmail, authorName } = parseFeedAuthorString(fromRaw);
      const dateRaw = headers.get("date")?.trim() ?? null;
      const parsedDate = dateRaw ? new Date(dateRaw) : null;
      const messageId = headers.get("message-id")?.trim() ?? null;
      const inReplyTo = headers.get("in-reply-to")?.trim() ?? null;

      out.push({
        authorEmail,
        authorName,
        bodyText,
        guid: messageId,
        inReplyTo,
        link: htmlUrl,
        publishedAt:
          parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null,
        title: subject,
      });
    }
  }

  return out;
}

// eslint-disable-next-line complexity -- MARC HTML scrape: month + message iteration
async function fetchMarcArchiveItems(
  listUrl: string,
  options?: { bypassNextDataCache?: boolean }
): Promise<NormalizedFeedItem[]> {
  const rootHtml = await fetchText(listUrl, options?.bypassNextDataCache);
  const monthHref =
    /href="(\?l=[^"&]+&r=1&b=[0-9]{6}&w=[0-9]+)"/.exec(rootHtml)?.[1] ?? null;
  if (!monthHref) {
    return [];
  }
  const monthUrl = new URL(monthHref, listUrl).toString();
  const monthHtml = await fetchText(monthUrl, options?.bypassNextDataCache);
  const messageHrefs = [
    ...monthHtml.matchAll(
      /href="(\?l=[^"&]+&m=[0-9]+&w=[0-9]+)">([^<]*)<\/a>/g
    ),
  ];

  const out: NormalizedFeedItem[] = [];
  for (const m of messageHrefs) {
    if (out.length >= MAILING_LIST_ITEMS_PER_SYNC) {
      return out;
    }
    const href = m[1];
    const fallbackTitle = (m[2] ?? "(no subject)").trim() || "(no subject)";
    if (!href) {
      continue;
    }
    const messageUrl = new URL(href, listUrl).toString();
    const rawMboxUrl = `${messageUrl}&q=mbox`;
    let rawMbox = "";
    try {
      rawMbox = await fetchText(rawMboxUrl, options?.bypassNextDataCache);
    } catch {
      continue;
    }
    const { bodyText, headers } = parseHeaders(normalizeMbox(rawMbox));
    const subject = headers.get("subject")?.trim() || fallbackTitle;
    const fromRaw = headers.get("from")?.trim() ?? "";
    const { authorEmail, authorName } = parseFeedAuthorString(fromRaw);
    const dateRaw = headers.get("date")?.trim() ?? null;
    const parsedDate = dateRaw ? new Date(dateRaw) : null;
    const messageId = headers.get("message-id")?.trim() ?? null;
    const inReplyTo = headers.get("in-reply-to")?.trim() ?? null;

    out.push({
      authorEmail,
      authorName,
      bodyText,
      guid: messageId,
      inReplyTo,
      link: messageUrl,
      publishedAt:
        parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null,
      title: subject,
    });
  }

  return out;
}

export async function fetchHtmlArchiveItems(
  archiveUrl: string,
  options?: { bypassNextDataCache?: boolean }
): Promise<NormalizedFeedItem[]> {
  const url = new URL(archiveUrl);
  if (
    url.hostname === "lists.freebsd.org" &&
    url.pathname.includes("/archives/")
  ) {
    return fetchFreeBsdArchiveItems(archiveUrl, options);
  }
  if (url.hostname === "marc.info") {
    return fetchMarcArchiveItems(archiveUrl, options);
  }
  throw new Error(`Unsupported HTML archive source: ${archiveUrl}`);
}
