import type { BlogPost } from "contentlayer/generated";

import { Section } from "@/components/shell";

import { BlogCategoryNav } from "./blog-category-nav";
import { BlogListHeader } from "./blog-list-header";
import { BlogPostCard } from "./blog-post-card";
import { blogContainerClassName } from "./blog-shell";

const DEFAULT_DESCRIPTION =
  "Stay up to date with the latest news, tutorials, and updates from the All Things Linux community. Our contributors share their knowledge to help you master Linux and open source.";

type BlogListViewProps = {
  activeCategorySlug: string | null;
  categories: string[];
  description?: string;
  eyebrow: string;
  posts: BlogPost[];
  title: string;
};

export function BlogListView({
  posts,
  categories,
  activeCategorySlug,
  title,
  eyebrow,
  description = DEFAULT_DESCRIPTION,
}: BlogListViewProps) {
  const showFeatured = activeCategorySlug === null && posts.length > 0;
  const featured = showFeatured ? posts[0] : null;
  const gridPosts = showFeatured ? posts.slice(1) : posts;

  return (
    <Section
      containerClassName={blogContainerClassName}
      size="default"
      variant="dots"
    >
      <BlogListHeader
        description={description}
        eyebrow={eyebrow}
        title={title}
      />
      <BlogCategoryNav
        activeCategorySlug={activeCategorySlug}
        categories={categories}
      />
      {posts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-lg">No posts found.</p>
        </div>
      ) : (
        <>
          {featured ? (
            <div className="mb-10 md:mb-12">
              <BlogPostCard post={featured} variant="featured" />
            </div>
          ) : null}

          {gridPosts.length > 0 ? (
            <div>
              {featured ? (
                <h2 className="text-muted-foreground mb-5 text-xs font-semibold tracking-[0.2em] uppercase">
                  More posts
                </h2>
              ) : null}
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {gridPosts.map((post) => (
                  <li key={`${post.categorySlug}-${post.slug}`}>
                    <BlogPostCard post={post} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </Section>
  );
}
