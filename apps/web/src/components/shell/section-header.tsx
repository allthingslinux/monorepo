import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  align?: "center" | "start";
  className?: string;
  description?: string;
  descriptionClassName?: string;
  eyebrow?: string;
  title: string;
}

export function SectionHeader({
  align = "center",
  className,
  description,
  descriptionClassName,
  eyebrow,
  title,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 max-w-2xl md:mb-14",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="text-primary mb-3 text-xs font-medium tracking-[0.2em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-muted-foreground text-sm text-balance sm:text-base md:text-lg",
            descriptionClassName
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
