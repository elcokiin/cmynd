import { ThemeProvider } from "@elcokiin/ui/theme-provider";
import type { ReactNode } from "react";

import { useThemeShortcut } from "@/hooks/use-theme-shortcut";
import { useClickTracker } from "@/hooks/use-theme-transition";

function ThemeShortcutListener() {
  useThemeShortcut();
  return null;
}

function ClickTracker() {
  useClickTracker();
  return null;
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <ClickTracker />
      <ThemeShortcutListener />
      {children}
    </ThemeProvider>
  );
}
