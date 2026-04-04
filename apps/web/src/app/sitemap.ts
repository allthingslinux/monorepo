import type { MetadataRoute } from "next";

import { getAllPostsAsPostType } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://allthingslinux.org";

  // Core pages
  const routes = [
    "/",
    "/about",
    "/code-of-conduct",
    "/blog",
    "/apply",
    "/contribute",
    // Add all other static routes here
  ].map((route) => ({
    changeFrequency: "monthly" as const,
    lastModified: new Date(),
    priority: route === "" ? 1 : 0.8,
    url: `${baseUrl}${route}`,
  }));

  // Add distribution logos to sitemap for better image SEO
  const distributionLogos = [
    "arch",
    "gentoo",
    "bazzite",
    "debian",
    "cachy",
    "fedora",
    "mint",
    "bedrock",
    "asahi",
    "ubuntu",
    "opensuse",
    "nixos",
    "redhat",
    "slackware",
  ].map((distro) => ({
    changeFrequency: "yearly" as const,
    lastModified: new Date(),
    priority: 0.3,
    url: `${baseUrl}/images/hero/${distro}.png`,
  }));

  // Get all blog posts and add them to sitemap
  const posts = await getAllPostsAsPostType();

  const blogPosts = posts.map((post) => ({
    changeFrequency: "monthly" as const,
    lastModified: new Date(post.date),
    priority: 0.7,
    url: `${baseUrl}/blog/${post.categorySlug}/${post.slug}`,
  }));

  // Get unique categories and add them to sitemap
  const categories = [...new Set(posts.map((post) => post.categorySlug))];
  const categoryPages = categories.map((category) => ({
    changeFrequency: "daily" as const,
    lastModified: new Date(),
    priority: 0.8,
    url: `${baseUrl}/blog/${category}`,
  }));

  return [...routes, ...distributionLogos, ...categoryPages, ...blogPosts];
}
