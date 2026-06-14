import { ThemeProvider } from "@elcokiin/ui/theme-provider";
import type { ReactNode } from "react";

import { useThemeShortcut } from "@/hooks/use-theme-shortcut";

function ThemeShortcutListener() {
  useThemeShortcut();
  return null;
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <ThemeShortcutListener />
      {children}
    </ThemeProvider>
  );
}
