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
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import { cn } from "@elcokiin/ui/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { type DocumentType, documentTypeConfig } from "./document-type-config";

export function CreateDocumentDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocumentType>("own");
  const [isCreating, setIsCreating] = useState(false);

  const createDocument = useMutation(api.documents.create);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsCreating(true);
    try {
      const documentId = await createDocument({
        title: title.trim(),
        type,
      });
      toast.success("Document created");
      setOpen(false);
      setTitle("");
      setType("own");
      navigate({ to: "/editor/$documentId", params: { documentId } });
    } catch (error) {
      console.error("Failed to create document:", error);
      toast.error("Failed to create document");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants({ variant: "default" }), "cursor-pointer")}
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        New Document
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
          <DialogDescription>
            Start with a title and choose the type of document you want to create.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="My awesome document"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Document Type</Label>
            <div className="grid grid-cols-1 gap-2">
              {(
                Object.entries(documentTypeConfig) as [
                  DocumentType,
                  (typeof documentTypeConfig)[DocumentType],
                ][]
              ).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                      type === key
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">{config.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {config.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose
            className={cn(buttonVariants({ variant: "ghost" }), "cursor-pointer")}
          >
            Cancel
          </DialogClose>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
