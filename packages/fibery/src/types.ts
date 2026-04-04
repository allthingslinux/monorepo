// ---------------------------------------------------------------------------
// Branded primitives
// ---------------------------------------------------------------------------

/**
 * A Fibery namespaced name in `"Space/TypeName"` format.
 * Useful as a branded type in your own code when you want to distinguish
 * raw strings from validated Fibery names:
 *
 * ```ts
 * function toFiberyName(s: string): FiberyName {
 *   if (!s.includes("/")) throw new Error(`Invalid Fibery name: ${s}`);
 *   return s as FiberyName;
 * }
 * ```
 */
export type FiberyName = string & { readonly __brand: "FiberyName" };

// ---------------------------------------------------------------------------
// Schema types
// ---------------------------------------------------------------------------

export interface FiberySchemaField {
  "fibery/id": string;
  "fibery/name": string;
  "fibery/type": string;
  "fibery/meta": FiberyFieldMeta;
}

export interface FiberySchemaType {
  "fibery/id": string;
  "fibery/name": string;
  "fibery/fields": FiberySchemaField[];
  "fibery/meta": Record<string, unknown>;
}

export interface FiberySchema {
  "fibery/id": string;
  "fibery/types": FiberySchemaType[];
  "fibery/meta": {
    "fibery/version": string;
    "fibery/rel-version": string;
    "fibery/maintenance?": boolean;
  };
}

// ---------------------------------------------------------------------------
// Field types & metadata
// ---------------------------------------------------------------------------

export type FiberyPrimitiveFieldType =
  | "fibery/int"
  | "fibery/decimal"
  | "fibery/bool"
  | "fibery/text"
  /** @deprecated Use `"fibery/text"` with `meta: { "ui/type": "email" }` instead. */
  | "fibery/email"
  | "fibery/emoji"
  | "fibery/date"
  | "fibery/date-time"
  | "fibery/date-range"
  | "fibery/date-time-range"
  | "fibery/location"
  | "fibery/uuid"
  | "fibery/rank"
  | "fibery/json-value";

/** Field type — either a primitive or a related type name e.g. "Blog/Tag" */
export type FiberyFieldType =
  | FiberyPrimitiveFieldType
  | (string & Record<never, never>);

export interface FiberyFieldMeta {
  "fibery/readonly?"?: boolean;
  "fibery/required?"?: boolean;
  "fibery/default-value"?: unknown;
  "fibery/unique?"?: boolean;
  "fibery/case-insensitive-text-unique?"?: boolean;
  "fibery/collection?"?: boolean;
  "fibery/relation"?: string;
  "fibery/entity-component?"?: boolean;
  "ui/type"?: "text" | "email" | "phone" | "url";
  "ui/number-unit"?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Entity types
// ---------------------------------------------------------------------------

export interface FiberyEntity {
  "fibery/id": string;
  "fibery/public-id"?: string;
  [field: string]: unknown;
}

// ---------------------------------------------------------------------------
// Query types
// ---------------------------------------------------------------------------

export type QueryOperator =
  | "="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "q/contains"
  | "q/not-contains"
  | "q/in"
  | "q/not-in"
  | "q/and"
  | "q/or";

export type WhereClause = [QueryOperator, ...unknown[]];

export interface EntityQuery {
  /** The type to query, e.g. "Blog/Post" */
  from: string;
  /** Fields to select. Nested relations use { "Space/Field": ["fibery/id"] } */
  select: (string | Record<string, unknown>)[];
  where?: WhereClause;
  /** Named params referenced in where clause, e.g. { $status: "Active" } */
  params?: Record<string, unknown>;
  /** Each clause is [[fieldName], direction], e.g. [["Blog/Title"], "q/asc"] */
  orderBy?: [[string], "q/asc" | "q/desc"][];
  limit: number | "q/no-limit";
  offset?: number;
}

// ---------------------------------------------------------------------------
// File types
// ---------------------------------------------------------------------------

export interface FiberyFile {
  "fibery/id": string;
  "fibery/name": string;
  "fibery/content-type": string;
  "fibery/secret": string;
}

export interface SignedUrl {
  secret: string;
  url: string;
  expiresAt: string;
}

// ---------------------------------------------------------------------------
// Raw command types
// ---------------------------------------------------------------------------

export interface FiberyCommand {
  command: string;
  args?: Record<string, unknown>;
  params?: Record<string, unknown>;
}

export interface FiberyCommandResult<T = unknown> {
  success: boolean;
  result: T;
}

// ---------------------------------------------------------------------------
// Type/Field API input shapes
// ---------------------------------------------------------------------------

export interface CreateTypeOptions {
  /** Show on Workspace Map */
  domain?: boolean;
  /** Enables permissions — required for most types */
  secured?: boolean;
  color?: string;
  /** Mixin names to install e.g. ["fibery/rank-mixin"] */
  mixins?: string[];
}

export interface CreateFieldOptions {
  type: FiberyFieldType;
  meta?: FiberyFieldMeta;
}

export type ConflictAction = "skip-create" | "update-latest";

export interface CreateOrUpdateOptions {
  conflictField: string;
  conflictAction: ConflictAction;
}

/** Discriminated union returned per-entity from fibery.entity.batch/create-or-update */
export type CreateOrUpdateResultItem =
  | { action: "create"; created: FiberyEntity }
  | {
      action: "skip-create";
      entity: Record<string, unknown>;
      duplicate: FiberyEntity;
    }
  | {
      action: "update-latest";
      entity: Record<string, unknown>;
      duplicate: FiberyEntity;
      updated: Record<string, unknown>;
    }
  | {
      action: "prefer-duplicate-found-in-the-batch";
      entity: Record<string, unknown>;
      duplicate: Record<string, unknown>;
    };

// ---------------------------------------------------------------------------
// Client config
// ---------------------------------------------------------------------------

export interface FiberyClientConfig {
  /** Subdomain only — e.g. "myteam" for myteam.fibery.io */
  account: string;
  token: string;
  /**
   * How many times to retry a 429 Too Many Requests response before throwing.
   * Uses exponential backoff (1 s, 2 s, 4 s, …) or the server's Retry-After header.
   * Defaults to 3. Set to 0 to disable retries.
   */
  maxRetries?: number;
}
