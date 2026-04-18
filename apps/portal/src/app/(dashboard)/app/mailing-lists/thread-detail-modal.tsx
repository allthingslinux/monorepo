"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";

import { useMarkThreadRead } from "@/features/mailing-lists/hooks/use-mailing-lists";
import { Dialog, DialogContent, DialogTitle } from "@atl/ui/components/dialog";

import { ThreadDetailContent } from "./[threadId]/thread-detail-content";

export function ThreadDetailModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadId = searchParams.get("thread");
  const markRead = useMarkThreadRead();

  const close = () => {
    if (threadId) {
      void markRead.mutateAsync(threadId);
    }
    const p = new URLSearchParams(searchParams.toString());
    p.delete("thread");
    const qs = p.toString();
    router.replace(`/app/mailing-lists${qs ? `?${qs}` : ""}` as Route);
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      open={Boolean(threadId)}
    >
      <DialogContent
        className="border-border/60 bg-card flex max-h-[min(90vh,56rem)] min-h-0 w-[min(100%-2rem,42rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none md:w-[min(100%-2rem,48rem)] lg:w-[min(100%-2rem,56rem)]"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Mailing list thread</DialogTitle>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {threadId ? (
            <ThreadDetailContent onClose={close} threadId={threadId} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
