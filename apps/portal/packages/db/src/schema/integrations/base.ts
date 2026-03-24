import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "../auth";

export const integrationAccountStatusEnum = pgEnum(
  "integration_account_status",
  ["active", "suspended", "deleted"]
);

export const integrationAccount = pgTable(
  "integration_accounts",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: text("id").primaryKey(),
    integrationType: text("integration_type").notNull(),
    metadata: jsonb("metadata"),
    status: integrationAccountStatusEnum("status").default("active").notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("integration_accounts_userId_idx").on(table.userId),
    index("integration_accounts_type_idx").on(table.integrationType),
    uniqueIndex("integration_accounts_userId_type_idx").on(
      table.userId,
      table.integrationType
    ),
  ]
);