/**
 * Custom error for Prosody account not found
 */
export class ProsodyAccountNotFoundError extends Error {
  constructor(message = "Prosody account not found") {
    super(message);
    this.name = "ProsodyAccountNotFoundError";
  }
}