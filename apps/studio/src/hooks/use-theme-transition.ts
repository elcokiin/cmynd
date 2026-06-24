import { useCallback, useEffect } from "react";
import { useTheme } from "next-themes";

const clickPosition = { x: 0, y: 0 };

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

      const x = clickPosition.x || window.innerWidth / 2;
      const y = clickPosition.y || window.innerHeight / 2;

      const style = document.createElement("style");
      style.id = "theme-transition-style";
      document.head.appendChild(style);

      style.textContent = `
        ::view-transition-new(root) {
          animation: 0.6s cubic-bezier(0.4, 0, 0.2, 1) both custom-reveal;
        }
        @keyframes custom-reveal {
          from {
            clip-path: circle(0% at ${x}px ${y}px);
          }
          to {
            clip-path: circle(150% at ${x}px ${y}px);
          }
        }
      `;

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
          document.getElementById("theme-transition-style")?.remove();
        })
        .catch(() => {
          document.getElementById("theme-transition-style")?.remove();
        });
    },
    [setTheme],
  );

  return { ...rest, setTheme: animatedSetTheme };
}

export function useClickTracker() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      clickPosition.x = e.clientX;
      clickPosition.y = e.clientY;
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
}
