import {
  ArrowLeftRight,
  Braces,
  ClipboardPaste,
  FileText,
  FlaskConical,
  Newspaper,
  Search,
  Terminal,
} from "lucide-react";

import { tokyoNightHex } from "@atl/tools-manifest";
import type { ServiceDefinition } from "@atl/tools-manifest";

const iconMap: Record<
  string,
  React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>
> = {
  ArrowLeftRight,
  Braces,
  ClipboardPaste,
  FileText,
  FlaskConical,
  Newspaper,
  Search,
  Terminal,
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
  const serviceIsActive = status === "active";
  const hostname = new URL(url).hostname;

  return (
    <a
      className={`service-card group border-border/50 bg-card flex h-full flex-col overflow-hidden rounded-lg border no-underline ${serviceIsActive ? "" : "pointer-events-none opacity-50"}`}
      href={serviceIsActive ? url : undefined}
      rel="noopener noreferrer"
      style={
        {
          "--card-color": hex,
          animationDelay: `${index * 60}ms`,
        } as React.CSSProperties
      }
      tabIndex={serviceIsActive ? undefined : -1}
      target={serviceIsActive ? "_blank" : undefined}
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
              className="text-muted-foreground shrink-0"
              size={16}
              strokeWidth={1.75}
            />
            <h3 className="text-foreground truncate font-semibold tracking-tight">
              {name}
            </h3>
          </div>
          {status === "active" && (
            <span
              aria-hidden="true"
              className="status-dot bg-success ml-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
            />
          )}
          {status === "maintenance" && (
            <span
              aria-hidden="true"
              className="bg-warning ml-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
            />
          )}
          {status === "planned" && (
            <span
              aria-hidden="true"
              className="bg-muted-foreground ml-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
            />
          )}
        </div>

        {/* Subdomain */}
        <p className="mb-4 font-mono text-sm" style={{ color: hex }}>
          {hostname}
        </p>

        {/* Description */}
        <p className="text-muted-foreground truncate text-sm leading-relaxed">
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
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-border/60 bg-muted text-muted-foreground hover:border-border hover:text-foreground"
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
