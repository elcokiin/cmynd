import type { ReactNode } from "react";
import { ForceField, type ForceFieldOptions } from "@elcokiin/ui/force-field";
import { useTheme } from "../../hooks/useTheme";

export function ForceField404({
  children,
  className,
  ...options
}: Omit<ForceFieldOptions, "color" | "edgeColor"> & {
  children: ReactNode;
  className?: string;
}) {
  const theme = useTheme();

  const colors: { color: [number, number, number]; edgeColor: [number, number, number] } =
    theme === "light"
      ? { color: [0.145, 0.388, 0.922], edgeColor: [0.376, 0.647, 0.98] }
      : { color: [0.39, 1, 0.855], edgeColor: [0.65, 1, 0.9] };

  return (
    <ForceField className={className} {...options} {...colors}>
      {children}
    </ForceField>
  );
}