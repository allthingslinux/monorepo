"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X, Code2, MessageCircle, PackageSearch } from "lucide-react"
import {
	categoryLabels,
	type ServiceCategory,
	type ServiceDefinition,
} from "@atl.tools/manifest"
import { ServiceCard } from "./service-card"

interface AppShellProps {
	services: ServiceDefinition[]
}

export function AppShell({ services }: AppShellProps) {
	const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all")
	const [activeTags, setActiveTags] = useState<string[]>([])
	const [search, setSearch] = useState("")
	const searchRef = useRef<HTMLInputElement>(null)

	const categories = Array.from(new Set(services.map((s) => s.category))) as ServiceCategory[]

	const allTags = Array.from(new Set(services.flatMap((s) => s.tags))).sort()

	const countForCategory = (cat: ServiceCategory | "all") =>
		cat === "all" ? services.length : services.filter((s) => s.category === cat).length

	const toggleTag = useCallback((tag: string) => {
		setActiveTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		)
	}, [])

	const filtered = services.filter((s) => {
		const matchesCategory = activeCategory === "all" || s.category === activeCategory
		const q = search.toLowerCase()
		const matchesSearch =
			!q ||
			s.name.toLowerCase().includes(q) ||
			s.description.toLowerCase().includes(q) ||
			s.tags.some((t) => t.includes(q))
		const matchesTags =
			activeTags.length === 0 || activeTags.some((t) => s.tags.includes(t))
		return matchesCategory && matchesSearch && matchesTags
	})

	const activeCount = services.filter((s) => s.status === "active").length

	const focusSearch = useCallback(() => {
		searchRef.current?.focus()
	}, [])

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault()
				focusSearch()
			}
		}
		window.addEventListener("keydown", handler)
		return () => window.removeEventListener("keydown", handler)
	}, [focusSearch])

	return (
		<div className="h-dvh flex overflow-hidden bg-base">
			{/* Skip link */}
			<a href="#main-content" className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:px-3 focus-visible:py-1.5 focus-visible:bg-base focus-visible:border focus-visible:border-blue focus-visible:text-blue focus-visible:text-sm focus-visible:rounded-md">Skip to content</a>
			{/* ── Sidebar ─────────────────────────────────── */}
			<aside className="hidden md:flex flex-col w-[220px] shrink-0 bg-mantle border-r border-surface0">
				{/* Brand */}
				<div className="px-4 py-5 border-b border-surface0">
					<a href="/" className="flex items-center gap-2.5 group">
						<img src="/logo_only.png" className="h-8 w-8" alt="" />
						<span className="font-semibold text-text/90 text-lg tracking-tight group-hover:text-text transition-colors">
							atl.tools
						</span>
					</a>
				</div>

				{/* Nav */}
				<nav className="flex-1 px-2 py-3 overflow-y-auto">
					{/* Categories */}
					<button
						type="button"
						onClick={() => setActiveCategory("all")}
						className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors cursor-pointer border-l-2 ${
							activeCategory === "all"
								? "border-l-blue bg-surface0 text-text font-medium"
								: "border-l-transparent text-text/50 hover:text-text/90 hover:bg-surface0/50"
						}`}
					>
						<span>All tools</span>
						<span className="text-xs font-mono text-text/30">{services.length}</span>
					</button>

					<div className="mt-4 mb-1 px-3 text-xs font-mono text-text/35 uppercase tracking-wider">
						Categories
					</div>
					{categories.map((cat) => (
						<button
							key={cat}
							type="button"
							onClick={() => setActiveCategory(cat)}
							className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors cursor-pointer border-l-2 ${
								activeCategory === cat
									? "border-l-blue bg-surface0 text-text font-medium"
									: "border-l-transparent text-text/50 hover:text-text/90 hover:bg-surface0/50"
							}`}
						>
							<span>{categoryLabels[cat]}</span>
							<span className="text-xs font-mono text-overlay2">
								{countForCategory(cat)}
							</span>
						</button>
					))}

					{/* Tags */}
					<div className="mt-5 mb-2 px-3 flex items-center justify-between">
						<span className="text-xs font-mono text-text/35 uppercase tracking-wider">
							Tags
						</span>
						{activeTags.length > 0 && (
							<button
								type="button"
								onClick={() => setActiveTags([])}
								className="text-xs font-mono text-text/40 hover:text-text/70 transition-colors cursor-pointer"
							>
								clear
							</button>
						)}
					</div>
					<div className="px-3 flex flex-wrap gap-1.5">
						{allTags.map((tag) => {
							const isActive = activeTags.includes(tag)
							return (
								<button
									key={tag}
									type="button"
									onClick={() => toggleTag(tag)}
									className={`px-2.5 py-0.5 rounded-full text-xs font-mono border transition-colors cursor-pointer ${
										isActive
											? "bg-blue/15 border-blue/40 text-blue"
											: "bg-surface0/60 border-overlay0/40 text-text/40 hover:text-text/70 hover:border-overlay0"
									}`}
								>
									{tag}
								</button>
							)
						})}
					</div>
				</nav>


			</aside>

			{/* ── Main ────────────────────────────────────── */}
			<div className="flex flex-col flex-1 min-w-0 overflow-hidden">
				{/* Toolbar */}
				<div className="shrink-0 bg-mantle border-b border-surface0 px-6 py-4">
					{/* Title + search row */}
					<div className="flex items-center gap-3">
						{/* Mobile brand */}
						<div className="flex md:hidden items-center gap-2 flex-1">
							<img src="/logo_only.png" className="h-5 w-5" alt="" />
							<span className="font-semibold text-sm text-text">atl.tools</span>
						</div>

						{/* Desktop title */}
						<div className="hidden md:flex flex-1 items-center gap-3">
							<h1 className="text-sm font-semibold text-text tracking-tight">Tools</h1>
							<span className="text-overlay0 text-xs select-none">/</span>
							<p className="text-xs font-mono text-overlay2">
								{filtered.length !== services.length
									? `${filtered.length} of ${services.length}`
									: `${activeCount} active`}{" "}
								· free to use
							</p>
						</div>

						{/* Search input */}
						<div className="relative flex items-center">
							<Search
								size={14}
								className="absolute left-3 text-overlay2 pointer-events-none"
							/>
							<input
								ref={searchRef}
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								onKeyDown={(e) => e.key === "Escape" && setSearch("")}
								placeholder="Search tools..."
								className="w-44 md:w-56 bg-surface0 border border-surface1 rounded-lg pl-8 pr-8 py-1.5 text-sm text-text placeholder-overlay1 focus-visible:outline-none focus-visible:border-blue transition-colors"
							/>
							{search ? (
								<button
									type="button"
									onClick={() => setSearch("")}
									aria-label="Clear search"
									className="absolute right-2.5 text-overlay2 hover:text-text transition-colors cursor-pointer"
								>
									<X size={13} aria-hidden="true" />
								</button>
							) : (
								<span className="absolute right-2.5 text-xs font-mono text-overlay1 pointer-events-none select-none">
									⌘K
								</span>
							)}
						</div>
					</div>

					{/* Mobile: stats + category chips */}
					<div className="md:hidden mt-3 space-y-2">
						<p className="text-xs font-mono text-overlay2">
							{filtered.length !== services.length
								? `${filtered.length} of ${services.length}`
								: `${activeCount} active`}{" "}
							· free to use
						</p>
						<div className="flex gap-1.5 overflow-x-auto no-scrollbar">
							<button
								type="button"
								onClick={() => setActiveCategory("all")}
								className={`shrink-0 px-3 py-1 rounded-full text-xs font-mono border transition-colors cursor-pointer ${
									activeCategory === "all"
										? "bg-blue/15 border-blue/40 text-blue font-medium"
										: "bg-surface0 border-surface1/60 text-subtext0 hover:bg-surface1 hover:text-text"
								}`}
							>
								all
							</button>
							{categories.map((cat) => (
								<button
									key={cat}
									type="button"
									onClick={() => setActiveCategory(cat)}
									className={`shrink-0 px-3 py-1 rounded-full text-xs font-mono border transition-colors cursor-pointer ${
										activeCategory === cat
											? "bg-blue/15 border-blue/40 text-blue font-medium"
											: "bg-surface0 border-surface1/60 text-subtext0 hover:bg-surface1 hover:text-text"
									}`}
								>
									{categoryLabels[cat].toLowerCase()}
								</button>
							))}
						</div>
						{/* Mobile tag row */}
						<div className="flex gap-1.5 overflow-x-auto no-scrollbar">
							{allTags.map((tag) => {
								const isActive = activeTags.includes(tag)
								return (
									<button
										key={tag}
										type="button"
										onClick={() => toggleTag(tag)}
										className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-mono border transition-colors cursor-pointer ${
											isActive
												? "bg-blue/15 border-blue/40 text-blue"
												: "bg-surface0 border-surface1/60 text-overlay2"
										}`}
									>
										{tag}
									</button>
								)
							})}
						</div>
					</div>
				</div>

				{/* Scrollable grid */}
				<main id="main-content" className="flex-1 overflow-y-auto px-6 py-6">
					{filtered.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
							{filtered.map((service, i) => (
								<div key={service.id} className="card-enter flex flex-col">
									<ServiceCard
										service={service}
										index={i}
										activeTags={activeTags}
										onTagClick={toggleTag}
									/>
								</div>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-24 text-center">
							<div className="w-12 h-12 rounded-2xl bg-surface0 flex items-center justify-center mb-4 text-overlay2">
								<PackageSearch size={22} strokeWidth={1.5} aria-hidden="true" />
							</div>
							<p className="text-text font-semibold mb-1">No tools found</p>
							<p className="text-sm text-subtext0 font-mono">
								{search
									? `No results for "${search}"`
									: activeTags.length > 0
										? `No tools tagged ${activeTags.map((t) => `"${t}"`).join(" or ")}`
										: "check back soon — more tools on the way."}
							</p>
						</div>
					)}
				</main>

					{/* Footer */}
				<footer className="shrink-0 px-6 py-3 bg-mantle border-t border-surface0 flex items-center justify-between">
					<span className="text-xs text-subtext0">
						Built with 💛 by{" "}
						<a href="https://allthingslinux.org" className="text-mauve hover:text-text transition-colors">
							All Things Linux
						</a>
					</span>
					<div className="flex items-center gap-4">
						<a
							href="https://discord.gg/linux"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 text-xs font-mono text-overlay2 hover:text-subtext0 transition-colors"
						>
							<MessageCircle size={13} />
							Discord
						</a>
						<a
							href="https://github.com/allthingslinux/atl.tools"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 text-xs font-mono text-overlay2 hover:text-subtext0 transition-colors"
						>
							<Code2 size={13} />
							allthingslinux/atl.tools
						</a>
					</div>
				</footer>
			</div>
		</div>
	)
}
