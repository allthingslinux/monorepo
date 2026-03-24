import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIsMobile } from "@/hooks/use-mobile";

describe("useIsMobile", () => {
  const originalInnerWidth = window.innerWidth;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // Reset window.innerWidth
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalInnerWidth,
      writable: true,
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalInnerWidth,
      writable: true,
    });
  });

  it("should return true for mobile viewport", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 500,
      writable: true,
    });

    const matchMediaMock = vi.fn((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: query.includes("max-width: 767px"),
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    window.matchMedia = matchMediaMock;

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("should return false for desktop viewport", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
      writable: true,
    });

    const matchMediaMock = vi.fn((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    window.matchMedia = matchMediaMock;

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });
});