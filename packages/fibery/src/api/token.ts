import type { FiberyTransport } from "../client.js";

export interface FiberyToken {
  id: string;
  token: string;
  createdAt?: string;
  lastUsedAt?: string;
}

export class TokenApi {
  private readonly transport: FiberyTransport;
  constructor(transport: FiberyTransport) {
    this.transport = transport;
  }

  /**
   * List all API tokens for the current user.
   * NOTE: This endpoint requires session/cookie auth — it is not accessible via API token.
   * It is intended for use in browser contexts (e.g. the Fibery web UI).
   */
  async list(): Promise<FiberyToken[]> {
    const res = await this.transport.request("/api/tokens");
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return res.json() as Promise<FiberyToken[]>;
  }

  /** Create a new API token for the current user. Max 3 per user. */
  async create(): Promise<FiberyToken> {
    const res = await this.transport.request("/api/tokens", {
      method: "POST",
    });
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return res.json() as Promise<FiberyToken>;
  }

  /** Delete an API token by id. */
  async delete(tokenId: string): Promise<void> {
    await this.transport.request(`/api/tokens/${tokenId}`, {
      method: "DELETE",
    });
  }
}
