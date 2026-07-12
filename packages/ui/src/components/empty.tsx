import * as React from "react";

import { Button } from "./button";

type EmptyAction = {
  label: string;
  onClick: () => void;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
};

type EmptyProps = {
  icon?: string;
  title: string;
  description?: string;
  action?: EmptyAction;
};

function Empty({ icon, title, description, action }: EmptyProps) {
  return (
    <div
      data-slot="empty"
      className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center"
    >
      {icon && <span className="mb-3 text-3xl">{icon}</span>}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
      {action && (
        <Button
          variant={action.variant ?? "default"}
          size={action.size ?? "sm"}
          className="mt-4 cursor-pointer gap-1.5"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export { Empty, type EmptyProps, type EmptyAction };
