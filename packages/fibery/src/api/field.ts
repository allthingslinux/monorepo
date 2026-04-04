import type { FiberyTransport } from "../client.js";
import type { CreateFieldOptions, FiberyFieldMeta } from "../types.js";

export class FieldApi {
  private readonly transport: FiberyTransport;
  constructor(transport: FiberyTransport) {
    this.transport = transport;
  }

  async create(
    holderType: string,
    name: string,
    options: CreateFieldOptions
  ): Promise<void> {
    await this.transport.schemaBatch([
      {
        args: {
          "fibery/holder-type": holderType,
          "fibery/name": name,
          "fibery/type": options.type,
          ...(options.meta ? { "fibery/meta": options.meta } : {}),
        },
        command: "schema.field/create",
      },
    ]);
  }

  async rename(
    holderType: string,
    fromName: string,
    toName: string
  ): Promise<void> {
    await this.transport.schemaBatch([
      {
        args: {
          "from-name": fromName,
          "holder-type": holderType,
          "to-name": toName,
        },
        command: "schema.field/rename",
      },
    ]);
  }

  async delete(
    holderType: string,
    name: string,
    options: { deleteValues?: boolean } = {}
  ): Promise<void> {
    await this.transport.schemaBatch([
      {
        args: {
          "delete-values?": options.deleteValues ?? false,
          "holder-type": holderType,
          name,
        },
        command: "schema.field/delete",
      },
    ]);
  }

  async setMeta(
    holderType: string,
    name: string,
    key: keyof FiberyFieldMeta,
    value: unknown
  ): Promise<void> {
    await this.transport.schemaBatch([
      {
        args: {
          "holder-type": holderType,
          key,
          name,
          value,
        },
        command: "schema.field/set-meta",
      },
    ]);
  }
}
