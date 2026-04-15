import { Badge } from "@atl/ui/components/badge";

type BlogListHeaderProps = {
  description: string;
  eyebrow: string;
  title: string;
};

export function BlogListHeader({
  eyebrow,
  title,
  description,
}: BlogListHeaderProps) {
  return (
    <div className="mb-11 flex flex-col items-center pt-6 text-center md:mb-14 md:pt-8 lg:mb-16 lg:pt-10">
      <div className="flex max-w-4xl flex-col items-center gap-4 md:gap-5 lg:gap-6">
        <Badge
          className="border-border/60 bg-muted/50 px-3 py-1 font-medium tracking-wide uppercase"
          variant="outline"
        >
          {eyebrow}
        </Badge>
        <h1 className="text-foreground font-serif text-3xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="text-muted-foreground max-w-3xl text-base leading-relaxed text-balance md:text-lg lg:text-xl">
          {description}
        </p>
      </div>
    </div>
  );
}
