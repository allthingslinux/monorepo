import { cn } from "@/lib/utils";

export type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Horizontal constraint for marketing sections: max width + responsive horizontal padding.
 * Use inside {@link Section} (including with `bleed`) so content aligns to the same grid.
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        "relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}