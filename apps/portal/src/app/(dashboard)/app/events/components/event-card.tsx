"use client";

import { ArrowUpRight, ChevronDown, Clock, Link2, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { EnrichedCalendarEvent } from "@atl/config/events";
import { Badge } from "@atl/ui/components/badge";
import { cn } from "@atl/ui/lib/utils";

import {
  formatEventRange,
  formatEventTime,
  sourceBadgeColor,
  sourceColor,
} from "../helpers/calendar-helpers";

// ── Sub-components ───────────────────────────────────────────────────────

function EventMeta({
  compact,
  event,
}: {
  compact?: boolean;
  event: EnrichedCalendarEvent;
}) {
  const time = formatEventTime(event.startsAt, event.endsAt);
  const loc = event.location.trim();
  const showLoc = Boolean(loc) && loc !== "—";
  const isUrl = /^https?:\/\//iu.test(loc);
  const LocIcon = isUrl ? Link2 : MapPin;

  if (!time && !showLoc && event.startsAt) {
    return null;
  }

  return (
    <>
      {(time || showLoc) && (
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {time && (
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden className="size-3.5 shrink-0" />
              <span className="text-xs leading-snug tabular-nums">
                {compact
                  ? time
                  : formatEventRange(event.startsAt, event.endsAt)}
              </span>
            </span>
          )}
          {showLoc && (
            <span className="inline-flex items-center gap-1.5">
              <LocIcon aria-hidden className="size-3.5 shrink-0" />
              <span className="min-w-0 truncate text-xs">{loc}</span>
            </span>
          )}
        </div>
      )}
      {!event.startsAt && (
        <p className="text-muted-foreground text-xs">Date to be announced</p>
      )}
    </>
  );
}

function ExpandableDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    setIsClamped(el.scrollHeight > el.clientHeight);
  }, [description]);

  return (
    <>
      <hr className="border-border/60 border-t" />
      <div>
        <p
          ref={ref}
          className={cn(
            "text-foreground/75 max-w-5xl text-sm leading-snug",
            !expanded && "line-clamp-3"
          )}
        >
          {description}
        </p>
        {(isClamped || expanded) && (
          <button
            className="text-muted-foreground hover:text-foreground mt-1 inline-flex items-center gap-0.5 text-[13px] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            type="button"
          >
            {expanded ? "Show less" : "Show more"}
            <ChevronDown
              className={cn(
                "size-3 transition-transform",
                expanded && "rotate-180"
              )}
            />
          </button>
        )}
      </div>
    </>
  );
}

// ── Main card ────────────────────────────────────────────────────────────

interface EventCardProps {
  compact?: boolean;
  event: EnrichedCalendarEvent;
  onSelect?: (event: EnrichedCalendarEvent) => void;
  selected?: boolean;
}

export function EventCard({
  event,
  compact,
  onSelect,
  selected,
}: EventCardProps) {
  const colors = sourceColor(event.sourceId);
  const badgeColors = sourceBadgeColor(event.sourceId);
  const hasDescription = !compact && Boolean(event.description.trim());

  const handleClick = onSelect ? () => onSelect(event) : undefined;
  const handleKeyDown = onSelect
    ? (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(event);
        }
      }
    : undefined;

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border",
        compact ? "gap-1.5 p-3" : "gap-3 p-3",
        colors.bg,
        colors.border,
        onSelect &&
          "cursor-pointer hover:brightness-95 dark:hover:brightness-110",
        selected && "ring-primary/20 dark:ring-primary/30 ring-2 ring-inset"
      )}
      {...(onSelect && {
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        role: "button",
        tabIndex: 0,
      })}
    >
      {/* Header */}
      <div
        className={cn(
          compact ? "space-y-1" : "flex items-start justify-between gap-2"
        )}
      >
        {compact && (
          <Badge
            className={cn(
              "shrink-0 text-xs font-normal",
              badgeColors.bg,
              badgeColors.border,
              badgeColors.text
            )}
            variant="outline"
          >
            {event.source.name}
          </Badge>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <p
            className={cn(
              "text-foreground leading-snug font-semibold tracking-tight",
              compact ? "text-base" : "text-lg"
            )}
          >
            {event.title}
          </p>
          <EventMeta compact={compact} event={event} />
        </div>
        {!compact && (
          <Badge
            className={cn(
              "shrink-0 text-sm font-normal",
              badgeColors.bg,
              badgeColors.border,
              badgeColors.text
            )}
            variant="outline"
          >
            {event.source.name}
          </Badge>
        )}
      </div>

      {hasDescription && (
        <ExpandableDescription description={event.description} />
      )}

      {event.url && (
        <div className={cn("flex", compact ? "justify-start" : "justify-end")}>
          <a
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 text-[13px] transition-colors"
            href={event.url}
            onClick={(e) => e.stopPropagation()}
            rel="noopener noreferrer"
            target="_blank"
          >
            Details
            <ArrowUpRight className="size-3" />
          </a>
        </div>
      )}
    </div>
  );
}
