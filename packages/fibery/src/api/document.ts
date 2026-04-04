import type { FiberyTransport } from "../client.js";

export type DocumentFormat = "md" | "html" | "json" | "plain-text";

export interface DocumentContent {
  secret: string;
  content: string;
}

export class DocumentApi {
  private readonly transport: FiberyTransport;
  constructor(transport: FiberyTransport) {
    this.transport = transport;
  }

  /** Read a rich text document by its secret. */
  async get(secret: string, format: DocumentFormat = "md"): Promise<string> {
    const res = await this.transport.request(
      `/api/documents/${secret}?format=${format}`
    );
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const body = (await res.json()) as { secret: string; content: string };
    return body.content;
  }

  /** Read multiple documents in a single request. */
  async getBatch(
    secrets: string[],
    format: DocumentFormat = "md"
  ): Promise<DocumentContent[]> {
    const res = await this.transport.request(
      `/api/documents/commands?format=${format}`,
      {
        body: JSON.stringify({
          args: secrets.map((secret) => ({ secret })),
          command: "get-documents",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }
    );
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return res.json() as Promise<DocumentContent[]>;
  }

  /** Overwrite a rich text document. */
  async update(
    secret: string,
    content: string,
    format: DocumentFormat = "md"
  ): Promise<void> {
    await this.transport.request(`/api/documents/${secret}?format=${format}`, {
      body: JSON.stringify({ content }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });
  }

  /** Update multiple documents in a single request. */
  async updateBatch(
    documents: DocumentContent[],
    format: DocumentFormat = "md"
  ): Promise<void> {
    await this.transport.request(`/api/documents/commands?format=${format}`, {
      body: JSON.stringify({
        args: documents,
        command: "create-or-update-documents",
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  }
}
