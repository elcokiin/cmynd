import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useRetryMutation } from "@/hooks/use-retry-mutation";

export function CreateDocumentButton() {
  const createDocumentMutation = useMutation(api.documents.create);
  const navigate = useNavigate();

  const createDocument = useRetryMutation(
    async (input: { title: string; type: "own" | "curated" }) => {
      return await createDocumentMutation(input);
    },
    {
      context: "CreateDocumentButton.handleCreate",
      onSuccess: (documentId) => {
        navigate({ to: "/editor/$documentId", params: { documentId } });
      },
    }
  );

  const handleCreate = () => {
    createDocument.mutate({
      title: "Untitled",
      type: "own",
    });
  };

  return (
    <Button onClick={handleCreate} disabled={createDocument.isPending}>
      <PlusIcon className="h-4 w-4 mr-2" />
      {createDocument.isPending ? "Creating..." : "New Document"}
    </Button>
  );
}
