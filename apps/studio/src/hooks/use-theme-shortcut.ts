import { useHotkey } from "@tanstack/react-hotkeys";
import { useThemeTransition } from "@/hooks/use-theme-transition";

export function useThemeShortcut() {
  const { theme, setTheme } = useThemeTransition();

  useHotkey("D", () => {
    setTheme(theme === "dark" ? "light" : "dark");
  });
}
