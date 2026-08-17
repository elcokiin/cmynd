import { useEffect, useRef } from "react";
import { applyTheme, getTheme } from "../../lib/theme";

export function ThemeShortcut() {
  const themeRef = useRef(getTheme());

  useEffect(() => {
    const initial = getTheme();
    themeRef.current = initial;
    applyTheme(initial);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "d" || e.key === "D") {
        const next = themeRef.current === "dark" ? "light" : "dark";
        themeRef.current = next;
        applyTheme(next);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}