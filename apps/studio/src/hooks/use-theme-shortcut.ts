import { useHotkey } from "@tanstack/react-hotkeys";
import { useTheme } from "next-themes";

export function useThemeShortcut() {
  const { theme, setTheme } = useTheme();

  useHotkey("D", () => {
    setTheme(theme === "dark" ? "light" : "dark");
  });
}
