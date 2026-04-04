import type { FiberyTransport } from "../client.js";
import type { FiberySchema } from "../types.js";

export interface SchemaQueryOptions {
  withDescription?: boolean;
  withSoftDeleted?: boolean;
}

export class SchemaApi {
  private readonly transport: FiberyTransport;
  constructor(transport: FiberyTransport) {
    this.transport = transport;
  }

  async query(options: SchemaQueryOptions = {}): Promise<FiberySchema> {
    return this.transport.command<FiberySchema>({
      command: "fibery.schema/query",
      params: {
        "with-description?": options.withDescription ?? false,
        "with-soft-deleted?": options.withSoftDeleted ?? false,
      },
    });
  }
}
