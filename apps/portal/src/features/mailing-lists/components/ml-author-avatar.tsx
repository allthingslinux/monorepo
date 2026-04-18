"use client";

import { useState } from "react";

import { cn } from "@atl/ui/lib/utils";

/** Default on (Gravatar identicons via `/api/.../avatar`). Set to `false` to use initials only (no third-party image). */
const GRAVATAR_ENABLED =
  process.env.NEXT_PUBLIC_MAILING_LIST_GRAVATAR !== "false";

function hashHue(seed: string): number {
  let h = 0;
  for (const ch of seed) {
    const cp = ch.codePointAt(0) ?? 0;
    h = Math.trunc(Math.imul(31, h) + cp);
  }
  return Math.abs(h) % 360;
}

function authorInitials(
  authorName: string | null,
  authorEmail: string | null
): string {
  const raw = (authorName ?? authorEmail ?? "?").trim();
  if (!raw) {
    return "?";
  }
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0] ?? "";
    const b = parts.at(-1)?.[0] ?? "";
    return `${a}${b}`.toUpperCase().slice(0, 2);
  }
  if (raw.includes("@")) {
    const local = raw.split("@")[0] ?? raw;
    return local.slice(0, 2).toUpperCase();
  }
  return raw.slice(0, 2).toUpperCase();
}

export function MailingListAuthorAvatar({
  authorEmail,
  authorName,
  className,
}: {
  authorEmail: string | null;
  authorName: string | null;
  className?: string;
}) {
  const seed = authorName ?? authorEmail ?? "";
  const hue = hashHue(seed);
  const initials = authorInitials(authorName, authorEmail);
  const [imgFailed, setImgFailed] = useState(false);

  const gravatarSrc =
    GRAVATAR_ENABLED && authorEmail?.includes("@")
      ? `/api/app/mailing-lists/avatar?email=${encodeURIComponent(authorEmail)}`
      : null;

  if (gravatarSrc && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- same-origin proxy redirects to Gravatar
      <img
        alt=""
        className={cn(
          "h-10 w-10 max-w-none shrink-0 rounded-full object-cover",
          className
        )}
        height={40}
        onError={() => setImgFailed(true)}
        referrerPolicy="no-referrer"
        src={gravatarSrc}
        width={40}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white shadow-inner",
        className
      )}
      style={{
        backgroundColor: `hsl(${hue} 42% 40%)`,
      }}
    >
      {initials}
    </div>
  );
}
