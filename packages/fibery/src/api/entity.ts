import type { FiberyTransport } from "../client.js";
import type {
  CreateOrUpdateOptions,
  CreateOrUpdateResultItem,
  EntityQuery,
  FiberyEntity,
} from "../types.js";

function buildQuery(q: EntityQuery) {
  return {
    "q/from": q.from,
    "q/select": q.select,
    ...(q.where ? { "q/where": q.where } : {}),
    ...(q.orderBy ? { "q/order-by": q.orderBy } : {}),
    "q/limit": q.limit,
    ...(q.offset === undefined ? {} : { "q/offset": q.offset }),
  };
}

export class EntityApi {
  private readonly transport: FiberyTransport;
  constructor(transport: FiberyTransport) {
    this.transport = transport;
  }

  async query<T extends FiberyEntity = FiberyEntity>(
    q: EntityQuery
  ): Promise<T[]> {
    return this.transport.command<T[]>({
      args: {
        query: buildQuery(q),
        ...(q.params ? { params: q.params } : {}),
      },
      command: "fibery.entity/query",
    });
  }

  async create(
    type: string,
    fields: Record<string, unknown>
  ): Promise<FiberyEntity> {
    return this.transport.command<FiberyEntity>({
      args: {
        entity: fields,
        type,
      },
      command: "fibery.entity/create",
    });
  }

  async update(
    type: string,
    id: string,
    fields: Record<string, unknown>
  ): Promise<void> {
    await this.transport.command({
      args: {
        entity: { "fibery/id": id, ...fields },
        type,
      },
      command: "fibery.entity/update",
    });
  }

  async delete(type: string, id: string): Promise<void> {
    await this.transport.command({
      args: {
        entity: { "fibery/id": id },
        type,
      },
      command: "fibery.entity/delete",
    });
  }

  async createOrUpdate(
    type: string,
    entities: Record<string, unknown>[],
    options: CreateOrUpdateOptions
  ): Promise<CreateOrUpdateResultItem[]> {
    return this.transport.command<CreateOrUpdateResultItem[]>({
      args: {
        "conflict-action": options.conflictAction,
        "conflict-field": options.conflictField,
        entities,
        type,
      },
      command: "fibery.entity.batch/create-or-update",
    });
  }

  async addToCollection(
    type: string,
    entityId: string,
    field: string,
    itemIds: string[]
  ): Promise<void> {
    await this.transport.command({
      args: {
        entity: { "fibery/id": entityId },
        field,
        items: itemIds.map((id) => ({ "fibery/id": id })),
        type,
      },
      command: "fibery.entity/add-collection-items",
    });
  }

  async removeFromCollection(
    type: string,
    entityId: string,
    field: string,
    itemIds: string[]
  ): Promise<void> {
    await this.transport.command({
      args: {
        entity: { "fibery/id": entityId },
        field,
        items: itemIds.map((id) => ({ "fibery/id": id })),
        type,
      },
      command: "fibery.entity/remove-collection-items",
    });
  }

  async setCollection(
    type: string,
    entityId: string,
    field: string,
    itemIds: string[]
  ): Promise<void> {
    await this.transport.command({
      args: {
        entity: { "fibery/id": entityId },
        field,
        items: itemIds.map((id) => ({ "fibery/id": id })),
        type,
      },
      command: "fibery.entity/set-collection-items",
    });
  }

  async resetCollection(
    type: string,
    entityId: string,
    field: string
  ): Promise<void> {
    await this.transport.command({
      args: {
        entity: entityId,
        field,
        type,
      },
      command: "fibery.entity/reset-collection-items",
    });
  }
}
