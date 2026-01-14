import type { Doc } from "@elcokiin/backend/convex/_generated/dataModel";

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
import { useMutation } from "convex/react";
import { MoreVerticalIcon, PenIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useErrorHandler } from "@/hooks/use-error-handler";

type DocumentCardMenuProps = {
  document: Doc<"documents">;
  onEdit: () => void;
};

export function DocumentCardMenu({ document, onEdit }: DocumentCardMenuProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { handleError } = useErrorHandler();

  const removeDocument = useMutation(api.documents.mutations.remove);

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
            "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
          )}
        >
          <MoreVerticalIcon className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <PenIcon className="h-4 w-4 mr-2" />
            Edit
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
