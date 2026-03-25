import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDynamicMetadata } from "@/app/metadata";
import { BackToAllPostsButton } from "@/components/blog/back-to-posts-button";
import ClientScrollToTop from "@/components/blog/client-scroll-to-top";
import { Mdx } from "@/components/mdx/mdx-components";
import { ArticleSchema } from "@/components/seo/structured-data";
import { getPost } from "@/lib/blog";
import { getBaseUrl } from "@/lib/utils";

interface PostPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

// Generate metadata for the post
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const post = await getPost(category, slug);

  if (!post) {
    return getDynamicMetadata({
      description: "The requested blog post could not be found.",
      title: "Post Not Found",
    });
  }

  // Convert category slug to proper name for display
  // const categoryName =
  //   post.category ||
  //   category
  //     .split('-')
  //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join(' ');

  // Build dynamic OG image URL with query parameters
  // const ogImageUrl = new URL(getApiUrl('/api/og'));
  // ogImageUrl.searchParams.append('title', post.title);
  // ogImageUrl.searchParams.append('category', categoryName);
  // ogImageUrl.searchParams.append('date', post.date);

  return {
    ...getDynamicMetadata({
      description: post.description || `Read our post about ${post.title}`,
      title: post.title,
    }),
    openGraph: {
      authors: [post.author || "All Things Linux"],
      description: post.description || `Read our post about ${post.title}`,
      modifiedTime: post.date,
      // images: [
      //   {
      //     url: ogImageUrl.toString(),
      //     width: 1200,
      //     height: 630,
      //     alt: post.title,
      //   },
      // ],
      publishedTime: post.date,
      title: post.title,
      type: "article",
      url: `${getBaseUrl()}/blog/${category}/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      description: post.description || `Read our post about ${post.title}`,
      title: post.title,
      // images: [ogImageUrl.toString()],
    },
  };
}

// Simple date formatter function
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { category, slug } = await params;

  const post = await getPost(category, slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="container relative max-w-4xl py-6 lg:py-10">
      <ArticleSchema
        authorName={post.author || "All Things Linux"}
        dateModified={post.date}
        datePublished={post.date}
        description={post.description || `Read our post about ${post.title}`}
        imageUrl="https://allthingslinux.org/images/og.png"
        title={post.title}
      />
      <div className="absolute top-14 left-[-200px] hidden xl:block">
        <BackToAllPostsButton />
      </div>

      <div>
        <h1 className="mt-2 scroll-m-20 text-balance font-bold text-4xl tracking-tight">
          {post.title}
        </h1>
        {post.description && (
          <p className="my-4 text-balance text-md text-muted-foreground">
            {post.description}
          </p>
        )}

        {/* Author and date with card aesthetic */}
        <div className="mt-4 inline-flex items-center space-x-2 rounded-md bg-card/50 px-3 py-1 text-muted-foreground text-sm">
          {post.author && (
            <>
              <div className="font-medium">{post.author}</div>
              <div>·</div>
            </>
          )}
          <div>
            <time dateTime={post.date}>
              {post.dateFormatted || formatDate(post.date)}
            </time>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Mdx code={post.body.code} />
      </div>

      <div className="flex items-center justify-center gap-4 py-6 lg:py-10">
        <BackToAllPostsButton />
        <ClientScrollToTop />
      </div>
    </article>
  );
}