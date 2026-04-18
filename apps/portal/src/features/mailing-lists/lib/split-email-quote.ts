/** Matches reply attribution (English + common locale variants). */
const ON_WROTE_LINE = /^On .+ wrote:\s*$/i;

/**
 * "Author Name writes:" (common in nested replies). Avoids `On … wrote:` and
 * obvious sentence starts (I/We/They…) to reduce false positives.
 */
/** Includes `Name <email@host> writes:` (public-inbox / mutt style). */
const NAME_WRITES_LINE =
  /^(?!On\s)(?!(?:I|We|They|He|She|It)\s)([^\n]{1,240})\s+writes:\s*$/i;

function isAttributionLine(trimmedLine: string): boolean {
  return ON_WROTE_LINE.test(trimmedLine) || NAME_WRITES_LINE.test(trimmedLine);
}

/** Patch / thread summaries often use `[...]`, `[ ... ]`, etc. as omitted-hunk markers. */
function isTruncationMarkerLine(trimmedLine: string): boolean {
  return /^\[\s*\.\.\.\s*\]\s*$/.test(trimmedLine);
}

/**
 * Some archives occasionally drop the leading `>` on a single continuation
 * line right after a quoted block. Keep obvious URL + short suffix lines
 * (e.g. `https://… tags/drm-fixes-…`) in the quoted region.
 */
function looksLikeLostQuotedUrlContinuation(trimmedLine: string): boolean {
  if (!/^https?:\/\//i.test(trimmedLine)) {
    return false;
  }
  if (trimmedLine.length > 240) {
    return false;
  }
  if (/[.!?]\s*$/.test(trimmedLine)) {
    return false;
  }
  return /^(https?:\/\/\S+)(?:\s+\S+){0,3}$/.test(trimmedLine);
}

/**
 * True when the remainder after a quoted block is only URL / link-footer lines.
 * Feeds often drop the final `>` so the last line (e.g. Sashiko permalink) lands
 * in main — merge it back into quoted so the top of the card is not "link only".
 */
function shouldMergeMainAfterIntoQuoted(fragment: string): boolean {
  const nonEmpty = fragment
    .replaceAll("\r\n", "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (nonEmpty.length === 0 || nonEmpty.length > 8) {
    return false;
  }
  return nonEmpty.every((line) => {
    if (/^https?:\/\//i.test(line)) {
      return true;
    }
    if (/^mailto:/i.test(line)) {
      return true;
    }
    if (/\S\s*[·•]\s*https?:\/\//.test(line)) {
      return true;
    }
    return false;
  });
}

/**
 * Lines that belong to the quoted block after "On … wrote:" — attribution,
 * blanks, `>` lines, and optional `[...]` / `[ ... ]` truncation markers.
 *
 * If there is already text above "On … wrote:" and the first non-blank line after
 * the attribution is *not* `>`-quoted, treat everything from that line to EOF as
 * the forwarded thread (many clients do not prefix with `>`).
 *
 * When the body *starts* with "On … wrote:" and the feed strips leading `>` so the
 * first line is plain text, scan forward for the first `>` line and include all
 * lines before it in the quoted block; if there is no `>` at all, treat the whole
 * tail as quoted (fully unquoted forward).
 */
function consumeQuotedAfterOnWrote(
  lines: string[],
  startIdx: number
): { quotedLines: string[]; remainderIdx: number } {
  const quotedLines: string[] = [lines[startIdx]];
  let i = startIdx + 1;

  while (i < lines.length && lines[i].trim() === "") {
    quotedLines.push(lines[i]);
    i += 1;
  }

  if (i >= lines.length) {
    return { quotedLines, remainderIdx: i };
  }

  const mainBefore = lines.slice(0, startIdx).join("\n").trimEnd();
  const firstLine = lines[i].trim();

  if (firstLine.startsWith(">")) {
    while (i < lines.length) {
      const t = lines[i].trim();
      if (t === "") {
        quotedLines.push(lines[i]);
        i += 1;
        continue;
      }
      if (t.startsWith(">")) {
        quotedLines.push(lines[i]);
        i += 1;
        continue;
      }
      if (isTruncationMarkerLine(t)) {
        quotedLines.push(lines[i]);
        i += 1;
        continue;
      }
      if (looksLikeLostQuotedUrlContinuation(t)) {
        quotedLines.push(lines[i]);
        i += 1;
        continue;
      }
      break;
    }
    return { quotedLines, remainderIdx: i };
  }

  if (mainBefore.length > 0) {
    while (i < lines.length) {
      quotedLines.push(lines[i]);
      i += 1;
    }
    return { quotedLines, remainderIdx: i };
  }

  const firstGtIdx = lines.findIndex(
    (line, idx) => idx >= i && line.trim().startsWith(">")
  );

  if (firstGtIdx !== -1) {
    while (i < firstGtIdx) {
      quotedLines.push(lines[i]);
      i += 1;
    }
    while (i < lines.length) {
      const t = lines[i].trim();
      if (t === "") {
        quotedLines.push(lines[i]);
        i += 1;
        continue;
      }
      if (t.startsWith(">")) {
        quotedLines.push(lines[i]);
        i += 1;
        continue;
      }
      if (isTruncationMarkerLine(t)) {
        quotedLines.push(lines[i]);
        i += 1;
        continue;
      }
      if (looksLikeLostQuotedUrlContinuation(t)) {
        quotedLines.push(lines[i]);
        i += 1;
        continue;
      }
      break;
    }
    return { quotedLines, remainderIdx: i };
  }

  while (i < lines.length) {
    quotedLines.push(lines[i]);
    i += 1;
  }
  return { quotedLines, remainderIdx: i };
}

/**
 * Split plain-text mail bodies into visible reply text vs quoted follow-up.
 * After "On … wrote:", `>`-quoted lines stay in the quoted region; when there is
 * text above the attribution and the body after "On" is not `>`-prefixed, the
 * entire tail is treated as the forwarded message.
 */
export function splitEmailQuotedBody(text: string): {
  main: string;
  quoted: string | null;
} {
  const normalized = text.replaceAll("\r\n", "\n");
  const lines = normalized.split("\n");

  const onWroteIndex = lines.findIndex((line) =>
    isAttributionLine(line.trim())
  );
  if (onWroteIndex !== -1) {
    const mainBefore = lines.slice(0, onWroteIndex).join("\n").trimEnd();
    const { quotedLines, remainderIdx } = consumeQuotedAfterOnWrote(
      lines,
      onWroteIndex
    );
    let mainAfter = lines.slice(remainderIdx).join("\n").trim();
    let quoted = quotedLines.join("\n").trim();
    if (quoted.length === 0) {
      return { main: normalized, quoted: null };
    }
    if (mainAfter.length > 0 && shouldMergeMainAfterIntoQuoted(mainAfter)) {
      const after = mainAfter.trim();
      const afterLines = after
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const everyLineAlreadyInQuoted = afterLines.every((line) =>
        quoted.includes(line)
      );
      if (!everyLineAlreadyInQuoted) {
        quoted = `${quoted}\n\n${after}`.trim();
      }
      mainAfter = "";
    }
    const main = [mainBefore, mainAfter]
      .filter((s) => s.length > 0)
      .join("\n\n")
      .trim();
    return { main, quoted };
  }

  const gtIndex = lines.findIndex(
    (line, i) => line.trim().startsWith(">") && (i === 0 || lines[i - 1] === "")
  );

  if (gtIndex > 0) {
    const main = lines.slice(0, gtIndex).join("\n").trimEnd();
    const quoted = lines.slice(gtIndex).join("\n").trim();
    if (quoted.length > 0 && main.length > 0) {
      return { main, quoted };
    }
  }

  return { main: normalized, quoted: null };
}
