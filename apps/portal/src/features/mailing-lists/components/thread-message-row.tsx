"use client";

import { MessageBodyMarkdown } from "@/features/mailing-lists/components/message-body-markdown";
import { MailingListAuthorAvatar } from "@/features/mailing-lists/components/ml-author-avatar";
import type { MailingListPatchMeta } from "@/features/mailing-lists/hooks/use-mailing-lists";
import { Badge } from "@atl/ui/components/badge";
import { buttonVariants } from "@atl/ui/components/button";
import { cn } from "@atl/ui/lib/utils";
import { formatRelativeTime } from "@atl/utils/date";

export function ThreadMessageRow({
  authorEmail,
  authorName,
  bodyPreview,
  externalUrl,
  patch,
  sentAt,
  subject,
  threadSubject,
}: {
  authorEmail: string | null;
  authorName: string | null;
  bodyPreview: string;
  externalUrl: string | null;
  patch: MailingListPatchMeta | null;
  sentAt: string | null;
  subject: string;
  threadSubject: string;
}) {
  const displayName = authorName ?? authorEmail ?? "Unknown author";
  const showSubjectLine = subject !== threadSubject;
  const full = sentAt ? new Date(sentAt).toLocaleString() : "";

  let patchLabel = "Patch metadata";
  if (patch) {
    if (patch.state) {
      patchLabel = `Patch: ${patch.state}`;
    } else if (
      patch.patchworkPatchId !== null &&
      patch.patchworkPatchId !== undefined
    ) {
      patchLabel = `Patch #${patch.patchworkPatchId}`;
    }
  }

  return (
    <article className="border-border/60 bg-muted/25 rounded-xl border px-3 py-3 shadow-xs md:px-4 md:py-3.5">
      <div className="flex gap-3">
        <MailingListAuthorAvatar
          authorEmail={authorEmail}
          authorName={authorName}
        />
        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-foreground text-sm font-semibold">
              {displayName}
            </span>
            {sentAt ? (
              <time
                className="text-muted-foreground text-xs tabular-nums"
                dateTime={sentAt}
                title={full}
              >
                {formatRelativeTime(sentAt)}
              </time>
            ) : null}
          </header>
          {showSubjectLine ? (
            <p className="text-muted-foreground mt-0.5 text-xs italic">
              {subject}
            </p>
          ) : null}
          <div className="text-foreground mt-1.5 text-sm [&_.text-foreground]:text-sm">
            <MessageBodyMarkdown text={bodyPreview} />
          </div>
          {externalUrl ? (
            <a
              className={cn(
                buttonVariants({ size: "sm", variant: "link" }),
                "mt-2 h-auto px-0 py-0 text-xs"
              )}
              href={externalUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open on origin site
            </a>
          ) : null}
          {patch ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{patchLabel}</Badge>
              {patch.seriesUrl ? (
                <a
                  className={cn(
                    buttonVariants({ size: "sm", variant: "link" }),
                    "h-auto px-0 py-0 text-xs"
                  )}
                  href={patch.seriesUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Series
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
