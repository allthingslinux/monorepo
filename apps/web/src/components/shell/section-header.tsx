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
        <p className="mb-3 font-medium text-primary text-xs uppercase tracking-[0.2em]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mb-4 font-bold font-display text-2xl tracking-tight sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-balance text-muted-foreground text-sm sm:text-base md:text-lg",
            descriptionClassName
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}