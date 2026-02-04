import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { useState } from "react";
import { Button } from "@elcokiin/ui/button";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { SendIcon } from "lucide-react";

type ButtonSubmitProps = {
  documentId: Id<"documents"> | null;
  title: string;
};

export function ButtonSubmit({ documentId, title }: ButtonSubmitProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleError } = useErrorHandler();

  const submitDocument = useMutation(api.documents.mutations.submit);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitDocument({ documentId: documentId as Id<"documents"> });
      toast.success("Document submitted for review");
    } catch (error) {
      handleError(error, { context: "EditorHeader.handleSubmit" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleSubmit}
      disabled={isSubmitting || !title.trim() || !documentId}
      title={!title.trim() ? "Document must have a title" : "Submit for review"}
    >
      <SendIcon className="h-4 w-4 mr-2" />
      {isSubmitting ? "Submitting..." : "Submit for Review"}
    </Button>
  );
}
