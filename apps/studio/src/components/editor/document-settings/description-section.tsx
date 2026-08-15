import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Textarea } from "@elcokiin/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";

import { useErrorHandler } from "@/hooks/use-error-handler";
import { useDebouncedSave } from "@/hooks/use-debounced-save";
import { normalizeOptionalText } from "@/lib/text";

type DescriptionSectionProps = {
  documentId: Id<"documents">;
};

export function DescriptionSection({ documentId }: DescriptionSectionProps) {
  const [description, setDescription] = useState("");
  const initializedRef = useRef(false);

  const { handleError } = useErrorHandler();

  const document = useQuery(api.documents.queries.getForEdit, { documentId });
  const updateMetadata = useMutation(api.documents.mutations.updateMetadata);

  useEffect(() => {
    if (!document) return;
    if (initializedRef.current) return;
    initializedRef.current = true;
    setDescription(document.description ?? "");
  }, [document]);

  const saveDescription = useDebouncedSave(async () => {
    try {
      await updateMetadata({
        documentId,
        description: normalizeOptionalText(description),
      });
    } catch (error) {
      handleError(error, {
        context: "DescriptionSection.saveDescription",
      });
    }
  }, 700);

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    saveDescription();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">Description</h3>
        <p className="text-sm text-muted-foreground">
          Add a short summary for this document. If left empty, a description
          will be auto-generated from the first words of your content.
        </p>
      </div>

      <div className="space-y-3">
        <label htmlFor="document-description" className="sr-only">
          Document description
        </label>
        <Textarea
          id="document-description"
          value={description}
          onChange={(event) => handleDescriptionChange(event.target.value)}
          placeholder="Write a concise summary of what this document covers..."
          className="min-h-[220px] resize-y"
        />
      </div>
    </div>
  );
}
