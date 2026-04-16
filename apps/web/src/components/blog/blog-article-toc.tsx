"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";

import { cn } from "@/lib/utils";

import {
  blogArticleSidePanelClassName,
  blogArticleSideRailWidthClassName,
} from "./blog-shell";

export type BlogArticleTocProps = {
  /** Stable key when switching posts (e.g. `category/slug`). */
  postKey: string;
};

type TocItem = { depth: number; id: string; text: string };

const CONTENT_ID = "blog-post-body";

/** Match any heading with an id from rehype-slug (not only ## / ### — many posts use # sections → h1). */
const HEADING_SELECTOR = "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]";

function headingRank(el: Element): number {
  const n = Number.parseInt(el.tagName.slice(1), 10);
  return Number.isFinite(n) ? n : 6;
}

/** Strip permalink/hash noise from heading text for TOC labels. */
function headingLabel(el: HTMLElement): string {
  const raw = el.textContent ?? "";
  return raw
    .replace(/^\s*#+\s*/u, "")
    .replace(/\s*#\s*$/u, "")
    .trim();
}

function collectHeadings(root: ParentNode): TocItem[] {
  const nodes = root.querySelectorAll(HEADING_SELECTOR);
  const preliminary: { id: string; rank: number; text: string }[] = [];
  const ranks: number[] = [];

  for (const el of nodes) {
    if (!(el instanceof HTMLElement)) {
      continue;
    }
    const id = el.id;
    const text = headingLabel(el);
    if (!(id && text)) {
      continue;
    }
    const rank = headingRank(el);
    ranks.push(rank);
    preliminary.push({ id, rank, text });
  }

  if (preliminary.length === 0) {
    return [];
  }

  const minRank = Math.min(...ranks);
  return preliminary.map(({ id, rank, text }) => ({
    depth: rank - minRank,
    id,
    text,
  }));
}

function scrollToTop() {
  window.scrollTo({ behavior: "smooth", top: 0 });
}

/** Keeps the flex column width aligned with the meta aside and real TOC (avoids layout shift when empty). */
const TOC_COLUMN_WIDTH_CLASS = cn(
  "hidden lg:block",
  blogArticleSideRailWidthClassName
);

const tocNavShellClassName = cn(
  blogArticleSidePanelClassName,
  "order-3 lg:sticky lg:top-24 lg:order-none lg:flex lg:h-fit lg:max-h-[min(100dvh-7rem,36rem)] lg:flex-col lg:self-start lg:overflow-hidden"
);

function TocSkeleton() {
  return (
    <nav
      aria-busy="true"
      aria-hidden
      className={cn(tocNavShellClassName, TOC_COLUMN_WIDTH_CLASS)}
    >
      <p className="text-muted-foreground shrink-0 text-xs font-medium tracking-wide uppercase">
        On this page
      </p>
      <ul className="mt-2.5 min-h-0 flex-1 space-y-2 overflow-hidden">
        {[
          { id: "a", ml: false, w: "w-[92%]" },
          { id: "b", ml: false, w: "w-[72%]" },
          { id: "c", ml: true, w: "w-[84%]" },
          { id: "d", ml: false, w: "w-[64%]" },
          { id: "e", ml: true, w: "w-[78%]" },
        ].map(({ id, ml, w: widthClass }) => (
          <li key={id}>
            <span
              className={cn(
                "bg-muted/70 block h-3.5 rounded-sm",
                widthClass,
                ml && "ml-3"
              )}
            />
          </li>
        ))}
      </ul>
      <div className="border-border/50 mt-3 shrink-0 border-t pt-3">
        <div className="bg-muted/50 h-5 w-28 rounded-sm" />
      </div>
    </nav>
  );
}

export function BlogArticleToc({ postKey }: BlogArticleTocProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  /** False until we stop expecting late-mounted MDX headings (reserves layout meanwhile). */
  const [layoutSettled, setLayoutSettled] = useState(false);

  /** After navigation, assume TOC may still hydrate; then allow empty column without skeleton. */
  useEffect(() => {
    setLayoutSettled(false);
    const t = window.setTimeout(() => {
      setLayoutSettled(true);
    }, 480);
    return () => {
      window.clearTimeout(t);
    };
  }, [postKey]);

  useLayoutEffect(() => {
    const root = document.querySelector(`#${CSS.escape(CONTENT_ID)}`);
    if (!root) {
      return;
    }

    const run = () => {
      setItems(collectHeadings(root));
    };

    run();
    const timer = window.setTimeout(run, 120);

    let raf = 0;
    const scheduleRun = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(run);
    };
    const observer = new MutationObserver(scheduleRun);
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [postKey]);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const OFFSET = 100;
    const updateActive = () => {
      const y = window.scrollY + OFFSET;
      let current: string | null = null;
      for (const item of items) {
        const el = document.querySelector(`#${CSS.escape(item.id)}`);
        if (!el) {
          continue;
        }
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        if (top <= y) {
          current = item.id;
        }
      }
      setActiveId(current ?? items[0]?.id ?? null);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [items]);

  if (items.length === 0) {
    if (!layoutSettled) {
      return <TocSkeleton />;
    }
    return <div aria-hidden className={TOC_COLUMN_WIDTH_CLASS} />;
  }

  return (
    <nav
      aria-label="On this page"
      className={cn(tocNavShellClassName, TOC_COLUMN_WIDTH_CLASS)}
    >
      <p className="text-muted-foreground shrink-0 text-xs font-medium tracking-wide uppercase">
        On this page
      </p>
      <ul className="mt-2.5 min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain text-sm leading-snug">
        {items.map((item) => (
          <li key={item.id}>
            <a
              className={cn(
                "border-border block border-l py-1.5 transition-colors",
                activeId === item.id
                  ? "text-primary border-primary font-medium"
                  : "text-muted-foreground hover:text-primary"
              )}
              href={`#${item.id}`}
              style={{
                paddingLeft: `calc(0.75rem + ${item.depth} * 0.65rem)`,
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
      <div className="border-border/50 mt-3 shrink-0 border-t pt-3">
        <button
          className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 text-left text-sm transition-colors"
          onClick={scrollToTop}
          type="button"
        >
          <ChevronUp aria-hidden className="size-4 shrink-0" />
          Back to top
        </button>
      </div>
    </nav>
  );
}
