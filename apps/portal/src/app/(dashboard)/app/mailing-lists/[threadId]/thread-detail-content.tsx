"use client";

import { X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Fragment, useMemo } from "react";

import { SourceLabelText } from "@/features/mailing-lists/components/source-label";
import { ThreadMessageRow } from "@/features/mailing-lists/components/thread-message-row";
import { useMailingListThread } from "@/features/mailing-lists/hooks/use-mailing-lists";
import { deriveThreadTags } from "@/features/mailing-lists/lib/derive-thread-tags";
import { Badge } from "@atl/ui/components/badge";
import { Button, buttonVariants } from "@atl/ui/components/button";
import { Separator } from "@atl/ui/components/separator";
import { cn } from "@atl/ui/lib/utils";

function previewBody(text: string | null): string {
  if (!text) {
    return "";
  }
  if (text.length > 8000) {
    return `${text.slice(0, 8000)}…`;
  }
  return text;
}

export function ThreadDetailContent({
  onClose,
  threadId,
}: {
  onClose?: () => void;
  threadId: string;
}) {
  const { data, error, isLoading } = useMailingListThread(threadId);

  const payload = data?.data;

  const plainBody = useMemo(() => {
    if (!payload?.messages) {
      return [];
    }
    return payload.messages.map((m) => ({
      ...m,
      preview: previewBody(m.bodyText),
    }));
  }, [payload?.messages]);

  const readBoundaryMs = useMemo(() => {
    const raw = payload?.read?.lastReadAt;
    if (!raw) {
      return null;
    }
    return new Date(raw).getTime();
  }, [payload?.read?.lastReadAt]);

  const firstUnreadIndex = useMemo(() => {
    if (readBoundaryMs === null) {
      return -1;
    }
    return plainBody.findIndex(
      (m) => m.sentAt && new Date(m.sentAt).getTime() > readBoundaryMs
    );
  }, [plainBody, readBoundaryMs]);

  const subjectTags = useMemo(
    () =>
      payload?.thread.subject ? deriveThreadTags(payload.thread.subject) : [],
    [payload?.thread.subject]
  );

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading thread…</p>;
  }

  if (error || !payload) {
    return (
      <p className="text-destructive text-sm">
        Could not load this thread. Try syncing the source list first.
      </p>
    );
  }

  const backEl = onClose ? (
    <button
      className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
      onClick={onClose}
      type="button"
    >
      ← Back to lists
    </button>
  ) : (
    <Link
      className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
      href={"/app/mailing-lists" as Route}
    >
      ← Back to lists
    </Link>
  );

  const sourceAndArchive = (
    <>
      <SourceLabelText
        displayName={payload.source.displayName}
        listLabel={payload.source.listLabel}
        sourceLabel={payload.source.sourceLabel}
        variant="inline"
      />
      <a
        className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        href={payload.source.archiveUrl}
        rel="noreferrer"
        target="_blank"
      >
        Open archive
      </a>
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      {onClose ? (
        <div className="grid w-full grid-cols-[1fr_auto] items-start gap-x-2 gap-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {backEl}
            {sourceAndArchive}
          </div>
          <Button
            aria-label="Close"
            className="shrink-0"
            onClick={onClose}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {backEl}
          {sourceAndArchive}
        </div>
      )}

      <header className="border-border/60 border-b pb-4">
        <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
          {payload.thread.subject}
        </h1>
        {subjectTags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {subjectTags.map((tag) => (
              <Badge
                className="text-xs font-normal capitalize"
                key={tag}
                variant="secondary"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
        <p className="text-muted-foreground mt-1.5 text-sm">
          {plainBody.length} message{plainBody.length === 1 ? "" : "s"}
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {plainBody.map((m, i) => (
          <Fragment key={m.id}>
            {i === firstUnreadIndex && firstUnreadIndex >= 0 ? (
              <div
                aria-hidden
                className="text-muted-foreground flex items-center gap-3 py-1 text-xs"
              >
                <Separator className="flex-1" />
                <span>New since last read</span>
                <Separator className="flex-1" />
              </div>
            ) : null}
            <ThreadMessageRow
              authorEmail={m.authorEmail}
              authorName={m.authorName}
              bodyPreview={m.preview}
              externalUrl={m.externalUrl}
              patch={m.patch}
              sentAt={m.sentAt}
              subject={m.subject}
              threadSubject={payload.thread.subject}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
