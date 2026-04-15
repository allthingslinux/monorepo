import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDynamicMetadata } from "@/app/metadata";
import { BlogListView } from "@/components/blog/blog-list-view";
import {
  getAllCategories,
  getAllCategorySlugs,
  getPostsByCategory,
} from "@/lib/blog";
import { categorySlugToTitle } from "@/lib/blog-utils";
import { getBaseUrl } from "@/lib/utils";

export const revalidate = 3600;

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryTitle = categorySlugToTitle(category);

  return {
    ...getDynamicMetadata({
      description: `Browse all our articles in ${categoryTitle}.`,
      title: `${categoryTitle} — Blog`,
    }),
    openGraph: {
      description: `Browse all our articles in ${categoryTitle}.`,
      title: `${categoryTitle} — Blog`,
      url: `${getBaseUrl()}/blog/${category}`,
    },
    twitter: {
      card: "summary_large_image",
      description: `Browse all our articles in ${categoryTitle}.`,
      title: `${categoryTitle} — Blog`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  const allCategories = await getAllCategories();
  const posts = await getPostsByCategory(category);
  const categoryTitle = categorySlugToTitle(category);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <BlogListView
      activeCategorySlug={category}
      categories={allCategories}
      eyebrow={categoryTitle}
      posts={posts}
      title={`${categoryTitle} articles`}
    />
  );
}
