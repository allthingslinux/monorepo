import type { BlogPost } from "contentlayer/generated";

import type { Post } from "@/types/blog";

// Convert BlogPost to Post
function convertToPost(blogPost: BlogPost): Post {
  return {
    ...blogPost,
    content: blogPost.body.raw, // Use the raw MDX content
  };
}

// Lazy-load blog posts only when needed (inside handlers)
export async function getAllPosts(): Promise<BlogPost[]> {
  // Dynamic import to avoid global execution
  const { allBlogPosts } = await import("contentlayer/generated");
  return [...allBlogPosts].toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// Get all posts as Post type
export async function getAllPostsAsPostType(): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.map(convertToPost);
}

// Get all unique categories
export async function getAllCategories(): Promise<string[]> {
  const posts = await getAllPosts();
  return [...new Set(posts.map((post) => post.category))].toSorted();
}

export async function getPostsByCategory(
  category: string
): Promise<BlogPost[]> {
  // If category is empty, null, undefined, or "all-posts", return all posts
  if (!category || category === "all-posts") {
    return getAllPosts();
  }

  const categorySlug = category.toLowerCase().replaceAll(" ", "-");
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.categorySlug === categorySlug);
}

export async function getPost(
  category: string,
  slug: string
): Promise<BlogPost | undefined> {
  const allPosts = await getAllPosts();
  return allPosts.find(
    (post) => post.slug === slug && post.categorySlug === category
  );
}
