/** Normalize a display category name to the URL segment (e.g. "News" → "news"). */
export function slugifyCategory(name: string): string {
  return name.trim().toLowerCase().replaceAll(" ", "-");
}

/** Stable lookup key for a post in maps and `generateStaticParams`. */
export function postLookupKey(categorySlug: string, slug: string): string {
  return `${categorySlug}/${slug}`;
}

/**
 * Deterministic gradient (Tailwind classes) for blog cards when no `image` is set.
 * Seeded per post (`categorySlug` + `slug`) so same-category rows don’t all match.
 * All use `bg-linear-to-b` so accents read consistently (strong color at top of media strip).
 */
const BLOG_POST_ACCENTS = [
  "bg-linear-to-b from-sky-400/50 via-cyan-500/20 to-background",
  "bg-linear-to-b from-violet-600/40 via-fuchsia-500/22 to-background",
  "bg-linear-to-b from-amber-400/50 via-orange-500/22 to-background",
  "bg-linear-to-b from-emerald-500/45 via-lime-400/18 to-background",
  "bg-linear-to-b from-rose-500/45 via-pink-500/28 to-background",
  "bg-linear-to-b from-blue-600/38 via-slate-500/12 to-background",
  "bg-linear-to-b from-indigo-500/48 via-violet-600/20 to-background",
  "bg-linear-to-b from-teal-500/48 via-cyan-400/18 to-background",
  "bg-linear-to-b from-yellow-500/38 via-amber-600/25 to-background",
  "bg-linear-to-b from-red-500/38 via-orange-500/22 to-background",
  "bg-linear-to-b from-cyan-500/42 via-blue-600/18 to-background",
  "bg-linear-to-b from-orange-500/42 via-rose-500/20 to-background",
  "bg-linear-to-b from-fuchsia-500/42 via-purple-600/22 to-background",
  "bg-linear-to-b from-lime-500/32 via-emerald-600/20 to-background",
  "bg-linear-to-b from-pink-500/38 via-rose-400/25 to-background",
  "bg-linear-to-b from-sky-500/38 via-indigo-500/25 to-background",
] as const;

function accentIndexForSeed(seed: string): number {
  let sum = 5381;
  for (let i = 0; i < seed.length; i += 1) {
    const unit = seed.codePointAt(i);
    if (unit === undefined) {
      break;
    }
    sum = Math.trunc(sum * 33 + unit) % 1_000_000_007;
  }
  return (
    ((sum % BLOG_POST_ACCENTS.length) + BLOG_POST_ACCENTS.length) %
    BLOG_POST_ACCENTS.length
  );
}

export function blogPostAccentClasses(
  categorySlug: string,
  slug: string
): string {
  return BLOG_POST_ACCENTS[
    accentIndexForSeed(postLookupKey(categorySlug, slug))
  ];
}

/** Turn a category slug from the URL into a display title (best-effort). */
export function categorySlugToTitle(categorySlug: string): string {
  return categorySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const SITE_ORIGIN = "https://allthingslinux.org";

/** Canonical image URL for SEO/JSON-LD (defaults to site OG fallback). */
export function resolvePostImageUrl(image: string | undefined): string {
  if (!image) {
    return `${SITE_ORIGIN}/images/og.png`;
  }
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  if (image.startsWith("/")) {
    return `${SITE_ORIGIN}${image}`;
  }
  return `${SITE_ORIGIN}/${image}`;
}
