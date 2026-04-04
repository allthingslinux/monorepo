function safeStringify(value: unknown, maxLength = 500): string {
  try {
    const s = JSON.stringify(value);
    return s.length > maxLength ? `${s.slice(0, maxLength)}…` : s;
  } catch {
    return String(value);
  }
}

export class FiberyCommandError extends Error {
  readonly command: string;
  readonly result: unknown;
  constructor(command: string, result: unknown) {
    super(`Fibery command "${command}" failed: ${safeStringify(result)}`);
    this.name = "FiberyCommandError";
    this.command = command;
    this.result = result;
  }
}
