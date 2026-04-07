"use client";

import { useEffect, useState } from "react";

import { APP_VERSION } from "@/config";

function useLiveTime(intervalMs = 1000) {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const format = () =>
      new Date().toLocaleTimeString(undefined, {
        hour: "2-digit",
        hour12: false,
        minute: "2-digit",
        second: "2-digit",
      });
    setTime(format());
    const id = setInterval(() => setTime(format()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return time;
}

export function StatusBar() {
  const time = useLiveTime();
  const isDev = process.env.NODE_ENV === "development";

  return (
    <footer
      aria-live="polite"
      className="border-border bg-sidebar text-sidebar-foreground flex h-6 w-full shrink-0 items-center justify-between gap-3 border-t px-3 font-mono text-[10px]"
    >
      <div className="flex items-center gap-3">
        {isDev && (
          <span className="bg-warning/20 text-warning rounded px-1.5 py-0.5 font-medium">
            dev
          </span>
        )}
        <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium">
          v{APP_VERSION}
        </span>
      </div>
      <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium tabular-nums">
        {time}
      </span>
    </footer>
  );
}
