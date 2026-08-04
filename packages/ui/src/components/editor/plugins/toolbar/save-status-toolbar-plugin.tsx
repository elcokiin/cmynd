import { useSaveStatus } from "src/components/editor/context/save-status-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "src/components/tooltip";
import { cn } from "src/lib/utils";

export function SaveStatusToolbarPlugin({ className }: { className?: string }) {
  const saveStatus = useSaveStatus();

  return (
    <span className={className}>
      <Tooltip>
        <TooltipTrigger>
          <span
            className={cn(
              "inline-block size-2.5 rounded-full transition-colors",
              saveStatus === "saved" && "bg-green-500",
              saveStatus === "saving" && "bg-yellow-500",
              saveStatus === "unsaved" && "bg-orange-500",
              saveStatus === "error" && "bg-red-500",
            )}
          />
        </TooltipTrigger>
        <TooltipContent>
          {saveStatus === "saved" && "Saved"}
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "unsaved" && "Unsaved changes"}
          {saveStatus === "error" && "Error saving"}
        </TooltipContent>
      </Tooltip>
    </span>
  );
}
