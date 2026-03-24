import type { Metadata } from "next";
import Link from "next/link";

import { getAllCategories, getAllPosts } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPageMetadata } from "../metadata";

export async function generateMetadata(): Promise<Metadata> {
  // Build dynamic OG image URL with query parameters
  // const ogImageUrl = new URL(getApiUrl('/api/og'));
  // ogImageUrl.searchParams.append('title', 'Latest Insights & Updates');
  // ogImageUrl.searchParams.append('category', 'Blog');

  return {
    ...getPageMetadata("blog"),
    openGraph: {
      ...getPageMetadata("blog").openGraph,
      // images: [
      //   {
      //     url: ogImageUrl.toString(),
      //     width: 1200,
      //     height: 630,
      //     alt: 'All Things Linux Blog',
      //   },
      // ],
    },
    twitter: {
      ...getPageMetadata("blog").twitter,
      // images: [ogImageUrl.toString()],
    },
  };
}

export default async function BlogPage() {
  // Get all blog posts and categories
  const posts = await getAllPosts();
  const categories = await getAllCategories();

  return (
    <section className="py-16 md:py-24 lg:py-32">
      <div className="container">
        <div className="mb-12 flex flex-col items-center gap-4 text-center md:mb-16 md:gap-6">
          <Badge className="px-3 py-1" variant="secondary">
            Blog
          </Badge>
          <h1 className="font-bold text-3xl md:text-5xl lg:text-6xl">
            Latest Insights & Updates
          </h1>
          <p className="max-w-3xl text-balance text-muted-foreground md:text-lg lg:text-xl">
            Stay up to date with the latest news, tutorials, and updates from
            the All Things Linux community. Our contributors share their
            knowledge to help you master Linux and open source.
          </p>
        </div>

        {/* Categories navigation */}
        {categories.length > 0 && (
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            <Button asChild className="rounded-full" variant="ghost">
              <Link href="/blog">All</Link>
            </Button>
            {categories.map((cat) => {
              // Generate category slug (same way as in the blog post)
              const categorySlug = cat.toLowerCase().replace(/ /g, "-");
              return (
                <Button
                  asChild
                  className="rounded-full"
                  key={categorySlug}
                  variant="ghost"
                >
                  <Link href={`/blog/${categorySlug}`}>{cat}</Link>
                </Button>
              );
            })}
          </div>
        )}

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">No posts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {posts.map((post) => {
              // Generate dynamic OG image URL for this post
              // const postImageUrl = new URL(getApiUrl('/api/og'));

              // postImageUrl.searchParams.append('title', post.title);
              // postImageUrl.searchParams.append('category', post.category);
              // postImageUrl.searchParams.append('date', post.date);

              return (
                <Link
                  className="group flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md"
                  href={`/blog/${post.categorySlug}/${post.slug}`}
                  key={post.slug}
                >
                  {/* <div className="relative h-48 overflow-hidden bg-muted">
                    <Image
                      src={postImageUrl.toString()}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div> */}
                  <div className="flex flex-grow flex-col p-5">
                    <Badge className="mb-2 w-fit" variant="outline">
                      {post.category}
                    </Badge>
                    <h3 className="mb-2 font-semibold text-xl transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="mb-4 line-clamp-3 text-base text-muted-foreground">
                        {post.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center gap-2 border-t pt-3 text-sm">
                      <span className="font-medium">{post.author}</span>
                      <span className="text-muted-foreground">
                        • {post.dateFormatted}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
