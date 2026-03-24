"use client";

import { Calendar, Tag } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
    .substring(0, 2);

  return (
    <Card className="mb-8 overflow-hidden border bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border/50">
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{author}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 md:ml-auto">
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Calendar className="h-4 w-4" />
              <time dateTime={date}>{formattedDate}</time>
            </div>

            <Link
              href={
                categorySlug === "all-posts" ? "/blog" : `/blog/${categorySlug}`
              }
            >
              <Badge
                className="flex items-center gap-1 transition-colors hover:bg-secondary/90"
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
