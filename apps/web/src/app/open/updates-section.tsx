import { Card, CardContent } from "@atl/ui/components/card";
import { FileText } from "lucide-react";
import Link from "next/link";

import { getAllPostsAsPostType } from "@/lib/blog";

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
          <div className="mb-2 text-lg text-muted-foreground">
            Community updates coming soon
          </div>
          <div className="text-muted-foreground text-sm">
            We're working on sharing regular updates about our community and
            projects.
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
              <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{monthYear}</div>
                    <div className="line-clamp-1 text-muted-foreground text-sm">
                      {post.title}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-muted-foreground text-sm">
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