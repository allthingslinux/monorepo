"use client";

import { Button } from "@atl/ui/components/button";
import { ChevronUp } from "lucide-react";

export default function ClientScrollToTop() {
  return (
    <Button
      className="flex items-center gap-2"
      onClick={() => window.scrollTo({ behavior: "smooth", top: 0 })}
      size="sm"
      variant="outline"
    >
      <ChevronUp className="h-4 w-4" />
      Back to top
    </Button>
  );
}