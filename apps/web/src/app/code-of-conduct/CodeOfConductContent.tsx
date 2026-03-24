"use client";

import Image from "next/image";
import type React from "react";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

// Custom CSS for the animation
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
`;

interface CodeOfConductContentProps {
  content: string;
  lastUpdated: string;
}

// Define custom components with improved styling
const components = {
  h1: ({
    id,
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={`group mt-12 mb-8 scroll-m-20 border-blue-500/30 border-b pb-3 font-bold text-3xl text-neutral-100 tracking-tight lg:text-4xl ${className || ""}`}
      id={id}
      {...props}
    >
      <span>{children}</span>
      {id && (
        <a
          aria-label="Link to this section"
          className="ml-2 text-blue-400 opacity-0 transition-opacity hover:text-blue-300 group-hover:opacity-100"
          href={`#${id}`}
        >
          #
        </a>
      )}
    </h1>
  ),
  h2: ({
    id,
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={`group mt-10 mb-6 scroll-m-20 border-blue-500/40 border-l-3 pl-3 font-semibold text-2xl text-neutral-100 tracking-tight lg:text-3xl ${className || ""}`}
      id={id}
      {...props}
    >
      <span>{children}</span>
      {id && (
        <a
          aria-label="Link to this section"
          className="ml-2 text-blue-400 opacity-0 transition-opacity hover:text-blue-300 group-hover:opacity-100"
          href={`#${id}`}
        >
          #
        </a>
      )}
    </h2>
  ),
  h3: ({
    id,
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={`group mt-8 mb-4 scroll-m-20 border-blue-400/30 border-l-2 pl-2 text-foreground text-xl tracking-tight lg:text-2xl ${className || ""}`}
      id={id}
      {...props}
    >
      <span>{children}</span>
      {id && (
        <a
          aria-label="Link to this section"
          className="ml-2 text-blue-400 opacity-0 transition-opacity hover:text-blue-300 group-hover:opacity-100"
          href={`#${id}`}
        >
          #
        </a>
      )}
    </h3>
  ),
  h4: ({
    id,
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className={`group mt-6 mb-3 scroll-m-20 border-blue-400/20 border-l pl-2 text-foreground text-lg tracking-tight lg:text-xl ${className || ""}`}
      id={id}
      {...props}
    >
      <span>{children}</span>
      {id && (
        <a
          aria-label="Link to this section"
          className="ml-2 text-blue-400 opacity-0 transition-opacity hover:text-blue-300 group-hover:opacity-100"
          href={`#${id}`}
        >
          #
        </a>
      )}
    </h4>
  ),
  a: ({
    href,
    className,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    // Handle case where href might not be a string
    if (href === undefined || href === null) {
      return <span className="text-neutral-300">{children}</span>;
    }

    // Make sure href is a string
    const hrefString = String(href);
    const isExternal = hrefString.startsWith("http");

    return (
      <a
        className={`font-medium text-blue-400 underline underline-offset-4 hover:text-blue-300 ${className || ""}`}
        href={hrefString}
        rel={isExternal ? "noopener noreferrer" : undefined}
        target={isExternal ? "_blank" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },
  ul: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={`my-6 ml-6 list-disc space-y-2 text-neutral-300 ${className || ""}`}
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={`my-6 ml-6 list-decimal space-y-2 text-neutral-300 ${className || ""}`}
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({
    className,
    children,
    ...props
  }: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li
      className={`text-neutral-300 leading-relaxed ${className || ""}`}
      {...props}
    >
      {children}
    </li>
  ),
  p: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={`text-neutral-300 leading-7 [&:not(:first-child)]:mt-6 ${className || ""}`}
      {...props}
    >
      {children}
    </p>
  ),
  code: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={`rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-foreground text-sm ${className || ""}`}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={`my-6 overflow-x-auto rounded-lg border border-neutral-700/50 bg-neutral-900 p-4 ${className || ""}`}
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <table
      className={`my-6 w-full border-separate border-spacing-0 text-foreground ${className || ""}`}
      {...props}
    />
  ),
  th: ({
    className,
    ...props
  }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={`border-b px-4 py-2 text-left text-foreground ${className || ""}`}
      {...props}
    />
  ),
  td: ({
    className,
    ...props
  }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={`border-neutral-800 border-b px-4 py-2 text-foreground ${className || ""}`}
      {...props}
    />
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className={`text-foreground ${className || ""}`} {...props} />
  ),
};

// Optimize the main component with memo
const CodeOfConductContent = memo(function CodeOfConductContent({
  content,
  lastUpdated,
}: CodeOfConductContentProps) {
  return (
    <div className="container mx-auto px-3 pt-24 pb-16 sm:px-4 sm:pt-28 sm:pb-20 md:px-6 md:pt-32 md:pb-24 lg:px-8 lg:pt-36 lg:pb-32">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      <article className="prose mx-auto max-w-3xl space-y-8 [&_p]:text-base [&_p]:leading-7">
        <div className="mb-6 flex items-center gap-2 text-neutral-400 text-sm">
          <span>Last updated:</span>
          <time dateTime={lastUpdated}>{lastUpdated}</time>
        </div>

        {/* Render the Markdown content */}
        <div className="prose max-w-none prose-code:bg-neutral-800 prose-pre:bg-neutral-900 prose-headings:font-semibold prose-a:text-blue-400 prose-code:before:content-none prose-code:after:content-none hover:prose-a:text-blue-300">
          <ReactMarkdown
            components={components}
            rehypePlugins={[
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: "append",
                  properties: {
                    className: ["anchor"],
                    ariaHidden: true,
                    tabIndex: -1,
                  },
                },
              ],
            ]}
            remarkPlugins={[remarkGfm]}
          >
            {content || ""}
          </ReactMarkdown>
        </div>

        <div className="mt-16 border-neutral-800 border-t pt-8">
          <p className="text-neutral-400 text-sm">Contributors:</p>
          <a
            className="block transition-opacity hover:opacity-90"
            href="https://github.com/allthingslinux/code-of-conduct/graphs/contributors"
          >
            <Image
              alt="Contributors"
              className="rounded-lg"
              height={1000}
              loading="lazy"
              src="https://contrib.rocks/image?repo=allthingslinux/code-of-conduct"
              width={1000}
            />
          </a>
        </div>
      </article>
    </div>
  );
});

export { CodeOfConductContent };