import { fromZonedTime } from "date-fns-tz";

/**
 * Minimal RFC 5545-ish VEVENT parser (no node-ical — avoids JSBI / Temporal polyfill issues in Turbopack).
 * Covers KDE-style feeds: DTSTART/DTEND with optional TZID or VALUE=DATE.
 */

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function unfoldIcsLines(body: string): string[] {
  const normalized = body.replaceAll("\r\n", "\n");
  const raw = normalized.split("\n");
  const out: string[] = [];
  for (const line of raw) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length > 0) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function splitVeventBlocks(fullText: string): string[] {
  const blocks: string[] = [];
  const re = /BEGIN:VEVENT\r?\n([\s\S]*?)END:VEVENT/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(fullText)) !== null) {
    blocks.push(m[1]);
  }
  return blocks;
}

function parseParams(namePart: string): {
  name: string;
  params: Record<string, string>;
} {
  const parts = namePart.split(";");
  const name = (parts[0] ?? "").toUpperCase();
  const params: Record<string, string> = {};
  for (let i = 1; i < parts.length; i += 1) {
    const p = parts[i];
    const eq = p.indexOf("=");
    if (eq > 0) {
      params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1);
    }
  }
  return { name, params };
}

function unescapeIcsText(s: string): string {
  return s
    .replaceAll("\\n", "\n")
    .replaceAll("\\,", ",")
    .replaceAll("\\;", ";")
    .replaceAll("\\\\", "\\");
}

function icsDateOnlyToIso(value: string): string | undefined {
  const y = Number(value.slice(0, 4));
  const mo = Number(value.slice(4, 6));
  const d = Number(value.slice(6, 8));
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) {
    return undefined;
  }
  return new Date(Date.UTC(y, mo - 1, d, 12, 0, 0)).toISOString();
}

function parseCompactParts(compact: string):
  | {
      day: number;
      h: number;
      mi: number;
      mo: number;
      s: number;
      y: number;
    }
  | undefined {
  const y = Number(compact.slice(0, 4));
  const mo = Number(compact.slice(4, 6));
  const day = Number(compact.slice(6, 8));
  const hasTime = compact.includes("T") && compact.length >= 15;
  const h = hasTime ? Number(compact.slice(9, 11)) : 0;
  const mi = hasTime ? Number(compact.slice(11, 13)) : 0;
  const s = hasTime ? Number(compact.slice(13, 15)) : 0;
  if (
    !Number.isFinite(y) ||
    !Number.isFinite(mo) ||
    !Number.isFinite(day) ||
    !Number.isFinite(h) ||
    !Number.isFinite(mi) ||
    !Number.isFinite(s)
  ) {
    return undefined;
  }
  return { day, h, mi, mo, s, y };
}

function wallTToUtcIso(
  y: number,
  mo: number,
  day: number,
  h: number,
  mi: number,
  s: number
): string | undefined {
  const wall = `${y}-${pad2(mo)}-${pad2(day)}T${pad2(h)}:${pad2(mi)}:${pad2(s)}`;
  const u = Date.parse(`${wall}Z`);
  return Number.isNaN(u) ? undefined : new Date(u).toISOString();
}

function zonedWallToUtcIso(
  y: number,
  mo: number,
  day: number,
  h: number,
  mi: number,
  s: number,
  tzid: string
): string | undefined {
  try {
    const wallSpace = `${y}-${pad2(mo)}-${pad2(day)} ${pad2(h)}:${pad2(mi)}:${pad2(s)}`;
    const d = fromZonedTime(wallSpace, tzid);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString();
    }
  } catch {
    /* fall through */
  }
  return undefined;
}

/** Parse YYYYMMDD or YYYYMMDDTHHmmss to UTC ISO string. */
function icsDateToIso(
  rawValue: string,
  params: Record<string, string>
): string | undefined {
  const value = rawValue.trim();
  const valueType = (params.VALUE ?? "").toUpperCase();
  const tzid = params.TZID;

  if (valueType === "DATE" || /^\d{8}$/.test(value)) {
    return icsDateOnlyToIso(value);
  }

  const compact = value.replaceAll(/[-:]/g, "");
  const parts = parseCompactParts(compact);
  if (!parts) {
    return undefined;
  }
  const { y, mo, day, h, mi, s } = parts;

  if (value.endsWith("Z") || compact.endsWith("Z")) {
    return wallTToUtcIso(y, mo, day, h, mi, s);
  }

  if (tzid) {
    const zoned = zonedWallToUtcIso(y, mo, day, h, mi, s, tzid);
    if (zoned) {
      return zoned;
    }
  }

  return wallTToUtcIso(y, mo, day, h, mi, s);
}

export interface ParsedVevent {
  description: string;
  dtend?: string;
  dtstart: string;
  location: string;
  summary: string;
  uid: string;
  url: string;
}

export function parseVeventsFromIcs(icsText: string): ParsedVevent[] {
  const blocks = splitVeventBlocks(icsText);
  const results: ParsedVevent[] = [];

  for (const block of blocks) {
    const lines = unfoldIcsLines(block);
    const fields = new Map<
      string,
      { params: Record<string, string>; value: string }
    >();

    for (const line of lines) {
      const colon = line.indexOf(":");
      if (colon <= 0) {
        continue;
      }
      const namePart = line.slice(0, colon);
      const value = line.slice(colon + 1);
      const { name, params } = parseParams(namePart);
      if (!name) {
        continue;
      }
      fields.set(name, { params, value });
    }

    const startField = fields.get("DTSTART");
    if (!startField) {
      continue;
    }

    const dtstart = icsDateToIso(startField.value, startField.params);
    if (!dtstart) {
      continue;
    }

    const endField = fields.get("DTEND");
    const dtend = endField
      ? icsDateToIso(endField.value, endField.params)
      : undefined;

    const uidRaw = fields.get("UID")?.value?.trim() ?? "";
    const summary = unescapeIcsText(fields.get("SUMMARY")?.value ?? "").trim();
    const description = unescapeIcsText(
      fields.get("DESCRIPTION")?.value ?? ""
    ).trim();
    const location = unescapeIcsText(
      fields.get("LOCATION")?.value ?? ""
    ).trim();
    const url = (fields.get("URL")?.value ?? "").trim();

    results.push({
      description,
      dtend,
      dtstart,
      location,
      summary,
      uid: uidRaw || `synthetic-${dtstart}-${summary.slice(0, 24)}`,
      url,
    });
  }

  return results;
}
