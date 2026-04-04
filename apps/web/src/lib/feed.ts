import { Feed } from "feed";
import { marked } from "marked";

import { siteConfig } from "@/app/metadata";
import { getAllPosts } from "@/lib/blog";

/**
 * Generates an Atom feed containing all posts.
 *
 * @returns {Promise<string>} A promise that resolves to a string representing an Atom feed from ATL blog posts.
 *
 * @description
 * Fetches all posts using `getAllPosts()`, builds site and author metadata,
 * and adds each post as an item to the feed.
 */
export async function generateFeed(): Promise<string> {
  const posts = await getAllPosts();

  const latestBlogPostDate = new Date(
    Math.max(...posts.map((post) => new Date(post.date).getTime()))
  );

  const feed = new Feed({
    author: {
      email: "admin@allthingslinux.org",
      link: siteConfig.url,
      name: siteConfig.name,
    },
    copyright: `All Rights Reserved ${new Date().getFullYear()}, ${siteConfig.name}`,
    description: siteConfig.description,
    feedLinks: {
      atom: `${siteConfig.url}/feed`,
    },
    generator: `Feed for ${siteConfig.name}, using open-source Node.js Feed generator by jpmonette. `,
    id: siteConfig.url,
    language: "en",
    link: `${siteConfig.url}/blog`,
    title: `${siteConfig.name} - Blog`,
    updated: latestBlogPostDate,
  });

  const feedEntries = await Promise.all(
    posts.map(async (post) => ({
      author: [
        {
          email: "admin@allthingslinux.org",
          link: siteConfig.url,
          name: siteConfig.name,
        },
      ],
      content: await marked(post.body.raw),
      date: new Date(post.date),
      description: post.description,
      id: `${siteConfig.url}${post.url}`,
      link: `${siteConfig.url}${post.url}`,
      title: post.title,
    }))
  );

  for (const entry of feedEntries) {
    feed.addItem(entry);
  }

  feed.addCategory("News");

  return feed.atom1();
}
