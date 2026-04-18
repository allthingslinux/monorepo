import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

/**
 * Configured upstream mailing list source (lore, Mailman, RSS, etc.).
 */
export const mlSource = pgTable(
  "ml_source",
  {
    adapterType: text("adapter_type").notNull(),
    archiveUrl: text("archive_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    displayName: text("display_name").notNull(),
    feedUrl: text("feed_url"),
    id: text("id").primaryKey(),
    lastCursor: text("last_cursor"),
    lastSyncError: text("last_sync_error"),
    lastSyncStatus: text("last_sync_status"),
    lastSyncedAt: timestamp("last_synced_at"),
    /** List name after the origin (e.g. announce, netdev). */
    listLabel: text("list_label"),
    name: text("name").notNull(),
    pollIntervalSeconds: integer("poll_interval_seconds")
      .notNull()
      .default(3600),
    rateLimitClass: text("rate_limit_class").notNull().default("normal"),
    slug: text("slug").notNull().unique(),
    /** Short origin for UI grouping (e.g. Debian, Kernel). */
    sourceLabel: text("source_label"),
    supportsPatchMeta: boolean("supports_patch_meta").notNull().default(false),
    supportsThreading: boolean("supports_threading").notNull().default(true),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    visibility: text("visibility").notNull().default("public"),
    volumeClass: text("volume_class").notNull(),
  },
  (table) => [
    index("ml_source_adapter_type_idx").on(table.adapterType),
    index("ml_source_volume_class_idx").on(table.volumeClass),
  ]
);

/**
 * Thread bucket per source (normalized subject / root message-id).
 */
export const mlThread = pgTable(
  "ml_thread",
  {
    id: text("id").primaryKey(),
    lastMessageAt: timestamp("last_message_at"),
    messageCount: integer("message_count").notNull().default(0),
    rootMessageId: text("root_message_id"),
    sourceId: text("source_id")
      .notNull()
      .references(() => mlSource.id, { onDelete: "cascade" }),
    subject: text("subject").notNull(),
    subjectKey: text("subject_key").notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("ml_thread_source_id_idx").on(table.sourceId),
    index("ml_thread_last_message_at_idx").on(table.lastMessageAt),
    index("ml_thread_source_subject_key_idx").on(
      table.sourceId,
      table.subjectKey
    ),
  ]
);

/**
 * Single message in a thread (RFC Message-Id is globally unique when present).
 */
export const mlMessage = pgTable(
  "ml_message",
  {
    authorEmail: text("author_email"),
    authorName: text("author_name"),
    bodyHtml: text("body_html"),
    bodyText: text("body_text"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    dedupeHash: text("dedupe_hash"),
    externalUrl: text("external_url"),
    id: text("id").primaryKey(),
    inReplyTo: text("in_reply_to"),
    referencesHeader: text("references_header"),
    rfcMessageId: text("rfc_message_id").unique(),
    sentAt: timestamp("sent_at"),
    sourceId: text("source_id")
      .notNull()
      .references(() => mlSource.id, { onDelete: "cascade" }),
    subject: text("subject").notNull(),
    threadId: text("thread_id")
      .notNull()
      .references(() => mlThread.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("ml_message_thread_id_sent_at_idx").on(table.threadId, table.sentAt),
    index("ml_message_source_id_idx").on(table.sourceId),
    index("ml_message_source_external_url_idx").on(
      table.sourceId,
      table.externalUrl
    ),
  ]
);

/**
 * Optional Patchwork enrichment linked to a message.
 */
export const mlPatchMeta = pgTable(
  "ml_patch_meta",
  {
    id: text("id").primaryKey(),
    messageId: text("message_id")
      .notNull()
      .unique()
      .references(() => mlMessage.id, { onDelete: "cascade" }),
    patchworkPatchId: integer("patchwork_patch_id"),
    patchworkProject: text("patchwork_project"),
    raw: jsonb("raw"),
    seriesUrl: text("series_url"),
    state: text("state"),
  },
  (table) => [index("ml_patch_meta_message_id_idx").on(table.messageId)]
);

/**
 * User follows a mailing list source (entire archive).
 */
export const mlUserFollowSource = pgTable(
  "ml_user_follow_source",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: text("id").primaryKey(),
    sourceId: text("source_id")
      .notNull()
      .references(() => mlSource.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("ml_user_follow_source_user_source_unique").on(
      table.userId,
      table.sourceId
    ),
    index("ml_user_follow_source_user_id_idx").on(table.userId),
  ]
);

/**
 * User follows a single thread.
 */
export const mlUserFollowThread = pgTable(
  "ml_user_follow_thread",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => mlThread.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("ml_user_follow_thread_user_thread_unique").on(
      table.userId,
      table.threadId
    ),
    index("ml_user_follow_thread_user_id_idx").on(table.userId),
  ]
);

/**
 * Per-user read cursor for a thread.
 */
export const mlUserReadState = pgTable(
  "ml_user_read_state",
  {
    id: text("id").primaryKey(),
    lastReadAt: timestamp("last_read_at"),
    lastReadMessageId: text("last_read_message_id").references(
      () => mlMessage.id,
      { onDelete: "set null" }
    ),
    threadId: text("thread_id")
      .notNull()
      .references(() => mlThread.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("ml_user_read_state_user_thread_unique").on(
      table.userId,
      table.threadId
    ),
    index("ml_user_read_state_user_id_idx").on(table.userId),
  ]
);

/**
 * Bookmarked thread per user.
 */
export const mlBookmark = pgTable(
  "ml_bookmark",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => mlThread.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("ml_bookmark_user_thread_unique").on(
      table.userId,
      table.threadId
    ),
    index("ml_bookmark_user_id_idx").on(table.userId),
  ]
);
