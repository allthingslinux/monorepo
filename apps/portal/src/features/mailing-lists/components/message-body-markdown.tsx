"use client";

import { feedBodyToPlainText } from "@/features/mailing-lists/lib/feed-body-plain";
import { splitEmailQuotedBody } from "@/features/mailing-lists/lib/split-email-quote";
import { cn } from "@atl/ui/lib/utils";

const bodyClassName =
  "text-foreground text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]";

const diffBodyClassName =
  "text-foreground bg-muted/20 border-border text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] overflow-x-auto rounded-md border p-3 font-mono";

function classifyDiffLine(
  line: string
):
  | "addition"
  | "deletion"
  | "file-new"
  | "file-old"
  | "hunk"
  | "meta"
  | "normal" {
  if (line.startsWith("diff --git ")) {
    return "meta";
  }
  if (
    line.startsWith("index ") ||
    line.startsWith("new file mode ") ||
    line.startsWith("deleted file mode ") ||
    line.startsWith("similarity index ") ||
    line.startsWith("rename from ") ||
    line.startsWith("rename to ")
  ) {
    return "meta";
  }
  if (line.startsWith("@@ ")) {
    return "hunk";
  }
  if (line.startsWith("+++ ")) {
    return "file-new";
  }
  if (line.startsWith("--- ")) {
    return "file-old";
  }
  if (line.startsWith("+")) {
    return "addition";
  }
  if (line.startsWith("-")) {
    return "deletion";
  }
  return "normal";
}

function lineClassFor(kind: ReturnType<typeof classifyDiffLine>): string {
  if (kind === "addition") {
    return "text-emerald-300 bg-emerald-500/10";
  }
  if (kind === "deletion") {
    return "text-rose-300 bg-rose-500/10";
  }
  if (kind === "hunk") {
    return "text-amber-300 bg-amber-500/10";
  }
  if (kind === "file-new") {
    return "text-emerald-300";
  }
  if (kind === "file-old") {
    return "text-rose-300";
  }
  if (kind === "meta") {
    return "text-cyan-300";
  }
  return "text-foreground";
}

function shouldHighlightAsDiff(text: string): boolean {
  const normalized = text.replaceAll("\r\n", "\n");
  const hasDiffGit = /(^|\n)diff --git /.test(normalized);
  const hasHunk = /(^|\n)@@ /.test(normalized);
  const hasFileHeaders = /(^|\n)--- .+\n\+\+\+ /m.test(normalized);
  return (hasDiffGit && hasHunk) || (hasFileHeaders && hasHunk);
}

function findDiffStartLine(lines: string[]): number {
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith("diff --git ")) {
      return i;
    }
    if (
      line.startsWith("--- ") &&
      i + 1 < lines.length &&
      lines[i + 1].startsWith("+++ ")
    ) {
      return i;
    }
  }
  return -1;
}

function findDiffEndLine(lines: string[], diffStart: number): number {
  if (diffStart < 0 || diffStart >= lines.length) {
    return lines.length;
  }
  for (let i = diffStart + 1; i < lines.length; i += 1) {
    // Common email signature separator that appears after patch body.
    if (/^--\s*$/.test(lines[i])) {
      return i;
    }
  }
  return lines.length;
}

function DiffHighlightedBody({
  className,
  text,
}: {
  className?: string;
  text: string;
}) {
  const lines = text.replaceAll("\r\n", "\n").split("\n");
  return (
    <pre className={cn(diffBodyClassName, className)}>
      {lines.map((line, idx) => {
        const kind = classifyDiffLine(line);
        const isLast = idx === lines.length - 1;
        return (
          <span
            className={lineClassFor(kind)}
            // eslint-disable-next-line react/no-array-index-key -- diff lines repeat; index is stable per render
            key={`diff-line-${idx}`}
          >
            {line}
            {isLast ? "" : "\n"}
          </span>
        );
      })}
    </pre>
  );
}

function PlainTextBody({
  className,
  text,
}: {
  className?: string;
  text: string;
}) {
  if (!shouldHighlightAsDiff(text)) {
    return <div className={cn(bodyClassName, className)}>{text}</div>;
  }

  const lines = text.replaceAll("\r\n", "\n").split("\n");
  const diffStart = findDiffStartLine(lines);
  if (diffStart < 0) {
    return <div className={cn(bodyClassName, className)}>{text}</div>;
  }

  const leading = lines.slice(0, diffStart).join("\n").trimEnd();
  const diffEnd = findDiffEndLine(lines, diffStart);
  const diff = lines.slice(diffStart, diffEnd).join("\n");
  const trailing = lines.slice(diffEnd).join("\n").trim();

  return (
    <div className={cn("space-y-3", className)}>
      {leading.length > 0 ? (
        <div className={bodyClassName}>{leading}</div>
      ) : null}
      <DiffHighlightedBody text={diff} />
      {trailing.length > 0 ? (
        <div className={bodyClassName}>{trailing}</div>
      ) : null}
    </div>
  );
}

export function MessageBodyMarkdown({ text }: { text: string }) {
  const normalized = feedBodyToPlainText(text);

  if (!normalized.trim()) {
    return <p className="text-muted-foreground text-sm italic">(empty body)</p>;
  }

  const { main, quoted } = splitEmailQuotedBody(normalized);
  const hasMain = Boolean(main.trim());

  if (!quoted) {
    return <PlainTextBody text={normalized} />;
  }

  if (!hasMain) {
    return <PlainTextBody text={quoted} />;
  }

  return (
    <div className="space-y-3">
      <PlainTextBody text={main} />
      <details className="border-border bg-muted/25 group mt-3 rounded-lg border">
        <summary className="text-muted-foreground hover:bg-muted/40 cursor-pointer px-3 py-2 text-sm select-none">
          Quoted message
        </summary>
        <div className="border-border border-t px-3 pt-2 pb-3">
          <PlainTextBody text={quoted} />
        </div>
      </details>
    </div>
  );
}
