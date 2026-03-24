"use client";

import { ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ClientScrollToTop() {
  return (
    <Button
      className="flex items-center gap-2"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      size="sm"
      variant="outline"
    >
      <ChevronUp className="h-4 w-4" />
      Back to top
    </Button>
  );
}