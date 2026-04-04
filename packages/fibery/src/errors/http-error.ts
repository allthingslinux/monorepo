export class FiberyHttpError extends Error {
  readonly status: number;
  readonly body: string;
  constructor(status: number, body: string) {
    super(`Fibery API error ${status}: ${body}`);
    this.name = "FiberyHttpError";
    this.status = status;
    this.body = body;
  }
}
