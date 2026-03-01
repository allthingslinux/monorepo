import { type ServiceDefinition, tokyoNightHex } from "@atl.tools/manifest";
import {
	ArrowLeftRight,
	Braces,
	ClipboardPaste,
	FileText,
	FlaskConical,
	Search,
	Terminal,
} from "lucide-react";

const iconMap: Record<
	string,
	React.ComponentType<{ size?: number; strokeWidth?: number }>
> = {
	ClipboardPaste,
	FlaskConical,
	ArrowLeftRight,
	Search,
	Terminal,
	Braces,
	FileText,
};

interface ServiceCardProps {
	activeTags?: string[];
	index: number;
	onTagClick?: (tag: string) => void;
	service: ServiceDefinition;
}

export function ServiceCard({
	service,
	index,
	activeTags = [],
	onTagClick,
}: ServiceCardProps) {
	const { name, description, url, icon, color, status, tags } = service;
	const hex = tokyoNightHex[color];
	const Icon = iconMap[icon] ?? Terminal;
	const isActive = status === "active";
	const hostname = new URL(url).hostname;

	return (
		<a
			className={`service-card group flex h-full flex-col overflow-hidden rounded-lg border border-surface1/50 bg-surface0 no-underline ${isActive ? "" : "pointer-events-none opacity-50"}`}
			href={isActive ? url : undefined}
			rel="noopener noreferrer"
			style={
				{
					"--card-color": hex,
					animationDelay: `${index * 60}ms`,
				} as React.CSSProperties
			}
			tabIndex={isActive ? undefined : -1}
			target={isActive ? "_blank" : undefined}
		>
			{/* Top accent stripe */}
			<div
				className="h-[2px] w-full shrink-0"
				style={{ backgroundColor: hex }}
			/>

			{/* Content */}
			<div className="flex flex-1 flex-col px-5 pt-4 pb-5">
				{/* Name row */}
				<div className="mb-1.5 flex items-center justify-between">
					<div className="flex min-w-0 items-center gap-2">
						<Icon
							className="shrink-0 text-subtext0"
							size={16}
							strokeWidth={1.75}
						/>
						<h3 className="truncate font-semibold text-base text-text tracking-tight">
							{name}
						</h3>
					</div>
					{status === "active" && (
						<span
							aria-hidden="true"
							className="status-dot ml-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-green"
						/>
					)}
					{status === "maintenance" && (
						<span
							aria-hidden="true"
							className="ml-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-yellow"
						/>
					)}
					{status === "planned" && (
						<span
							aria-hidden="true"
							className="ml-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-overlay2"
						/>
					)}
				</div>

				{/* Subdomain */}
				<p className="mb-4 font-mono text-sm" style={{ color: hex }}>
					{hostname}
				</p>

				{/* Description */}
				<p className="truncate text-sm text-subtext0 leading-relaxed">
					{description}
				</p>

				{/* Tags */}
				<div className="mt-auto flex flex-wrap gap-1.5 pt-4">
					{tags.map((tag) => {
						const isActive = activeTags.includes(tag);
						return (
							<button
								className={`cursor-pointer rounded-full border px-2.5 py-0.5 font-mono text-xs transition-colors ${
									isActive
										? "border-blue/40 bg-blue/15 text-blue"
										: "border-surface2/60 bg-surface1 text-subtext0 hover:border-surface2 hover:text-text"
								}`}
								key={tag}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onTagClick?.(tag);
								}}
								type="button"
							>
								{tag}
							</button>
						);
					})}
				</div>
			</div>
		</a>
	);
}
