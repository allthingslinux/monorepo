import type { FiberyTransport } from "../client.js";
import type { FiberyFile, SignedUrl } from "../types.js";

export class FileApi {
  private readonly transport: FiberyTransport;
  constructor(transport: FiberyTransport) {
    this.transport = transport;
  }

  /** Upload a file from a Blob or File object. */
  async upload(file: Blob | File): Promise<FiberyFile> {
    const body = new FormData();
    body.append("file", file);

    const res = await this.transport.request("/api/files", {
      body,
      method: "POST",
    });

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return res.json() as Promise<FiberyFile>;
  }

  /** Upload a file from a remote URL. */
  async uploadFromUrl(
    url: string,
    options?: {
      name?: string;
      method?: "GET" | "POST";
      headers?: Record<string, string>;
    }
  ): Promise<FiberyFile> {
    const res = await this.transport.request("/api/files/from-url", {
      body: JSON.stringify({ url, ...options }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return res.json() as Promise<FiberyFile>;
  }

  /** Download a file by its secret. Returns the raw Response for streaming. */
  async download(secret: string): Promise<Response> {
    return this.transport.request(`/api/files/${secret}`);
  }

  /** Get temporary (60-min) public URLs for a list of file secrets. */
  async signUrls(secrets: string[]): Promise<SignedUrl[]> {
    const res = await this.transport.request("/api/files/sign-urls", {
      body: JSON.stringify({ secrets }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const body = (await res.json()) as { items: SignedUrl[] };
    return body.items;
  }

  /**
   * Attach an uploaded file to an entity collection field.
   * Upload first to get the file id, then call this.
   */
  async attachToEntity(
    type: string,
    entityId: string,
    field: string,
    fileId: string
  ): Promise<void> {
    await this.transport.command({
      args: {
        entity: { "fibery/id": entityId },
        field,
        items: [{ "fibery/id": fileId }],
        type,
      },
      command: "fibery.entity/add-collection-items",
    });
  }

  /** Permanently delete files by id. */
  async delete(fileIds: string[]): Promise<void> {
    await this.transport.command({
      args: {
        entities: fileIds.map((id) => ({ "fibery/id": id })),
        type: "fibery/file",
      },
      command: "fibery.deleteEntityBatch",
    });
  }
}
