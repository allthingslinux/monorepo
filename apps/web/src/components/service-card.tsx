import {
	ArrowLeftRight,
	Braces,
	ClipboardPaste,
	FileText,
	FlaskConical,
	Search,
	Terminal,
} from "lucide-react"
import { tokyoNightHex, type ServiceDefinition } from "@atl.tools/manifest"

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
	ClipboardPaste,
	FlaskConical,
	ArrowLeftRight,
	Search,
	Terminal,
	Braces,
	FileText,
}

interface ServiceCardProps {
	service: ServiceDefinition
	index: number
	activeTags?: string[]
	onTagClick?: (tag: string) => void
}

export function ServiceCard({ service, index, activeTags = [], onTagClick }: ServiceCardProps) {
	const { name, description, url, icon, color, status, tags } = service
	const hex = tokyoNightHex[color]
	const Icon = iconMap[icon] ?? Terminal
	const isActive = status === "active"
	const hostname = new URL(url).hostname

	return (
		<a
			href={isActive ? url : undefined}
			target={isActive ? "_blank" : undefined}
			rel="noopener noreferrer"
			tabIndex={isActive ? undefined : -1}
			className={`service-card group flex flex-col h-full bg-surface0 border border-surface1/50 rounded-lg overflow-hidden no-underline ${!isActive ? "pointer-events-none opacity-50" : ""}`}
			style={
				{
					"--card-color": hex,
					animationDelay: `${index * 60}ms`,
				} as React.CSSProperties
			}
		>
			{/* Top accent stripe */}
			<div className="h-[2px] w-full shrink-0" style={{ backgroundColor: hex }} />

			{/* Content */}
			<div className="flex flex-col flex-1 px-5 pt-4 pb-5">
				{/* Name row */}
				<div className="flex items-center justify-between mb-1.5">
					<div className="flex items-center gap-2 min-w-0">
						<Icon
							size={16}
							strokeWidth={1.75}
							className="shrink-0 text-subtext0"
						/>
						<h3 className="text-base font-semibold text-text tracking-tight truncate">
							{name}
						</h3>
					</div>
					{status === "active" && (
						<span className="status-dot shrink-0 ml-2 w-1.5 h-1.5 rounded-full bg-green inline-block" aria-hidden="true" />
					)}
					{status === "maintenance" && (
						<span className="shrink-0 ml-2 w-1.5 h-1.5 rounded-full bg-yellow inline-block" aria-hidden="true" />
					)}
					{status === "planned" && (
						<span className="shrink-0 ml-2 w-1.5 h-1.5 rounded-full bg-overlay2 inline-block" aria-hidden="true" />
					)}
				</div>

				{/* Subdomain */}
				<p className="text-sm font-mono mb-4" style={{ color: hex }}>
					{hostname}
				</p>

				{/* Description */}
				<p className="text-sm text-subtext0 leading-relaxed truncate">
					{description}
				</p>

				{/* Tags */}
				<div className="flex flex-wrap gap-1.5 mt-auto pt-4">
					{tags.map((tag) => {
						const isActive = activeTags.includes(tag)
						return (
							<button
								key={tag}
								type="button"
								onClick={(e) => {
									e.preventDefault()
									e.stopPropagation()
									onTagClick?.(tag)
								}}
								className={`px-2.5 py-0.5 rounded-full text-xs font-mono border transition-colors cursor-pointer ${
									isActive
										? "bg-blue/15 border-blue/40 text-blue"
										: "bg-surface1 border-surface2/60 text-subtext0 hover:border-surface2 hover:text-text"
								}`}
							>
								{tag}
							</button>
						)
					})}
				</div>
			</div>
		</a>
	)
}
