import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

import { cn } from "../lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props & {
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      data-orientation={orientation}
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
