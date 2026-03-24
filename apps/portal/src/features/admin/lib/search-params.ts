/**
 * nuqs parsers for admin list URL state.
 * Import from "nuqs/server" so parsers can be reused in createLoader (server)
 * and in useQueryStates (client; client imports this file and passes parsers to nuqs).
 * See docs/NUQS.md and nuqs server-side / batching / utilities docs.
 */
import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import type { inferParserType } from "nuqs/server";

export const usersListParsers = {
  limit: parseAsInteger.withDefault(100),
  offset: parseAsInteger.withDefault(0),
  role: parseAsStringLiteral(["user", "staff", "admin", "all"]).withDefault(
    "all"
  ),
  search: parseAsString.withDefault(""),
  status: parseAsStringLiteral(["all", "active", "banned"]).withDefault("all"),
} as const;

/** Inferred type of URL state from usersListParsers (useQueryStates state and loader return). */
export type UsersListUrlState = inferParserType<typeof usersListParsers>;

/** Parse users list search params server-side. Accepts Request, URLSearchParams, or Promise thereof. */
export const loadUsersListSearchParams = createLoader(usersListParsers);