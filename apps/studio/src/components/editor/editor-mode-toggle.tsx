import { Button } from "@elcokiin/ui/button";
import { FileCode2Icon, PencilIcon } from "lucide-react";

type EditorModeToggleProps = {
  mode: "visual" | "markdown";
  onModeChange: (mode: "visual" | "markdown") => void;
};

export function EditorModeToggle({
  mode,
  onModeChange,
}: EditorModeToggleProps): React.ReactNode {
  return (
    <div className="flex items-center gap-1 border rounded-md p-1">
      <Button
        type="button"
        variant={mode === "visual" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onModeChange("visual")}
      >
        <PencilIcon className="h-4 w-4 mr-1" />
        Tiptap
      </Button>
      <Button
        type="button"
        variant={mode === "markdown" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onModeChange("markdown")}
      >
        <FileCode2Icon className="h-4 w-4 mr-1" />
        Markdown
      </Button>
    </div>
  );
}
