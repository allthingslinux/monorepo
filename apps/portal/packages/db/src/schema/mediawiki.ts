import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";

import { user } from "./auth";

export const mediawikiAccountStatusEnum = pgEnum("mediawiki_account_status", [
  "active",
  "pending",
  "suspended",
  "deleted",
]);

export const mediawikiAccount = pgTable(
  "mediawiki_account",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    metadata: jsonb("metadata"),
    status: mediawikiAccountStatusEnum("status").default("active").notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    wikiUserId: integer("wiki_user_id"),
    wikiUsername: text("wiki_username").notNull(),
  },
  (table) => [
    index("mediawiki_account_status_idx").on(table.status),
    uniqueIndex("mediawiki_account_userId_active_idx")
      .on(table.userId)
      .where(sql`status != 'deleted'`),
    uniqueIndex("mediawiki_account_wikiUsername_active_idx")
      .on(table.wikiUsername)
      .where(sql`status != 'deleted'`),
  ]
);

// Zod schemas generated from Drizzle table
export const selectMediawikiAccountSchema =
  createSelectSchema(mediawikiAccount);
export const insertMediawikiAccountSchema =
  createInsertSchema(mediawikiAccount);