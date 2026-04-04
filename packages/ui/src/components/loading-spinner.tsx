import type React from "react";

import { cn } from "@atl/ui/lib/utils";

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: "small" | "medium" | "large";
}

export function LoadingSpinner({
  size = "medium",
  className,
  ...props
}: LoadingSpinnerProps) {
  const sizeClasses = {
    large: "h-12 w-12 border-4",
    medium: "h-8 w-8 border-3",
    small: "h-4 w-4 border-2",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-blue-400 border-t-transparent",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
