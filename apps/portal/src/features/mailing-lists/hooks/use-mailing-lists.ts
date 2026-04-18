"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const mailingListQueryKeys = {
  sources: () => ["mailing-lists", "sources"] as const,
  thread: (threadId: string) => ["mailing-lists", "thread", threadId] as const,
  threads: (filters: MailingListThreadsFilters) =>
    ["mailing-lists", "threads", filters] as const,
};

export interface MailingListThreadsFilters {
  limit?: number;
  offset?: number;
  order?: "asc" | "desc";
  q?: string;
  sort?: "lastMessageAt" | "messageCount" | "subject";
  sourceId?: string | null;
  volumeClass?: "high" | "medium" | "low" | "";
}

function buildThreadsQueryString(filters: MailingListThreadsFilters): string {
  const qs = new URLSearchParams();
  qs.set("limit", String(filters.limit ?? 40));
  qs.set("offset", String(filters.offset ?? 0));
  qs.set("sort", filters.sort ?? "lastMessageAt");
  qs.set("order", filters.order ?? "desc");
  if (filters.sourceId) {
    qs.set("sourceId", filters.sourceId);
  }
  if (filters.volumeClass) {
    qs.set("volumeClass", filters.volumeClass);
  }
  if (filters.q?.trim()) {
    qs.set("q", filters.q.trim());
  }
  return qs.toString();
}

export function useMailingListSources() {
  return useQuery({
    queryFn: async () => {
      const res = await fetch("/api/app/mailing-lists/sources");
      if (!res.ok) {
        throw new Error("Failed to load sources");
      }
      const json: { data: unknown; ok: boolean } = await res.json();
      return json.data;
    },
    queryKey: mailingListQueryKeys.sources(),
  });
}

export function useMailingListThreads(filters: MailingListThreadsFilters = {}) {
  const qs = buildThreadsQueryString(filters);
  return useQuery({
    queryFn: async () => {
      const res = await fetch(`/api/app/mailing-lists/threads?${qs}`);
      if (!res.ok) {
        throw new Error("Failed to load threads");
      }
      const json: {
        data: { threads: MailingListThreadRow[] };
        ok: boolean;
      } = await res.json();
      return json.data.threads;
    },
    queryKey: mailingListQueryKeys.threads(filters),
  });
}

export interface MailingListThreadRow {
  lastMessageAt: string | null;
  messageCount: number;
  source: {
    displayName: string;
    id: string;
    listLabel: string | null;
    slug: string;
    sourceLabel: string | null;
    volumeClass: string;
  };
  subject: string;
  threadId: string;
  unread: boolean;
}

export interface MailingListPatchMeta {
  id: string;
  messageId: string;
  patchworkPatchId: number | null;
  patchworkProject: string | null;
  raw: unknown;
  seriesUrl: string | null;
  state: string | null;
}

export interface MailingListThreadMessage {
  authorEmail: string | null;
  authorName: string | null;
  bodyHtml?: string | null;
  bodyText: string | null;
  externalUrl: string | null;
  id: string;
  inReplyTo?: string | null;
  patch: MailingListPatchMeta | null;
  referencesHeader?: string | null;
  rfcMessageId?: string | null;
  sentAt: string | null;
  subject: string;
}

export interface MailingListThreadPayload {
  messages: MailingListThreadMessage[];
  read: {
    lastReadAt: string | null;
    lastReadMessageId: string | null;
  } | null;
  source: {
    archiveUrl: string;
    displayName: string;
    id: string;
    listLabel: string | null;
    slug: string;
    sourceLabel: string | null;
  };
  thread: {
    id: string;
    lastMessageAt: string | null;
    messageCount: number;
    rootMessageId: string | null;
    sourceId: string;
    subject: string;
    subjectKey: string;
    updatedAt: string;
  };
}

export function useMailingListThread(
  threadId: string | null,
  options?: { include?: ("threading" | "bodyHtml")[] }
) {
  const includeParam =
    options?.include?.length && options.include.length > 0
      ? `?include=${options.include.join(",")}`
      : "";

  return useQuery({
    enabled: Boolean(threadId),
    queryFn: async () => {
      const res = await fetch(
        `/api/app/mailing-lists/threads/${threadId}${includeParam}`
      );
      if (!res.ok) {
        throw new Error("Failed to load thread");
      }
      return res.json() as Promise<{
        data: MailingListThreadPayload;
        ok: boolean;
      }>;
    },
    queryKey: [...mailingListQueryKeys.thread(threadId ?? ""), includeParam],
  });
}

export function useMarkThreadRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (threadId: string) => {
      const res = await fetch(
        `/api/app/mailing-lists/threads/${threadId}/read`,
        {
          body: JSON.stringify({}),
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        }
      );
      if (!res.ok) {
        throw new Error("Failed to mark read");
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["mailing-lists"] });
    },
  });
}

export function useSyncMailingLists() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { all?: boolean; sourceSlug?: string }) => {
      const res = await fetch("/api/app/mailing-lists/sync", {
        body: JSON.stringify(input),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(typeof j.error === "string" ? j.error : "Sync failed");
      }
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["mailing-lists"] });
    },
  });
}

export function useClearMailingLists() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/app/mailing-lists/clear", {
        method: "POST",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(typeof j.error === "string" ? j.error : "Clear failed");
      }
      return res.json() as Promise<{
        data: { deletedSources: number };
        ok: boolean;
      }>;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["mailing-lists"] });
    },
  });
}

export function useFollowSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      following,
      sourceId,
    }: {
      following: boolean;
      sourceId: string;
    }) => {
      const res = await fetch(
        `/api/app/mailing-lists/sources/${sourceId}/follow`,
        { method: following ? "PUT" : "DELETE" }
      );
      if (!res.ok) {
        throw new Error("Follow update failed");
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: mailingListQueryKeys.sources() });
    },
  });
}
