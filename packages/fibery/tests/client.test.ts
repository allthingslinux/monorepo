import { describe, it, expect, beforeAll } from "vitest";

import {
  FiberyClient,
  FiberyHttpError,
  FiberyCommandError,
} from "../src/index.ts";
import type { FiberySchema, FiberyEntity } from "../src/index.ts";

// ---------------------------------------------------------------------------
// Shared setup — all API calls made once, sequentially, before any tests run
// ---------------------------------------------------------------------------

/** Pause between requests to stay within Fibery's 3 req/sec rate limit. */
async function sleep(ms: number): Promise<void> {
  // oxlint-disable-next-line promise/avoid-new
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
const RATE_DELAY = 400; // ms between requests (~2.5/sec, safely under 3/sec)

let fibery: FiberyClient;
let schema: FiberySchema;
let schemaWithDesc: FiberySchema;
let schemaWithDeleted: FiberySchema;
let users: FiberyEntity[];
let usersLimited: FiberyEntity[];
let usersPage1: FiberyEntity[];
let usersPage2: FiberyEntity[];
let usersOrdered: FiberyEntity[];
let usersFiltered: FiberyEntity[];
let entitiesWithNested: FiberyEntity[];
let docField:
  | (typeof schema)["fibery/types"][0]["fibery/fields"][0]
  | undefined;
let docMd: string | undefined;
let docHtml: string | undefined;
let docPlainText: string | undefined;
let batchDocs: { secret: string; content: string }[] | undefined;
let batchSecrets: string[];
let views: Awaited<ReturnType<FiberyClient["views"]["query"]>>;
let viewsPrivate: Awaited<ReturnType<FiberyClient["views"]["query"]>>;
let rawResults: Awaited<ReturnType<FiberyClient["commands"]>>;

beforeAll(async () => {
  fibery = new FiberyClient({
    account: process.env.FIBERY_ACCOUNT!,
    token: process.env.FIBERY_TOKEN!,
  });

  // Sequential fetches with delays to stay within the 3 req/sec rate limit
  schema = await fibery.schema.query();
  await sleep(RATE_DELAY);
  schemaWithDesc = await fibery.schema.query({ withDescription: true });
  await sleep(RATE_DELAY);
  schemaWithDeleted = await fibery.schema.query({ withSoftDeleted: true });
  await sleep(RATE_DELAY);

  users = await fibery.entities.query({
    from: "fibery/user",
    limit: 10,
    select: ["fibery/id", "user/name"],
  });
  await sleep(RATE_DELAY);
  usersLimited = await fibery.entities.query({
    from: "fibery/user",
    limit: 2,
    select: ["fibery/id"],
  });
  await sleep(RATE_DELAY);
  usersPage1 = await fibery.entities.query({
    from: "fibery/user",
    limit: 1,
    offset: 0,
    select: ["fibery/id"],
  });
  await sleep(RATE_DELAY);
  usersPage2 = await fibery.entities.query({
    from: "fibery/user",
    limit: 1,
    offset: 1,
    select: ["fibery/id"],
  });
  await sleep(RATE_DELAY);
  usersOrdered = await fibery.entities.query({
    from: "fibery/user",
    limit: 5,
    orderBy: [[["fibery/id"] as [string], "q/asc"]],
    select: ["fibery/id", "user/name"],
  });
  await sleep(RATE_DELAY);

  const knownId = users[0]?.["fibery/id"] as string | undefined;
  usersFiltered =
    knownId !== undefined && knownId !== ""
      ? await fibery.entities.query({
          from: "fibery/user",
          limit: 5,
          params: { $id: knownId },
          select: ["fibery/id"],
          where: ["=", ["fibery/id"], "$id"],
        })
      : [];
  await sleep(RATE_DELAY);

  // Find a type with a Document field for nested + document tests
  const typeWithDoc = schema["fibery/types"].find((t) =>
    t["fibery/fields"].some(
      (f) => f["fibery/type"] === "Collaboration~Documents/Document"
    )
  );
  docField = typeWithDoc?.["fibery/fields"].find(
    (f) => f["fibery/type"] === "Collaboration~Documents/Document"
  );

  if (typeWithDoc && docField) {
    entitiesWithNested = await fibery.entities.query({
      from: typeWithDoc["fibery/name"],
      limit: 3,
      select: [
        "fibery/id",
        { [docField["fibery/name"]]: ["Collaboration~Documents/secret"] },
      ],
    });
    await sleep(RATE_DELAY);

    batchSecrets = entitiesWithNested
      .map((e) => {
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        const nested = e[docField!["fibery/name"]] as Record<string, unknown>;
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        return nested["Collaboration~Documents/secret"] as string;
      })
      .filter(Boolean);

    if (batchSecrets[0]) {
      docMd = await fibery.documents.get(batchSecrets[0], "md");
      await sleep(RATE_DELAY);
      docHtml = await fibery.documents.get(batchSecrets[0], "html");
      await sleep(RATE_DELAY);
      docPlainText = await fibery.documents.get(batchSecrets[0], "plain-text");
      await sleep(RATE_DELAY);
      batchDocs = await fibery.documents.getBatch(batchSecrets, "md");
      await sleep(RATE_DELAY);
    }
  } else {
    entitiesWithNested = [];
    batchSecrets = [];
  }

  views = await fibery.views.query();
  await sleep(RATE_DELAY);
  viewsPrivate = await fibery.views.query({ isPrivate: true });
  await sleep(RATE_DELAY);

  rawResults = await fibery.commands([
    {
      args: {
        query: {
          "q/from": "fibery/user",
          "q/limit": 1,
          "q/select": ["fibery/id"],
        },
      },
      command: "fibery.entity/query",
    },
  ]);
});

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

describe("schema.query", () => {
  it("returns a fibery/types array", () => {
    expect(schema["fibery/types"]).toBeInstanceOf(Array);
    expect(schema["fibery/types"].length).toBeGreaterThan(0);
  });

  it("each type has id, name, and fields", () => {
    for (const type of schema["fibery/types"].slice(0, 5)) {
      expect(typeof type["fibery/id"]).toBe("string");
      expect(typeof type["fibery/name"]).toBe("string");
      expect(type["fibery/fields"]).toBeInstanceOf(Array);
    }
  });

  it("each field has id, name, and type", () => {
    const type = schema["fibery/types"].find(
      (t) => t["fibery/fields"].length > 0
    )!;
    const field = type["fibery/fields"][0];
    expect(typeof field["fibery/id"]).toBe("string");
    expect(typeof field["fibery/name"]).toBe("string");
    expect(typeof field["fibery/type"]).toBe("string");
  });

  it("withDescription returns same structure", () => {
    expect(schemaWithDesc["fibery/types"]).toBeInstanceOf(Array);
    expect(schemaWithDesc["fibery/types"].length).toBeGreaterThan(0);
  });

  it("withSoftDeleted returns at least as many types", () => {
    expect(schemaWithDeleted["fibery/types"].length).toBeGreaterThanOrEqual(
      schema["fibery/types"].length
    );
  });
});

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

describe("entities.query", () => {
  it("returns an array", () => {
    expect(users).toBeInstanceOf(Array);
  });

  it("entities have selected fields", () => {
    if (users.length === 0) {
      return;
    }
    expect(users[0]).toHaveProperty("fibery/id");
    expect(users[0]).toHaveProperty("user/name");
    expect(typeof users[0]?.["fibery/id"]).toBe("string");
  });

  it("limit is respected", () => {
    expect(usersLimited.length).toBeLessThanOrEqual(2);
  });

  it("offset returns different entities", () => {
    if (usersPage1.length === 0 || usersPage2.length === 0) {
      return;
    }
    expect(usersPage1[0]?.["fibery/id"]).not.toBe(usersPage2[0]?.["fibery/id"]);
  });

  it("orderBy does not throw and returns an array", () => {
    expect(usersOrdered).toBeInstanceOf(Array);
  });

  it("where clause filters to exactly the matching entity", () => {
    if (usersFiltered.length === 0 || users.length === 0) {
      return;
    }
    expect(usersFiltered.length).toBe(1);
    expect(usersFiltered[0]?.["fibery/id"]).toBe(users[0]?.["fibery/id"]);
  });

  it("nested relation select returns object with document secret", () => {
    if (entitiesWithNested.length === 0 || !docField) {
      return;
    }
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const nested = entitiesWithNested[0]?.[docField["fibery/name"]] as Record<
      string,
      unknown
    >;
    expect(nested).toHaveProperty("Collaboration~Documents/secret");
    expect(typeof nested["Collaboration~Documents/secret"]).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

describe("documents.get", () => {
  it("returns a string for md format", () => {
    if (docMd === undefined) {
      return;
    }
    expect(typeof docMd).toBe("string");
  });

  it("returns a string for html format", () => {
    if (docHtml === undefined) {
      return;
    }
    expect(typeof docHtml).toBe("string");
  });

  it("returns a string for plain-text format", () => {
    if (docPlainText === undefined) {
      return;
    }
    expect(typeof docPlainText).toBe("string");
  });
});

describe("documents.getBatch", () => {
  it("returns one entry per secret", () => {
    if (!batchDocs) {
      return;
    }
    expect(batchDocs.length).toBe(batchSecrets.length);
  });

  it("each entry has secret and content fields", () => {
    if (!batchDocs) {
      return;
    }
    for (const doc of batchDocs) {
      expect(typeof doc.secret).toBe("string");
      expect(typeof doc.content).toBe("string");
    }
  });
});

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

describe("views.query", () => {
  it("returns an array", () => {
    expect(views).toBeInstanceOf(Array);
  });

  it("each view has id, name, and type", () => {
    if (views.length === 0) {
      return;
    }
    const view = views[0];
    expect(typeof view["fibery/id"]).toBe("string");
    expect(typeof view["fibery/name"]).toBe("string");
    expect(typeof view["fibery/type"]).toBe("string");
  });

  it("isPrivate filter returns a subset", () => {
    expect(viewsPrivate.length).toBeLessThanOrEqual(views.length);
  });
});

// ---------------------------------------------------------------------------
// Raw commands
// ---------------------------------------------------------------------------

describe("commands (raw)", () => {
  it("returns an array of command results", () => {
    expect(rawResults).toBeInstanceOf(Array);
    expect(rawResults.length).toBe(1);
  });

  it("result has success: true", () => {
    expect(rawResults[0]).toHaveProperty("success", true);
  });

  it("result.result is an array", () => {
    expect(rawResults[0]?.result).toBeInstanceOf(Array);
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe("error handling", () => {
  it("bad token throws FiberyHttpError", async () => {
    const bad = new FiberyClient({
      account: process.env.FIBERY_ACCOUNT!,
      token: "invalid-token",
    });
    const err = await bad.schema.query().catch((error: unknown) => error);
    expect(err).toBeInstanceOf(FiberyHttpError);
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    expect(typeof (err as FiberyHttpError).status).toBe("number");
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    expect(typeof (err as FiberyHttpError).body).toBe("string");
  });

  it("invalid type throws FiberyCommandError", async () => {
    const err = await fibery
      .commands([
        {
          args: {
            query: {
              "q/from": "Nonexistent/Type",
              "q/limit": 1,
              "q/select": ["fibery/id"],
            },
          },
          command: "fibery.entity/query",
        },
      ])
      .catch((error: unknown) => error);
    expect(err).toBeInstanceOf(FiberyCommandError);
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    expect((err as FiberyCommandError).command).toBe("fibery.entity/query");
  });
});
