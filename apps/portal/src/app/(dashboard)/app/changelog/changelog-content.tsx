"use client";

import { AlertTriangle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { ChangelogFilters } from "@/features/changelog/components/changelog-filters";
import type { EntryTypeFilterValue } from "@/features/changelog/components/changelog-filters";
import { TimelineView } from "@/features/changelog/components/timeline-view";
import { useChangelogLiveQuery } from "@/features/changelog/hooks/use-changelog-live-query";
import { parseConventionalCommit } from "@/features/changelog/lib/parser";
import type {
  ConventionalCommitType,
  RepoError,
  RepoSummary,
  TimelineEntry,
} from "@/features/changelog/lib/types";

const PAGE_SIZE = 30;

interface ChangelogContentProps {
  entries: TimelineEntry[];
  errors: RepoError[];
  repos: RepoSummary[];
}

export function ChangelogContent({
  entries,
  errors,
  repos,
}: ChangelogContentProps) {
  const live = useChangelogLiveQuery({ entries, errors, repos });
  const {
    entries: liveEntries,
    errors: liveErrors,
    repos: liveRepos,
  } = live.data;

  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [entryTypeFilter, setEntryTypeFilter] =
    useState<EntryTypeFilterValue>("all");
  const [selectedCommitTypes, setSelectedCommitTypes] = useState<
    Set<ConventionalCommitType>
  >(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredEntries = useMemo(() => {
    let list = liveEntries;
    if (selectedRepos.size > 0) {
      list = list.filter((e) => selectedRepos.has(e.repoId));
    }
    if (entryTypeFilter === "releases") {
      list = list.filter((e) => e.type === "release");
    } else if (entryTypeFilter === "commits") {
      list = list.filter((e) => e.type === "commit");
    }
    if (selectedCommitTypes.size > 0) {
      list = list.filter((e) => {
        if (e.type !== "commit") {
          return false;
        }
        const parsed = parseConventionalCommit(e.message);
        return parsed.type !== null && selectedCommitTypes.has(parsed.type);
      });
    }
    return list;
  }, [liveEntries, selectedRepos, entryTypeFilter, selectedCommitTypes]);

  function toggleRepo(repoId: string) {
    setSelectedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(repoId)) {
        next.delete(repoId);
      } else {
        next.add(repoId);
      }
      return next;
    });
    setVisibleCount(PAGE_SIZE);
  }

  function handleEntryTypeChange(value: EntryTypeFilterValue) {
    setEntryTypeFilter(value);
    setVisibleCount(PAGE_SIZE);
  }

  function toggleCommitType(type: ConventionalCommitType) {
    setSelectedCommitTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
    setVisibleCount(PAGE_SIZE);
  }

  function resetFilters() {
    setSelectedRepos(new Set());
    setEntryTypeFilter("all");
    setSelectedCommitTypes(new Set());
    setVisibleCount(PAGE_SIZE);
  }

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  if (liveEntries.length === 0 && liveErrors.length > 0) {
    return (
      <div className="border-destructive/35 bg-destructive/10 ring-destructive/10 flex flex-col items-center justify-center rounded-xl border py-16 shadow-sm ring-1 backdrop-blur-sm">
        <AlertTriangle className="text-destructive/60 mb-3 size-8" />
        <p className="text-foreground font-medium">
          Changelog data is temporarily unavailable
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto">
      {live.isError ? (
        <div className="border-warning/35 bg-warning/10 rounded-lg border px-4 py-2.5">
          <p className="text-warning text-xs">
            Could not refresh the changelog. Showing the last loaded timeline.
          </p>
        </div>
      ) : null}

      <ChangelogFilters
        entryType={entryTypeFilter}
        onCommitTypeToggle={toggleCommitType}
        onEntryTypeChange={handleEntryTypeChange}
        onRepoToggle={toggleRepo}
        onReset={resetFilters}
        repos={liveRepos}
        selectedCommitTypes={selectedCommitTypes}
        selectedRepos={selectedRepos}
      />
      <TimelineView
        entries={filteredEntries}
        onLoadMore={loadMore}
        visibleCount={visibleCount}
      />
    </div>
  );
}
