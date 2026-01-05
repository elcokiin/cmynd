import { api } from "@elcokiin/backend/convex/_generated/api";
import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import { Button, buttonVariants } from "@elcokiin/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@elcokiin/ui/card";
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

import { type DocumentType, documentTypeConfig } from "./document-type-config";

export type Document = {
  _id: Id<"documents">;
  title: string;
  type: DocumentType;
  status: "building" | "published";
  createdAt: number;
  updatedAt: number;
};

type DocumentCardProps = {
  document: Document;
  onOpen: () => void;
};

export function DocumentCard({ document, onOpen }: DocumentCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const removeDocument = useMutation(api.documents.remove);

  const config = documentTypeConfig[document.type];
  const Icon = config.icon;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeDocument({ documentId: document._id });
      toast.success("Document deleted");
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(timestamp));
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground capitalize">
              {config.label}
            </span>
            {document.status === "published" && (
              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">
                Published
              </span>
            )}
          </div>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                )}
              >
                <MoreVerticalIcon className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onOpen}>
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
                    "cursor-pointer"
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
        </div>

        <CardTitle
          className="text-lg cursor-pointer hover:text-primary transition-colors line-clamp-2"
          onClick={onOpen}
        >
          {document.title || "Untitled"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>Updated {formatDate(document.updatedAt)}</CardDescription>
      </CardContent>
    </Card>
  );
}
