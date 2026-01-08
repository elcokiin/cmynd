import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type { DocumentType } from "@elcokiin/backend/lib/types/documents";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@elcokiin/ui/dialog";
import { Label } from "@elcokiin/ui/label";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

import { documentTypeConfig } from "@/components/dashboard/document-type-config";
import { useRetryMutation } from "@/hooks/use-retry-mutation";

type DocumentSettingsDialogProps = {
  documentId: Id<"documents">;
  currentType: DocumentType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DocumentSettingsDialog({
  documentId,
  currentType,
  open,
  onOpenChange,
}: DocumentSettingsDialogProps) {
  const [type, setType] = useState<DocumentType>(currentType);
  const updateType = useMutation(api.documents.updateType);

  const updateMutation = useRetryMutation(
    async (input: { documentId: Id<"documents">; type: DocumentType }) =>
      await updateType(input),
    {
      context: "DocumentSettingsDialog.handleSave",
      onSuccess: () => {
        toast.success("Document settings updated");
        onOpenChange(false);
      },
    }
  );

  const handleSave = () => {
    if (type === currentType) {
      onOpenChange(false);
      return;
    }

    updateMutation.mutate({ documentId, type });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Document Settings</DialogTitle>
          <DialogDescription>
            Change the type and configuration of your document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
