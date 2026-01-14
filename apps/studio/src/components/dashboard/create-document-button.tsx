import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { useErrorHandler } from "@/hooks/use-error-handler";

export function CreateDocumentButton(): React.ReactNode {
  const [isCreating, setIsCreating] = useState(false);
  const { handleError } = useErrorHandler();
  const createDocument = useMutation(api.documents.mutations.create);
  const navigate = useNavigate();

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const documentId = await createDocument({
        title: "Untitled",
        type: "own",
      });
      navigate({ to: "/editor/$documentId", params: { documentId } });
    } catch (error) {
      handleError(error, { context: "CreateDocumentButton.handleCreate" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button onClick={handleCreate} disabled={isCreating}>
      <PlusIcon className="h-4 w-4 mr-2" />
      {isCreating ? "Creating..." : "New Document"}
    </Button>
  );
}
