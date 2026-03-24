/**
 * Error thrown by Prosody REST API requests, preserving the HTTP status code.
 */
export class ProsodyApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ProsodyApiError";
    this.status = status;
  }
}