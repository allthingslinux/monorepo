"use client";

import {
  AlertCircle,
  ChevronDown,
  ExternalLink,
  Hash,
  List,
  Loader2,
  MessageSquare,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  MailingListSourceRow,
  MailingListThreadRow,
  MailingListThreadsFilters,
} from "@/features/mailing-lists/hooks/use-mailing-lists";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
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

const SEARCH_DEBOUNCE_MS = 300;
const THREADS_PAGE_SIZE = 40;
const UNGROUPED_SOURCE_LABEL = "Other";

function ThreadsBody({
  hasMore: _hasMore,
  loading,
  loadingMore,
  loadingOlderHistory,
  onLoadMore,
  threads,
}: {
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  loadingOlderHistory: boolean;
  onLoadMore: () => Promise<void>;
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
      <div className="flex flex-col gap-2">
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
                      <span className="font-medium wrap-break-word">
                        {title}
                      </span>
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
        <Button
          className="w-full"
          disabled={loadingMore || loadingOlderHistory}
          onClick={() => {
            void onLoadMore();
          }}
          size="sm"
          variant="outline"
        >
          {(() => {
            if (loadingMore) {
              return (
                <>
                  <Loader2 className="mr-2 size-3.5 animate-spin" />
                  Loading more threads…
                </>
              );
            }
            if (loadingOlderHistory) {
              return (
                <>
                  <Loader2 className="mr-2 size-3.5 animate-spin" />
                  Syncing older history…
                </>
              );
            }
            return "Load more";
          })()}
        </Button>
      </div>
    );
  }
  return (
    <p className="text-muted-foreground text-sm">
      No threads yet. Run <strong>Sync all</strong> to ingest messages from
      public feeds.
    </p>
  );
}

// eslint-disable-next-line complexity -- sources sidebar, filters, and thread list in one dashboard view
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
      sourceGroup: searchParams.get("sourceGroup"),
      sourceId: searchParams.get("source"),
      volumeClass:
        volRaw === "high" || volRaw === "medium" || volRaw === "low"
          ? volRaw
          : "",
    };
  }, [searchParams]);

  const selectedSourceId = threadFilters.sourceId ?? null;
  const selectedSourceGroup = threadFilters.sourceGroup ?? null;

  const { data: sources, isLoading: sourcesLoading } = useMailingListSources();
  const {
    data: threadPages,
    fetchNextPage: fetchNextThreadsPage,
    hasNextPage: threadsHasNextPage,
    isFetchingNextPage: threadsLoadingMore,
    isLoading: threadsLoading,
  } = useMailingListThreads({
    limit: THREADS_PAGE_SIZE,
    order: threadFilters.order,
    q: threadFilters.q || undefined,
    sort: threadFilters.sort,
    sourceGroup: selectedSourceGroup,
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
    return sources as MailingListSourceRow[];
  }, [sources]);
  const sourceGroups = useMemo(() => {
    const grouped = new Map<string, MailingListSourceRow[]>();
    for (const source of sourceRows) {
      const label = source.sourceLabel?.trim() || UNGROUPED_SOURCE_LABEL;
      const bucket = grouped.get(label);
      if (bucket) {
        bucket.push(source);
      } else {
        grouped.set(label, [source]);
      }
    }

    const entries = [...grouped.entries()].toSorted(([a], [b]) => {
      if (a === UNGROUPED_SOURCE_LABEL) {
        return 1;
      }
      if (b === UNGROUPED_SOURCE_LABEL) {
        return -1;
      }
      return a.localeCompare(b);
    });

    for (const [, rows] of entries) {
      rows.sort((a, b) => a.displayName.localeCompare(b.displayName));
    }
    return entries;
  }, [sourceRows]);

  const totalUnreadCount = useMemo(
    () => sourceRows.reduce((sum, s) => sum + (s.unreadCount || 0), 0),
    [sourceRows]
  );
  const threads = useMemo(() => threadPages?.pages.flat() ?? [], [threadPages]);

  const sortValue = threadFilters.sort ?? "lastMessageAt";
  const orderValue = threadFilters.order ?? "desc";
  const volumeValue = threadFilters.volumeClass || "";
  const queryValue = searchParams.get("q") ?? "";
  const [searchDraft, setSearchDraft] = useState(queryValue);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const debouncedSearch = useDebouncedValue(searchDraft, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    setSearchDraft(queryValue);
  }, [queryValue]);

  useEffect(() => {
    const next = debouncedSearch.trim();
    if (next === queryValue) {
      return;
    }
    navigate({ q: next || null, thread: null });
  }, [debouncedSearch, navigate, queryValue]);

  useEffect(() => {
    setCollapsedGroups((prev) => {
      const next: Record<string, boolean> = {};
      for (const [label] of sourceGroups) {
        next[label] = prev[label] ?? false;
      }
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      if (prevKeys.length !== nextKeys.length) {
        return next;
      }
      for (const k of nextKeys) {
        if (prev[k] !== next[k]) {
          return next;
        }
      }
      return prev;
    });
  }, [sourceGroups]);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(22rem,28rem)_minmax(0,1fr)]">
      <Card className="bg-card/95 border-border/70 flex min-h-0 w-full flex-col gap-0 rounded-xl border pt-2 pb-0 shadow-sm backdrop-blur-sm">
        <CardHeader className="shrink-0 px-3 pt-1 pb-2">
          <div className="space-y-1.5">
            <div className="flex h-8 items-center gap-2.5">
              <span className="bg-muted text-muted-foreground border-border/70 inline-flex size-7 shrink-0 items-center justify-center rounded-md border">
                <List className="size-4" />
              </span>
              <CardTitle className="text-base leading-6">Sources</CardTitle>
            </div>
          </div>
          <div className="bg-muted/20 border-border/60 mt-1.5 grid grid-cols-1 gap-1.5 rounded-lg border p-1.5 sm:grid-cols-3">
            <Button
              className="h-9 w-full"
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
              className="h-9 w-full"
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
            <AlertDialog
              onOpenChange={setClearDialogOpen}
              open={clearDialogOpen}
            >
              <AlertDialogTrigger
                render={
                  <Button
                    className="border-destructive/40 text-destructive hover:bg-destructive/10 h-9 w-full"
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
                    This clears your read state, follows, and bookmarks for
                    mailing lists. Shared synced threads/messages remain
                    available for everyone.
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
                          setClearDialogOpen(false);
                          toast.success(
                            `Cleared your mailing-list state (${res.data.totalDeleted} row${res.data.totalDeleted === 1 ? "" : "s"}).`
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
        <CardContent className="border-border/60 flex min-h-0 flex-1 flex-col border-t p-2 pt-2.5">
          <Button
            className={cn(
              "h-9 w-full justify-start gap-2 px-3 font-medium",
              selectedSourceId === null && selectedSourceGroup === null
                ? "border-border bg-muted text-foreground hover:bg-muted hover:text-foreground border"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
            onClick={() =>
              navigate({ q: null, source: null, sourceGroup: null })
            }
            size="sm"
            variant="ghost"
          >
            <List
              className={cn(
                "size-3.5 shrink-0",
                selectedSourceId === null && selectedSourceGroup === null
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            />
            All lists
            {totalUnreadCount > 0 ? (
              <Badge
                className="ml-auto h-5 min-w-5 px-1.5 py-0 text-[10px] tabular-nums"
                title={`${totalUnreadCount} unread thread${totalUnreadCount === 1 ? "" : "s"}`}
                variant="secondary"
              >
                {totalUnreadCount}
              </Badge>
            ) : null}
          </Button>
          <Separator className="my-1.5" />
          {sourcesLoading ? (
            <p className="text-muted-foreground px-1 py-2 text-sm">Loading…</p>
          ) : (
            <div className={cn("min-h-0 flex-1", panelScrollClass)}>
              <div className="pr-3 sm:pr-4">
                <ul className="flex flex-col gap-0.5">
                  {sourceGroups.map(([groupLabel, groupSources]) => {
                    const groupUnread = groupSources.reduce(
                      (sum, source) => sum + (source.unreadCount || 0),
                      0
                    );
                    const hasFailure = groupSources.some(
                      (source) => source.lastSyncStatus === "error"
                    );
                    const isCollapsed = collapsedGroups[groupLabel] ?? false;

                    return (
                      <li key={groupLabel}>
                        <div className="mb-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              className={cn(
                                "hover:bg-muted/30 flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left",
                                selectedSourceId === null &&
                                  selectedSourceGroup === groupLabel &&
                                  "bg-muted/50"
                              )}
                              onClick={() =>
                                navigate({
                                  q: null,
                                  source: null,
                                  sourceGroup: groupLabel,
                                  thread: null,
                                })
                              }
                              type="button"
                            >
                              <span className="text-foreground min-w-0 flex-1 text-sm font-semibold">
                                {groupLabel}
                              </span>
                            </button>
                            {groupUnread > 0 ? (
                              <Badge
                                className="h-5 min-w-5 px-1.5 py-0 text-[10px] tabular-nums"
                                title={`${groupUnread} unread thread${groupUnread === 1 ? "" : "s"}`}
                                variant="secondary"
                              >
                                {groupUnread}
                              </Badge>
                            ) : null}
                            {hasFailure ? (
                              <Badge
                                className="h-5 gap-0.5 px-1 py-0 text-[9px]"
                                title="One or more lists in this group failed to sync"
                                variant="destructive"
                              >
                                <AlertCircle
                                  aria-hidden
                                  className="size-2.5 shrink-0"
                                />
                                <span>Failed</span>
                              </Badge>
                            ) : null}
                            <button
                              className="hover:bg-muted/30 rounded-md p-1"
                              onClick={() =>
                                setCollapsedGroups((prev) => ({
                                  ...prev,
                                  [groupLabel]: !isCollapsed,
                                }))
                              }
                              type="button"
                            >
                              <ChevronDown
                                className={cn(
                                  "text-muted-foreground size-3.5 shrink-0 transition-transform",
                                  isCollapsed && "-rotate-90"
                                )}
                              />
                            </button>
                          </div>
                          {isCollapsed ? null : (
                            <ul className="mt-0.5 ml-4 flex flex-col gap-0.5 border-l pl-2">
                              {groupSources.map((s) => (
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
                                      onClick={() =>
                                        navigate({
                                          q: null,
                                          source: s.id,
                                          sourceGroup: null,
                                        })
                                      }
                                      type="button"
                                    >
                                      <SourceLabelText
                                        displayName={
                                          s.listLabel ?? s.displayName
                                        }
                                        listLabel={null}
                                        sourceLabel={null}
                                        variant="sidebar"
                                      />
                                    </button>
                                    <div className="flex shrink-0 items-center gap-0">
                                      {s.unreadCount > 0 ? (
                                        <Badge
                                          aria-label={`${s.unreadCount} unread thread${s.unreadCount === 1 ? "" : "s"}`}
                                          className="mr-0.5 h-5 min-w-5 px-1.5 py-0 text-[10px] tabular-nums"
                                          title={`${s.unreadCount} unread thread${s.unreadCount === 1 ? "" : "s"}`}
                                          variant="secondary"
                                        >
                                          {s.unreadCount}
                                        </Badge>
                                      ) : null}
                                      {s.lastSyncStatus === "error" ? (
                                        <Badge
                                          aria-label={
                                            s.lastSyncError
                                              ? `Last sync failed: ${s.lastSyncError}`
                                              : "Last sync failed"
                                          }
                                          className="mr-0.5 max-w-[5.5rem] gap-0.5 px-1 py-0 text-[9px]"
                                          title={
                                            s.lastSyncError ??
                                            "Last sync failed"
                                          }
                                          variant="destructive"
                                        >
                                          <AlertCircle
                                            aria-hidden
                                            className="size-2.5 shrink-0"
                                          />
                                          <span className="truncate">
                                            Failed
                                          </span>
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
                                        title={
                                          s.following ? "Unfollow" : "Follow"
                                        }
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
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/95 border-border/70 flex min-h-0 min-w-0 flex-1 flex-col gap-0 rounded-xl border pt-2 pb-0 shadow-sm backdrop-blur-sm">
        <CardHeader className="shrink-0 px-3 pt-1 pb-2">
          <div className="space-y-1.5">
            <div className="flex h-8 items-center gap-2.5">
              <span className="bg-muted text-muted-foreground border-border/70 inline-flex size-7 shrink-0 items-center justify-center rounded-md border">
                <MessageSquare className="size-4" />
              </span>
              <CardTitle className="text-base leading-6">Threads</CardTitle>
            </div>
            {selectedSourceGroup && !selectedSourceId ? (
              <CardDescription className="text-sm leading-5">
                {`Showing threads for ${selectedSourceGroup}. Open a thread to read messages.`}
              </CardDescription>
            ) : null}
          </div>
          <div className="bg-muted/20 border-border/60 mt-1.5 grid grid-cols-1 items-end gap-1.5 rounded-lg border p-1.5 md:grid-cols-[minmax(14rem,1.8fr)_minmax(8rem,1fr)_minmax(8rem,1fr)_minmax(6.5rem,0.8fr)]">
            <div className="flex min-w-0 flex-col gap-1">
              <label className="sr-only" htmlFor="ml-q">
                Search
              </label>
              <Input
                aria-label="Search threads"
                className="h-9"
                id="ml-q"
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Subject or body…"
                value={searchDraft}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="sr-only">Sort</span>
              <select
                aria-label="Sort threads"
                className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                onChange={(e) => navigate({ sort: e.target.value })}
                value={sortValue}
              >
                <option value="lastMessageAt">Last activity</option>
                <option value="messageCount">Message count</option>
                <option value="subject">Subject</option>
              </select>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="sr-only">Order</span>
              <select
                aria-label="Thread order"
                className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                onChange={(e) => navigate({ order: e.target.value })}
                value={orderValue}
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="sr-only">Volume</span>
              <select
                aria-label="Filter by volume"
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
        <CardContent className="border-border/60 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-t p-2 pt-2.5">
          <div className={cn("min-h-0 min-w-0 flex-1", panelScrollClass)}>
            <div className="min-w-0 pr-1 sm:pr-2">
              <ThreadsBody
                hasMore={Boolean(threadsHasNextPage)}
                loading={threadsLoading}
                loadingMore={threadsLoadingMore}
                loadingOlderHistory={sync.isPending}
                onLoadMore={async () => {
                  if (threadsHasNextPage) {
                    await fetchNextThreadsPage();
                    return;
                  }
                  if (selectedSourceId) {
                    await sync.mutateAsync({
                      older: true,
                      sourceSlug: selectedSourceId,
                    });
                    return;
                  }
                  await sync.mutateAsync({ all: true, older: true });
                }}
                threads={threads}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
