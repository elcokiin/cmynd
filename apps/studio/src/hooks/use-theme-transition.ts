import { useCallback, useEffect } from "react";
import { useTheme } from "next-themes";

let clickX = 0;
let clickY = 0;
let isAnimating = false;
let styleEl: HTMLStyleElement | null = null;

export function useThemeTransition() {
  const { setTheme, ...rest } = useTheme();

  const animatedSetTheme = useCallback(
    (theme: string) => {
      if (
        !document.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setTheme(theme);
        return;
      }

      if (isAnimating) {
        setTheme(theme);
        return;
      }

      const x = clickX || window.innerWidth / 2;
      const y = clickY || window.innerHeight / 2;

      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "theme-transition-style";
        document.head.appendChild(styleEl);
      }

      styleEl.textContent = `
        ::view-transition-new(root) {
          animation: 0.25s ease-out both custom-reveal;
        }
        @keyframes custom-reveal {
          from { clip-path: circle(0% at ${x}px ${y}px); }
          to { clip-path: circle(150% at ${x}px ${y}px); }
        }
      `;

      isAnimating = true;

      const transition = document.startViewTransition(() => {
        const noTransition = document.createElement("style");
        noTransition.id = "theme-no-transition";
        noTransition.textContent =
          "*, *::before, *::after { transition: none !important; }";
        document.head.appendChild(noTransition);
        document.documentElement.offsetHeight;

        setTheme(theme);

        document.getElementById("theme-no-transition")?.remove();
      });

      transition.finished
        .then(() => {
          isAnimating = false;
        })
        .catch(() => {
          isAnimating = false;
        });
    },
    [setTheme],
  );

  return { ...rest, setTheme: animatedSetTheme };
}

export function useClickTracker() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      clickX = e.clientX;
      clickY = e.clientY;
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
}
