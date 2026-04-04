import type { FiberyTransport } from "../client.js";
import { FiberyCommandError } from "../errors.js";

export type FiberyViewType =
  | "board"
  | "list"
  | "table"
  | "calendar"
  | "timeline"
  | "document"
  | "chart"
  | "whiteboard"
  | (string & Record<never, never>);

export interface FiberyView {
  "fibery/id": string;
  "fibery/public-id": string;
  "fibery/name": string;
  "fibery/type": FiberyViewType;
  "fibery/icon": string | null;
  "fibery/description": string | null;
  "fibery/rank": number;
  "fibery/meta": Record<string, unknown>;
}

export interface ViewFilter {
  ids?: string[];
  publicIds?: string[];
  isPrivate?: boolean;
  container?: {
    type: "entity";
    typeId: string;
    publicIds: string[];
  };
}

export interface CreateViewInput {
  "fibery/id"?: string;
  "fibery/name": string;
  "fibery/type": FiberyViewType;
  "fibery/meta"?: Record<string, unknown>;
  "fibery/container-app": { "fibery/id": string };
}

export interface UpdateViewInput {
  id: string;
  values: {
    "fibery/name"?: string;
    "fibery/meta"?: Record<string, unknown>;
  };
}

export class ViewApi {
  private readonly transport: FiberyTransport;
  constructor(transport: FiberyTransport) {
    this.transport = transport;
  }

  private async rpc<T = undefined>(
    method: string,
    params?: unknown
  ): Promise<T> {
    const res = await this.transport.request("/api/views/json-rpc", {
      body: JSON.stringify({ jsonrpc: "2.0", method, params }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const body = (await res.json()) as { result: T; error?: unknown };
    if (body.error !== undefined) {
      throw new FiberyCommandError(`views.rpc/${method}`, body.error);
    }
    return body.result;
  }

  async query(filter?: ViewFilter): Promise<FiberyView[]> {
    return this.rpc<FiberyView[]>("query-views", filter ? { filter } : {});
  }

  async create(views: CreateViewInput[]): Promise<FiberyView[]> {
    return this.rpc<FiberyView[]>("create-views", { views });
  }

  async update(updates: UpdateViewInput[]): Promise<void> {
    await this.rpc("update-views", { updates });
  }

  async delete(ids: string[]): Promise<void> {
    await this.rpc("delete-views", { ids });
  }
}
