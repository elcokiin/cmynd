import { useEffect, useRef } from "react";

function applyTheme(t: "dark" | "light") {
  document.documentElement.setAttribute("data-theme", t);
  document.documentElement.classList.toggle("dark", t === "dark");
  localStorage.setItem("theme", t);
}

export function ThemeShortcut() {
  const themeRef = useRef<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const t = stored === "dark" || stored === "light" ? stored : "dark";
    themeRef.current = t;
    applyTheme(t);
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
