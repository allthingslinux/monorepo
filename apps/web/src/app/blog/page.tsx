import type { Metadata } from "next";

import { BlogListView } from "@/components/blog/blog-list-view";
import { getAllCategories, getAllPosts } from "@/lib/blog";

import { getPageMetadata } from "../metadata";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    ...getPageMetadata("blog"),
    openGraph: {
      ...getPageMetadata("blog").openGraph,
    },
    twitter: {
      ...getPageMetadata("blog").twitter,
    },
  };
}

export default async function BlogPage() {
  const posts = await getAllPosts();
  const categories = await getAllCategories();

  return (
    <BlogListView
      activeCategorySlug={null}
      categories={categories}
      eyebrow="Blog"
      posts={posts}
      title="Latest Insights & Updates"
    />
  );
}
