/* oxlint-disable react/no-danger -- JSON-LD requires raw JSON in a script element */
import type { Thing, WithContext } from "schema-dts";

interface JsonLdProps {
  readonly code: WithContext<Thing>;
  readonly nonce?: string;
}

const escapeJsonForHtml = (json: string): string =>
  json
    .replaceAll("&", "\\u0026")
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e");

export async function JsonLd({ code, nonce }: JsonLdProps) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: escapeJsonForHtml(JSON.stringify(code)),
      }}
      nonce={nonce}
      type="application/ld+json"
    />
  );
}
