import type { FiberyTransport } from "../client.js";
import type { CreateTypeOptions, FiberyCommand } from "../types.js";

export class TypeApi {
  private readonly transport: FiberyTransport;
  constructor(transport: FiberyTransport) {
    this.transport = transport;
  }

  async create(name: string, options: CreateTypeOptions = {}): Promise<void> {
    const commands: FiberyCommand[] = [
      {
        args: {
          "fibery/meta": {
            "fibery/domain?": options.domain ?? false,
            "fibery/secured?": options.secured ?? false,
            ...(options.color !== undefined && options.color !== ""
              ? { "ui/color": options.color }
              : {}),
          },
          "fibery/name": name,
        },
        command: "schema.type/create",
      },
    ];

    if (options.mixins && options.mixins.length > 0) {
      commands.push({
        args: { types: { [name]: options.mixins } },
        command: "fibery.app/install-mixins",
      });
    }

    await this.transport.schemaBatch(commands);
  }

  async rename(fromName: string, toName: string): Promise<void> {
    await this.transport.schemaBatch([
      {
        args: { "from-name": fromName, "to-name": toName },
        command: "schema.type/rename",
      },
    ]);
  }

  async delete(
    name: string,
    options: { deleteEntities?: boolean; deleteRelatedFields?: boolean } = {}
  ): Promise<void> {
    await this.transport.schemaBatch([
      {
        args: {
          "delete-entities?": options.deleteEntities ?? false,
          "delete-related-fields?": options.deleteRelatedFields ?? false,
          name,
        },
        command: "schema.type/delete",
      },
    ]);
  }
}
