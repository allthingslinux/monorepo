import { ArrowUpRight, Newspaper } from "lucide-react";

import { fetchLatestBlogPosts } from "@/shared/feed";

const POST_LIMIT = 5;

function formatDate(isoDate?: string, pubDate?: string): string {
  const dateStr = isoDate ?? pubDate;
  if (!dateStr) {
    return "";
  }
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export async function LatestUpdatesCard() {
  const posts = await fetchLatestBlogPosts(POST_LIMIT);

  if (posts.length === 0) {
    return (
      <div className="border-border/60 bg-card/50 dark:border-border/40 dark:bg-card/30 rounded-xl border p-4">
        <div className="flex items-center gap-2">
          <Newspaper className="text-muted-foreground size-4" />
          <h3 className="text-foreground font-medium">Latest Blog Posts</h3>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          No posts available right now. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="border-border/60 bg-card/50 dark:border-border/40 dark:bg-card/30 rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="text-muted-foreground size-4" />
          <h3 className="text-foreground font-medium">Latest Blog Posts</h3>
        </div>
        <a
          className="text-primary text-xs font-medium hover:underline"
          href="https://allthingslinux.org/blog"
          rel="noopener noreferrer"
          target="_blank"
        >
          View all
        </a>
      </div>
      <ul className="flex flex-col gap-2">
        {posts.map((post) => (
          <li key={post.link}>
            <a
              className="group border-border/60 hover:bg-muted/50 dark:border-border/40 flex flex-col gap-0.5 rounded-lg border px-3 py-2 transition-colors"
              href={post.link}
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-foreground group-hover:text-primary line-clamp-2 text-sm font-medium">
                  {post.title}
                </span>
                <ArrowUpRight className="text-muted-foreground mt-0.5 size-3.5 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </div>
              {formatDate(post.isoDate, post.pubDate) && (
                <span className="text-muted-foreground text-xs">
                  {formatDate(post.isoDate, post.pubDate)}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
