import { FileText } from "lucide-react";
import Link from "next/link";

import { getAllPostsAsPostType } from "@/lib/blog";
import { Card, CardContent } from "@atl/ui/components/card";

export async function UpdatesSection() {
  // Get the most recent blog posts (news/updates)
  const posts = await getAllPostsAsPostType();
  const recentPosts = posts
    .filter((post) => post.categorySlug === "news")
    .slice(0, 3);

  if (recentPosts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground mb-2 text-lg">
            Community updates coming soon
          </div>
          <div className="text-muted-foreground text-sm">
            We&apos;re working on sharing regular updates about our community
            and projects.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {recentPosts.map((post) => {
        const date = new Date(post.date);
        const monthYear = date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

        return (
          <div className="mb-6 last:mb-0" key={post.slug}>
            <Link href={`/blog/${post.categorySlug}/${post.slug}`}>
              <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex-shrink-0">
                    <FileText className="text-muted-foreground h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{monthYear}</div>
                    <div className="text-muted-foreground line-clamp-1 text-sm">
                      {post.title}
                    </div>
                  </div>
                  <div className="text-muted-foreground flex-shrink-0 text-sm">
                    Read report →
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
