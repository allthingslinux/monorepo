import { createHash } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * GET /api/app/mailing-lists/avatar?email=
 * Redirects to Gravatar (MD5 of normalized email). Unauthenticated: same public
 * lookup anyone can do with the hash. The client loads these by default unless
 * `NEXT_PUBLIC_MAILING_LIST_GRAVATAR=false`.
 *
 * `d=identicon` so every address gets a stable image (not 404 when no photo).
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email?.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const hash = createHash("md5").update(email).digest("hex");
  const url = `https://www.gravatar.com/avatar/${hash}?s=80&d=identicon&r=g`;
  return NextResponse.redirect(url);
}
