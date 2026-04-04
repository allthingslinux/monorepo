import { FiberyCommandError, FiberyHttpError } from "./errors.js";
import type {
  FiberyClientConfig,
  FiberyCommand,
  FiberyCommandResult,
} from "./types.js";

export { FiberyCommandError, FiberyHttpError } from "./errors.js";

async function sleep(ms: number): Promise<void> {
  // oxlint-disable-next-line promise/avoid-new
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** How long to wait before a rate-limited retry. */
function retryDelay(attempt: number, retryAfterMs: number | null): number {
  // Honour the server's Retry-After if present, otherwise exponential backoff:
  // attempt 0 → 1 000 ms, attempt 1 → 2 000 ms, attempt 2 → 4 000 ms, …
  return retryAfterMs ?? Math.min(1000 * 2 ** attempt, 30_000);
}

function parseRetryAfterMs(headers: Headers): number | null {
  const raw = headers.get("Retry-After");
  if (raw === null || raw === "") {
    return null;
  }
  const seconds = Number(raw);
  return Number.isFinite(seconds) ? seconds * 1000 : null;
}

function headersToRecord(headers: HeadersInit): Record<string, string> {
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers;
}

export class FiberyTransport {
  readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly jsonHeaders: Record<string, string>;
  private readonly maxRetries: number;

  constructor(config: FiberyClientConfig) {
    this.baseUrl = `https://${config.account}.fibery.io`;
    this.authHeader = `Token ${config.token}`;
    this.jsonHeaders = {
      Authorization: this.authHeader,
      "Content-Type": "application/json",
    };
    this.maxRetries = config.maxRetries ?? 3;
  }

  /**
   * Low-level fetch with automatic retry on 429 Too Many Requests.
   * Throws FiberyHttpError for any non-2xx response that exhausts retries.
   */
  private async fetchWithRetry(
    url: string,
    init: RequestInit
  ): Promise<Response> {
    for (let attempt = 0; ; attempt += 1) {
      const res = await globalThis.fetch(url, init);

      if (res.status !== 429) {
        return res;
      }

      if (attempt >= this.maxRetries) {
        throw new FiberyHttpError(res.status, await res.text());
      }

      const delay = retryDelay(attempt, parseRetryAfterMs(res.headers));
      await sleep(delay);
    }
  }

  /** Send an array of commands to /api/commands and return results. */
  async commands<T = unknown>(
    commands: FiberyCommand[]
  ): Promise<FiberyCommandResult<T>[]> {
    const res = await this.fetchWithRetry(`${this.baseUrl}/api/commands`, {
      body: JSON.stringify(commands),
      headers: this.jsonHeaders,
      method: "POST",
    });

    if (!res.ok) {
      throw new FiberyHttpError(res.status, await res.text());
    }

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const results = (await res.json()) as FiberyCommandResult<T>[];

    for (let i = 0; i < results.length; i += 1) {
      const r = results[i];
      if (r && !r.success) {
        const cmd = commands[i]?.command ?? "unknown";
        throw new FiberyCommandError(cmd, r.result);
      }
    }

    return results;
  }

  /** Send a single command and return its result value. */
  async command<T = unknown>(cmd: FiberyCommand): Promise<T> {
    const [result] = await this.commands<T>([cmd]);
    if (!result) {
      throw new FiberyCommandError(cmd.command, null);
    }
    return result.result;
  }

  /** Send a batch of schema mutation commands via fibery.schema/batch. */
  async schemaBatch(commands: FiberyCommand[]): Promise<void> {
    await this.command({
      args: { commands },
      command: "fibery.schema/batch",
    });
  }

  /** Raw request for non-command endpoints (documents, files, views). */
  async request(path: string, init?: RequestInit): Promise<Response> {
    const res = await this.fetchWithRetry(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: this.authHeader,
        ...(init?.headers !== null && init?.headers !== undefined
          ? headersToRecord(init.headers)
          : {}),
      },
    });

    if (!res.ok) {
      throw new FiberyHttpError(res.status, await res.text());
    }

    return res;
  }
}
