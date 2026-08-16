export type Theme = "dark" | "light";

export const DEFAULT_THEME: Theme = "dark";

const THEME_STORAGE_KEY = "theme";

/**
 * Returns the active theme. Prefers the persisted value and falls back to the
 * `data-theme` attribute on <html> (which is set at boot by BaseLayout).
 * Safe to call on the server: returns the default theme when `document` is
 * unavailable.
 */
export function getTheme(): Theme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

/** Applies a theme to <html> and persists it to localStorage. */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/** Toggles between dark and light, applies it, and returns the new theme. */
export function toggleTheme(): Theme {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

export interface ThemeTransitionCoords {
  x: number;
  y: number;
}

/**
 * Runs `update` inside a native View Transition, expanding from `coords` (or
 * the screen center when omitted). Falls back to running `update` directly
 * when the browser lacks support or reduced motion is preferred.
 */
export function runWithThemeTransition(
  update: () => void,
  coords?: ThemeTransitionCoords,
): void {
  if (typeof document === "undefined") {
    update();
    return;
  }
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!document.startViewTransition || prefersReducedMotion) {
    update();
    return;
  }

  const root = document.documentElement;
  if (coords) {
    root.style.setProperty("--x", `${coords.x}px`);
    root.style.setProperty("--y", `${coords.y}px`);
  } else {
    root.style.removeProperty("--x");
    root.style.removeProperty("--y");
  }

  document.startViewTransition(() => {
    update();
  });
}