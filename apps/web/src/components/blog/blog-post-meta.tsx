"use client";

import { Calendar, Tag } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@atl/ui/components/avatar";
import { Badge } from "@atl/ui/components/badge";
import { Card, CardContent } from "@atl/ui/components/card";

interface BlogPostMetaProps {
  author: string;
  category: string;
  categorySlug: string;
  date: string;
  formattedDate: string;
}

export function BlogPostMeta({
  author,
  date,
  formattedDate,
  category,
  categorySlug,
}: BlogPostMetaProps) {
  // Generate initials for avatar
  const initials = author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="bg-card/50 mb-8 overflow-hidden border backdrop-blur-sm">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center gap-3">
            <Avatar className="border-border/50 h-10 w-10 border">
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-foreground font-medium">{author}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 md:ml-auto">
            <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Calendar className="h-4 w-4" />
              <time dateTime={date}>{formattedDate}</time>
            </div>

            <Link
              href={
                categorySlug === "all-posts" ? "/blog" : `/blog/${categorySlug}`
              }
            >
              <Badge
                className="hover:bg-secondary/90 flex items-center gap-1 transition-colors"
                variant="secondary"
              >
                <Tag className="h-3 w-3" />
                {category}
              </Badge>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
