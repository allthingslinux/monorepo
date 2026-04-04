import { cn } from "@/lib/utils";

import { Container } from "./container";

/** Vertical padding between section bands (override with `className` when needed). */
const sectionSizeClass = {
  compact: "py-12 md:py-16 lg:py-20",
  default: "py-16 md:py-20 lg:py-24",
  hero: "pt-14 pb-16 md:pt-16 md:pb-20",
  spacious: "py-20 md:py-28 lg:py-32",
} as const;

export type SectionSize = keyof typeof sectionSizeClass;

const variantClass: Record<
  "default" | "muted" | "dots" | "grid" | "brand",
  string
> = {
  brand:
    "border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background",
  default: "border-b border-border/40 bg-background",
  dots: "border-b border-border/40 bg-background",
  grid: "border-b border-border/40 bg-muted/15",
  muted: "border-b border-border/40 bg-muted/25",
};

const patternClass: Record<"dots" | "grid", string> = {
  dots: "bg-[radial-gradient(var(--border)_1px,transparent_1px)] opacity-[0.35] bg-size-[20px_20px]",
  grid: "bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] opacity-20 bg-size-[40px_40px]",
};

export type SectionProps = {
  bleed?: boolean;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
  /** Default vertical rhythm; override padding with `className` for one-offs. */
  size?: SectionSize;
  variant?: keyof typeof variantClass;
};

export function Section({
  bleed = false,
  children,
  className,
  containerClassName,
  id,
  size = "default",
  variant = "default",
}: SectionProps) {
  const pattern =
    variant === "dots"
      ? patternClass.dots
      : variant === "grid"
        ? patternClass.grid
        : null;

  return (
    <section
      className={cn(
        "relative",
        sectionSizeClass[size],
        variantClass[variant],
        className
      )}
      id={id}
    >
      {pattern ? (
        <div
          aria-hidden
          className={cn("pointer-events-none absolute inset-0", pattern)}
        />
      ) : null}
      {bleed ? (
        <div className={cn("relative z-10 w-full", containerClassName)}>
          {children}
        </div>
      ) : (
        <Container className={containerClassName}>{children}</Container>
      )}
    </section>
  );
}
