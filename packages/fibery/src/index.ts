import { DocumentApi } from "./api/document.js";
import { EntityApi } from "./api/entity.js";
import { FieldApi } from "./api/field.js";
import { FileApi } from "./api/file.js";
import { SchemaApi } from "./api/schema.js";
import { TokenApi } from "./api/token.js";
import { TypeApi } from "./api/type.js";
import { ViewApi } from "./api/view.js";
import { FiberyTransport } from "./client.js";
import type {
  FiberyClientConfig,
  FiberyCommand,
  FiberyCommandResult,
} from "./types.js";

export class FiberyClient {
  readonly schema: SchemaApi;
  readonly entities: EntityApi;
  readonly documents: DocumentApi;
  readonly types: TypeApi;
  readonly fields: FieldApi;
  readonly files: FileApi;
  readonly tokens: TokenApi;
  readonly views: ViewApi;

  private readonly transport: FiberyTransport;

  constructor(config: FiberyClientConfig) {
    this.transport = new FiberyTransport(config);
    this.schema = new SchemaApi(this.transport);
    this.entities = new EntityApi(this.transport);
    this.documents = new DocumentApi(this.transport);
    this.types = new TypeApi(this.transport);
    this.fields = new FieldApi(this.transport);
    this.files = new FileApi(this.transport);
    this.tokens = new TokenApi(this.transport);
    this.views = new ViewApi(this.transport);
  }

  /** Send raw commands directly — escape hatch for anything not covered by the typed API. */
  async commands<T = unknown>(
    commands: FiberyCommand[]
  ): Promise<FiberyCommandResult<T>[]> {
    return this.transport.commands<T>(commands);
  }
}

export { FiberyHttpError, FiberyCommandError } from "./client.js";

export type {
  FiberyClientConfig,
  FiberyCommand,
  FiberyCommandResult,
  FiberyEntity,
  FiberyFile,
  FiberyFieldMeta,
  FiberyFieldType,
  FiberyName,
  FiberySchema,
  FiberySchemaField,
  FiberySchemaType,
  EntityQuery,
  WhereClause,
  CreateTypeOptions,
  CreateFieldOptions,
  CreateOrUpdateOptions,
  CreateOrUpdateResultItem,
  ConflictAction,
  SignedUrl,
} from "./types.js";

export type { DocumentFormat, DocumentContent } from "./api/document.js";
export type { SchemaQueryOptions } from "./api/schema.js";
export type { FiberyToken } from "./api/token.js";
export type {
  FiberyView,
  FiberyViewType,
  ViewFilter,
  CreateViewInput,
  UpdateViewInput,
} from "./api/view.js";
