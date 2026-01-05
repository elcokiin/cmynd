import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CreateDocumentButton() {
  const [isCreating, setIsCreating] = useState(false);
  const createDocument = useMutation(api.documents.create);
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
      console.error("Failed to create document:", error);
      toast.error("Failed to create document");
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
