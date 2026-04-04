"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

interface ThemeContextValue {
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  theme: Theme;
}

function noop(_theme: Theme) {
  // default context stub — replaced by ThemeProvider
}

const ThemeContext = createContext<ThemeContextValue>({
  resolvedTheme: "dark",
  setTheme: noop,
  theme: "dark",
});

export function useTheme() {
  return useContext(ThemeContext);
}

function resolve(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme | null) ?? "dark";
    const resolved = resolve(stored);
    setThemeState(stored);
    setResolvedTheme(resolved);
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, []);

  function setTheme(t: Theme) {
    const resolved = resolve(t);
    setThemeState(t);
    setResolvedTheme(resolved);
    localStorage.setItem("theme", t);
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }

  const ctx = useMemo(
    () => ({ resolvedTheme, setTheme, theme }),
    [resolvedTheme, theme]
  );

  return <ThemeContext.Provider value={ctx}>{children}</ThemeContext.Provider>;
}
