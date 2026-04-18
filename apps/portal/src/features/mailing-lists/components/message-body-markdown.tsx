"use client";

import { feedBodyToPlainText } from "@/features/mailing-lists/lib/feed-body-plain";
import { splitEmailQuotedBody } from "@/features/mailing-lists/lib/split-email-quote";
import { cn } from "@atl/ui/lib/utils";

const bodyClassName =
  "text-foreground text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]";

function PlainTextBody({
  className,
  text,
}: {
  className?: string;
  text: string;
}) {
  return <div className={cn(bodyClassName, className)}>{text}</div>;
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
