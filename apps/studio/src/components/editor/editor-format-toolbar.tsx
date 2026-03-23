import type { EditorInstance } from "novel";

import { Button } from "@elcokiin/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@elcokiin/ui/dropdown-menu";
import { cn } from "@elcokiin/ui/lib/utils";
import { MoreHorizontalIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  editorFormatActions,
  type EditorFormatAction,
} from "./editor-format-actions";

type EditorFormatToolbarProps = {
  editor: EditorInstance | null;
  className?: string;
  actions?: EditorFormatAction[];
  overflow?: boolean;
  actionWrapper?: (
    action: EditorFormatAction,
    children: React.ReactNode,
  ) => React.ReactNode;
};

const BUTTON_WIDTH = 36;
const DOTS_WIDTH = 36;

export function EditorFormatToolbar({
  editor,
  className,
  actions = editorFormatActions,
  overflow = true,
  actionWrapper,
}: EditorFormatToolbarProps): React.ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width;
      if (!next) return;
      setContainerWidth(next);
    });

    observer.observe(element);
    setContainerWidth(element.getBoundingClientRect().width);

    return () => {
      observer.disconnect();
    };
  }, []);

  const { visibleActions, overflowActions } = useMemo(() => {
    if (containerWidth <= 0) {
      return {
        visibleActions: actions,
        overflowActions: [] as EditorFormatAction[],
      };
    }

    if (!overflow) {
      return {
        visibleActions: actions,
        overflowActions: [] as EditorFormatAction[],
      };
    }

    const visibleCapacity = Math.floor(containerWidth / BUTTON_WIDTH);
    if (visibleCapacity >= actions.length) {
      return {
        visibleActions: actions,
        overflowActions: [] as EditorFormatAction[],
      };
    }

    const capacityWithDots = Math.max(
      0,
      Math.floor((containerWidth - DOTS_WIDTH) / BUTTON_WIDTH),
    );

    return {
      visibleActions: actions.slice(0, capacityWithDots),
      overflowActions: actions.slice(capacityWithDots),
    };
  }, [actions, containerWidth, overflow]);

  return (
    <div ref={containerRef} className={cn("flex items-center gap-1 min-w-0", className)}>
      {visibleActions.map((action) => {
        const button = (
          <Button
            key={action.id}
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={actionWrapper ? undefined : () => action.run(editor)}
            title={action.label}
          >
            <action.icon
              className={cn(
                "h-4 w-4",
                action.isActive(editor) ? "text-primary" : "text-foreground",
              )}
            />
          </Button>
        );

        return actionWrapper ? actionWrapper(action, button) : button;
      })}

      {overflowActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-accent"
            onMouseDown={(event) => {
              event.preventDefault();
            }}
          >
            <MoreHorizontalIcon className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {overflowActions.map((action) => (
              <DropdownMenuItem
                key={action.id}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => action.run(editor)}
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
