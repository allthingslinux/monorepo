# @atl/fibery

TypeScript client for the [Fibery API](https://the.fibery.io/@public/User_Guide/Guide/HTTP-API-259). Zero dependencies, source-first, server-only.

## Installation

```json
// In any app's package.json
{
  "dependencies": {
    "@atl/fibery": "workspace:*"
  }
}
```

## Setup

```ts
import { FiberyClient } from "@atl/fibery";

const fibery = new FiberyClient({
  account: process.env.FIBERY_ACCOUNT!, // subdomain: "myteam" → myteam.fibery.io
  token: process.env.FIBERY_TOKEN!,
});
```

Required env vars:

| Variable         | Description                                  |
| ---------------- | -------------------------------------------- |
| `FIBERY_ACCOUNT` | Your Fibery subdomain (without `.fibery.io`) |
| `FIBERY_TOKEN`   | API token from workspace menu → API Tokens   |

> **Server-only.** Never import this package in client components or browser code. Tokens carry the same privileges as your user account.

### Rate limiting

Fibery enforces **3 requests/second per token** and 7/second per workspace. The client automatically retries `429 Too Many Requests` responses with exponential backoff (1 s, 2 s, 4 s, …), honouring the server's `Retry-After` header when present.

```ts
const fibery = new FiberyClient({
  account: process.env.FIBERY_ACCOUNT!,
  token: process.env.FIBERY_TOKEN!,
  maxRetries: 3, // default — set to 0 to disable retries
});
```

## API

### Schema

Introspect your workspace — all Types (Databases) and their Fields.

```ts
const schema = await fibery.schema.query();

// Include field descriptions
const schema = await fibery.schema.query({ withDescription: true });

schema["fibery/types"].forEach((type) => {
  console.log(type["fibery/name"], type["fibery/fields"].length);
});
```

---

### Entities

Full CRUD for entities in any Type.

```ts
// Query
const posts = await fibery.entities.query({
  from: "Blog/Post",
  select: [
    "fibery/id",
    "Blog/Title",
    { "Blog/Author": ["fibery/id", "user/name"] },
  ],
  where: ["=", ["Blog/Status"], "$status"],
  params: { $status: "Published" },
  orderBy: [[["Blog/Title"], "q/asc"]],
  limit: 50,
});

// Create
const post = await fibery.entities.create("Blog/Post", {
  "Blog/Title": "Hello World",
  "Blog/Status": { "fibery/id": "<status-entity-id>" },
});

// Update
await fibery.entities.update("Blog/Post", post["fibery/id"], {
  "Blog/Title": "Updated Title",
});

// Delete
await fibery.entities.delete("Blog/Post", post["fibery/id"]);

// Upsert — create or update based on a conflict field
const results = await fibery.entities.createOrUpdate(
  "Blog/Post",
  [{ "fibery/id": "...", "Blog/Title": "Hello World" }],
  { conflictField: "Blog/Title", conflictAction: "update-latest" }
);
// results[0].action → "create" | "skip-create" | "update-latest" | "prefer-duplicate-found-in-the-batch"
```

#### Collections (relations)

```ts
await fibery.entities.addToCollection("Blog/Post", postId, "Blog/Tags", [
  tagId,
]);
await fibery.entities.removeFromCollection("Blog/Post", postId, "Blog/Tags", [
  tagId,
]);
await fibery.entities.setCollection("Blog/Post", postId, "Blog/Tags", [tagId]); // replaces all
await fibery.entities.resetCollection("Blog/Post", postId, "Blog/Tags"); // clears all
```

---

### Documents

Rich text fields are stored as collaborative documents addressed by a `secret` UUID. Fetch the secret via an entity query first.

```ts
// 1. Get the document secret
const [entity] = await fibery.entities.query({
  from: "Blog/Post",
  select: ["fibery/id", { "Blog/Body": ["Collaboration~Documents/secret"] }],
  where: ["=", ["fibery/id"], "$id"],
  params: { $id: postId },
  limit: 1,
});

const secret = entity["Blog/Body"]["Collaboration~Documents/secret"];

// 2. Read / write
const markdown = await fibery.documents.get(secret, "md");
await fibery.documents.update(secret, "# New content", "md");

// Batch operations
const docs = await fibery.documents.getBatch([secret1, secret2], "md");
await fibery.documents.updateBatch(
  [
    { secret: secret1, content: "content 1" },
    { secret: secret2, content: "content 2" },
  ],
  "md"
);
```

Supported formats: `"md"` (default) · `"html"` · `"json"` · `"plain-text"`

---

### Types

Create, rename, and delete Types (Databases) in your workspace schema.

```ts
await fibery.types.create("Recruiting/Application", {
  domain: true, // show on Workspace Map
  secured: true, // enable permissions
  color: "#ff6b6b",
  mixins: ["fibery/rank-mixin"],
});

await fibery.types.rename("Recruiting/Application", "Recruiting/Submission");

await fibery.types.delete("Recruiting/Submission", {
  deleteEntities: true,
  deleteRelatedFields: true,
});
```

---

### Fields

Add, rename, and delete Fields on a Type.

```ts
// Primitive field
await fibery.fields.create(
  "Recruiting/Application",
  "Recruiting/Discord Username",
  {
    type: "fibery/text",
  }
);

// Relation field
await fibery.fields.create("Recruiting/Application", "Recruiting/Role", {
  type: "Roles/Role", // related type name
  meta: { "fibery/collection?": false },
});

// Rich text field
await fibery.fields.create(
  "Recruiting/Application",
  "Recruiting/Cover Letter",
  {
    type: "Collaboration~Documents/Document",
    meta: { "fibery/entity-component?": true },
  }
);

await fibery.fields.rename(
  "Recruiting/Application",
  "Recruiting/Discord Username",
  "Recruiting/Discord"
);
await fibery.fields.delete("Recruiting/Application", "Recruiting/Discord", {
  deleteValues: true,
});

// Update a single meta key
await fibery.fields.setMeta(
  "Recruiting/Application",
  "Recruiting/Discord",
  "fibery/required?",
  true
);
```

Field types: `fibery/int` · `fibery/decimal` · `fibery/bool` · `fibery/text` · `fibery/date` · `fibery/date-time` · `fibery/date-range` · `fibery/date-time-range` · `fibery/uuid` · `fibery/rank` · `fibery/json-value` · `fibery/location` · `fibery/emoji`

---

### Files

```ts
// Upload
const file = await fibery.files.upload(blob);
const file = await fibery.files.uploadFromUrl("https://example.com/logo.png", {
  name: "logo.png",
});

// Attach to an entity
await fibery.files.attachToEntity(
  "Blog/Post",
  postId,
  "Blog/Files",
  file["fibery/id"]
);

// Download (returns a Response for streaming)
const res = await fibery.files.download(file["fibery/secret"]);
const buffer = await res.arrayBuffer();

// Temporary public URLs (valid 60 min)
const urls = await fibery.files.signUrls([file["fibery/secret"]]);
console.log(urls[0].url, urls[0].expiresAt);

// Delete
await fibery.files.delete([file["fibery/id"]]);
```

---

### Views

```ts
// List all views, or filter
const views = await fibery.views.query();
const privateViews = await fibery.views.query({ isPrivate: true });
const specific = await fibery.views.query({ ids: ["<view-id>"] });

// Create
const [view] = await fibery.views.create([
  {
    "fibery/name": "All Applications",
    "fibery/type": "table",
    "fibery/container-app": { "fibery/id": "<space-id>" },
  },
]);

// Update
await fibery.views.update([
  { id: view["fibery/id"], values: { "fibery/name": "Applications" } },
]);

// Delete
await fibery.views.delete([view["fibery/id"]]);
```

---

### Tokens

Manage API tokens for the authenticated user (max 3 per user).

```ts
const tokens = await fibery.tokens.list();
const newToken = await fibery.tokens.create();
await fibery.tokens.delete(tokens[0].id);
```

> **Note:** The token endpoints (`list`, `create`, `delete`) require session/cookie authentication. They are not accessible via an API token and are intended for browser-context use only (e.g. the Fibery web UI).

---

### Raw commands

Escape hatch for anything not covered by the typed API.

```ts
const results = await fibery.commands([
  {
    command: "fibery.entity/query",
    args: {
      query: {
        "q/from": "fibery/user",
        "q/select": ["user/name"],
        "q/limit": 10,
      },
    },
  },
]);
```

## Error handling

```ts
import { FiberyHttpError, FiberyCommandError } from "@atl/fibery";

try {
  await fibery.entities.create("Blog/Post", { "Blog/Title": "Hello" });
} catch (err) {
  if (err instanceof FiberyHttpError) {
    // Non-2xx response — network/auth/rate-limit errors
    console.error(err.status, err.body); // e.g. 429, "Too Many Requests"
  } else if (err instanceof FiberyCommandError) {
    // API-level failure — bad command, schema mismatch, etc.
    console.error(err.command, err.result);
  }
}
```

| Error                | When                                                               |
| -------------------- | ------------------------------------------------------------------ |
| `FiberyHttpError`    | Non-2xx HTTP response. `status` + `body` fields.                   |
| `FiberyCommandError` | Fibery returned `{ success: false }`. `command` + `result` fields. |

**Rate limits:** 3 requests/second per token, 7/second per workspace. `FiberyHttpError` with `status: 429` when exceeded.

## Type reference

Key types exported from `@atl/fibery`:

```ts
import type {
  FiberyEntity, // { "fibery/id": string; [field: string]: unknown }
  FiberySchema, // full schema response
  EntityQuery, // query shape for entities.query()
  CreateOrUpdateResultItem, // discriminated union for upsert results
  FiberyFieldType, // primitive field type union
  FiberyFile, // file upload response
  SignedUrl, // signed URL response
  FiberyClientConfig, // { account, token }
} from "@atl/fibery";
```
