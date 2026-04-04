"use client";

import { Code2, MessageCircle, PackageSearch, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ServiceCategory, ServiceDefinition } from "@atl/tools-manifest";
import { categoryLabels } from "@atl/tools-manifest";

import { ServiceCard } from "./service-card";

interface AppShellProps {
  services: ServiceDefinition[];
}

export function AppShell({ services }: AppShellProps) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">(
    "all"
  );
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const categories = [
    ...new Set(services.map((s) => s.category)),
  ] as ServiceCategory[];

  const allTags = [...new Set(services.flatMap((s) => s.tags))].toSorted();

  const countForCategory = (cat: ServiceCategory | "all") =>
    cat === "all"
      ? services.length
      : services.filter((s) => s.category === cat).length;

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const filtered = services.filter((s) => {
    const matchesCategory =
      activeCategory === "all" || s.category === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some((t) => t.includes(q));
    const matchesTags =
      activeTags.length === 0 || activeTags.some((t) => s.tags.includes(t));
    return matchesCategory && matchesSearch && matchesTags;
  });

  const activeCount = services.filter((s) => s.status === "active").length;

  const focusSearch = useCallback(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        focusSearch();
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [focusSearch]);

  return (
    <div className="bg-background flex h-dvh overflow-hidden">
      {/* Skip link */}
      <a
        className="focus-visible:border-primary focus-visible:bg-background focus-visible:text-primary sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:border focus-visible:px-3 focus-visible:py-1.5 focus-visible:text-sm"
        href="#main-content"
      >
        Skip to content
      </a>
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="border-border bg-card hidden w-[220px] shrink-0 flex-col border-r md:flex">
        {/* Brand */}
        <div className="border-border border-b px-4 py-5">
          <Link className="group flex items-center gap-2.5" href="/">
            <Image
              alt=""
              className="h-8 w-8"
              height={32}
              src="/logo_only.png"
              width={32}
            />
            <span className="text-foreground/90 group-hover:text-foreground text-lg font-semibold tracking-tight transition-colors">
              atl.tools
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {/* Categories */}
          <button
            className={`flex w-full cursor-pointer items-center justify-between rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
              activeCategory === "all"
                ? "border-l-primary bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground/90 border-l-transparent"
            }`}
            onClick={() => {
              setActiveCategory("all");
            }}
            type="button"
          >
            <span>All tools</span>
            <span className="text-muted-foreground/50 font-mono text-xs">
              {services.length}
            </span>
          </button>

          <div className="text-muted-foreground/60 mt-4 mb-1 px-3 font-mono text-xs tracking-wider uppercase">
            Categories
          </div>
          {categories.map((cat) => (
            <button
              className={`flex w-full cursor-pointer items-center justify-between rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
                activeCategory === cat
                  ? "border-l-primary bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground/90 border-l-transparent"
              }`}
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
              }}
              type="button"
            >
              <span>{categoryLabels[cat]}</span>
              <span className="text-muted-foreground font-mono text-xs">
                {countForCategory(cat)}
              </span>
            </button>
          ))}

          {/* Tags */}
          <div className="mt-5 mb-2 flex items-center justify-between px-3">
            <span className="text-muted-foreground/60 font-mono text-xs tracking-wider uppercase">
              Tags
            </span>
            {activeTags.length > 0 && (
              <button
                className="text-muted-foreground/70 hover:text-foreground/70 cursor-pointer font-mono text-xs transition-colors"
                onClick={() => {
                  setActiveTags([]);
                }}
                type="button"
              >
                clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 px-3">
            {allTags.map((tag) => {
              const isActive = activeTags.includes(tag);
              return (
                <button
                  className={`cursor-pointer rounded-full border px-2.5 py-0.5 font-mono text-xs transition-colors ${
                    isActive
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-border/40 bg-muted/60 text-muted-foreground/70 hover:border-border hover:text-foreground/70"
                  }`}
                  key={tag}
                  onClick={() => {
                    toggleTag(tag);
                  }}
                  type="button"
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* ── Main ────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-border bg-card shrink-0 border-b px-6 py-4">
          {/* Title + search row */}
          <div className="flex items-center gap-3">
            {/* Mobile brand */}
            <div className="flex flex-1 items-center gap-2 md:hidden">
              <Image
                alt=""
                className="h-5 w-5"
                height={20}
                src="/logo_only.png"
                width={20}
              />
              <span className="text-foreground text-sm font-semibold">
                atl.tools
              </span>
            </div>

            {/* Desktop title */}
            <div className="hidden flex-1 items-center gap-3 md:flex">
              <h1 className="text-foreground text-sm font-semibold tracking-tight">
                Tools
              </h1>
              <span className="text-muted-foreground/60 text-xs select-none">
                /
              </span>
              <p className="text-muted-foreground font-mono text-xs">
                {filtered.length === services.length
                  ? `${activeCount} active`
                  : `${filtered.length} of ${services.length}`}{" "}
                · free to use
              </p>
            </div>

            {/* Search input */}
            <div className="relative flex items-center">
              <Search
                className="text-muted-foreground pointer-events-none absolute left-3"
                size={14}
              />
              <input
                className="border-border bg-muted text-foreground placeholder-muted-foreground/70 focus-visible:border-primary w-44 rounded-lg border py-1.5 pr-8 pl-8 text-sm transition-colors focus-visible:outline-none md:w-56"
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearch("");
                  }
                }}
                placeholder="Search tools..."
                ref={searchRef}
                type="text"
                value={search}
              />
              {search ? (
                <button
                  aria-label="Clear search"
                  className="text-muted-foreground hover:text-foreground absolute right-2.5 cursor-pointer transition-colors"
                  onClick={() => {
                    setSearch("");
                  }}
                  type="button"
                >
                  <X aria-hidden="true" size={13} />
                </button>
              ) : (
                <span className="text-muted-foreground/70 pointer-events-none absolute right-2.5 font-mono text-xs select-none">
                  ⌘K
                </span>
              )}
            </div>
          </div>

          {/* Mobile: stats + category chips */}
          <div className="mt-3 space-y-2 md:hidden">
            <p className="text-muted-foreground font-mono text-xs">
              {filtered.length === services.length
                ? `${activeCount} active`
                : `${filtered.length} of ${services.length}`}{" "}
              · free to use
            </p>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              <button
                className={`shrink-0 cursor-pointer rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
                  activeCategory === "all"
                    ? "border-primary/40 bg-primary/15 text-primary font-medium"
                    : "border-border/60 bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
                onClick={() => {
                  setActiveCategory("all");
                }}
                type="button"
              >
                all
              </button>
              {categories.map((cat) => (
                <button
                  className={`shrink-0 cursor-pointer rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
                    activeCategory === cat
                      ? "border-primary/40 bg-primary/15 text-primary font-medium"
                      : "border-border/60 bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                  }}
                  type="button"
                >
                  {categoryLabels[cat].toLowerCase()}
                </button>
              ))}
            </div>
            {/* Mobile tag row */}
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              {allTags.map((tag) => {
                const isActive = activeTags.includes(tag);
                return (
                  <button
                    className={`shrink-0 cursor-pointer rounded-full border px-2.5 py-0.5 font-mono text-xs transition-colors ${
                      isActive
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-border/60 bg-muted text-muted-foreground"
                    }`}
                    key={tag}
                    onClick={() => {
                      toggleTag(tag);
                    }}
                    type="button"
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable grid */}
        <main className="flex-1 overflow-y-auto px-6 py-6" id="main-content">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((service, i) => (
                <div className="card-enter flex flex-col" key={service.id}>
                  <ServiceCard
                    activeTags={activeTags}
                    index={i}
                    onTagClick={toggleTag}
                    service={service}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-muted text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
                <PackageSearch aria-hidden="true" size={22} strokeWidth={1.5} />
              </div>
              <p className="text-foreground mb-1 font-semibold">
                No tools found
              </p>
              <p className="text-muted-foreground font-mono text-sm">
                {(() => {
                  if (search) {
                    return `No results for "${search}"`;
                  }
                  if (activeTags.length > 0) {
                    return `No tools tagged ${activeTags.map((t) => `"${t}"`).join(" or ")}`;
                  }
                  return "check back soon — more tools on the way.";
                })()}
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-border bg-card flex shrink-0 items-center justify-between border-t px-6 py-3">
          <span className="text-muted-foreground text-xs">
            Built with 💛 by{" "}
            <a
              className="text-accent hover:text-foreground transition-colors"
              href="https://allthingslinux.org"
            >
              All Things Linux
            </a>
          </span>
          <div className="flex items-center gap-4">
            <a
              className="text-muted-foreground hover:text-foreground/80 flex items-center gap-2 font-mono text-xs transition-colors"
              href="https://discord.gg/linux"
              rel="noopener noreferrer"
              target="_blank"
            >
              <MessageCircle size={13} />
              Discord
            </a>
            <a
              className="text-muted-foreground hover:text-foreground/80 flex items-center gap-2 font-mono text-xs transition-colors"
              href="https://github.com/allthingslinux/atl.tools"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Code2 size={13} />
              allthingslinux/atl.tools
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
