import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { FileUpIcon, PlusIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { markdownToJson } from "@/lib/markdown-conversion";

export function CreateDocumentButton(): React.ReactNode {
  const navigate = useNavigate();
  const createDocument = useMutation(api.documents.mutations.create);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleCreate = () => {
    navigate({ to: "/editor/new" });
  };

  const handleOpenImportDialog = () => {
    fileInputRef.current?.click();
  };

  const handleImportMarkdown = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const markdown = await file.text();
      const content = markdownToJson(markdown);
      const titleFromFile = file.name.replace(/\.(md|markdown)$/i, "").trim();
      const title =
        titleFromFile.length > 0 && titleFromFile.toLowerCase() !== "untitled"
          ? titleFromFile
          : "Imported Markdown";

      const result = await createDocument({
        title,
        type: "own",
        content,
        markdownSource: markdown,
        contentFormat: "markdown_imported",
      } as any);

      toast.success("Markdown imported");
      navigate({
        to: "/editor/$slug",
        params: { slug: result.slug },
      });
    } catch {
      toast.error("Failed to import markdown file");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        className="hidden"
        onChange={handleImportMarkdown}
        disabled={isImporting}
      />
      <Button variant="outline" onClick={handleOpenImportDialog} disabled={isImporting}>
        <FileUpIcon className="h-4 w-4 mr-2" />
        {isImporting ? "Importing..." : "Import Markdown"}
      </Button>
      <Button onClick={handleCreate}>
        <PlusIcon className="h-4 w-4 mr-2" />
        New Document
      </Button>
    </div>
  );
}
