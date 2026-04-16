import { ArrowLeft } from "lucide-react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getDynamicMetadata } from "@/app/metadata";
import { BlogArticleBreadcrumbs } from "@/components/blog/blog-article-breadcrumbs";
import { BlogArticleMetaAside } from "@/components/blog/blog-article-meta-aside";
import { BlogArticleToc } from "@/components/blog/blog-article-toc";
import { BlogRelatedPosts } from "@/components/blog/blog-related-posts";
import { blogContainerClassName } from "@/components/blog/blog-shell";
import ClientScrollToTop from "@/components/blog/client-scroll-to-top";
import { Mdx } from "@/components/mdx/mdx-components";
import { ArticleSchema } from "@/components/seo/structured-data";
import { Container } from "@/components/shell";
import { getAllPostRouteParams, getPost, getRelatedPosts } from "@/lib/blog";
import { resolvePostImageUrl } from "@/lib/blog-utils";
import { getBaseUrl } from "@/lib/utils";
import { Button } from "@atl/ui/components/button";

interface PostPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllPostRouteParams();
}

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

  const imageUrl = resolvePostImageUrl(post.image);
  const pageUrl = `${getBaseUrl()}/blog/${category}/${slug}`;

  return {
    ...getDynamicMetadata({
      description: post.description || `Read our post about ${post.title}`,
      title: post.title,
    }),
    openGraph: {
      authors: [post.author || "All Things Linux"],
      description: post.description || `Read our post about ${post.title}`,
      images: [{ alt: post.title, height: 630, url: imageUrl, width: 1200 }],
      modifiedTime: post.date,
      publishedTime: post.date,
      title: post.title,
      type: "article",
      url: pageUrl,
    },
    twitter: {
      card: "summary_large_image",
      description: post.description || `Read our post about ${post.title}`,
      images: [imageUrl],
      title: post.title,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { category, slug } = await params;

  const post = await getPost(category, slug);

  if (!post) {
    notFound();
  }

  const imageUrl = resolvePostImageUrl(post.image);
  const related = await getRelatedPosts(post, 4);
  const postKey = `${category}/${slug}`;
  const categoryHref = `/blog/${post.categorySlug}` as Route;
  const showImage = Boolean(post.image);

  return (
    <>
      <ArticleSchema
        authorName={post.author || "All Things Linux"}
        dateModified={post.date}
        datePublished={post.date}
        description={post.description || `Read our post about ${post.title}`}
        imageUrl={imageUrl}
        title={post.title}
      />
      <article className="border-border/40 bg-background border-b pt-20 pb-10 md:pt-24 md:pb-14 lg:pt-28 lg:pb-20">
        <Container className={blogContainerClassName}>
          <div className="mx-auto w-full max-w-4xl text-center">
            <BlogArticleBreadcrumbs post={post} />

            <h1 className="text-foreground mt-8 scroll-m-20 font-serif text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-6xl">
              {post.title}
            </h1>

            {post.description ? (
              <p className="text-muted-foreground mx-auto mt-5 max-w-2xl text-lg leading-relaxed font-medium text-pretty md:text-xl">
                {post.description}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                nativeButton={false}
                render={<Link href="/blog" />}
                size="lg"
              >
                <ArrowLeft aria-hidden className="mr-2 size-4 shrink-0" />
                All posts
              </Button>
              <Button
                nativeButton={false}
                render={<Link href={categoryHref} />}
                size="lg"
                variant="outline"
              >
                More in {post.category}
              </Button>
            </div>
          </div>

          <div className="relative mt-12 flex flex-col gap-8 lg:mt-20 lg:flex-row lg:items-start lg:gap-6 xl:gap-7">
            <BlogArticleMetaAside post={post} />

            <div className="order-1 min-w-0 flex-1 space-y-8 lg:order-none">
              {showImage ? (
                <div className="border-border relative aspect-video w-full overflow-hidden rounded-2xl border">
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    src={post.image as string}
                    unoptimized
                  />
                </div>
              ) : null}

              <div className="px-4 sm:px-6 lg:pr-6 lg:pl-4 xl:pr-9 xl:pl-7">
                <div className="mx-auto w-full max-w-prose" id="blog-post-body">
                  <Mdx code={post.body.code} />
                </div>
              </div>
            </div>

            <BlogArticleToc key={postKey} postKey={postKey} />
          </div>

          <BlogRelatedPosts categoryLabel={post.category} posts={related} />

          <div className="mt-12 flex flex-col items-center justify-center gap-4 border-t pt-10 sm:flex-row">
            <Button
              nativeButton={false}
              render={<Link href="/blog" />}
              variant="ghost"
            >
              <ArrowLeft aria-hidden className="mr-2 size-4 shrink-0" />
              All posts
            </Button>
            <ClientScrollToTop />
          </div>
        </Container>
      </article>
    </>
  );
}
