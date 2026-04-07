/** Shape of Discord's JSON error body. */
interface DiscordErrorBody {
  code?: number;
  message?: string;
}

export class DiscordHttpError extends Error {
  /** Discord's internal error code, if the response body was valid JSON. */
  readonly discordCode: number | null;
  readonly route: string;
  readonly status: number;

  constructor(status: number, body: string, route: string) {
    let parsed: DiscordErrorBody | null = null;
    try {
      parsed = JSON.parse(body) as DiscordErrorBody;
    } catch {
      // body was not JSON — use raw text in the message
    }

    const discordMessage = parsed?.message ?? body;
    super(`Discord ${status} on ${route}: ${discordMessage}`);
    this.name = "DiscordHttpError";
    this.discordCode = parsed?.code ?? null;
    this.route = route;
    this.status = status;
  }
}
