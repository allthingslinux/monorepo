"use client";

import {
	categoryLabels,
	type ServiceCategory,
	type ServiceDefinition,
} from "@atl.tools/manifest";
import { Code2, MessageCircle, PackageSearch, Search, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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

	const categories = Array.from(
		new Set(services.map((s) => s.category))
	) as ServiceCategory[];

	const allTags = Array.from(new Set(services.flatMap((s) => s.tags))).sort();

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
		return () => window.removeEventListener("keydown", handler);
	}, [focusSearch]);

	return (
		<div className="flex h-dvh overflow-hidden bg-base">
			{/* Skip link */}
			<a
				className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:border focus-visible:border-blue focus-visible:bg-base focus-visible:px-3 focus-visible:py-1.5 focus-visible:text-blue focus-visible:text-sm"
				href="#main-content"
			>
				Skip to content
			</a>
			{/* ── Sidebar ─────────────────────────────────── */}
			<aside className="hidden w-[220px] shrink-0 flex-col border-surface0 border-r bg-mantle md:flex">
				{/* Brand */}
				<div className="border-surface0 border-b px-4 py-5">
					<a className="group flex items-center gap-2.5" href="/">
						<Image
							alt=""
							className="h-8 w-8"
							height={32}
							src="/logo_only.png"
							width={32}
						/>
						<span className="font-semibold text-lg text-text/90 tracking-tight transition-colors group-hover:text-text">
							atl.tools
						</span>
					</a>
				</div>

				{/* Nav */}
				<nav className="flex-1 overflow-y-auto px-2 py-3">
					{/* Categories */}
					<button
						className={`flex w-full cursor-pointer items-center justify-between rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
							activeCategory === "all"
								? "border-l-blue bg-surface0 font-medium text-text"
								: "border-l-transparent text-text/50 hover:bg-surface0/50 hover:text-text/90"
						}`}
						onClick={() => setActiveCategory("all")}
						type="button"
					>
						<span>All tools</span>
						<span className="font-mono text-text/30 text-xs">
							{services.length}
						</span>
					</button>

					<div className="mt-4 mb-1 px-3 font-mono text-text/35 text-xs uppercase tracking-wider">
						Categories
					</div>
					{categories.map((cat) => (
						<button
							className={`flex w-full cursor-pointer items-center justify-between rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
								activeCategory === cat
									? "border-l-blue bg-surface0 font-medium text-text"
									: "border-l-transparent text-text/50 hover:bg-surface0/50 hover:text-text/90"
							}`}
							key={cat}
							onClick={() => setActiveCategory(cat)}
							type="button"
						>
							<span>{categoryLabels[cat]}</span>
							<span className="font-mono text-overlay2 text-xs">
								{countForCategory(cat)}
							</span>
						</button>
					))}

					{/* Tags */}
					<div className="mt-5 mb-2 flex items-center justify-between px-3">
						<span className="font-mono text-text/35 text-xs uppercase tracking-wider">
							Tags
						</span>
						{activeTags.length > 0 && (
							<button
								className="cursor-pointer font-mono text-text/40 text-xs transition-colors hover:text-text/70"
								onClick={() => setActiveTags([])}
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
											? "border-blue/40 bg-blue/15 text-blue"
											: "border-overlay0/40 bg-surface0/60 text-text/40 hover:border-overlay0 hover:text-text/70"
									}`}
									key={tag}
									onClick={() => toggleTag(tag)}
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
				<div className="shrink-0 border-surface0 border-b bg-mantle px-6 py-4">
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
							<span className="font-semibold text-sm text-text">atl.tools</span>
						</div>

						{/* Desktop title */}
						<div className="hidden flex-1 items-center gap-3 md:flex">
							<h1 className="font-semibold text-sm text-text tracking-tight">
								Tools
							</h1>
							<span className="select-none text-overlay0 text-xs">/</span>
							<p className="font-mono text-overlay2 text-xs">
								{filtered.length !== services.length
									? `${filtered.length} of ${services.length}`
									: `${activeCount} active`}{" "}
								· free to use
							</p>
						</div>

						{/* Search input */}
						<div className="relative flex items-center">
							<Search
								className="pointer-events-none absolute left-3 text-overlay2"
								size={14}
							/>
							<input
								className="w-44 rounded-lg border border-surface1 bg-surface0 py-1.5 pr-8 pl-8 text-sm text-text placeholder-overlay1 transition-colors focus-visible:border-blue focus-visible:outline-none md:w-56"
								onChange={(e) => setSearch(e.target.value)}
								onKeyDown={(e) => e.key === "Escape" && setSearch("")}
								placeholder="Search tools..."
								ref={searchRef}
								type="text"
								value={search}
							/>
							{search ? (
								<button
									aria-label="Clear search"
									className="absolute right-2.5 cursor-pointer text-overlay2 transition-colors hover:text-text"
									onClick={() => setSearch("")}
									type="button"
								>
									<X aria-hidden="true" size={13} />
								</button>
							) : (
								<span className="pointer-events-none absolute right-2.5 select-none font-mono text-overlay1 text-xs">
									⌘K
								</span>
							)}
						</div>
					</div>

					{/* Mobile: stats + category chips */}
					<div className="mt-3 space-y-2 md:hidden">
						<p className="font-mono text-overlay2 text-xs">
							{filtered.length !== services.length
								? `${filtered.length} of ${services.length}`
								: `${activeCount} active`}{" "}
							· free to use
						</p>
						<div className="no-scrollbar flex gap-1.5 overflow-x-auto">
							<button
								className={`shrink-0 cursor-pointer rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
									activeCategory === "all"
										? "border-blue/40 bg-blue/15 font-medium text-blue"
										: "border-surface1/60 bg-surface0 text-subtext0 hover:bg-surface1 hover:text-text"
								}`}
								onClick={() => setActiveCategory("all")}
								type="button"
							>
								all
							</button>
							{categories.map((cat) => (
								<button
									className={`shrink-0 cursor-pointer rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
										activeCategory === cat
											? "border-blue/40 bg-blue/15 font-medium text-blue"
											: "border-surface1/60 bg-surface0 text-subtext0 hover:bg-surface1 hover:text-text"
									}`}
									key={cat}
									onClick={() => setActiveCategory(cat)}
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
												? "border-blue/40 bg-blue/15 text-blue"
												: "border-surface1/60 bg-surface0 text-overlay2"
										}`}
										key={tag}
										onClick={() => toggleTag(tag)}
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
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface0 text-overlay2">
								<PackageSearch aria-hidden="true" size={22} strokeWidth={1.5} />
							</div>
							<p className="mb-1 font-semibold text-text">No tools found</p>
							<p className="font-mono text-sm text-subtext0">
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
				<footer className="flex shrink-0 items-center justify-between border-surface0 border-t bg-mantle px-6 py-3">
					<span className="text-subtext0 text-xs">
						Built with 💛 by{" "}
						<a
							className="text-mauve transition-colors hover:text-text"
							href="https://allthingslinux.org"
						>
							All Things Linux
						</a>
					</span>
					<div className="flex items-center gap-4">
						<a
							className="flex items-center gap-2 font-mono text-overlay2 text-xs transition-colors hover:text-subtext0"
							href="https://discord.gg/linux"
							rel="noopener noreferrer"
							target="_blank"
						>
							<MessageCircle size={13} />
							Discord
						</a>
						<a
							className="flex items-center gap-2 font-mono text-overlay2 text-xs transition-colors hover:text-subtext0"
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
