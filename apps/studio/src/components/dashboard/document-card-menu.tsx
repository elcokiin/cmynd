import type { DocumentListItem } from "@elcokiin/backend/lib/types/documents";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button, buttonVariants } from "@elcokiin/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@elcokiin/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@elcokiin/ui/dropdown-menu";
import { cn } from "@elcokiin/ui/lib/utils";
import { useConvex, useMutation } from "convex/react";
import { DownloadIcon, MoreVerticalIcon, PenIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useErrorHandler } from "@/hooks/use-error-handler";
import { downloadMarkdown, jsonToMarkdown } from "@/lib/markdown-conversion";

type DocumentCardMenuProps = {
  document: DocumentListItem;
  onEdit: () => void;
};

export function DocumentCardMenu({ document, onEdit }: DocumentCardMenuProps): React.ReactNode {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { handleError } = useErrorHandler();
  const convex = useConvex();

  const removeDocument = useMutation(api.documents.mutations.remove);

  const handleExportMarkdown = async () => {
    setIsExporting(true);
    try {
      const fullDoc = await convex.query(api.documents.queries.getForEdit, {
        documentId: document._id,
      });
      const markdown = jsonToMarkdown(fullDoc.content as any);
      downloadMarkdown(document.slug || document.title || "document", markdown);
      toast.success("Markdown exported");
    } catch (error) {
      handleError(error, { context: "DocumentCardMenu.handleExportMarkdown" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeDocument({ documentId: document._id });
      toast.success("Document deleted");
      setIsDeleteOpen(false);
    } catch (error) {
      handleError(error, { context: "DocumentCardMenu.handleDelete" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-background/80 backdrop-blur-sm hover:bg-background",
          )}
        >
          <MoreVerticalIcon className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <PenIcon className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportMarkdown} disabled={isExporting}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export Markdown"}
          </DropdownMenuItem>
          <DialogTrigger className="w-full">
            <DropdownMenuItem className="text-destructive">
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Document</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{document.title}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "cursor-pointer",
            )}
          >
            Cancel
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
