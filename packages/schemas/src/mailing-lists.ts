import { z } from "zod";

export const mailingListSortFieldSchema = z.enum([
  "lastMessageAt",
  "messageCount",
  "subject",
]);

export const mailingListSortOrderSchema = z.enum(["asc", "desc"]);

export const mailingListVolumeClassSchema = z.enum(["high", "medium", "low"]);

const emptyToUndefined = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

export const mailingListThreadsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(30),
  offset: z.coerce.number().int().nonnegative().default(0),
  order: mailingListSortOrderSchema.default("desc"),
  /** ILIKE search on thread subject and message body. */
  q: z.preprocess(emptyToUndefined, z.string().min(1).max(500).optional()),
  sort: mailingListSortFieldSchema.default("lastMessageAt"),
  sourceGroup: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  sourceId: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  volumeClass: z.preprocess(
    emptyToUndefined,
    mailingListVolumeClassSchema.optional()
  ),
});

export type MailingListThreadsQuery = z.infer<
  typeof mailingListThreadsQuerySchema
>;

export const mailingListThreadDetailQuerySchema = z.object({
  /** Comma-separated: `threading` (inReplyTo, rfcMessageId, referencesHeader), `bodyHtml`. */
  include: z
    .string()
    .optional()
    .transform((s) =>
      s
        ? s
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : []
    ),
});

export type MailingListThreadDetailQuery = z.infer<
  typeof mailingListThreadDetailQuerySchema
>;

export const mailingListSyncBodySchema = z.object({
  all: z.boolean().optional(),
  older: z.boolean().optional(),
  sourceSlug: z.string().min(1).optional(),
});

export type MailingListSyncBody = z.infer<typeof mailingListSyncBodySchema>;
