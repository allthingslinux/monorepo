"use client";

import { useMDXComponent } from "next-contentlayer2/hooks";
import Image from "next/image";
import * as React from "react";

import { Alert } from "@/components/mdx/alert";
import { cn } from "@/lib/utils";

// Simple components without memoization
const Heading1 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={cn("mt-10 mb-6 scroll-m-20 font-bold tracking-tight", className)}
    {...props}
  />
);

const Heading2 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={cn(
      "mt-8 mb-4 scroll-m-20 border-b pb-2 tracking-tight first:mt-0",
      className
    )}
    {...props}
  />
);

const Heading3 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("mt-6 mb-3 scroll-m-20 tracking-tight", className)}
    {...props}
  />
);

const Heading4 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h4
    className={cn("mt-5 mb-2 scroll-m-20 tracking-tight", className)}
    {...props}
  />
);

const Heading5 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h5
    className={cn("mt-4 mb-2 scroll-m-20 tracking-tight", className)}
    {...props}
  />
);

const Heading6 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h6
    className={cn("mt-4 mb-1.5 scroll-m-20 tracking-tight", className)}
    {...props}
  />
);

// Simplified alert detection regex - precompiled
const ALERT_REGEX =
  /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*?)\s*$/i;

const Blockquote = ({
  className,
  children,
  ...props
}: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => {
  // Simpler alert detection with better performance
  const childArray = React.Children.toArray(children);
  const firstChild = childArray[0];

  // Early return for non-paragraph first children
  if (
    !(firstChild && React.isValidElement(firstChild)) ||
    firstChild.type !== "p"
  ) {
    return (
      <blockquote
        className={cn(
          "[&>*]:text-muted-foreground mt-6 border-l-2 pl-6 italic",
          className
        )}
        {...props}
      >
        {children}
      </blockquote>
    );
  }

  // Check for alert syntax in the first paragraph
  const firstChildProps = firstChild.props as { children?: React.ReactNode };
  const alertText =
    typeof firstChildProps.children === "string"
      ? firstChildProps.children
      : null;

  // If no alert text pattern, render normal blockquote
  if (!alertText) {
    return (
      <blockquote
        className={cn(
          "[&>*]:text-muted-foreground mt-6 border-l-2 pl-6 italic",
          className
        )}
        {...props}
      >
        {children}
      </blockquote>
    );
  }

  // Check for alert pattern using regex
  const match = alertText.match(ALERT_REGEX);
  if (!match) {
    return (
      <blockquote
        className={cn(
          "[&>*]:text-muted-foreground mt-6 border-l-2 pl-6 italic",
          className
        )}
        {...props}
      >
        {children}
      </blockquote>
    );
  }

  // Extract alert type and title
  const alertType = match[1].toLowerCase() as
    | "note"
    | "tip"
    | "important"
    | "warning"
    | "caution";
  const title = match[2] ? match[2].trim() : "";

  // Return the alert component
  return (
    <Alert title={title} type={alertType}>
      {childArray.slice(1)}
    </Alert>
  );
};

// Image component with lazy loading and proper sizing
const CustomImage = ({
  alt,
  src,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const { width: propsWidth, height: propsHeight, ...restProps } = props;

  // Use default sizes that are more reasonable for blog content
  const width = propsWidth
    ? typeof propsWidth === "number"
      ? propsWidth
      : Number.parseInt(String(propsWidth), 10) || 800
    : 800;

  const height = propsHeight
    ? typeof propsHeight === "number"
      ? propsHeight
      : Number.parseInt(String(propsHeight), 10) || 450
    : 450;

  return (
    <Image
      alt={alt || ""}
      className="rounded-md border"
      height={height}
      loading="lazy"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
      src={typeof src === "string" ? src : ""}
      width={width}
      {...restProps}
    />
  );
};

const Anchor = ({
  className,
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const isExternal = href?.startsWith("http");
  return (
    <a
      className={cn(
        "font-medium text-blue-400 underline underline-offset-4 hover:text-blue-300",
        className
      )}
      href={href}
      rel={isExternal ? "noopener noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
      {...props}
    />
  );
};

const Paragraph = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
    {...props}
  />
);

const UnorderedList = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className={cn("my-6 ml-4 list-disc", className)} {...props} />
);

const OrderedList = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLOListElement>) => (
  <ol className={cn("my-6 ml-4 list-decimal", className)} {...props} />
);

const ListItem = ({
  className,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li className={cn("mt-2", className)} {...props} />
);

const HorizontalRule = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHRElement>) => (
  <hr className={cn("my-4 md:my-8", className)} {...props} />
);

const Table = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="my-6 w-full overflow-y-auto">
    <table className={cn("w-full", className)} {...props} />
  </div>
);

const TableRow = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("even:bg-muted m-0 border-t p-0", className)} {...props} />
);

const TableHeader = ({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
      className
    )}
    {...props}
  />
);

const TableCell = ({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={cn(
      "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
      className
    )}
    {...props}
  />
);

const Preformatted = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLPreElement>) => (
  <pre
    className={cn(
      "mt-6 mb-4 overflow-x-auto rounded-lg border bg-black py-4",
      className
    )}
    {...props}
  />
);

const Code = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {
  const isInlineCode = !className?.includes("language-");
  return isInlineCode ? (
    <code
      className={cn(
        "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className
      )}
      {...props}
    />
  ) : (
    <code
      className={cn(
        "relative rounded border px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className
      )}
      {...props}
    />
  );
};

const components = {
  Alert,
  Image,
  a: Anchor,
  blockquote: Blockquote,
  code: Code,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
  hr: HorizontalRule,
  img: CustomImage,
  li: ListItem,
  ol: OrderedList,
  p: Paragraph,
  pre: Preformatted,
  table: Table,
  td: TableCell,
  th: TableHeader,
  tr: TableRow,
  ul: UnorderedList,
};

// Standard React Error Boundary
class MDXErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null, hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { error, hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error as Error} />;
    }

    return this.props.children;
  }
}

// Client-side error handling component
function ErrorDisplay({ error }: { error: Error | null }) {
  if (!error) {
    return null;
  }

  return (
    <div className="rounded-md border border-red-500 bg-red-50 p-4 dark:bg-red-900/10">
      <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
        Error rendering MDX content
      </h3>
      <p className="mt-2 text-sm text-red-700 dark:text-red-300">
        There was an error rendering this content. Please check the MDX syntax.
      </p>
      <pre className="mt-4 overflow-auto rounded-md bg-red-100 p-2 text-xs text-red-900 dark:bg-red-950 dark:text-red-200">
        {error.message}
      </pre>
    </div>
  );
}

function MissingContentDisplay() {
  return (
    <div className="rounded-md border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-900/10">
      <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
        Missing content
      </h3>
      <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
        The MDX content for this post could not be loaded.
      </p>
    </div>
  );
}

interface MdxProps {
  code: string;
}

export function Mdx({ code }: MdxProps) {
  // Always call hooks at the top level
  // Since we disabled MDX compilation, we need to handle raw MDX content
  const Component = useMDXComponent(code || "");

  // Handle missing code
  if (!code) {
    return <MissingContentDisplay />;
  }

  // Use the proper error boundary
  return (
    <MDXErrorBoundary>
      <div className="mdx prose prose-neutral dark:prose-invert prose-code:bg-muted prose-pre:bg-black prose-headings:scroll-mt-24 prose-headings:font-semibold prose-a:text-primary prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-code:before:content-none prose-code:after:content-none [&_a.anchor]:text-muted-foreground max-w-none [&_a.anchor]:no-underline [&_a.anchor]:opacity-100 [&_a.anchor]:transition-opacity [&_h1:hover_a.anchor]:opacity-70 [&_h2:hover_a.anchor]:opacity-70 [&_h3:hover_a.anchor]:opacity-70 [&_h4:hover_a.anchor]:opacity-70 [&_h5:hover_a.anchor]:opacity-70 [&_h6:hover_a.anchor]:opacity-70">
        <Component components={components} />
      </div>
    </MDXErrorBoundary>
  );
}
