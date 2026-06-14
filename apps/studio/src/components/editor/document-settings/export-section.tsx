import { Button } from "@elcokiin/ui/button";
import { DownloadIcon } from "lucide-react";

type ExportSectionProps = {
  onExportMarkdown: () => void;
};

export function ExportSection({ onExportMarkdown }: ExportSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">Export</h3>
        <p className="text-sm text-muted-foreground">
          Download your document as a Markdown file.
        </p>
      </div>
      <div className="rounded-lg border bg-muted/20 p-4">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          onClick={onExportMarkdown}
        >
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export as .md
        </Button>
      </div>
    </div>
  );
}
