import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@elcokiin/ui/alert-dialog";
import { buttonVariants } from "@elcokiin/ui/button";
import { cn } from "@elcokiin/ui/lib/utils";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import {
  InspirationCard,
  type InspirationItem,
} from "./inspiration-card";
import {
  InspirationForm,
  type InspirationFormValues,
} from "./inspiration-form";

type InspirationListProps = {
  /* TODO: recibir documentId cuando se conecte al backend
   * inspirations vendrá de api.documents.queries.getForEdit
   */
  documentId: Id<"documents">;
  onNavigateToReprint?: () => void;
};

export function InspirationsSection({
  documentId: _documentId,
  onNavigateToReprint,
}: InspirationListProps) {
  /* TODO: reemplazar por:
   * const document = useQuery(api.documents.queries.getForEdit, { documentId });
   * const isReprint = document?.type === "reprint";
   * const inspirations = (document?.inspirations ?? []) as InspirationItem[];
   */
  const [inspirations, setInspirations] = useState<InspirationItem[]>([]);
  const isReprint = false;

  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleSave = (values: InspirationFormValues) => {
    const newInspiration: InspirationItem = {
      emoji: values.emoji,
      title: values.title,
      url: values.url || undefined,
      author: values.author || undefined,
      note: values.note || undefined,
    };

    if (editingIndex !== null) {
      setInspirations((prev) => {
        const next = [...prev];
        next[editingIndex] = newInspiration;
        return next;
      });
      setEditingIndex(null);
    } else {
      setInspirations((prev) => [...prev, newInspiration]);
      setIsAdding(false);
    }
  };

  const handleDelete = () => {
    if (deleteIndex === null) return;
    setInspirations((prev) => prev.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingIndex(null);
  };

  if (isReprint) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Inspirations</h3>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-dashed bg-muted/30 p-4">
          <span className="mt-0.5 shrink-0 text-lg">ⓘ</span>
          <div>
            <p className="text-sm font-medium">Not available for reprints</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Reprints are content by other authors and cannot include
              your own inspirations.
            </p>
            {onNavigateToReprint && (
              <button
                type="button"
                onClick={onNavigateToReprint}
                className={cn(
                  buttonVariants({ variant: "link", size: "xs" }),
                  "mt-2 h-auto cursor-pointer p-0 text-xs",
                )}
              >
                Go to Reprint settings
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Inspirations</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add links and sources that inspired this document.
        </p>
      </div>

      {inspirations.length === 0 && !isAdding && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
          <span className="mb-3 text-3xl">✨</span>
          <p className="text-sm font-medium">No inspirations yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Track what inspired this piece
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingIndex(null);
              setIsAdding(true);
            }}
            className={cn(
              buttonVariants({ size: "sm" }),
              "mt-4 cursor-pointer gap-1.5",
            )}
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Add inspiration
          </button>
        </div>
      )}

      {inspirations.length > 0 && (
        <div className="space-y-2">
          {inspirations.map((insp, i) =>
            editingIndex === i ? (
              <InspirationForm
                key={i}
                initialValues={{
                  emoji: insp.emoji,
                  title: insp.title,
                  url: insp.url ?? "",
                  author: insp.author ?? "",
                  note: insp.note ?? "",
                }}
                onSave={handleSave}
                onCancel={cancelForm}
                submitLabel="Save"
              />
            ) : (
              <InspirationCard
                key={i}
                inspiration={insp}
                onEdit={() => {
                  setIsAdding(false);
                  setEditingIndex(i);
                }}
                onDelete={() => setDeleteIndex(i)}
              />
            ),
          )}
        </div>
      )}

      {isAdding && (
        <InspirationForm onSave={handleSave} onCancel={cancelForm} />
      )}

      {!isAdding && inspirations.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setEditingIndex(null);
            setIsAdding(true);
          }}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full cursor-pointer gap-1.5",
          )}
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Add inspiration
        </button>
      )}

      <AlertDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => !open && setDeleteIndex(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove inspiration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this inspiration? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
