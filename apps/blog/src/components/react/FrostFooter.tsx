import { Frost, type FrostProps } from "@elcokiin/ui/frost";
import { useTheme } from "../../hooks/useTheme";

type FrostFooterProps = Omit<FrostProps, "tintThin" | "tintThick">;

const DARK_THIN: [number, number, number] = [0.8196, 0.8588, 1];
const DARK_THICK: [number, number, number] = [0.9176, 0.9608, 1];
const LIGHT_THIN: [number, number, number] = [0, 0, 0];
const LIGHT_THICK: [number, number, number] = [0, 0, 0];

/**
 * Frost wrapper that picks the frost tint colors based on the active theme.
 * - Dark mode: keeps the original icy colors.
 * - Light mode: uses black (#000000) for both tints.
 */
export function FrostFooter({ children, ...props }: FrostFooterProps) {
  const isLight = useTheme() === "light";

  return (
    <Frost
      {...props}
      tintThin={isLight ? LIGHT_THIN : DARK_THIN}
      tintThick={isLight ? LIGHT_THICK : DARK_THICK}
    >
      {children}
    </Frost>
  );
}