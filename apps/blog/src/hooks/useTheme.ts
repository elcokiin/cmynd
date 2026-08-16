import { useEffect, useState } from "react";
import { getTheme, type Theme } from "../lib/theme";

/**
 * Reactive theme hook. Returns the active theme and keeps it in sync with the
 * `data-theme` attribute on <html> and theme changes from other tabs.
 */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(() => getTheme());

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(getTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const onStorage = () => setTheme(getTheme());
    window.addEventListener("storage", onStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return theme;
}