import "server-only";
import { log } from "@portal/observability/utils";
import { startSpan } from "@sentry/nextjs";

import { mailcowConfig, validateMailcowConfig } from "./config";
import type {
  MailcowAlias,
  MailcowAppPassword,
  MailcowResponseEntry,
} from "./types";

/**
 * Base URL for mailcow API (no trailing slash).
 * MAILCOW_API_URL should be the mailcow UI origin only (e.g. https://mail.atl.tools).
 * Paths like /api/v1/add/mailbox are appended here.
 */
function getBaseUrl(): string {
  validateMailcowConfig();
  const url = mailcowConfig.apiUrl;
  if (!url) {
    throw new Error("MAILCOW_API_URL is not configured");
  }
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

async function mailcowRequest<T = MailcowResponseEntry[]>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  validateMailcowConfig();
  const url = `${getBaseUrl()}${path}`;
  const method = options.method || "GET";

  log.debug(`Mailcow API request: ${method} ${path}`, {
    method,
    url,
  });

  const { apiKey } = mailcowConfig;
  if (!apiKey) {
    throw new Error("MAILCOW_API_KEY is not configured");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      log.error("Mailcow API authentication failed", { method, path });
      throw new Error(
        "Mailcow API authentication failed (invalid or expired API key)"
      );
    }

    if (!response.ok) {
      const text = await response.text();
      log.error(`Mailcow API error (${response.status})`, {
        method,
        path,
        response: text,
        status: response.status,
      });
      throw new Error(`Mailcow API error (${response.status}): ${text}`);
    }

    const text = await response.text();
    let data: T;
    try {
      data = text ? (JSON.parse(text) as T) : ({} as T);
    } catch {
      log.error("Failed to parse Mailcow API response", { method, path, text });
      data = {} as T;
    }

    log.debug("Mailcow API response success", { method, path });
    return data;
  } catch (error) {
    if (!(error instanceof Error && error.message.includes("Mailcow API"))) {
      log.error("Mailcow API request failed", {
        error: error instanceof Error ? error.message : String(error),
        method,
        path,
      });
    }
    throw error;
  }
}

/**
 * Parse mailcow array response and throw on error/danger.
 */
function assertSuccess(entries: MailcowResponseEntry[]): void {
  const first = Array.isArray(entries) ? entries[0] : entries;
  if (!first) {
    return;
  }

  if (first.type === "error" || first.type === "danger") {
    const msg = Array.isArray(first.msg) ? first.msg.join(" ") : first.msg;
    throw new Error(msg || "Mailcow API returned an error");
  }
}

/**
 * Create a mailbox in mailcow.
 */
export function createMailbox(
  domain: string,
  localPart: string,
  password: string,
  name: string
): Promise<void> {
  return startSpan(
    {
      attributes: {
        "mailcow.domain": domain,
        "mailcow.local_part": localPart,
      },
      name: "mailcow createMailbox",
      op: "http.client",
    },
    async () => {
      const body = {
        active: 1,
        authsource: "mailcow",
        domain,
        local_part: localPart,
        name,
        password,
        password2: password, // confirmation required
        quota: 3072, // 3GB default, matching OpenAPI example and domain defaults
      };

      const result = await mailcowRequest("/api/v1/add/mailbox", {
        body: JSON.stringify(body),
        method: "POST",
      });

      assertSuccess(result);
    }
  );
}

/**
 * Delete a mailbox from mailcow.
 */
export function deleteMailbox(username: string): Promise<void> {
  return startSpan(
    {
      attributes: {
        "mailcow.username": username,
      },
      name: "mailcow deleteMailbox",
      op: "http.client",
    },
    async () => {
      const result = await mailcowRequest("/api/v1/delete/mailbox", {
        body: JSON.stringify([username]),
        method: "POST",
      });

      assertSuccess(result);
    }
  );
}

/**
 * Update a mailbox in mailcow.
 */
export function updateMailbox(
  username: string,
  data: Record<string, unknown>
): Promise<void> {
  return startSpan(
    {
      attributes: {
        "mailcow.username": username,
      },
      name: "mailcow updateMailbox",
      op: "http.client",
    },
    async () => {
      const result = await mailcowRequest("/api/v1/edit/mailbox", {
        body: JSON.stringify({
          attr: data,
          items: [username],
        }),
        method: "POST",
      });

      assertSuccess(result);
    }
  );
}

/**
 * Extract a single valid record from a mailcow API response,
 * which may be an object or an array. Returns null if the response
 * is empty, an error, or missing the required field.
 */
function extractRecord(
  result: Record<string, unknown> | Record<string, unknown>[],
  requiredField: string
): Record<string, unknown> | null {
  const entry = Array.isArray(result)
    ? (result[0] as Record<string, unknown> | undefined)
    : result;

  if (!entry || typeof entry !== "object") {
    return null;
  }
  if (entry.type === "error" || entry.type === "danger") {
    return null;
  }
  return requiredField in entry ? entry : null;
}

/**
 * Get mailbox from mailcow (returns single object or null if not found).
 */
export function getMailbox(
  username: string
): Promise<Record<string, unknown> | null> {
  return startSpan(
    {
      attributes: {
        "mailcow.username": username,
      },
      name: "mailcow getMailbox",
      op: "http.client",
    },
    async () => {
      const encoded = encodeURIComponent(username);
      const result = await mailcowRequest<
        Record<string, unknown> | Record<string, unknown>[]
      >(`/api/v1/get/mailbox/${encoded}`);

      return extractRecord(result, "username");
    }
  );
}

/**
 * Get domain from mailcow.
 */
export function getDomain(
  domain: string
): Promise<Record<string, unknown> | null> {
  return startSpan(
    {
      attributes: {
        "mailcow.domain": domain,
      },
      name: "mailcow getDomain",
      op: "http.client",
    },
    async () => {
      const encoded = encodeURIComponent(domain);
      const result = await mailcowRequest<
        Record<string, unknown> | Record<string, unknown>[]
      >(`/api/v1/get/domain/${encoded}`);

      return (
        extractRecord(result, "domain_name") ?? extractRecord(result, "domain")
      );
    }
  );
}

/**
 * App Passwords
 */

const GENERATED_PASSWORD_REGEX = /Generated password: ([^ ]+)/;

export function getAppPasswords(
  accountId: string
): Promise<MailcowAppPassword[]> {
  return startSpan(
    {
      attributes: {
        "mailcow.accountId": accountId,
      },
      name: "mailcow getAppPasswords",
      op: "http.client",
    },
    async () => {
      const encoded = encodeURIComponent(accountId);
      const result = await mailcowRequest<MailcowAppPassword[]>(
        `/api/v1/get/app-passwd/${encoded}`
      );
      return Array.isArray(result) ? result : [];
    }
  );
}

export function createAppPassword(
  accountId: string,
  name: string
): Promise<{ app_passwd: string }> {
  return startSpan(
    {
      attributes: {
        "mailcow.accountId": accountId,
        "mailcow.name": name,
      },
      name: "mailcow createAppPassword",
      op: "http.client",
    },
    async () => {
      const body = {
        app_passwd_name: name,
        items: [accountId],
      };

      const result = await mailcowRequest<MailcowResponseEntry[]>(
        "/api/v1/add/app-passwd",
        {
          body: JSON.stringify(body),
          method: "POST",
        }
      );

      assertSuccess(result);

      // Extract the password from the response
      const entry = result[0] as MailcowResponseEntry & {
        app_passwd?: string;
      };
      const password =
        entry.app_passwd ||
        (Array.isArray(entry.log) ? (entry.log[0] as string) : undefined);

      if (!password && typeof entry.msg === "string") {
        // Some mailcow versions put it in the msg like "Generated password: XXX"
        const match = entry.msg.match(GENERATED_PASSWORD_REGEX);
        if (match) {
          return { app_passwd: match[1] };
        }
      }

      if (!password) {
        throw new Error("Could not find generated app password in response");
      }

      return { app_passwd: password };
    }
  );
}

export function deleteAppPassword(
  accountId: string,
  passwordId: string | number
): Promise<void> {
  return startSpan(
    {
      attributes: {
        "mailcow.accountId": accountId,
        "mailcow.passwordId": passwordId,
      },
      name: "mailcow deleteAppPassword",
      op: "http.client",
    },
    async () => {
      const result = await mailcowRequest("/api/v1/delete/app-passwd", {
        body: JSON.stringify([passwordId]),
        method: "POST",
      });

      assertSuccess(result);
    }
  );
}

/**
 * Aliases
 */

export function getAliases(accountId: string): Promise<MailcowAlias[]> {
  return startSpan(
    {
      attributes: {
        "mailcow.accountId": accountId,
      },
      name: "mailcow getAliases",
      op: "http.client",
    },
    async () => {
      const encoded = encodeURIComponent(accountId);
      const result = await mailcowRequest<MailcowAlias[]>(
        `/api/v1/get/alias/${encoded}`
      );
      return Array.isArray(result) ? result : [];
    }
  );
}

export function createAlias(
  address: string,
  goto: string,
  active = true,
  publicComment?: string
): Promise<void> {
  return startSpan(
    {
      attributes: {
        "mailcow.address": address,
        "mailcow.goto": goto,
      },
      name: "mailcow createAlias",
      op: "http.client",
    },
    async () => {
      const body = {
        active: active ? 1 : 0,
        address,
        goto,
        public_comment: publicComment,
      };

      const result = await mailcowRequest("/api/v1/add/alias", {
        body: JSON.stringify(body),
        method: "POST",
      });

      assertSuccess(result);
    }
  );
}

export function deleteAlias(aliasId: string | number): Promise<void> {
  return startSpan(
    {
      attributes: {
        "mailcow.aliasId": aliasId,
      },
      name: "mailcow deleteAlias",
      op: "http.client",
    },
    async () => {
      const result = await mailcowRequest("/api/v1/delete/alias", {
        body: JSON.stringify([aliasId]),
        method: "POST",
      });

      assertSuccess(result);
    }
  );
}

export function getMailboxUsage(
  accountId: string
): Promise<Record<string, unknown>> {
  return startSpan(
    {
      attributes: {
        "mailcow.accountId": accountId,
      },
      name: "mailcow getMailboxUsage",
      op: "http.client",
    },
    async () => {
      const mailbox = await getMailbox(accountId);
      if (!mailbox) {
        return { percent_in_use: 0, quota: 0, quota_used: 0 };
      }
      return {
        percent_in_use: Number(mailbox.percent_in_use),
        quota: Number(mailbox.quota), // Already in Bytes from API
        quota_used: Number(mailbox.quota_used), // Already in Bytes from API
      };
    }
  );
}