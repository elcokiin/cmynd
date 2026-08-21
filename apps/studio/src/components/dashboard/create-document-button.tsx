import type { SerializedEditorState } from "lexical";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { useErrorHandler } from "@/hooks/use-error-handler";
import { getRandomTitle } from "@/lib/random-titles";

const EMPTY_CONTENT: SerializedEditorState = {
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [],
  },
};

export function CreateDocumentButton(): React.ReactNode {
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();

  const createDocument = useMutation(api.documents.mutations.create);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const { slug } = await createDocument({
        title: getRandomTitle(),
        type: "own",
        content: EMPTY_CONTENT,
      });

      await navigate({ to: "/editor/$slug", params: { slug: slug } });
    } catch (error) {
      handleError(error, { context: "CreateDocumentButton.create" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleCreate} disabled={isCreating}>
        <PlusIcon className="h-4 w-4 mr-2" />
        {isCreating ? "Creating..." : "New Document"}
      </Button>
    </div>
  );
}
