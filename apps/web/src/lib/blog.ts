import type { BlogPost } from "contentlayer/generated";

import { postLookupKey, slugifyCategory } from "@/lib/blog-utils";
import type { Post } from "@/types/blog";

function isPublishedInThisEnvironment(post: BlogPost): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  return !post.draft;
}

// Convert BlogPost to Post
function convertToPost(blogPost: BlogPost): Post {
  return {
    ...blogPost,
    content: blogPost.body.raw,
  };
}

/** Map for O(1) lookup by `categorySlug/slug` (built from the current post list). */
export function buildPostLookupMap(posts: BlogPost[]): Map<string, BlogPost> {
  return new Map(
    posts.map((post) => [postLookupKey(post.categorySlug, post.slug), post])
  );
}

// Lazy-load blog posts only when needed (inside handlers)
export async function getAllPosts(): Promise<BlogPost[]> {
  const { allBlogPosts } = await import("contentlayer/generated");
  return [...allBlogPosts]
    .filter(isPublishedInThisEnvironment)
    .toSorted(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

// Get all posts as Post type
export async function getAllPostsAsPostType(): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.map(convertToPost);
}

// Get all unique categories (from published posts only)
export async function getAllCategories(): Promise<string[]> {
  const posts = await getAllPosts();
  return [...new Set(posts.map((post) => post.category))].toSorted();
}

/** Distinct category URL segments, sorted (for `generateStaticParams`). */
export async function getAllCategorySlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  return [...new Set(posts.map((post) => post.categorySlug))].toSorted();
}

export async function getPostsByCategory(
  category: string
): Promise<BlogPost[]> {
  if (!category || category === "all-posts") {
    return getAllPosts();
  }

  const categorySlug = slugifyCategory(category);
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.categorySlug === categorySlug);
}

export async function getPost(
  category: string,
  slug: string
): Promise<BlogPost | undefined> {
  const posts = await getAllPosts();
  return buildPostLookupMap(posts).get(postLookupKey(category, slug));
}

/** Params for `generateStaticParams` on `[category]/[slug]` (published posts only). */
export async function getAllPostRouteParams(): Promise<
  { category: string; slug: string }[]
> {
  const posts = await getAllPosts();
  return posts.map((p) => ({ category: p.categorySlug, slug: p.slug }));
}

/** Other posts in the same category (newest first), excluding the current slug. */
export async function getRelatedPosts(
  current: BlogPost,
  limit = 4
): Promise<BlogPost[]> {
  const posts = await getPostsByCategory(current.categorySlug);
  return posts.filter((p) => p.slug !== current.slug).slice(0, limit);
}
