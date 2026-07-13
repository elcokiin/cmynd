import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { buttonVariants } from "@elcokiin/ui/button";
import { Empty } from "@elcokiin/ui/empty";
import { cn } from "@elcokiin/ui/lib/utils";
import { useQuery } from "convex/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import {
  InspirationCard,
  type InspirationItem,
} from "./inspiration-card";
import { InspirationForm } from "./inspiration-form";

type InspirationListProps = {
  documentId: Id<"documents">;
  onNavigateToReprint?: () => void;
};

export function InspirationsSection({
  documentId,
  onNavigateToReprint,
}: InspirationListProps) {
  const document = useQuery(api.documents.queries.getForEdit, { documentId });
  const isReprint = document?.type === "reprint";
  const inspirations = (document?.inspirations ?? []) as InspirationItem[];

  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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
        <Empty
          icon="✨"
          title="No inspirations yet"
          description="Track what inspired this piece"
          action={{
            label: "Add inspiration",
            onClick: () => {
              setEditingIndex(null);
              setIsAdding(true);
            },
          }}
        />
      )}

      {inspirations.length > 0 && (
        <div className="space-y-2">
          {inspirations.map((insp, i) =>
            editingIndex === i ? (
              <InspirationForm
                key={i}
                documentId={documentId}
                index={i}
                initialValues={{
                  emoji: insp.emoji,
                  title: insp.title,
                  url: insp.url ?? "",
                  author: insp.author ?? "",
                  note: insp.note ?? "",
                }}
                onDone={cancelForm}
                onCancel={cancelForm}
                submitLabel="Save"
              />
            ) : (
              <InspirationCard
                key={i}
                documentId={documentId}
                index={i}
                inspiration={insp}
                onEdit={() => {
                  setIsAdding(false);
                  setEditingIndex(i);
                }}
              />
            ),
          )}
        </div>
      )}

      {isAdding && (
        <InspirationForm
          documentId={documentId}
          onDone={cancelForm}
          onCancel={cancelForm}
        />
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
    </div>
  );
}
