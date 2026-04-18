"use client";

import {
  AlertCircle,
  ExternalLink,
  Hash,
  List,
  Loader2,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { SourceLabelText } from "@/features/mailing-lists/components/source-label";
import {
  useClearMailingLists,
  useFollowSource,
  useMailingListSources,
  useMailingListThreads,
  useSyncMailingLists,
} from "@/features/mailing-lists/hooks/use-mailing-lists";
import type {
  MailingListThreadRow,
  MailingListThreadsFilters,
} from "@/features/mailing-lists/hooks/use-mailing-lists";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@atl/ui/components/alert-dialog";
import { Badge } from "@atl/ui/components/badge";
import { Button } from "@atl/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@atl/ui/components/card";
import { Input } from "@atl/ui/components/input";
import { Separator } from "@atl/ui/components/separator";
import { cn } from "@atl/ui/lib/utils";
import { formatRelativeTime } from "@atl/utils/date";

/** Native overflow + thin scrollbar — avoids the wide custom ScrollArea track. */
const panelScrollClass = cn(
  "overflow-y-auto overscroll-contain",
  "[scrollbar-width:thin]",
  "[scrollbar-color:var(--border)_transparent]",
  "[&::-webkit-scrollbar]:w-[5px]",
  "[&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-thumb]:rounded-full",
  "[&::-webkit-scrollbar-thumb]:hover:bg-border/80"
);

function ThreadsBody({
  loading,
  threads,
}: {
  loading: boolean;
  threads: MailingListThreadRow[] | undefined;
}) {
  const searchParams = useSearchParams();

  const threadHref = useCallback(
    (threadId: string) => {
      const p = new URLSearchParams(searchParams.toString());
      p.set("thread", threadId);
      return `/app/mailing-lists?${p.toString()}` as Route;
    },
    [searchParams]
  );

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading threads…</p>;
  }
  if (threads && threads.length > 0) {
    return (
      <ul className="flex flex-col gap-0.5">
        {threads.map((t) => {
          const title =
            t.subject.trim() ||
            /* i18n: thread had no subject in feed */ "(No subject)";
          return (
            <li key={t.threadId}>
              <Link
                className={cn(
                  "group grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2 gap-y-1 rounded-lg px-2 py-2.5 transition-colors",
                  "hover:bg-muted/45 border-border/50 hover:border-border/80 border border-transparent"
                )}
                href={threadHref(t.threadId)}
              >
                <div className="flex shrink-0 items-start gap-1.5 pt-0.5">
                  {t.unread ? (
                    <span
                      aria-label="Unread"
                      className="bg-primary mt-1 size-2 shrink-0 rounded-full"
                      title="Unread"
                    />
                  ) : (
                    <span className="mt-1 size-2 shrink-0" aria-hidden />
                  )}
                  <Hash
                    aria-hidden
                    className="text-muted-foreground/70 size-4 shrink-0 opacity-70 group-hover:opacity-100"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-foreground m-0 text-sm leading-snug">
                    <span className="font-medium wrap-break-word">{title}</span>
                    <span
                      aria-label={`${t.messageCount} message${t.messageCount === 1 ? "" : "s"} in thread`}
                      className="bg-muted/90 text-foreground/90 ring-border/50 ml-1.5 inline-flex h-5 min-w-5 shrink-0 translate-y-px items-center justify-center rounded-full px-1.5 align-middle text-[11px] font-semibold tabular-nums ring-1"
                      title={`${t.messageCount} message${t.messageCount === 1 ? "" : "s"}`}
                    >
                      {t.messageCount}
                    </span>
                  </p>
                  <div className="text-muted-foreground mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                    <SourceLabelText
                      displayName={t.source.displayName}
                      listLabel={t.source.listLabel}
                      sourceLabel={t.source.sourceLabel}
                      variant="inline"
                    />
                  </div>
                </div>
                <div className="flex min-w-0 flex-col items-end gap-1 pt-0.5">
                  {t.lastMessageAt ? (
                    <time
                      className="text-muted-foreground text-xs whitespace-nowrap tabular-nums"
                      dateTime={t.lastMessageAt}
                      title={new Date(t.lastMessageAt).toLocaleString()}
                    >
                      {formatRelativeTime(t.lastMessageAt)}
                    </time>
                  ) : (
                    <span className="text-muted-foreground w-14 shrink-0" />
                  )}
                  <Badge
                    className="h-5 shrink-0 px-1.5 py-0 text-[10px] capitalize"
                    variant="outline"
                  >
                    {t.source.volumeClass}
                  </Badge>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <p className="text-muted-foreground text-sm">
      No threads yet. Run <strong>Sync all</strong> to ingest messages from
      public feeds.
    </p>
  );
}

export function MailingListsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigate = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const p = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === undefined || v === null || v === "") {
          p.delete(k);
        } else {
          p.set(k, v);
        }
      }
      router.replace(`${pathname}?${p.toString()}` as Route);
    },
    [pathname, router, searchParams]
  );

  const threadFilters = useMemo((): MailingListThreadsFilters => {
    const sortRaw = searchParams.get("sort");
    const orderRaw = searchParams.get("order");
    const volRaw = searchParams.get("volume");
    return {
      order: orderRaw === "asc" || orderRaw === "desc" ? orderRaw : "desc",
      q: searchParams.get("q") ?? "",
      sort:
        sortRaw === "messageCount" ||
        sortRaw === "subject" ||
        sortRaw === "lastMessageAt"
          ? sortRaw
          : "lastMessageAt",
      sourceId: searchParams.get("source"),
      volumeClass:
        volRaw === "high" || volRaw === "medium" || volRaw === "low"
          ? volRaw
          : "",
    };
  }, [searchParams]);

  const selectedSourceId = threadFilters.sourceId ?? null;

  const { data: sources, isLoading: sourcesLoading } = useMailingListSources();
  const { data: threads, isLoading: threadsLoading } = useMailingListThreads({
    limit: 40,
    offset: 0,
    order: threadFilters.order,
    q: threadFilters.q || undefined,
    sort: threadFilters.sort,
    sourceId: selectedSourceId,
    volumeClass: threadFilters.volumeClass || undefined,
  });

  const sync = useSyncMailingLists();
  const clear = useClearMailingLists();
  const follow = useFollowSource();

  const sourceRows = useMemo(() => {
    if (!Array.isArray(sources)) {
      return [];
    }
    return sources as {
      archiveUrl: string;
      displayName: string;
      following: boolean;
      id: string;
      lastSyncError: string | null;
      lastSyncStatus: string | null;
      lastSyncedAt: string | null;
      listLabel: string | null;
      slug: string;
      sourceLabel: string | null;
    }[];
  }, [sources]);

  const sortValue = threadFilters.sort ?? "lastMessageAt";
  const orderValue = threadFilters.order ?? "desc";
  const volumeValue = threadFilters.volumeClass || "";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-4">
      <Card
        className="flex min-h-0 w-full max-w-[min(100%,28rem)] flex-1 flex-col lg:h-full lg:max-w-[28rem] lg:flex-none"
        size="sm"
      >
        <CardHeader className="shrink-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <List className="size-4" />
            Sources
          </CardTitle>
          <CardDescription>
            Filter by list. Sync loads recent posts from public feeds. A red
            badge means the last sync for that source failed—hover it for the
            error message.
          </CardDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              disabled={sync.isPending || clear.isPending}
              onClick={() => sync.mutate({ all: true })}
              size="sm"
              variant="secondary"
            >
              <RefreshCw
                className={cn("mr-1 size-3", sync.isPending && "animate-spin")}
              />
              Sync all
            </Button>
            <Button
              disabled={!selectedSourceId || sync.isPending || clear.isPending}
              onClick={() =>
                selectedSourceId &&
                sync.mutate({ sourceSlug: selectedSourceId })
              }
              size="sm"
              variant="outline"
            >
              Sync selected
            </Button>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    disabled={sync.isPending || clear.isPending}
                    size="sm"
                    variant="outline"
                  />
                }
              >
                {clear.isPending ? (
                  <>
                    <Loader2 className="mr-1 size-3 animate-spin" />
                    Clearing…
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-1 size-3" />
                    Clear data
                  </>
                )}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear mailing list data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes all synced threads, messages, and your
                    follows/bookmarks for these lists. Source entries are
                    restored when you sync again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      void (async () => {
                        try {
                          const res = await clear.mutateAsync();
                          toast.success(
                            `Cleared ${res.data.deletedSources} mailing list source(s). Run Sync to ingest again.`
                          );
                        } catch (error: unknown) {
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : "Clear failed"
                          );
                        }
                      })();
                    }}
                  >
                    Clear all data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col pt-0">
          <Button
            className={cn(
              "mb-1.5 h-9 w-full justify-start gap-2 px-3 font-medium",
              selectedSourceId === null
                ? "border-border bg-muted text-foreground hover:bg-muted hover:text-foreground border"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
            onClick={() => navigate({ source: null })}
            size="sm"
            variant="ghost"
          >
            <List
              className={cn(
                "size-3.5 shrink-0",
                selectedSourceId === null
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            />
            All lists
          </Button>
          <Separator className="mb-1.5" />
          {sourcesLoading ? (
            <p className="text-muted-foreground px-1 py-2 text-sm">Loading…</p>
          ) : (
            <div className={cn("min-h-0 flex-1", panelScrollClass)}>
              <div className="pr-3 sm:pr-4">
                <ul className="flex flex-col gap-0.5">
                  {sourceRows.map((s) => (
                    <li key={s.id}>
                      <div
                        className={cn(
                          "flex items-center gap-1 rounded-md border border-transparent py-1.5 pr-0.5 pl-1.5 transition-colors",
                          "hover:bg-muted/40",
                          selectedSourceId === s.id &&
                            "border-border bg-muted/50 border-l-primary border-l-2 shadow-xs"
                        )}
                      >
                        <button
                          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-sm py-0.5 pr-0.5 text-left"
                          onClick={() => navigate({ source: s.id })}
                          type="button"
                        >
                          <SourceLabelText
                            displayName={s.displayName}
                            listLabel={s.listLabel}
                            sourceLabel={s.sourceLabel}
                            variant="sidebar"
                          />
                        </button>
                        <div className="flex shrink-0 items-center gap-0">
                          {s.lastSyncStatus === "error" ? (
                            <Badge
                              aria-label={
                                s.lastSyncError
                                  ? `Last sync failed: ${s.lastSyncError}`
                                  : "Last sync failed"
                              }
                              className="mr-0.5 max-w-[5.5rem] gap-0.5 px-1 py-0 text-[9px]"
                              title={s.lastSyncError ?? "Last sync failed"}
                              variant="destructive"
                            >
                              <AlertCircle
                                aria-hidden
                                className="size-2.5 shrink-0"
                              />
                              <span className="truncate">Failed</span>
                            </Badge>
                          ) : null}
                          <Button
                            aria-label={
                              s.following
                                ? `Unfollow ${s.displayName}`
                                : `Follow ${s.displayName}`
                            }
                            className={cn(
                              "shrink-0",
                              s.following &&
                                "text-amber-600 dark:text-amber-400"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              follow.mutate({
                                following: !s.following,
                                sourceId: s.id,
                              });
                            }}
                            size="icon-xs"
                            title={s.following ? "Unfollow" : "Follow"}
                            variant="ghost"
                          >
                            <Star
                              className={cn(
                                "size-3.5",
                                s.following && "fill-current"
                              )}
                            />
                          </Button>
                          <Button
                            className="text-muted-foreground shrink-0"
                            size="icon-xs"
                            variant="ghost"
                            render={
                              <a
                                aria-label={`Open ${s.displayName} archive in new tab`}
                                href={s.archiveUrl}
                                rel="noreferrer"
                                target="_blank"
                                title="Open list archive"
                              />
                            }
                          >
                            <ExternalLink className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="flex min-h-0 min-w-0 flex-1 flex-col">
        <CardHeader className="shrink-0">
          <CardTitle className="text-base">Threads</CardTitle>
          <CardDescription>
            {selectedSourceId
              ? `Showing threads for one list. Open a thread to read messages.`
              : "Showing threads across all synced lists."}
          </CardDescription>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <div className="flex max-w-md min-w-[10rem] flex-1 flex-col gap-1">
              <label className="text-muted-foreground text-xs" htmlFor="ml-q">
                Search
              </label>
              <Input
                className="h-9"
                defaultValue={searchParams.get("q") ?? ""}
                id="ml-q"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = (e.target as HTMLInputElement).value.trim();
                    navigate({ q: v || null });
                  }
                }}
                placeholder="Subject or body…"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Sort</span>
              <select
                className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                onChange={(e) => navigate({ sort: e.target.value })}
                value={sortValue}
              >
                <option value="lastMessageAt">Last activity</option>
                <option value="messageCount">Message count</option>
                <option value="subject">Subject</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Order</span>
              <select
                className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                onChange={(e) => navigate({ order: e.target.value })}
                value={orderValue}
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Volume</span>
              <select
                className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                onChange={(e) => navigate({ volume: e.target.value || null })}
                value={volumeValue}
              >
                <option value="">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pt-0">
          <div className={cn("min-h-0 min-w-0 flex-1", panelScrollClass)}>
            <div className="min-w-0 pr-3 sm:pr-4">
              <ThreadsBody loading={threadsLoading} threads={threads} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
