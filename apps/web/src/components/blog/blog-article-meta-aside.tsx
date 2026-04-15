import type { BlogPost } from "contentlayer/generated";
import type { Route } from "next";
import Link from "next/link";

type BlogArticleMetaAsideProps = {
  post: BlogPost;
};

export function BlogArticleMetaAside({ post }: BlogArticleMetaAsideProps) {
  return (
    <aside
      aria-label="Article details"
      className="order-2 flex h-fit w-full max-w-full flex-col gap-6 lg:sticky lg:top-24 lg:order-none lg:w-36 lg:max-w-[9.5rem] lg:shrink-0 lg:self-start"
    >
      <div>
        <h2 className="text-sm font-semibold">Category</h2>
        <Link
          className="text-muted-foreground hover:text-foreground mt-2 block text-sm transition-colors"
          href={`/blog/${post.categorySlug}` as Route}
        >
          {post.category}
        </Link>
      </div>
      <div>
        <h2 className="text-sm font-semibold">Published</h2>
        <time
          className="text-muted-foreground mt-2 block text-sm"
          dateTime={post.date}
        >
          {post.dateFormatted}
        </time>
      </div>
      <div>
        <h2 className="text-sm font-semibold">Author</h2>
        <p className="text-muted-foreground mt-2 text-sm">{post.author}</p>
      </div>
    </aside>
  );
}
